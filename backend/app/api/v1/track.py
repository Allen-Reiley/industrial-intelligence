from fastapi import APIRouter, BackgroundTasks, Request, Header
from typing import Optional
from datetime import datetime
from app.models.visit import VisitCreate, Visit
from app.models.pageview import PageViewCreate
from app.services.enrichment import enrich_visitor_data
from app.services.contacts import get_corporate_contacts 
from sqlmodel import Session, select
from app.db import engine
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")

async def process_entry_logic(payload: VisitCreate, client_ip: str):
    """
    Consolidates traffic by IP/URL and handles enrichment.
    """
    with Session(engine) as session:
        # 1. Check if this specific Entity (IP + Page) already exists in our feed
        # We look for the most recent record for this IP and URL
        statement = select(Visit).where(
            Visit.ip_address == client_ip,
            Visit.url == payload.url,
            Visit.client_id == payload.client_id
        ).order_by(Visit.created_at.desc())
        
        existing_visit = session.exec(statement).first()

        if existing_visit:
            # 2. Logic: Increment existing record to avoid clutter
            try:
                # Assuming hit_count exists in your model (default 1)
                existing_visit.hit_count = (existing_visit.hit_count or 1) + 1
                existing_visit.updated_at = datetime.utcnow()
                
                session.add(existing_visit)
                session.commit()
                logger.info(f"📈 Signal Strengthened: {existing_visit.company_name} | Hits: {existing_visit.hit_count}")
                return
            except Exception as e:
                logger.error(f"⚠️ Failed to increment hit_count: {e}")
                # Fall through to create a new one if update fails

        # 3. New Entity Logic (Enrichment only happens for NEW entries)
        enriched_data = {"company_name": "Unknown", "is_b2b": False}
        contact_data = {"hq_phone": None, "corp_emails": []}

        try:
            enriched_data = await enrich_visitor_data(client_ip)
            if enriched_data.get("is_b2b") and enriched_data.get("domain"):
                try:
                    contact_data = await get_corporate_contacts(enriched_data["domain"])
                except Exception as e:
                    logger.error(f"⚠️ Contact Enrichment Failed: {e}")
        except Exception as e:
            logger.error(f"❌ Enrichment Failure for {client_ip}: {e}")

        try:
            db_visit = Visit(
                client_id=payload.client_id,
                url=payload.url,
                ip_address=client_ip,
                referrer=payload.referrer,
                company_name=enriched_data.get("company_name", "Unknown"),
                domain=enriched_data.get("domain"),
                is_b2b=enriched_data.get("is_b2b", False),
                industry=enriched_data.get("industry"),
                city=enriched_data.get("city"),
                region=enriched_data.get("region"),
                hq_phone=contact_data.get("hq_phone"),
                corp_emails=", ".join(contact_data.get("corp_emails", [])) if contact_data.get("corp_emails") else None,
                hit_count=1 # Initialize the counter
            )
            
            session.add(db_visit)
            session.commit()
            logger.info(f"✨ New Entity Resolved: {db_visit.company_name} | IP: {client_ip}")
            
        except Exception as e:
            logger.error(f"🚨 DATABASE COMMIT FAILED: {e}")

@router.post("/entry")
async def track_entry(
    payload: VisitCreate, 
    request: Request, 
    background_tasks: BackgroundTasks,
    x_forwarded_for: Optional[str] = Header(None)
):
    client_ip = "127.0.0.1"
    if x_forwarded_for:
        client_ip = x_forwarded_for.split(',')[0].strip()
    elif request.client:
        client_ip = request.client.host

    logger.info(f"⚡ Ping from {client_ip} on {payload.url}")
    background_tasks.add_task(process_entry_logic, payload, client_ip)
    return {"status": "accepted"}

@router.post("/exit")
async def track_exit(payload: PageViewCreate):
    try:
        with Session(engine) as session:
            # Match the most recent visit to update duration
            statement = select(Visit).where(
                Visit.client_id == payload.client_id,
                Visit.url == payload.url
            ).order_by(Visit.updated_at.desc()) # Use updated_at since hit_count refreshes it
            
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