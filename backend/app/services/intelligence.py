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
    Converts IP to Company Identity.
    Note: Requires IPinfo 'Business' or 'Standard' tier for company data.
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
            # The 'company' block is the gold mine for B2B
            company = data.get("company", {})
            
            # We only care if it's a 'business' type, not an ISP (like Vodacom/MWEB)
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

def get_visitor_journey(aura_id: str, ip_address: str = None):
    """Retrieves the anonymous history and building-level context"""
    if not aura_id:
        return "No tracking ID found."

    with Session(engine) as session:
        # 1. Fetch Journey for this specific device
        statement = select(Visit).where(Visit.aura_id == aura_id).order_by(Visit.timestamp)
        history = session.exec(statement).all()

        # 2. Check for "Building-Level" Activity (Other devices on the same IP)
        building_context = "Solo Device"
        if ip_address:
            # Look for other unique aura_ids from this same IP in the last 48 hours
            time_threshold = datetime.utcnow() - timedelta(hours=48)
            building_stmt = select(Visit).where(
                Visit.ip == ip_address,
                Visit.aura_id != aura_id,
                Visit.timestamp >= time_threshold
            )
            other_devices = session.exec(building_stmt).all()
            
            if other_devices:
                unique_others = len({v.aura_id for v in other_devices})
                building_context = f"🏢 Building Cluster: {unique_others} other unique device(s) detected"

        if not history:
            return {
                "total_touches": 0,
                "pathway": "Direct Entry",
                "building_context": building_context
            }

        # Summarize the journey
        pages = [v.path for v in history]
        unique_pages = list(dict.fromkeys(pages))
        
        return {
            "total_touches": len(history),
            "pathway": " → ".join(unique_pages),
            "first_seen": history[0].timestamp.strftime("%Y-%m-%d %H:%M"),
            "last_seen": history[-1].timestamp.strftime("%Y-%m-%d %H:%M"),
            "building_context": building_context
        }