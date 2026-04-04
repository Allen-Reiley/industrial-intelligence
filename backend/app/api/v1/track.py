from fastapi import APIRouter, BackgroundTasks, Request, Header
from typing import Optional
from datetime import datetime, timedelta, timezone
from app.models.visit import VisitCreate, Visit
from app.models.company import Company
from app.models.pageview import PageViewCreate
from app.services.enrichment import enrich_visitor_data
from app.services.contacts import get_corporate_contacts 
from sqlmodel import Session, select, func
from app.db import engine
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")

class ConsentPayload(BaseModel):
    client_id: str
    aura_id: str
    status: str  # "accepted"

async def process_entry_logic(payload: VisitCreate, client_ip: str):
    """
    Jurisdictive Entity Resolution: Resolves the Company first, then logs the Visit.
    """
    with Session(engine) as session:
        # 1. Resolve or Create the Jurisdictive Entity (Company)
        # We use the domain as the unique anchor for the company
        enriched_info = await enrich_visitor_data(client_ip)
        domain = enriched_info.get("domain")
        company_name = enriched_info.get("company_name", "Unknown")

        company = None
        if domain:
            company_statement = select(Company).where(Company.domain == domain)
            company = session.exec(company_statement).first()

        if not company and company_name != "Unknown":
            # Create new Juristic Person record
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
            logger.info(f"🏢 New Jurisdictive Entity Created: {company.name}")
        elif company:
            # Update existing entity stats
            company.total_visits += 1
            session.add(company)

        # 2. Log the Granular Visit
        # Check if this specific aura_id has already given technical consent
        # (This would have been toggled by the /consent endpoint)
        db_visit = Visit(
            company_id=company.id if company else None,
            client_id=payload.client_id,
            aura_id=payload.aura_id,
            ip_address=client_ip,
            url=payload.url,
            referrer=payload.referrer,
            screen_resolution=payload.screen_resolution,
            # If we already have a consented visit for this aura_id, keep it true
            is_consented=False 
        )
        
        session.add(db_visit)
        session.commit()
        logger.info(f"📍 Visit Logged: {company.name if company else 'Anonymous'} | ID: {payload.aura_id[:8]}")

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

@router.post("/consent")
async def track_consent(payload: ConsentPayload):
    """
    Gate 1: The 'Authorize Sync' Handshake.
    Promotes all current and future visits for this aura_id to 'Consented' status.
    """
    try:
        with Session(engine) as session:
            statement = select(Visit).where(Visit.aura_id == payload.aura_id)
            visits = session.exec(statement).all()
            
            for visit in visits:
                visit.is_consented = True
                session.add(visit)
            
            session.commit()
            logger.info(f"✅ POPIA Technical Consent Granted: {payload.aura_id[:8]}")
            return {"status": "consent_recorded"}
    except Exception as e:
        logger.error(f"❌ Consent Error: {e}")
        return {"status": "error"}

@router.post("/exit")
async def track_exit(payload: PageViewCreate):
    try:
        with Session(engine) as session:
            statement = select(Visit).where(
                Visit.client_id == payload.client_id,
                Visit.url == payload.url
            ).order_by(Visit.created_at.desc())
            
            visit = session.exec(statement).first()
            if visit:
                visit.duration = payload.duration
                session.add(visit)
                session.commit()
                return {"status": "recorded"}
            return {"status": "pending_entry"}
    except Exception as e:
        logger.error(f"❌ Exit Error: {e}")
        return {"status": "error"}