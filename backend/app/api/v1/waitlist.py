import logging
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from sqlmodel import Session, select
from app.db import engine
from app.models.waitlist import WaitlistLead 
from app.models.company import Company
from app.models.visit import Visit
from app.core.config import settings
# We will create orchestrate_lead_audit in the next step
from app.services.intelligence import orchestrate_lead_audit 

router = APIRouter()
logger = logging.getLogger("uvicorn")

# --- UTILS: Industrial Formatting ---
def format_zar(value: str) -> str:
    """Handles both raw numbers and dropdown ranges for industrial pricing."""
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

@router.post("/join")
async def join_waitlist(payload: dict, request: Request, background_tasks: BackgroundTasks):
    """
    Entry point for the AuraWorks Intelligence Pipeline.
    Promotes a Forensic Signature to a Consented Lead.
    """
    logger.info(f"--- 📡 AURA SIGNAL: [PROMOTION INITIATED] ---")
    
    email = payload.get("email")
    aura_id = payload.get("aura_id")
    raw_company_name = payload.get("company") or payload.get("company_name")
    website = payload.get("website")

    if not email:
        raise HTTPException(status_code=400, detail="Work email required.")

    with Session(engine) as session:
        try:
            # 1. Resolve Jurisdictive Entity (Company Anchor)
            domain = None
            if website:
                domain = website.replace("https://", "").replace("http://", "").split("/")[0].lower()
            
            company = None
            if domain:
                company = session.exec(select(Company).where(Company.domain == domain)).first()
            
            if not company and raw_company_name:
                company = session.exec(select(Company).where(Company.name == raw_company_name)).first()

            if not company:
                company = Company(
                    name=raw_company_name or "Unknown Industrial Entity", 
                    domain=domain,
                    industry=payload.get("industry")
                )
                session.add(company)
                session.commit()
                session.refresh(company)

            # 2. Identity Promotion (POPIA Consented Lead)
            lead = session.exec(select(WaitlistLead).where(WaitlistLead.email == email)).first()
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

            # 3. Forensic Stitching: Anchor anonymous history to this identity
            if aura_id:
                past_visits = session.exec(select(Visit).where(Visit.aura_id == aura_id)).all()
                for v in past_visits:
                    v.is_consented = True
                    v.company_id = company.id
                    session.add(v)

            session.commit()
            session.refresh(lead)

            # 4. CHAINED EXECUTION: 
            # We move away from immediate Slack triggers.
            # We hand off to a single orchestrator that manages DeepSeek -> Slack -> Postmark
            payload["formatted_price"] = format_zar(payload.get('avg_price'))
            payload["company_name_final"] = company.name

            background_tasks.add_task(
                orchestrate_lead_audit, 
                lead_id=lead.id, 
                aura_id=aura_id, 
                payload=payload
            )
            
            return {"status": "success", "message": "Phase 01 Audit Queued"}

        except Exception as e:
            session.rollback()
            logger.error(f"🚨 Promotion Failure: {e}")
            raise HTTPException(status_code=500, detail="Synchronization delay.")