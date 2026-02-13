from fastapi import APIRouter, BackgroundTasks, Request, Header
from typing import Optional
from app.models.visit import VisitCreate, Visit
from app.models.pageview import PageViewCreate
from app.services.enrichment import enrich_visitor_data
from app.db import get_session
from sqlmodel import Session, select
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")

async def process_entry_logic(payload: VisitCreate, client_ip: str):
    """
    Background task to handle the heavy lifting: 
    IP enrichment, B2B filtering, and DB storage.
    """
    with Session(get_session()) as session:
        # 1. Check if this is an ISP or a real Company (The Enrichment Service)
        enriched_data = await enrich_visitor_data(client_ip)
        
        # 2. Create the Visit record
        db_visit = Visit(
            client_id=payload.client_id,
            url=payload.url,
            ip_address=client_ip,
            referrer=payload.referrer,
            company_name=enriched_data.get("company_name"),
            is_b2b=enriched_data.get("is_b2b", False),
            industry=enriched_data.get("industry"),
            city=enriched_data.get("city"),
            region=enriched_data.get("region")
        )
        
        session.add(db_visit)
        session.commit()
        logger.info(f"Entry logged: {db_visit.company_name} on {payload.url}")

@router.post("/entry")
async def track_entry(
    payload: VisitCreate, 
    request: Request, 
    background_tasks: BackgroundTasks,
    x_forwarded_for: Optional[str] = Header(None)
):
    """
    Endpoint for tracker.js Entry Ping.
    Returns 202 Accepted immediately to keep the client site fast.
    """
    # Get IP: Use X-Forwarded-For if behind a proxy (like Railway/Cloudflare)
    client_ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.client.host
    
    # Offload the heavy work to a background thread
    background_tasks.add_task(process_entry_logic, payload, client_ip)
    
    return {"status": "accepted"}

@router.post("/exit")
async def track_exit(payload: PageViewCreate):
    """
    Endpoint for tracker.js Exit Ping (sendBeacon).
    Updates the duration of the visit.
    """
    with Session(get_session()) as session:
        # Find the most recent visit for this client and URL from this IP
        # In a real-world scenario, you might use a Session ID or Cookie
        statement = select(Visit).where(
            Visit.client_id == payload.client_id,
            Visit.url == payload.url
        ).order_by(Visit.created_at.desc())
        
        visit = session.exec(statement).first()
        
        if visit:
            visit.duration = payload.duration
            session.add(visit)
            session.commit()
            logger.info(f"Exit logged: {visit.company_name} stayed for {payload.duration}s")
            
    return {"status": "recorded"}