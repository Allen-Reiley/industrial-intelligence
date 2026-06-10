from fastapi import APIRouter, BackgroundTasks, Request, Header, HTTPException, Depends
from typing import Optional, Dict, Any
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import logging
from datetime import datetime, timezone
from cachetools import TTLCache

# Internal AuraWorks Imports
from app.models.visit import Visit, VisitCreate, PageViewCreate
from app.models import Company, Prospect, PageView
from app.models.enrichment_queue import EnrichmentQueue, QueueType
from app.services.enrichment import enrich_visitor_data, EnrichmentError
from app.services.notifications import post_to_slack, handle_juristic_only_alert
from app.services.intelligence import get_visitor_journey
from app.db import async_session_maker, get_async_session
from uuid import UUID

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
    client_id: UUID
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
            from sqlalchemy import text
            await session.execute(
                text("SELECT set_config('app.current_client_id', :client_id, true)").bindparams(client_id=str(payload.client_id))
            )
            # 1. Forensic Enrichment (with defensive wrapper for Task 2.3)
            is_failed = False
            try:
                enriched_info = await enrich_visitor_data(client_ip)
            except EnrichmentError as e:
                logger.warning(f"⚠️ IPinfo enrichment failed for IP {client_ip}, queuing: {e}")
                is_failed = True
                enriched_info = {"company_name": "Anonymous Entity", "domain": "unknown.com", "city": "Unknown", "region": "ZA"}

            domain = enriched_info.get("domain")
            
            # 2. Entity Resolution Logic
            # Search by domain globally (since Company is a shared table)
            company = None
            if domain and domain not in ["unknown.com", "n/a"]:
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
                    company_name=enriched_info.get("company_name", "Unknown"),
                    domain=domain,
                    cipc_verified=False,
                    total_visits=1
                )
                session.add(company)

            
            await session.commit()
            if company: 
                await session.refresh(company)

            # Fire immediate departmental enrichment if the company domain is verified and it's a B2B visitor
            if company and company.domain and enriched_info.get("is_b2b", False):
                from app.services.enrichment import enrich_company_departments
                import asyncio
                asyncio.create_task(enrich_company_departments(company.id, company.domain))

            # 3. Persistence of the Forensic Trail
            db_visit = Visit(
                company_id=company.id if company else None,
                client_id=payload.client_id,
                aura_id=payload.aura_id,
                ip_address=client_ip,
                verification_status="verified" if (company and company.cipc_verified) else "verifying"
            )
            session.add(db_visit)
            await session.commit()
            await session.refresh(db_visit)

            # Check and trigger company intent surge alerts
            if company:
                from app.services.notifications import check_and_trigger_company_surge
                await check_and_trigger_company_surge(company.id, payload.client_id, session)


            # Create initial PageView record
            db_page_view = PageView(
                client_id=payload.client_id,
                visit_id=db_visit.id,
                url_path=payload.url,
                referrer=payload.referrer or "direct"
            )
            session.add(db_page_view)
            await session.commit()

            # 4. Queue to EnrichmentQueue if IPinfo lookup failed
            if is_failed:
                queue_entry = EnrichmentQueue(
                    client_id=payload.client_id,
                    visit_id=db_visit.id,
                    aura_id=payload.aura_id,
                    queue_type=QueueType.IPINFO,
                    payload={"ip_address": client_ip},
                    status="pending",
                    retry_count=0
                )
                session.add(queue_entry)
                await session.commit()
            
        except Exception as e:
            await session.rollback()
            logger.error(f"🚨 Silent Ingestion Error: {e}")

