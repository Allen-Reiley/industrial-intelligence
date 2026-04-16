# backend/app/api/v1/waitlist.py
import logging
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks, Depends
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_async_session, async_session_maker
from app.models.waitlist import WaitlistLead 
from app.models.company import Company
from app.models.visit import Visit
from app.core.config import settings
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
    """
    async with async_session_maker() as session:
        try:
            # Execute the Behavioral Ledger synthesis
            journey = await get_visitor_journey(aura_id, session)
            
            # Logic for Airtable/Slack dispatch would go here
            logger.info(f"📊 Lead Analysis Complete for {aura_id}: {journey['intent_summary'][:50]}...")
        except Exception as e:
            logger.error(f"❌ Background Analysis Error: {e}")

@router.post("/join")
async def join_waitlist(
    payload: dict, 
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Entry point for the AuraWorks Intelligence Pipeline.
    Promotes a Forensic Signature to a Consented Lead and immunizes history.
    """
    logger.info(f"--- 📡 AURA SIGNAL: [PROMOTION INITIATED] ---")
    
    email = payload.get("email")
    aura_id = payload.get("aura_id")
    raw_company_name = payload.get("company") or payload.get("company_name")
    website = payload.get("website")

    if not email:
        raise HTTPException(status_code=400, detail="Work email required.")

    try:
        # 1. Resolve Jurisdictive Entity (Company Anchor)
        domain = None
        if website:
            domain = website.replace("https://", "").replace("http://", "").split("/")[0].lower()
        
        company = None
        if domain:
            res = await session.execute(select(Company).where(Company.domain == domain))
            company = res.scalars().first()
        
        if not company and raw_company_name:
            res = await session.execute(select(Company).where(Company.name == raw_company_name))
            company = res.scalars().first()

        if not company:
            company = Company(
                name=raw_company_name or "Unknown Industrial Entity", 
                domain=domain,
                industry=payload.get("industry")
            )
            session.add(company)
            await session.commit()
            await session.refresh(company)

        # 2. Identity Promotion (POPIA Consented Lead)
        res = await session.execute(select(WaitlistLead).where(WaitlistLead.email == email))
        lead = res.scalars().first()
        
        if not lead:
            lead = WaitlistLead(email=email)
        
        lead.name = payload.get("name")
        lead.company_id = company.id
        lead.company_name_raw = raw_company_name
        lead.industry = payload.get("industry")
        lead.website = website
        lead.traffic = payload.get("traffic")
        lead.avg_price = payload.get("avg_price")
        lead.aura_id = aura_id
        
        session.add(lead)

        # 3. Forensic Stitching & Janitor Shield
        if aura_id:
            res = await session.execute(select(Visit).where(Visit.aura_id == aura_id))
            past_visits = res.scalars().all()
            for v in past_visits:
                v.is_consented = True
                v.verification_status = "verified" # The Janitor Shield
                v.company_id = company.id
                session.add(v)

        await session.commit()
        await session.refresh(lead)

        # 4. CHAINED EXECUTION
        payload["formatted_price"] = format_zar(payload.get('avg_price'))
        payload["company_name_final"] = company.name

        background_tasks.add_task(
            background_lead_analysis, 
            lead_id=lead.id, 
            aura_id=aura_id, 
            payload=payload
        )
        
        return {"status": "success", "message": "Phase 01 Audit Queued"}

    except Exception as e:
        await session.rollback()
        logger.error(f"🚨 Promotion Failure: {e}")
        raise HTTPException(status_code=500, detail="Synchronization delay.")