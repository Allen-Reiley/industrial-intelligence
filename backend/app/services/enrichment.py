import httpx
from app.core.config import settings
import logging

logger = logging.getLogger("uvicorn")

# List of common South African and Global Consumer ISPs to filter out
CONSUMER_ISP_KEYWORDS = [
    "vodacom", "mtn", "telkom", "liquid", "afrihost", "cool ideas", 
    "rain", "mweb", "cell c", "vumatel", "comcast", "verizon", "orange"
]

async def enrich_visitor_data(ip_address: str) -> dict:
    """
    Calls IPinfo.io to identify the company behind the IP.
    Filters out residential ISPs to ensure only B2B leads are flagged.
    """
    # 1. Skip local/loopback IPs (for development)
    if ip_address in ("127.0.0.1", "localhost", "::1"):
        return {"company_name": "Local Test Environment", "is_b2b": False}

    url = f"https://ipinfo.io/{ip_address}?token={settings.IPINFO_TOKEN}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5.0)
            if response.status_code != 200:
                logger.error(f"IPinfo error: {response.status_code}")
                return {"is_b2b": False}

            data = response.json()
            
            # 2. Extract Organization info (Format: "AS12345 Company Name")
            org_full = data.get("org", "Unknown")
            # Remove the AS number from the string
            company_name = " ".join(org_full.split(" ")[1:]) if " " in org_full else org_full
            
            # 3. B2B Filter Logic
            # We assume it's B2B unless we find a consumer ISP keyword
            is_b2b = True
            lowered_org = org_full.lower()
            
            if any(keyword in lowered_org for keyword in CONSUMER_ISP_KEYWORDS):
                is_b2b = False

            return {
                "company_name": company_name,
                "is_b2b": is_b2b,
                "industry": data.get("asn", {}).get("type"), # 'business', 'isp', or 'hosting'
                "city": data.get("city"),
                "region": data.get("region"),
                "country": data.get("country")
            }

        except Exception as e:
            logger.error(f"Enrichment Service Failure: {str(e)}")
            return {"is_b2b": False}