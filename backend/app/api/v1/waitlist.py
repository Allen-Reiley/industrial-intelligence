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
    Deferred processing to keep the user-facing response fast.
    """
    async with async_session_maker() as session:
        try:
            # Execute the Behavioral Ledger synthesis (DeepSeek + Cluster Analysis)
            journey = await get_visitor_journey(aura_id, session)
            
            # Additional enrichment logic (Airtable, Slack, etc.) would trigger here
            logger.info(f"📊 Intelligence Analysis Complete for {aura_id} (Lead: {lead_id})")
        except Exception as e:
            logger.error(f"❌ Background Analysis Error: {e}")

@router.post("/join")
async def join_waitlist(
    payload: dict, 
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Primary Promotion Engine: 
    Converts anonymous traffic into a Consented 'Warm Lead'.
    Synchronizes volunteered data with forensic signatures.
    """
    logger.info(f"--- 📡 AURA SIGNAL: [PROMOTION INITIATED] ---")
    
    email = payload.get("email")
    aura_id = payload.get("aura_id")
    client_id = payload.get("client_id") # Multi-tenancy anchor
    raw_company_name = payload.get("company") or payload.get("company_name")
    website = payload.get("website")

    if not email or not client_id:
        raise HTTPException(status_code=400, detail="Incomplete lead parameters.")

    try:
        # 1. Resolve Jurisdictive Entity (Company Anchor)
        domain = None
        if website:
            domain = website.replace("https://", "").replace("http://", "").split("/")[0].lower()
        
        # Search for company by domain or name within the client's silo
        company_stmt = select(Company).where(
            (Company.client_id == client_id) & 
            ((Company.domain == domain) if domain else (Company.name == raw_company_name))
        )
        res_company = await session.execute(company_stmt)
        company = res_company.scalars().first()

        if not company:
            company = Company(
                client_id=client_id,
                name=raw_company_name or "Unknown Industrial Entity", 
                domain=domain,
                industry=payload.get("industry"),
                is_verified=True # Form submission auto-verifies the company name
            )
            session.add(company)
            await session.commit()
            await session.refresh(company)

        # 2. Identity Promotion (POPIA Consented Lead)
        # Check if a 'Warm Lead' already exists (e.g., from a partial banner capture)
        lead_stmt = select(WaitlistLead).where(
            WaitlistLead.email == email,
            WaitlistLead.client_id == client_id
        )
        res_lead = await session.execute(lead_stmt)
        lead = res_lead.scalars().first()
        
        if not lead:
            # Also check by aura_id if email was previously unknown
            aura_lead_stmt = select(WaitlistLead).where(
                WaitlistLead.aura_id == aura_id,
                WaitlistLead.client_id == client_id
            )
            res_aura = await session.execute(aura_lead_stmt)
            lead = res_aura.scalars().first()

        if not lead:
            lead = WaitlistLead(email=email, client_id=client_id, aura_id=aura_id)
        
        # Deep Merge: Update all identity and professional context fields
        lead.name = payload.get("name") or lead.name
        lead.email = email
        lead.company_id = company.id
        lead.company_name_raw = raw_company_name or lead.company_name_raw
        lead.department = payload.get("department") or lead.department
        lead.position = payload.get("position") or payload.get("job_title") or lead.position
        lead.industry = payload.get("industry") or lead.industry
        lead.website = website or lead.website
        lead.traffic = payload.get("traffic")
        lead.avg_price = payload.get("avg_price")
        lead.aura_id = aura_id
        
        session.add(lead)

        # 3. Forensic Stitching & Janitor Shield
        # Immediately promote all historical visits to 'verified' to prevent the 48h purge
        if aura_id:
            visit_stmt = select(Visit).where(Visit.aura_id == aura_id)
            res_visits = await session.execute(visit_stmt)
            past_visits = res_visits.scalars().all()
            for v in past_visits:
                v.is_consented = True
                v.verification_status = "verified" 
                v.company_id = company.id
                session.add(v)

        await session.commit()
        await session.refresh(lead)

        # 4. DEFERRED JOURNEY MAPPING
        # Pass the forensic data for DeepSeek analysis in the background
        background_tasks.add_task(
            background_lead_analysis, 
            lead_id=lead.id, 
            aura_id=aura_id, 
            payload=payload
        )
        
        return {"status": "success", "message": "Lead verified and promoted."}

    except Exception as e:
        await session.rollback()
        logger.error(f"🚨 Promotion Failure: {e}")
        raise HTTPException(status_code=500, detail="Industrial sync failed.")