async def process_exit_logic(aura_id: str, client_id: str, duration: int = 0, has_downloaded_asset: bool = False):
    """
    THE BATCH PROCESSOR:
    Fires exclusively upon departure. Evaluates identity data gates to avoid chat pollution.
    Compiles the entire session trail into a single structured prompt for DeepSeek analysis.
    """
    if not async_session_maker:
        return

    # Anti-Spam: Skip duplicate execution loops for the same session footprint (Task 2.2 composite keys)
    cache_key = f"{client_id}:{aura_id}"
    if cache_key in exit_notification_cache:
        return

    async with async_session_maker() as session:
        try:
            from sqlalchemy import text
            await session.execute(
                text("SELECT set_config('app.current_client_id', :client_id, true)").bindparams(client_id=str(client_id))
            )
            # 1. Dual-lookup configuration mapping both individual context and corporate metadata independently
            # Individual context
            prospect_stmt = select(Prospect).where(
                Prospect.aura_id == aura_id,
                Prospect.client_id == UUID(client_id) if isinstance(client_id, str) else client_id
            )
            lead = (await session.execute(prospect_stmt)).scalars().first()

            # Corporate metadata: find active Company identification matching the cryptographic aura_id
            visit_stmt = select(Visit).where(
                Visit.aura_id == aura_id,
                Visit.client_id == UUID(client_id) if isinstance(client_id, str) else client_id,
                Visit.company_id != None
            ).order_by(Visit.created_at.desc())
            visit_with_company = (await session.execute(visit_stmt)).scalars().first()

            company = None
            if visit_with_company:
                company = await session.get(Company, visit_with_company.company_id)

            if not lead and not company:
                return

            if not lead and company:
                journey = await get_visitor_journey(aura_id, session)
                
                # Check if duration criteria breach the 15-second baseline tracking floor
                # Sum the durations of all visits for this session
                visits_stmt = select(Visit).where(
                    Visit.aura_id == aura_id,
                    Visit.client_id == UUID(client_id) if isinstance(client_id, str) else client_id
                )
                visits = (await session.execute(visits_stmt)).scalars().all()
                db_total_duration = sum(v.duration for v in visits if v.duration)
                effective_duration = max(duration, db_total_duration)

                if effective_duration >= 15 or has_downloaded_asset:
                    exit_notification_cache[cache_key] = True
                    await handle_juristic_only_alert(company, journey, client_id)
                return

            # Active context throttle lock
            exit_notification_cache[cache_key] = True
            logger.info(f"🚪 High-Intent Exit Flagged for {aura_id}. Compiling full DeepSeek journey matrix...")

            # 2. Compile the full session ledger into a single operational object
            journey = await get_visitor_journey(aura_id, session)

            # 3. Resolve Company Reference parameters
            company_name = lead.company_name_raw or "Anonymous Entity"
            if lead.company_id:
                company = await session.get(Company, lead.company_id)
                if company:
                    company_name = company.company_name

            # 4. Normalize the unified dataset dictionary payload with Location data included
            complete_prospect_payload = {
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
            await post_to_slack(prospect_data=complete_prospect_payload, journey=journey)
            
            # Phase 3 & Phase 4 Vault Bridge integrations
            from app.services.vault import sync_to_airtable, sync_to_notion
            
            # Push completed session summary metrics out to Airtable
            await sync_to_airtable(complete_prospect_payload, journey)
            
            # Spin up the comprehensive canvas log layout space inside Notion
            await sync_to_notion(complete_prospect_payload, journey)

            logger.info(f"✅ DeepSeek Batch Processing synchronized delivery complete for {aura_id}")

        except Exception as e:
            logger.error(f"🚨 Exit Logic Batch Error: {e}")

@router.post("/entry")
async def track_entry(payload: VisitCreate, request: Request, background_tasks: BackgroundTasks):
    client_ip = request.headers.get("x-forwarded-for", request.client.host).split(',')[0]
    background_tasks.add_task(process_entry_logic, payload, client_ip)
    return {"status": "accepted"}

@router.post("/identity")
async def track_identity(
    payload: IdentityPayload,
    session: AsyncSession = Depends(get_async_session)
):
    """Upgrades anonymous forensic profiles using volunteered banner form data."""
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
        drift_val = sig.get("drift")
        visit.clock_drift = str(drift_val) if drift_val is not None else None
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
            select(Prospect).where(
                Prospect.aura_id == payload.aura_id,
                Prospect.client_id == payload.client_id
            )
        )
        lead = res_lead.scalars().first()

        if not lead:
            lead = Prospect(
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
async def track_event(
    payload: PageViewCreate,
    session: AsyncSession = Depends(get_async_session)
):
    import traceback
    try:
        target_aura_id = payload.aura_id if getattr(payload, "aura_id", None) else str(payload.client_id)
        res = await session.execute(
            select(Visit).where(
                Visit.aura_id == target_aura_id
            ).order_by(Visit.created_at.desc())
        )
        visit = res.scalars().first()
        if visit:
            if getattr(payload, "event_type", None) == "intent_click":
                visit.intent_cluster = getattr(payload, "intent_cluster", "General")
            await session.commit()
            return {"status": "event_logged"}
        return {"status": "pending_entry"}
    except Exception as e:
        await session.rollback()
        logger.error(f"Event Route Exception: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/consent")
async def track_consent(
    payload: ConsentPayload,
    session: AsyncSession = Depends(get_async_session)
):
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
async def track_exit(
    payload: PageViewCreate,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_async_session)
):
    """Records session metrics upon departure and coordinates the batch analytical thread."""
    try:
        processed_duration = int(float(payload.duration))
    except (ValueError, TypeError):
        processed_duration = 0

    target_aura_id = payload.aura_id if getattr(payload, "aura_id", None) else str(payload.client_id)

    res = await session.execute(
        select(Visit).where(
            Visit.aura_id == target_aura_id
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
        background_tasks.add_task(
            process_exit_logic,
            target_aura_id,
            str(payload.client_id),
            processed_duration,
            getattr(payload, "has_downloaded_asset", False)
        )

    return {"status": "recorded"}


class IntentPayload(BaseModel):
    client_id: UUID
    aura_id: str
    vsl_completion_percentage: int
    vsl_abandoned: Optional[bool] = None


@router.post("/intent")
async def track_intent(
    payload: IntentPayload,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Tracks real-time prospect intent telemetry (e.g. VSL completion percentage).
    Updates Visit and Prospect records accordingly.
    Triggers Slack alerting on 100% completion.
    """
    from app.models.visit import Visit
    from app.models.prospect import Prospect
    from datetime import datetime, timezone
    
    # 1. Update Visit
    visit_stmt = select(Visit).where(
        Visit.aura_id == payload.aura_id,
        Visit.client_id == payload.client_id
    ).order_by(Visit.created_at.desc())
    visit_res = await session.execute(visit_stmt)
    visit = visit_res.scalars().first()
    
    now = datetime.now(timezone.utc)
    if visit:
        current_pct = visit.vsl_completion_percentage or 0
        if payload.vsl_completion_percentage > current_pct:
            visit.vsl_completion_percentage = payload.vsl_completion_percentage
            if payload.vsl_completion_percentage == 100:
                visit.vsl_completed_at = now
        if payload.vsl_abandoned is not None:
            visit.vsl_abandoned = payload.vsl_abandoned
        session.add(visit)
            
    # 2. Update Prospect (if a prospect exists for this aura_id and client_id)
    prospect_stmt = select(Prospect).where(
        Prospect.aura_id == payload.aura_id,
        Prospect.client_id == payload.client_id
    ).order_by(Prospect.created_at.desc())
    prospect_res = await session.execute(prospect_stmt)
    prospect = prospect_res.scalars().first()
    
    if prospect:
        current_pct = prospect.vsl_completion_percentage or 0
        if payload.vsl_completion_percentage > current_pct:
            prospect.vsl_completion_percentage = payload.vsl_completion_percentage
            if payload.vsl_completion_percentage == 100:
                prospect.vsl_completed_at = now
        if payload.vsl_abandoned is not None:
            prospect.vsl_abandoned = payload.vsl_abandoned
        session.add(prospect)

    await session.commit()
    
    # 3. Trigger Slack alerts if 100% complete
    if payload.vsl_completion_percentage == 100:
        company_name = None
        if prospect and prospect.company_name_raw:
            company_name = prospect.company_name_raw
        elif visit and visit.company_id:
            from app.models.company import Company
            company = await session.get(Company, visit.company_id)
            if company:
                company_name = company.company_name
                
        if company_name:
            from app.services.notifications import post_vsl_completion_to_slack
            background_tasks.add_task(post_vsl_completion_to_slack, company_name, payload.client_id, payload.aura_id)

    return {"status": "success", "percentage": payload.vsl_completion_percentage}