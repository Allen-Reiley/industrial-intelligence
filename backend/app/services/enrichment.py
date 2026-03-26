import httpx
from app.core.config import settings
import logging

logger = logging.getLogger("uvicorn")

# --- AuraWorks Identity Bridge: Consumer ISP & Infrastructure Blacklist ---
# Purpose: Filter out non-corporate traffic to isolate high-intent B2B leads.
CONSUMER_ISP_KEYWORDS = [
    # --- The Big Five (Mobile & Primary) ---
    "vodacom", "mtn", "telkom", "cell c", "rain", "liquid intelligent", "liquid telecom",

    # --- Major National ISPs & Fibre Providers ---
    "afrihost", "mweb", "cool ideas", "vumatel", "frogfoot", "openserve", 
    "vox telecom", "webafrica", "seacom", "dark fibre africa", "dfa",
    "supersonic", "metrofibre", "herotel", "rsaweb", "nexus", "tiscali",
    "axxess", "cybersmart", "home-connect", "atomic access",

    # --- Regional, Local & WISPs (Wireless ISPs) ---
    "wispernet", "snowball", "infoprotect", "italk", "skyfi", "jikani", 
    "amobia", "bitco", "comsol", "i-connect", "krypton", "limpopo online", 
    "megasurf", "penta-net", "wisper", "zeon", "zalist", "wirulink",
    "fancam", "breede net", "gigajoy", "lightspeed", "wibernet", "wiiconnect",
    "cape connect", "garden route fibre", "urbanx", "123net", "adept ict",

    # --- MVNOs & Retail Managed Services ---
    "fnb connect", "standard bank mobile", "capitec connect", "melon mobile",
    "shoprite k'nect", "pnp mobile", "mr p mobile", "tyme bank mobile",
    "flash mobile", "absamobile",

    # --- Fibre Infrastructure & Open Access (FNOs) ---
    "octotel", "link africa", "evotel", "vuma", "zoom fibre", "ttconnect",
    "mitchells fibre", "century city connect", "smart village", "vula",
    "fibertime", "net nine nine", "link layer", "lightstruck", "clear access",
    "dnatel", "purple forest fibre", "balwin fibre", "fibresuburb", "netstream",
    "open fibre", "route networks", "teralink", "thinkspeed", "wire-wire", 
    "ilitha telecoms", "zing fibre", "purple forest",

    # --- Satellite & Niche Providers ---
    "starlink", "morclick", "q-kon", "yahclick", "eutelsat", "too-way", "twoobii",

    # --- Legacy & Merged Entities ---
    "iburst", "neotel", "screamer", "is", "internet solutions",
    "dimension data", "didata", "altech", "autopage", "nashua mobile",
    "business connexion", "bcx", "yellow pages", "trudon",

    # --- International Overspill & Cloud Proxies ---
    "google", "comcast", "verizon", "orange", "at&t", "charter", "bt", 
    "telefonica", "t-mobile", "cox", "lumen", "centurylink", "fastly", 
    "cloudflare", "akamai", "amazon", "aws", "microsoft", "azure"
]

def is_consumer_traffic(target_name: str) -> bool:
    """Helper to check if a name matches our blacklist."""
    if not target_name:
        return False
    normalized = target_name.lower()
    return any(keyword in normalized for keyword in CONSUMER_ISP_KEYWORDS)

async def enrich_visitor_data(ip_address: str, client: httpx.AsyncClient) -> dict:
    """
    Enriches visitor data using IPinfo. 
    Accepts an existing httpx client for connection pooling.
    """
    if ip_address in ("127.0.0.1", "localhost", "::1"):
        return {"company_name": "Local Test Environment", "is_b2b": False}

    # If your token is not set, this will resolve to the free tier (limited data)
    url = f"https://ipinfo.io/{ip_address}?token={settings.IPINFO_TOKEN}"

    try:
        response = await client.get(url, timeout=5.0)
        if response.status_code != 200:
            logger.error(f"IPinfo error: {response.status_code}")
            return {"company_name": "Unknown", "is_b2b": False}

        data = response.json()
        
        # 🏢 1. Extraction Logic: Prioritize clean company data
        company_data = data.get("company", {})
        final_name = company_data.get("name")
        final_domain = company_data.get("domain")

        # Fallback to ASN 'org' if 'company' block is missing (common in free tier or new IPs)
        if not final_name:
            org_full = data.get("org", "Unknown")
            parts = org_full.split(" ")
            final_name = " ".join(parts[1:]) if parts[0].startswith("AS") and len(parts) > 1 else org_full

        # 🔍 2. B2B Intelligence Logic
        asn_type = data.get("asn", {}).get("type", "").lower()
        is_b2b = True

        # Check against blacklist first (The SA Authority)
        if is_consumer_traffic(final_name) or is_consumer_traffic(data.get("org", "")):
            is_b2b = False
        
        # Filter Cloud/Bot traffic
        elif asn_type == "hosting":
            is_b2b = False
            
        # Global ISP Check
        elif asn_type == "isp":
            is_b2b = False

        return {
            "company_name": final_name,
            "domain": final_domain or data.get("asn", {}).get("domain"),
            "is_b2b": is_b2b,
            "industry": asn_type or "unknown",
            "city": data.get("city"),
            "region": data.get("region"),
            "country": data.get("country")
        }

    except Exception as e:
        logger.error(f"Enrichment Service Failure: {str(e)}")
        return {"company_name": "Error", "is_b2b": False}