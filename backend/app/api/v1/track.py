# backend/app/api/v1/endpoints/track.py
from fastapi import APIRouter, BackgroundTasks, Request, Header, HTTPException
from typing import Optional, Dict, Any
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.visit import VisitCreate, Visit
from app.models.company import Company
from app.models.waitlist import WaitlistLead
from app.services.enrichment import enrich_visitor_data
from app.services.notifications import post_to_visit_channel
from app.services.intelligence import get_visitor_journey
from app.db import async_session_maker
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
    email: Optional[str] = None
    company_name: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    signature: Optional[Dict[str, Any]] = None

async def process_entry_logic(payload: VisitCreate, client_ip: str, background_tasks: BackgroundTasks):
    async with async_session_maker() as session:
        try:
            # 1. Forensic Enrichment
            enriched_info = await enrich_visitor_data(client_ip)
            domain = enriched_info.get("domain")
            
            # 2. Entity Resolution & Visit Counter Logic
            res = await session.execute(
                select(Company).where(
                    Company.domain == domain,
                    Company.client_id == payload.client_id
                )
            )
            company = res.scalars().first()

            if company:
                company.total_visits += 1 # Industrial Increment
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
            if company: await session.refresh(company)

            # 3. Persistence of the Forensic Trail
            db_visit = Visit(
                company_id=company.id if company else None,
                client_id=payload.client_id,
                aura_id=payload.aura_id,
                ip_address=client_ip,
                url=payload.url,
                verification_status="verified" if (company and company.is_verified) else "verifying"
            )
            session.add(db_visit)
            await session.commit()

            # 4. Background Intelligence Dispatch
            journey = await get_visitor_journey(payload.aura_id, session)
            background_tasks.add_task(post_to_visit_channel, {"company": company.name if company else "Anonymous"}, journey)

        except Exception as e:
            logger.error(f"🚨 Ingestion Error: {e}")

@router.post("/identity")
async def track_identity(payload: IdentityPayload):
    """
    Primary Warm Lead Registration: 
    Captures volunteered data from the banner to upgrade forensic profiles.
    """
    async with async_session_maker() as session:
        # 1. Resolve or Create the Warm Lead entry
        res_lead = await session.execute(
            select(WaitlistLead).where(
                WaitlistLead.aura_id == payload.aura_id,
                WaitlistLead.client_id == payload.client_id
            )
        )
        lead = res_lead.scalars().first()

        if not lead and payload.email:
            lead = WaitlistLead(
                client_id=payload.client_id,
                aura_id=payload.aura_id,
                email=payload.email
            )
        
        if lead:
            if payload.email: lead.email = payload.email
            if payload.company_name: lead.company_name_raw = payload.company_name
            if payload.department: lead.department = payload.department
            if payload.position: lead.position = payload.position
            session.add(lead)

        # 2. Promote Forensic Visits to 'Verified' (The Janitor Shield)
        res_visits = await session.execute(
            select(Visit).where(Visit.aura_id == payload.aura_id)
        )
        visits = res_visits.scalars().all()
        for v in visits:
            v.verification_status = "verified" # Priority Upgrade
            v.is_consented = True
            session.add(v)

        await session.commit()
        return {"status": "warm_lead_registered"}

@router.post("/entry")
async def track_entry(payload: VisitCreate, request: Request, background_tasks: BackgroundTasks):
    client_ip = request.headers.get("x-forwarded-for", request.client.host).split(',')[0]
    background_tasks.add_task(process_entry_logic, payload, client_ip, background_tasks)
    return {"status": "accepted"}

@router.post("/identity")
async def track_identity(payload: IdentityPayload):
    async with async_session_maker() as session:
        res = await session.execute(
            select(Visit).where(
                Visit.aura_id == payload.aura_id,
                Visit.client_id == payload.client_id
            ).order_by(Visit.created_at.desc())
        )
        visit = res.scalars().first()
        
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
                res_lead = await session.execute(
                    select(Lead).where(
                        Lead.aura_id == payload.aura_id,
                        Lead.client_id == payload.client_id
                    )
                )
                lead = res_lead.scalars().first()
                if lead:
                    lead.email = payload.email
                    session.add(lead)
            
            session.add(visit)
            await session.commit()
            return {"status": "identity_locked"}
        return {"status": "visit_not_found"}

@router.post("/event")
async def track_event(payload: PageViewCreate):
    async with async_session_maker() as session:
        res = await session.execute(
            select(Visit).where(
                Visit.aura_id == payload.client_id,
                Visit.client_id == payload.client_id 
            ).order_by(Visit.created_at.desc())
        )
        visit = res.scalars().first()
        if visit:
            if payload.event_type == "intent_click":
                visit.intent_cluster = payload.intent_cluster
                visit.intent_metadata = {"target": payload.url, "path": payload.url}
            await session.commit()
            return {"status": "event_logged"}
        return {"status": "pending_entry"}

@router.post("/consent")
async def track_consent(payload: ConsentPayload):
    async with async_session_maker() as session:
        try:
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
        except Exception as e:
            logger.error(f"❌ Consent Sync Error: {e}")
            return {"status": "error"}

@router.post("/exit")
async def track_exit(payload: PageViewCreate):
    try:
        processed_duration = int(float(payload.duration))
    except (ValueError, TypeError):
        processed_duration = 0

    async with async_session_maker() as session:
        res = await session.execute(
            select(Visit).where(
                Visit.aura_id == payload.client_id,
                Visit.url == payload.url
            ).order_by(Visit.created_at.desc())
        )
        visit = res.scalars().first()
        
        if visit:
            if processed_duration > (visit.duration or 0):
                visit.duration = processed_duration
                session.add(visit)
                await session.commit()
                return {"status": "recorded", "duration": processed_duration}
            return {"status": "no_change"}
        return {"status": "pending_entry"}