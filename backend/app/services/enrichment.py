import httpx
from app.core.config import settings
import logging

logger = logging.getLogger("uvicorn")

# List of common South African and Global Consumer ISPs to filter out
CONSUMER_ISP_KEYWORDS = [
    "vodacom", "mtn", "telkom", "liquid", "afrihost", "cool ideas", 
    "rain", "mweb", "cell c", "vumatel", "comcast", "verizon", "orange", "google"
]

async def enrich_visitor_data(ip_address: str) -> dict:
    if ip_address in ("127.0.0.1", "localhost", "::1"):
        return {"company_name": "Local Test Environment", "is_b2b": False}

    url = f"https://ipinfo.io/{ip_address}?token={settings.IPINFO_TOKEN}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5.0)
            if response.status_code != 200:
                logger.error(f"IPinfo error: {response.status_code}")
                return {"company_name": "Unknown", "is_b2b": False}

            data = response.json()
            org_full = data.get("org", "Unknown")

            # 🛠️ FIXED: Smarter Company Name Extraction
            # Only remove the first word if it looks like an ASN (starts with 'AS')
            parts = org_full.split(" ")
            if parts[0].startswith("AS") and len(parts) > 1:
                company_name = " ".join(parts[1:])
            else:
                company_name = org_full

            # 🛠️ FIXED: Smarter B2B Logic
            # IPinfo provides a 'type' field inside 'asn' if you have a token.
            # It usually returns 'business', 'hosting', or 'isp'.
            asn_type = data.get("asn", {}).get("type", "").lower()
            
            is_b2b = True
            lowered_org = org_full.lower()
            
            # If it's explicitly labeled as an ISP by IPinfo, or matches our keywords
            if asn_type == "isp" or any(k in lowered_org for k in CONSUMER_ISP_KEYWORDS):
                is_b2b = False
            
            # Hosting (Google/AWS/Azure) is usually not a 'real' visitor lead
            if asn_type == "hosting":
                is_b2b = False

            return {
                "company_name": company_name,
                "domain": data.get("company", {}).get("domain"),
                "is_b2b": is_b2b,
                "industry": asn_type,
                "city": data.get("city"),
                "region": data.get("region"),
                "country": data.get("country")
            }

        except Exception as e:
            logger.error(f"Enrichment Service Failure: {str(e)}")
            return {"company_name": "Error", "is_b2b": False}