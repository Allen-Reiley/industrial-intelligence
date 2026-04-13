from fastapi import APIRouter, BackgroundTasks, Request, Header, HTTPException
from typing import Optional, Dict, Any, List
from app.models.visit import VisitCreate, Visit
from app.models.company import Company
from app.models.pageview import PageViewCreate
from app.services.enrichment import enrich_visitor_data
from app.services.notifications import post_to_visit_channel
from app.services.intelligence import get_visitor_journey
from app.services.airtable import airtable_engine
from sqlmodel import Session, select
from app.db import engine
from pydantic import BaseModel
import logging
from datetime import datetime, timezone

router = APIRouter()
logger = logging.getLogger("uvicorn")

class ConsentPayload(BaseModel):
    client_id: str
    aura_id: str
    status: str 

class IdentityPayload(BaseModel):
    client_id: str
    aura_id: str
    signature: Optional[Dict[str, Any]] = None
    email: Optional[str] = None
    capture_source: Optional[str] = None

async def process_entry_logic(payload: VisitCreate, client_ip: str, background_tasks: BackgroundTasks):
    """
    Refined Ingestion: Quarantines hits for audit while auto-verifying whitelisted entities.
    """
    with Session(engine) as session:
        # 1. Resolve Firmographics
        enriched_info = await enrich_visitor_data(client_ip)
        domain = enriched_info.get("domain")
        company_name = enriched_info.get("company_name", "Unknown")
        confidence = enriched_info.get("confidence_score", 0.0)

        # 2. Check for Existing Company
        company = None
        if domain and domain not in ["unknown.com", "n/a"]:
            company_statement = select(Company).where(Company.domain == domain)
            company = session.exec(company_statement).first()

        # 3. Handle Company Record
        if not company and domain and domain not in ["unknown.com", "n/a"]:
            company = Company(
                name=company_name,
                domain=domain,
                industry=enriched_info.get("industry"),
                city=enriched_info.get("city"),
                region=enriched_info.get("region"),
                is_b2b=enriched_info.get("is_b2b", True),
                is_verified=False
            )
            session.add(company)
            session.commit()
            session.refresh(company)
        elif company:
            company.total_visits += 1
            session.add(company)

        # 4. Visit Status Logic (Matches Janitor Expectations)
        initial_status = "verified" if (company and company.is_verified) else "verifying"
        
        db_visit = Visit(
            company_id=company.id if company else None,
            client_id=payload.client_id,
            aura_id=payload.aura_id,
            ip_address=client_ip,
            url=payload.url,
            referrer=payload.referrer,
            # Schema Fix: Matches the manual ALTER TABLE column
            verification_status=initial_status,
            last_audit_at=datetime.now(timezone.utc),
            utm_source=payload.utm_source,
            utm_medium=payload.utm_medium,
            utm_campaign=payload.utm_campaign,
            is_consented=False 
        )
        
        session.add(db_visit)
        session.commit()
        session.refresh(db_visit)

        # 5. Dispatch to Channels
        if confidence >= 0.5 or (company and company.is_verified):
            airtable_data = {
                "company_name": company.name if company else "Anonymous Facility",
                "domain": domain or "unknown.com",
                "ip_address": client_ip,
                "city": enriched_info.get("city", "Unknown"),
                "region": enriched_info.get("region", "ZA"),
                "aura_id": payload.aura_id,
                "effective_connection_type": payload.effective_connection_type or "Unknown"
            }
            background_tasks.add_task(airtable_engine.push_visit, airtable_data)

            journey = await get_visitor_journey(payload.aura_id)
            visit_report = {
                "company_name": airtable_data["company_name"],
                "network_type": payload.effective_connection_type or "Standard",
                "utm_source": payload.utm_source or "Direct",
                "utm_medium": payload.utm_medium or "None",
                "aura_id": payload.aura_id,
                "city": airtable_data["city"],
                "region": airtable_data["region"]
            }
            background_tasks.add_task(post_to_visit_channel, visit_report, journey)

@router.post("/entry")
async def track_entry(
    payload: VisitCreate, 
    request: Request, 
    background_tasks: BackgroundTasks,
    x_forwarded_for: Optional[str] = Header(None)
):
    client_ip = x_forwarded_for.split(',')[0].strip() if x_forwarded_for else (request.client.host if request.client else "127.0.0.1")
    background_tasks.add_task(process_entry_logic, payload, client_ip, background_tasks)
    return {"status": "accepted"}

@router.post("/identity")
async def track_identity(payload: IdentityPayload):
    with Session(engine) as session:
        statement = select(Visit).where(Visit.aura_id == payload.aura_id).order_by(Visit.created_at.desc())
        visit = session.exec(statement).first()
        
        if visit:
            if payload.signature:
                sig = payload.signature
                visit.canvas_hash = sig.get("canvas")
                visit.webgl_renderer = sig.get("webgl")
                visit.clock_drift = sig.get("drift")
                net = sig.get("network")
                if isinstance(net, dict):
                    visit.effective_connection_type = net.get("type")
                    visit.downlink_speed = net.get("downlink")
                    visit.rtt = net.get("rtt")
            
            if payload.email:
                visit.capture_source = payload.capture_source or "authorized_blur"
            
            session.add(visit)
            session.commit()
            return {"status": "identity_locked"}
        return {"status": "visit_not_found"}

@router.post("/event")
async def track_event(payload: PageViewCreate):
    with Session(engine) as session:
        statement = select(Visit).where(Visit.aura_id == payload.client_id).order_by(Visit.created_at.desc())
        visit = session.exec(statement).first()
        if visit:
            if payload.event_type == "intent_click":
                visit.intent_cluster = payload.intent_cluster
                visit.intent_metadata = {"target": payload.url, "path": payload.url}
            session.commit()
            return {"status": "event_logged"}
        return {"status": "pending_entry"}

@router.post("/consent")
async def track_consent(payload: ConsentPayload):
    try:
        with Session(engine) as session:
            statement = select(Visit).where(Visit.aura_id == payload.aura_id)
            visits = session.exec(statement).all()
            for v in visits:
                v.is_consented = True
                session.add(v)
            session.commit()
            return {"status": "consent_recorded"}
    except Exception as e:
        logger.error(f"❌ Consent Sync Error: {e}")
        return {"status": "error"}

@router.post("/exit")
async def track_exit(payload: PageViewCreate):
    """
    Finalizes dwell time for a forensic session.
    Matches incoming client_id to the aura_id in the Visit ledger.
    """
    try:
        # Sanitize duration: Convert from string/float to int
        # Handle cases where frontend might send "NaN" or null
        try:
            processed_duration = int(float(payload.duration))
        except (ValueError, TypeError):
            processed_duration = 0

        with Session(engine) as session:
            # Locate the most recent visit matching this ID and URL
            statement = select(Visit).where(
                Visit.aura_id == payload.client_id,
                Visit.url == payload.url
            ).order_by(Visit.created_at.desc())
            
            visit = session.exec(statement).first()
            
            if visit:
                # Logic check: Only update if the new duration is greater 
                # (Prevents race conditions from late heartbeat packets)
                if processed_duration > (visit.duration or 0):
                    visit.duration = processed_duration
                    session.add(visit)
                    session.commit()
                    return {"status": "recorded", "duration": processed_duration}
                
                return {"status": "no_change", "reason": "existing_duration_higher"}
            
            return {"status": "pending_entry", "msg": "Visit record not yet initialized"}
            
    except Exception as e:
        logger.error(f"❌ Exit Tracking Error: {e}")
        # Return 200 even on error to prevent browser retry loops during page close
        return {"status": "error", "message": str(e)}