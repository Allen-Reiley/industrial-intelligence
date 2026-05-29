# backend/app/api/v1/waitlist.py
import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_async_session, async_session_maker
from app.models.waitlist import WaitlistLead 
from app.models.company import Company
from app.models.visit import Visit
from app.services.intelligence import get_visitor_journey
# PHASE 1: Import the new Resend notification engine
from app.services.email import send_waitlist_success_email

router = APIRouter()
logger = logging.getLogger("uvicorn")

# --- UTILS: Industrial Formatting ---
def format_zar(value: str) -> str:
    """Standardizes South African currency strings for industrial reporting."""
    if not value: 
        return "N/A"
    
    val_str = str(value).strip().lower()
    if "m" in val_str: 
        return "R1,000,000+"
    if "-" in val_str:
        parts = val_str.replace('k', '000').split('-')
        try:
            formatted_parts = [f"R{int(p.strip()):,}" for p in parts]
            return " - ".join(formatted_parts)
        except: 
            return str(value)
            
    clean_value = "".join(filter(str.isdigit, val_str.replace('k', '000')))
    return f"R{int(clean_value):,}" if clean_value else str(value)

async def background_lead_analysis(lead_id: int, aura_id: str, payload: dict):
    """
    Sequential Forensic Orchestration Engine.
    Holds back external system sinks (Slack) until DeepSeek and 
    firmographic intelligence have fully compiled their data.
    """
    if not async_session_maker:
        logger.error("❌ background_lead_analysis: Aborted. Async Engine offline.")
        return

    async with async_session_maker() as session:
        try:
            logger.info(f"⏳ Ingesting Sequential Audit Pipeline for Lead ID: {lead_id}")

            # 1. Pull the fresh lead record to get the linked company context
            lead_stmt = select(WaitlistLead).where(WaitlistLead.id == lead_id)
            lead_res = await session.execute(lead_stmt)
            lead = lead_res.scalars().first()

            if not lead:
                logger.error(f"❌ Sequential Pipeline Error: Lead ID {lead_id} not found in DB.")
                return

            # 2. Compile Unified Journey & Ghost Enrichment (Awaits DeepSeek completely before proceeding)
            journey = await get_visitor_journey(aura_id, session)

            # 3. Pull resolved company context for notifications
            company_name = "Anonymous Entity"
            if lead.company_id:
                company = await session.get(Company, lead.company_id)
                if company:
                    company_name = company.name
            elif lead.company_name_raw:
                company_name = lead.company_name_raw

            # 4. Pack the complete, unified data dictionary
            complete_lead_payload = {
                "id": lead.id,
                "aura_id": lead.aura_id,
                "name": lead.name,
                "email": lead.email,
                "company_name_final": company_name,
                "department": lead.department or "Undetermined",
                "position": lead.position or "Evaluator",
                "industry": lead.industry or "Industrial",
                "website": lead.website or "N/A",
                "capture_source": "waitlist_conversion",
                "traffic": lead.traffic or "N/A",
                "avg_price": lead.avg_price or "N/A"
            }

            logger.info(f"✨ DeepSeek Data compiled for Lead ID {lead_id}. Releasing external notification gates...")

            # =================================================================
            # 5. RELEASE GATES: Dispatch completed data packets sequentially
            # =================================================================
            
            # Dispatch Premium Identity Promotion Alert to Slack with full data resolved
            from app.services.notifications import post_to_slack
            await post_to_slack(lead_data=complete_lead_payload, journey=journey)

            # Future Phase 2 Bridges can plug in here cleanly:
            # await sync_to_airtable(complete_lead_payload, journey)
            # await sync_to_notion(complete_lead_payload, journey)

            logger.info(f"✅ Full Synchronization Cycle Complete for Lead ID: {lead_id}")

        except Exception as e:
            logger.error(f"🚨 Sequential Lead Pipeline Failure for Lead ID {lead_id}: {e}")

