from fastapi import APIRouter, BackgroundTasks, Request, Header
from typing import Optional
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
    REINFORCED: Handles IP enrichment with safety nets to ensure DB storage.
    """
    with Session(engine) as session:
        # Initialize defaults so the Visit record can still be created if APIs fail
        enriched_data = {"company_name": "Unknown", "is_b2b": False}
        contact_data = {"hq_phone": None, "corp_emails": []}

        try:
            # 1. Attempt Enrichment
            enriched_data = await enrich_visitor_data(client_ip)
            
            # 2. Attempt Contact Data (only if B2B)
            if enriched_data.get("is_b2b") and enriched_data.get("domain"):
                try:
                    contact_data = await get_corporate_contacts(enriched_data["domain"])
                except Exception as e:
                    logger.error(f"⚠️ Contact Enrichment Failed for {enriched_data['domain']}: {e}")
        
        except Exception as e:
            # If the enrichment service crashes, we still want to log the visit!
            logger.error(f"❌ Critical Enrichment Failure for IP {client_ip}: {e}")

        try:
            # 3. Create the Visit record (The "Identity" save)
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
                
                # Contact Data
                hq_phone=contact_data.get("hq_phone"),
                corp_emails=", ".join(contact_data.get("corp_emails", [])) if contact_data.get("corp_emails") else None
            )
            
            session.add(db_visit)
            session.commit()
            session.refresh(db_visit)
            logger.info(f"✅ Visit Saved: {db_visit.company_name} | IP: {client_ip}")
            
        except Exception as e:
            logger.error(f"🚨 DATABASE COMMIT FAILED: {e}")

@router.post("/entry")
async def track_entry(
    payload: VisitCreate, 
    request: Request, 
    background_tasks: BackgroundTasks,
    x_forwarded_for: Optional[str] = Header(None)
):
    # 1. Safer IP Extraction (Fixes the 'NoneType' error)
    client_ip = "127.0.0.1" # Default fallback
    
    if x_forwarded_for:
        client_ip = x_forwarded_for.split(',')[0].strip()
    elif request.client:
        client_ip = request.client.host

    # 2. Log the attempt so we can see it in Railway Logs
    logger.info(f"⚡ Tracking attempt received for Client: {payload.client_id} from IP: {client_ip}")

    # Offload to background thread
    background_tasks.add_task(process_entry_logic, payload, client_ip)
    
    return {"status": "accepted"}

@router.post("/exit")
async def track_exit(payload: PageViewCreate):
    """
    Updates the duration of the most recent visit.
    """
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
                logger.info(f"⏱️ Duration Updated: {visit.company_name} for {payload.duration}s")
                return {"status": "recorded"}
            
            logger.warning(f"❓ Exit received, no Entry found: {payload.client_id}")
            return {"status": "pending_entry"}
    except Exception as e:
        logger.error(f"❌ Exit Logging Error: {e}")
        return {"status": "error"}