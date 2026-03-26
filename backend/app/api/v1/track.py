from fastapi import APIRouter, BackgroundTasks, Request, Header
from typing import Optional
from app.models.visit import VisitCreate, Visit
from app.models.pageview import PageViewCreate
from app.services.enrichment import enrich_visitor_data
from app.services.contacts import get_corporate_contacts 
from sqlmodel import Session, select
from app.db import engine
import logging

# 🛠️ Handled in main.py: app.include_router(track.router, prefix=f"{settings.API_V1_STR}/track")
router = APIRouter()
logger = logging.getLogger("uvicorn")

async def process_entry_logic(payload: VisitCreate, client_ip: str):
    """
    Handles IP enrichment and DB storage with safety nets.
    """
    with Session(engine) as session:
        enriched_data = {"company_name": "Unknown", "is_b2b": False}
        contact_data = {"hq_phone": None, "corp_emails": []}

        try:
            # 1. Attempt Enrichment using the dynamic client_ip
            enriched_data = await enrich_visitor_data(client_ip)
            
            # 2. Attempt Contact Data (only if B2B)
            if enriched_data.get("is_b2b") and enriched_data.get("domain"):
                try:
                    contact_data = await get_corporate_contacts(enriched_data["domain"])
                except Exception as e:
                    logger.error(f"⚠️ Contact Enrichment Failed for {enriched_data['domain']}: {e}")
        
        except Exception as e:
            logger.error(f"❌ Critical Enrichment Failure for IP {client_ip}: {e}")

        try:
            # 3. Create the Visit record
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
                
                # Contact Data mapped to DB columns
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
    """
    Endpoint: /api/v1/track/entry
    Captures oncoming traffic IP and offloads enrichment to background tasks.
    """
    # Dynamic IP Extraction (Prioritize proxy header for Railway, fallback to direct client host)
    client_ip = "127.0.0.1"
    if x_forwarded_for:
        # Get the first IP if multiple exist (standard proxy behavior)
        client_ip = x_forwarded_for.split(',')[0].strip()
    elif request.client:
        client_ip = request.client.host

    logger.info(f"⚡ Tracking attempt received for Client: {payload.client_id} from IP: {client_ip}")

    # Offload heavy lifting to background to keep the tracker responsive
    background_tasks.add_task(process_entry_logic, payload, client_ip)
    
    return {"status": "accepted"}

@router.post("/exit")
async def track_exit(payload: PageViewCreate):
    """
    Endpoint: /api/v1/track/exit
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
            
            return {"status": "pending_entry"}
    except Exception as e:
        logger.error(f"❌ Exit Logging Error: {e}")
        return {"status": "error"}