@router.post("/join")
async def join_waitlist(
    payload: dict, 
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_async_session)
):
    """
    The Promotion Engine: 
    Converts anonymous traffic into a POPIA-consented 'Warm Lead'.
    Synchronizes volunteered company data with backend forensic signatures.
    """
    logger.info(f"--- 📡 AURA SIGNAL: [PROMOTION INITIATED] ---")
    
    email = payload.get("email")
    aura_id = payload.get("aura_id")
    client_id = payload.get("client_id") # Anchor for multi-tenancy
    raw_company_name = payload.get("company") or payload.get("company_name")
    website = payload.get("website")
    recipient_name = payload.get("name")

    if not email or not client_id:
        raise HTTPException(status_code=400, detail="Incomplete lead parameters (Email/Client ID missing).")

    try:
        # 1. Resolve Jurisdictive Entity (Company Anchor)
        domain = None
        if website:
            domain = website.replace("https://", "").replace("http://", "").split("/")[0].lower()
        
        # Search for company by domain or name within the specific client's silo
        company_stmt = select(Company).where(
            (Company.client_id == client_id) & 
            ((Company.domain == domain) if domain else (Company.name == raw_company_name))
        )
        res_company = await session.execute(company_stmt)
        company = res_company.scalars().first()

        if not company:
            # Create a new Juristic record if this is a first-time encounter
            company = Company(
                client_id=client_id,
                name=raw_company_name or "Unknown Industrial Entity", 
                domain=domain,
                industry=payload.get("industry"),
                is_verified=True # Direct form submission serves as manual verification
            )
            session.add(company)
            await session.commit()
            await session.refresh(company)

        # 2. Identity Promotion & Lead Deep-Merge
        # Check if we already have a partial record for this person
        lead_stmt = select(WaitlistLead).where(
            WaitlistLead.email == email,
            WaitlistLead.client_id == client_id
        )
        res_lead = await session.execute(lead_stmt)
        lead = res_lead.scalars().first()
        
        if not lead and aura_id:
            # Fallback: check if we have a record based on their browser ID
            aura_lead_stmt = select(WaitlistLead).where(
                WaitlistLead.aura_id == aura_id,
                WaitlistLead.client_id == client_id
            )
            res_aura = await session.execute(aura_lead_stmt)
            lead = res_aura.scalars().first()

        if not lead:
            lead = WaitlistLead(email=email, client_id=client_id, aura_id=aura_id)
        
        # Merge volunteered context into the Lead object
        lead.name = recipient_name or lead.name
        lead.email = email
        lead.company_id = company.id
        lead.company_name_raw = raw_company_name or lead.company_name_raw
        lead.department = payload.get("department") or lead.department
        lead.position = payload.get("position") or payload.get("job_title") or lead.position
        lead.industry = payload.get("industry") or lead.industry
        lead.website = website or lead.website
        
        # Industrial-specific metrics formatting normalization
        lead.traffic = payload.get("traffic")
        lead.avg_price = format_zar(payload.get("avg_price")) if payload.get("avg_price") else lead.avg_price
        lead.aura_id = aura_id or lead.aura_id
        
        session.add(lead)

        # 3. Forensic Stitching & The Janitor Shield
        # Promote all historical visits to 'verified' to prevent 48h automated deletion
        if aura_id:
            visit_stmt = select(Visit).where(Visit.aura_id == aura_id)
            res_visits = await session.execute(visit_stmt)
            past_visits = res_visits.scalars().all()
            for v in past_visits:
                v.is_consented = True
                v.verification_status = "verified" # The Janitor Shield active
                v.company_id = company.id
                session.add(v)

        await session.commit()
        await session.refresh(lead)

        # 4. DEFERRED JOURNEY MAPPING & NOTIFICATIONS
        # Launch heavy intelligence analysis without blocking the UI response
        background_tasks.add_task(
            background_lead_analysis, 
            lead_id=lead.id, 
            aura_id=aura_id, 
            payload=payload
        )
        
        # PHASE 1: Schedule the Resend confirmation email dispatch asynchronously
        background_tasks.add_task(
            send_waitlist_success_email,
            recipient_email=email,
            recipient_name=recipient_name
        )
        
        return {"status": "success", "message": "Lead promoted and forensic history shielded. Confirmation queued."}

    except Exception as e:
        await session.rollback()
        logger.error(f"🚨 Promotion Failure: {e}")
        raise HTTPException(status_code=500, detail="Industrial sync failed during promotion.")