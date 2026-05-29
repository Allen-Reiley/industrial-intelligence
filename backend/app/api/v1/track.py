# backend/app/api/v1/track.py
from fastapi import APIRouter, BackgroundTasks, Request, Header, HTTPException
from typing import Optional, Dict, Any
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import logging
from datetime import datetime, timezone

# Internal AuraWorks Imports
from app.models.visit import Visit, VisitCreate, PageViewCreate
from app.models.company import Company
from app.models.waitlist import WaitlistLead
from app.services.enrichment import enrich_visitor_data
from app.services.notifications import post_to_visit_channel
from app.services.intelligence import get_visitor_journey
from app.db import async_session_maker

router = APIRouter()
logger = logging.getLogger("uvicorn")

class ConsentPayload(BaseModel):
    client_id: str
    aura_id: str
    status: str 

class IdentityPayload(BaseModel):
    client_id: str
    aura_id: str
    email: Optional[str] = None
    company_name: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    capture_source: Optional[str] = "authorized_blur"
    signature: Optional[Dict[str, Any]] = None

async def process_entry_logic(payload: VisitCreate, client_ip: str):
    """
    Main ingestion engine for raw visitor traffic. 
    Sequentially blocks notification dispatch until DeepSeek intent has compiled.
    """
    if not async_session_maker:
        logger.error("❌ process_entry_logic: Aborted. Async Database Engine not initialized.")
        return

    async with async_session_maker() as session:
        try:
            # 1. Forensic Enrichment (Firmographic Resolution)
            enriched_info = await enrich_visitor_data(client_ip)
            domain = enriched_info.get("domain")
            
            # 2. Entity Resolution Logic
            res = await session.execute(
                select(Company).where(
                    Company.domain == domain,
                    Company.client_id == payload.client_id
                )
            )
            company = res.scalars().first()

            if company:
                company.total_visits += 1 
                session.add(company)
            elif domain and domain not in ["unknown.com", "n/a"]:
                company = Company(
                    client_id=payload.client_id,
                    name=enriched_info.get("company_name", "Unknown"),
                    domain=domain,
                    is_verified=False
                )
                session.add(company)
            
            await session.commit()
            if company: 
                await session.refresh(company)

            # 3. Persistence of the Forensic Trail
            db_visit = Visit(
                company_id=company.id if company else None,
                client_id=payload.client_id,
                aura_id=payload.aura_id,
                ip_address=client_ip,
                url=payload.url,
                referrer=payload.referrer,
                verification_status="verified" if (company and company.is_verified) else "verifying"
            )
            session.add(db_visit)
            await session.commit()
            await session.refresh(db_visit)

            # 4. AWAIT INTELLIGENCE SYNTHESIS (Halts sequential block until DeepSeek finishes)
            journey = await get_visitor_journey(payload.aura_id, session)
            
            # 5. Pack visit properties securely with full context resolved
            visit_notification_payload = {
                "aura_id": db_visit.aura_id,
                "company_name": company.name if company else "Anonymous Entity",
                "confidence_score": 1.0 if (company and company.is_verified) else 0.6,
                "is_verified": company.is_verified if company else False,
                "utm_source": getattr(payload, "utm_source", "Direct"),
                "utm_medium": getattr(payload, "utm_medium", "None"),
                "city": enriched_info.get("city", "Unknown"),
                "region": enriched_info.get("region", "ZA")
            }
            
            # 6. Dispatch clear notification package to Slack
            await post_to_visit_channel(visit_notification_payload, journey)

        except Exception as e:
            await session.rollback()
            logger.error(f"🚨 Ingestion Error: {e}")

@router.post("/entry")
async def track_entry(payload: VisitCreate, request: Request, background_tasks: BackgroundTasks):
    # Resolve IP via proxy headers for Railway/Cloudfront compatibility
    client_ip = request.headers.get("x-forwarded-for", request.client.host).split(',')[0]
    background_tasks.add_task(process_entry_logic, payload, client_ip)
    return {"status": "accepted"}

