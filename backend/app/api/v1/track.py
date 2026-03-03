from fastapi import APIRouter, BackgroundTasks, Request, Header
from typing import Optional
from app.models.visit import VisitCreate, Visit
from app.models.pageview import PageViewCreate
from app.services.enrichment import enrich_visitor_data
from app.services.contacts import get_corporate_contacts  # 🎯 New Import
from sqlmodel import Session, select
from app.db import engine
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")

async def process_entry_logic(payload: VisitCreate, client_ip: str):
    """
    Background task to handle IP enrichment and DB storage.
    """
    # Use the ENGINE directly for background tasks
    with Session(engine) as session:
        # 1. Check if this is an ISP or a real Company
        enriched_data = await enrich_visitor_data(client_ip)
        
        # We only run this if it's a B2B lead and we found a domain
        contact_data = {"hq_phone": None, "corp_emails": []}

        if enriched_data.get("is_b2b") and enriched_data.get("domain"):
            contact_data = await get_corporate_contacts(enriched_data["domain"])

        # 2. Create the Visit record
        db_visit = Visit(
            client_id=payload.client_id,
            url=payload.url,
            ip_address=client_ip,
            referrer=payload.referrer,
            company_name=enriched_data.get("company_name"),
            domain=enriched_data.get("domain"), # 🎯 New
            is_b2b=enriched_data.get("is_b2b", False),
            industry=enriched_data.get("industry"),
            city=enriched_data.get("city"),
            region=enriched_data.get("region"),
            
            # Contact Data
            hq_phone=contact_data.get("hq_phone"), # 🎯 New
            # Store emails as a comma-separated string for easy DB storage
            corp_emails=", ".join(contact_data.get("corp_emails", [])) if contact_data.get("corp_emails") else None
        )
        
        session.add(db_visit)
        session.commit()
        session.refresh(db_visit)
        logger.info(f"Entry logged: {db_visit.company_name} from {client_ip}")

@router.post("/entry")
async def track_entry(
    payload: VisitCreate, 
    request: Request, 
    background_tasks: BackgroundTasks,
    x_forwarded_for: Optional[str] = Header(None)
):
    # Get IP: Use X-Forwarded-For if behind a proxy
    client_ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.client.host

    #? Spoofing Google LLC for testing purposes
    # client_ip = "8.8.8.8"
    
    # Offload to background thread
    background_tasks.add_task(process_entry_logic, payload, client_ip)
    
    
    return {"status": "accepted"}

@router.post("/exit")
async def track_exit(payload: PageViewCreate):
    """
    Endpoint for tracker.js Exit Ping. Updates the duration.
    """
    with Session(engine) as session:
        # Find the most recent visit for this client and URL
        statement = select(Visit).where(
            Visit.client_id == payload.client_id,
            Visit.url == payload.url
        ).order_by(Visit.created_at.desc())
        
        visit = session.exec(statement).first()
        
        if not visit:
            logger.warning(f"Exit received but no matching Entry found for client {payload.client_id}")
            return {"status": "pending_entry"}

        visit.duration = payload.duration
        session.add(visit)
        session.commit()
        logger.info(f"Exit logged: {visit.company_name} stayed for {payload.duration}s")
            
    return {"status": "recorded"}