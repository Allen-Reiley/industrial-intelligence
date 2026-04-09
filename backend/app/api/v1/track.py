from fastapi import APIRouter, BackgroundTasks, Request, Header
from typing import Optional, Dict, Any
from app.models.visit import VisitCreate, Visit
from app.models.company import Company
from app.models.pageview import PageViewCreate
from app.services.enrichment import enrich_visitor_data
from sqlmodel import Session, select
from app.db import engine
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")

class ConsentPayload(BaseModel):
    client_id: str
    aura_id: str
    status: str  # "accepted"

class IdentityPayload(BaseModel):
    client_id: str
    aura_id: str
    signature: Optional[Dict[str, Any]] = None
    email: Optional[str] = None
    capture_source: Optional[str] = None

async def process_entry_logic(payload: VisitCreate, client_ip: str):
    """
    Jurisdictive Entity Resolution & Network Intelligence Mapping.
    """
    with Session(engine) as session:
        # 1. Resolve or Create the Jurisdictive Entity (Company)
        enriched_info = await enrich_visitor_data(client_ip)
        domain = enriched_info.get("domain")
        company_name = enriched_info.get("company_name", "Unknown")

        company = None
        if domain:
            company_statement = select(Company).where(Company.domain == domain)
            company = session.exec(company_statement).first()

        if not company and company_name != "Unknown":
            company = Company(
                name=company_name,
                domain=domain,
                industry=enriched_info.get("industry"),
                city=enriched_info.get("city"),
                region=enriched_info.get("region"),
                is_b2b=enriched_info.get("is_b2b", True)
            )
            session.add(company)
            session.commit()
            session.refresh(company)
            logger.info(f"🏢 New Jurisdictive Entity: {company.name}")
        elif company:
            company.total_visits += 1
            session.add(company)

        # 2. Log the Granular Visit with Tracker v2.4.0 signals
        db_visit = Visit(
            company_id=company.id if company else None,
            client_id=payload.client_id,
            aura_id=payload.aura_id,
            ip_address=client_ip,
            url=payload.url,
            referrer=payload.referrer,
            screen_resolution=payload.screen_resolution,
            # Map Industrial Network Signals
            effective_connection_type=payload.effective_connection_type,
            downlink_speed=payload.downlink_speed,
            rtt=payload.rtt,
            # Map Attribution
            utm_source=payload.utm_source,
            utm_medium=payload.utm_medium,
            utm_campaign=payload.utm_campaign,
            is_consented=False 
        )
        
        session.add(db_visit)
        session.commit()
        logger.info(f"📍 Visit Recorded | Net: {payload.effective_connection_type or 'N/A'} | ID: {payload.aura_id[:8]}")

@router.post("/entry")
async def track_entry(
    payload: VisitCreate, 
    request: Request, 
    background_tasks: BackgroundTasks,
    x_forwarded_for: Optional[str] = Header(None)
):
    client_ip = x_forwarded_for.split(',')[0].strip() if x_forwarded_for else (request.client.host if request.client else "127.0.0.1")
    background_tasks.add_task(process_entry_logic, payload, client_ip)
    return {"status": "accepted"}

@router.post("/identity")
async def track_identity(payload: IdentityPayload):
    """
    Forensic Lock & Ghost Enrichment: Captures browser signature or blurred emails.
    """
    with Session(engine) as session:
        # Find the most recent visit to attach this identity to
        statement = select(Visit).where(Visit.aura_id == payload.aura_id).order_by(Visit.created_at.desc())
        visit = session.exec(statement).first()
        
        if visit:
            if payload.signature:
                sig = payload.signature
                visit.canvas_hash = sig.get("canvas")
                visit.webgl_renderer = sig.get("webgl")
                visit.clock_drift = sig.get("drift")
                # Update network info if it came in the signature block
                net = sig.get("network")
                if isinstance(net, dict):
                    visit.effective_connection_type = net.get("type")
                    visit.downlink_speed = net.get("downlink")
                    visit.rtt = net.get("rtt")
            
            session.add(visit)
            session.commit()
            return {"status": "identity_locked"}
        return {"status": "visit_not_found"}

@router.post("/event")
async def track_event(payload: PageViewCreate):
    """
    Intent Cluster Catch: Records high-intent interactions (Pricing, Audit clicks).
    """
    with Session(engine) as session:
        statement = select(Visit).where(
            Visit.aura_id == payload.client_id # aura.js uses client_id/aura_id interchangeably in events
        ).order_by(Visit.created_at.desc())
        
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
            for visit in visits:
                visit.is_consented = True
                session.add(visit)
            session.commit()
            return {"status": "consent_recorded"}
    except Exception as e:
        logger.error(f"❌ Consent Error: {e}")
        return {"status": "error"}

@router.post("/exit")
async def track_exit(payload: PageViewCreate):
    with Session(engine) as session:
        statement = select(Visit).where(
            Visit.aura_id == payload.client_id,
            Visit.url == payload.url
        ).order_by(Visit.created_at.desc())
        
        visit = session.exec(statement).first()
        if visit:
            visit.duration = payload.duration
            session.add(visit)
            session.commit()
            return {"status": "recorded"}
        return {"status": "pending"}