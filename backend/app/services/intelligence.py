import httpx
import logging
from datetime import datetime, timedelta
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
            
            # Filter for business entities to exclude general ISPs
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

def get_visitor_journey(client_id: str, ip_address: str = None):
    """
    Retrieves journey and building context.
    Uses 'client_id' and 'ip_address' to match the updated Visit model.
    """
    if not client_id:
        return {
            "total_touches": 0,
            "pathway": "No Tracking ID",
            "building_context": "Unknown"
        }

    try:
        with Session(engine) as session:
            # 1. Device Journey: Match against client_id from your tracker
            statement = select(Visit).where(Visit.client_id == client_id).order_by(Visit.created_at)
            history = session.exec(statement).all()

            # 2. Building-Level Activity: Cluster unique devices on the same IP
            building_context = "Solo Device"
            if ip_address and ip_address != "0.0.0.0":
                time_threshold = datetime.utcnow() - timedelta(hours=48)
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
                    "pathway": "First interaction recorded",
                    "building_context": building_context
                }

            # Map the pathway using unique URLs visited
            pages = [v.url for v in history]
            unique_pages = list(dict.fromkeys(pages))
            
            return {
                "total_touches": len(history),
                "pathway": " → ".join(unique_pages),
                "first_seen": history[0].created_at.strftime("%Y-%m-%d %H:%M"),
                "building_context": building_context
            }
            
    except Exception as e:
        logger.error(f"Intelligence Engine Error: {e}")
        # Return a safe default so the Slack/Waitlist logic doesn't crash
        return {
            "total_touches": 0, 
            "pathway": "Recovery Mode", 
            "building_context": "Error"
        }