# backend/app/api/v1/track.py
from fastapi import APIRouter, BackgroundTasks, Request, Header, HTTPException
from typing import Optional, Dict, Any
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import logging
from datetime import datetime, timezone
from cachetools import TTLCache

# Internal AuraWorks Imports
from app.models.visit import Visit, VisitCreate, PageViewCreate
from app.models.company import Company
from app.models.waitlist import WaitlistLead
from app.services.enrichment import enrich_visitor_data
from app.services.notifications import post_to_slack
from app.services.intelligence import get_visitor_journey
from app.db import async_session_maker

router = APIRouter()
logger = logging.getLogger("uvicorn")

# --- ANTI-SPAM LOCK ---
# Prevents duplicate exit notifications if the browser fires multiple exit beacons
exit_notification_cache = TTLCache(maxsize=2000, ttl=43200) # 12 hour cooldown

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
    SILENT INGESTION ENGINE:
    Records raw traffic trails and resolves firmographics without triggering DeepSeek or Slack pings.
    """
    if not async_session_maker:
        return

    async with async_session_maker() as session:
        try:
            # 1. Forensic Enrichment
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
            
        except Exception as e:
            await session.rollback()
            logger.error(f"🚨 Silent Ingestion Error: {e}")

async def process_exit_logic(aura_id: str, client_id: str):
    """
    THE BATCH PROCESSOR:
    Fires exclusively upon departure. Evaluates identity data gates to avoid chat pollution.
    Compiles the entire session trail into a single structured prompt for DeepSeek analysis.
    """
    if not async_session_maker:
        return

    # Anti-Spam: Skip duplicate execution loops for the same session footprint
    if aura_id in exit_notification_cache:
        return

    async with async_session_maker() as session:
        try:
            # 1. THE GATEKEEPER: Did they convert or hand over data via banner forms?
            lead_stmt = select(WaitlistLead).where(
                WaitlistLead.aura_id == aura_id,
                WaitlistLead.client_id == client_id
            )
            lead = (await session.execute(lead_stmt)).scalars().first()

            # Ghost tracking bypass: If no identity attributes exist, terminate silently.
            if not lead:
                return

            # Active context throttle lock
            exit_notification_cache[aura_id] = True
            logger.info(f"🚪 High-Intent Exit Flagged for {aura_id}. Compiling full DeepSeek journey matrix...")

            # 2. Compile the full session ledger into a single operational object
            journey = await get_visitor_journey(aura_id, session)

            # 3. Resolve Company Reference parameters
            company_name = lead.company_name_raw or "Anonymous Entity"
            if lead.company_id:
                company = await session.get(Company, lead.company_id)
                if company:
                    company_name = company.name

            # 4. Normalize the unified dataset dictionary payload with Location data included
            complete_lead_payload = {
                "id": lead.id,
                "aura_id": lead.aura_id,
                "name": lead.name or "Unknown Lead",
                "email": lead.email,
                "company_name_final": company_name,
                "department": lead.department or "Undetermined",
                "position": lead.position or "Evaluator",
                "industry": lead.industry or "Industrial",
                "website": lead.website or "N/A",
                "capture_source": "banner_interaction",
                "city": journey.get("city") or "Unknown",
                "region": journey.get("region") or "ZA"
            }

            # =================================================================
            # 5. RELEASE GATES: Dispatch compiled datasets sequentially
            # =================================================================

            # Route the clean, fully-formed summary packet to Slack
            await post_to_slack(lead_data=complete_lead_payload, journey=journey)
            
            # Phase 3 & Phase 4 Vault Bridge integrations
            from app.services.vault import sync_to_airtable, sync_to_notion
            
            # Push completed session summary metrics out to Airtable
            await sync_to_airtable(complete_lead_payload, journey)
            
            # Spin up the comprehensive canvas log layout space inside Notion
            await sync_to_notion(complete_lead_payload, journey)

            logger.info(f"✅ DeepSeek Batch Processing synchronized delivery complete for {aura_id}")

        except Exception as e:
            logger.error(f"🚨 Exit Logic Batch Error: {e}")

@router.post("/entry")
async def track_entry(payload: VisitCreate, request: Request, background_tasks: BackgroundTasks):
    client_ip = request.headers.get("x-forwarded-for", request.client.host).split(',')[0]
    background_tasks.add_task(process_entry_logic, payload, client_ip)
    return {"status": "accepted"}

@router.post("/identity")
async def track_identity(payload: IdentityPayload):
    """Upgrades anonymous forensic profiles using volunteered banner form data."""
    async with async_session_maker() as session:
        res = await session.execute(
            select(Visit).where(
                Visit.aura_id == payload.aura_id,
                Visit.client_id == payload.client_id
            ).order_by(Visit.created_at.desc())
        )
        visit = res.scalars().first()
        
        if not visit:
            return {"status": "visit_not_found"}

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
            visit.capture_source = payload.capture_source
            visit.verification_status = "verified" # Activate Janitor Shield
            visit.is_consented = True

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
    async with async_session_maker() as session:
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
async def track_exit(payload: PageViewCreate, background_tasks: BackgroundTasks):
    """Records session metrics upon departure and coordinates the batch analytical thread."""
    try:
        processed_duration = int(float(payload.duration))
    except (ValueError, TypeError):
        processed_duration = 0

    target_aura_id = payload.aura_id if getattr(payload, "aura_id", None) else payload.client_id

    async with async_session_maker() as session:
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

    # Launch Batch Intelligence processing sequentially when the session closes down
    if target_aura_id and payload.client_id:
        background_tasks.add_task(process_exit_logic, target_aura_id, payload.client_id)

    return {"status": "recorded"}