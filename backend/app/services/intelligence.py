import httpx
import logging
import asyncio
from datetime import datetime, timedelta, timezone
from sqlmodel import Session, select
from app.models.visit import Visit
from app.db import engine
from app.core.config import settings

logger = logging.getLogger("uvicorn")

async def get_firmographic_data(ip_address: str):
    """
    Converts IP to Company Identity using IPinfo.
    """
    if not settings.IPINFO_TOKEN or ip_address in ["127.0.0.1", "::1"]:
        return None

    url = f"https://ipinfo.io/{ip_address}?token={settings.IPINFO_TOKEN}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5.0)
            if response.status_code != 200:
                return None
                
            data = response.json()
            company = data.get("company", {})
            
            if company.get("type") == "business":
                return {
                    "name": company.get("name"),
                    "domain": company.get("domain"),
                    "industry": company.get("type")
                }
            return None
        except Exception as e:
            logger.error(f"IP Enrichment failed: {e}")
            return None

async def get_visitor_journey(client_id: str, ip_address: str = None):
    """
    Retrieves journey and building context with high-fidelity stitching.
    """
    if not client_id:
        return {
            "total_touches": 0,
            "pathway": "No Tracking ID",
            "building_context": "Unknown"
        }

    # SYSTEM FIX: Session Sync Delay
    # We wait briefly to ensure the final tracking signals from the frontend 
    # have been committed to the DB by the tracking routes.
    attempts = 2
    history = []
    
    try:
        for i in range(attempts):
            with Session(engine) as session:
                # 1. Device Journey: Primary Stitching via client_id
                # We drop the IP requirement here because client_id is a UUID
                statement = select(Visit).where(Visit.client_id == client_id).order_by(Visit.created_at)
                history = session.exec(statement).all()
                
                if history:
                    break # Data found, proceed
                
                if i < attempts - 1:
                    logger.info(f"🕵️ Stitching delay: Retrying journey lookup for {client_id}")
                    await asyncio.sleep(1.0) # 1-second industrial buffer

            # 2. Building-Level Activity (Cluster Analysis)
            building_context = "Solo Device"
            if ip_address and ip_address != "0.0.0.0":
                # Using timezone-aware UTC for 2026 standards
                time_threshold = datetime.now(timezone.utc) - timedelta(hours=48)
                
                with Session(engine) as session:
                    building_stmt = select(Visit).where(
                        Visit.ip_address == ip_address,
                        Visit.client_id != client_id,
                        Visit.created_at >= time_threshold
                    )
                    other_devices = session.exec(building_stmt).all()
                    
                    if other_devices:
                        unique_others = len({v.client_id for v in other_devices})
                        building_context = f"🏢 Building Cluster: {unique_others} other unique device(s)"

            if not history:
                return {
                    "total_touches": 0,
                    "pathway": "First interaction recorded (Stitch Miss)",
                    "building_context": building_context
                }

            # Map the pathway: Extracting short paths for Slack readability
            pages = []
            for v in history:
                # Clean URL to show only the path (e.g., /pricing)
                path = v.url.split('auraworks.co.za')[-1] if v.url else "Home"
                if not path or path == "": path = "/"
                pages.append(path)
            
            unique_pages = list(dict.fromkeys(pages))
            
            return {
                "total_touches": len(history),
                "pathway": " → ".join(unique_pages),
                "first_seen": history[0].created_at.strftime("%Y-%m-%d %H:%M"),
                "building_context": building_context
            }
            
    except Exception as e:
        logger.error(f"Intelligence Engine Error: {e}")
        return {
            "total_touches": 0, 
            "pathway": "Recovery Mode", 
            "building_context": "Error"
        }