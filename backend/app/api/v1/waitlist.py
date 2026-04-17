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

router = APIRouter()
logger = logging.getLogger("uvicorn")

# --- UTILS: Industrial Formatting ---
def format_zar(value: str) -> str:
    """Standardizes South African currency strings for industrial reporting."""
    if not value: return "N/A"
    if "m" in value.lower(): return "R1,000,000+"
    if "-" in value:
        parts = value.replace('k', '000').split('-')
        try:
            formatted_parts = [f"R{int(p.strip()):,}" for p in parts]
            return " - ".join(formatted_parts)
        except: return value
    clean_value = "".join(filter(str.isdigit, value))
    return f"R{int(clean_value):,}" if clean_value else value

async def background_lead_analysis(lead_id: int, aura_id: str, payload: dict):
    """
    Asynchronous orchestration of the forensic audit and journey mapping.
    Deferred processing to keep the user-facing response time under 200ms.
    """
    async with async_session_maker() as session:
        try:
            # Execute the Behavioral Ledger synthesis (DeepSeek + Cluster Analysis)
            journey = await get_visitor_journey(aura_id, session)
            
            # This is where the Phase 2 'Airtable Bridge' and Slack Dispatch will trigger
            logger.info(f"📊 Intelligence Analysis Complete for {aura_id} (Lead ID: {lead_id})")
        except Exception as e:
            logger.error(f"❌ Background Analysis Error: {e}")

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
        lead.name = payload.get("name") or lead.name
        lead.email = email
        lead.company_id = company.id
        lead.company_name_raw = raw_company_name or lead.company_name_raw
        lead.department = payload.get("department") or lead.department
        lead.position = payload.get("position") or payload.get("job_title") or lead.position
        lead.industry = payload.get("industry") or lead.industry
        lead.website = website or lead.website
        
        # Industrial-specific metrics
        lead.traffic = payload.get("traffic")
        lead.avg_price = payload.get("avg_price")
        lead.aura_id = aura_id
        
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

        # 4. DEFERRED JOURNEY MAPPING
        # Launch heavy intelligence analysis without blocking the UI response
        background_tasks.add_task(
            background_lead_analysis, 
            lead_id=lead.id, 
            aura_id=aura_id, 
            payload=payload
        )
        
        return {"status": "success", "message": "Lead promoted and forensic history shielded."}

    except Exception as e:
        await session.rollback()
        logger.error(f"🚨 Promotion Failure: {e}")
        raise HTTPException(status_code=500, detail="Industrial sync failed during promotion.")