@router.post("/identity")
async def track_identity(payload: IdentityPayload):
    """
    Identity Bridge: Upgrades anonymous forensic profiles using volunteered data.
    Stitches signatures (Canvas/WebGL) to the database record.
    """
    async with async_session_maker() as session:
        # 1. Fetch the most recent visit for this ID to attach signatures
        res = await session.execute(
            select(Visit).where(
                Visit.aura_id == payload.aura_id,
                Visit.client_id == payload.client_id
            ).order_by(Visit.created_at.desc())
        )
        visit = res.scalars().first()
        
        if not visit:
            return {"status": "visit_not_found"}

        # 2. Forensic Locking (Canvas/WebGL/Clock)
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

        # 3. Warm Lead Promotion (The Janitor Shield)
        if payload.email:
            # Update the visit metadata
            visit.capture_source = payload.capture_source
            visit.verification_status = "verified" # Shielded from 48h purge
            visit.is_consented = True

            # Resolve or Create the WaitlistLead entry
            res_lead = await session.execute(
                select(WaitlistLead).where(
                    WaitlistLead.aura_id == payload.aura_id,
                    WaitlistLead.client_id == payload.client_id
                )
            )
            lead = res_lead.scalars().first()

            if not lead:
                lead = WaitlistLead(
                    client_id=payload.client_id,
                    aura_id=payload.aura_id,
                    email=payload.email
                )
            
            # Enrich lead record with provided context
            lead.email = payload.email
            if payload.company_name: lead.company_name_raw = payload.company_name
            if payload.department: lead.department = payload.department
            if payload.position: lead.position = payload.position
            session.add(lead)

        session.add(visit)
        await session.commit()
        return {"status": "identity_locked"}

@router.post("/event")
async def track_event(payload: PageViewCreate):
    """Logs behavioral intent clicks (e.g., 'Pricing', 'Industrial Sync')."""
    async with async_session_maker() as session:
        # Standardized tracking normalization fallback
        target_aura_id = payload.aura_id if getattr(payload, "aura_id", None) else payload.client_id
        
        res = await session.execute(
            select(Visit).where(
                Visit.aura_id == target_aura_id,
                Visit.url == payload.url 
            ).order_by(Visit.created_at.desc())
        )
        visit = res.scalars().first()
        if visit:
            if getattr(payload, "event_type", None) == "intent_click":
                visit.intent_cluster = getattr(payload, "intent_cluster", "General")
            await session.commit()
            return {"status": "event_logged"}
        return {"status": "pending_entry"}

@router.post("/consent")
async def track_consent(payload: ConsentPayload):
    async with async_session_maker() as session:
        res = await session.execute(
            select(Visit).where(
                Visit.aura_id == payload.aura_id,
                Visit.client_id == payload.client_id
            )
        )
        visits = res.scalars().all()
        for v in visits:
            v.is_consented = True
            session.add(v)
        await session.commit()
        return {"status": "consent_recorded"}

@router.post("/exit")
async def track_exit(payload: PageViewCreate):
    """Records session duration upon visitor departure."""
    try:
        processed_duration = int(float(payload.duration))
    except (ValueError, TypeError):
        processed_duration = 0

    async with async_session_maker() as session:
        # Standardized tracking normalization fallback
        target_aura_id = payload.aura_id if getattr(payload, "aura_id", None) else payload.client_id

        res = await session.execute(
            select(Visit).where(
                Visit.aura_id == target_aura_id,
                Visit.url == payload.url
            ).order_by(Visit.created_at.desc())
        )
        visit = res.scalars().first()
        
        if visit:
            if processed_duration > (visit.duration or 0):
                visit.duration = processed_duration
                session.add(visit)
                await session.commit()
                return {"status": "recorded"}
        return {"status": "pending_entry"}