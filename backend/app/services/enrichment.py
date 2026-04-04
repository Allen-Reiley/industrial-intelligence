import httpx
from app.core.config import settings
from typing import Optional, List, Dict
import logging

logger = logging.getLogger("uvicorn")

# --- AuraWorks Identity Bridge: Consumer ISP & Infrastructure Blacklist ---
# (Keep your existing CONSUMER_ISP_KEYWORDS list here as the SA Authority filter)

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

async def enrich_visitor_data(ip_address: str) -> dict:
    """
    Phase 01: Immediate IP Resolution.
    Identifies the Jurisdictive Entity (Company) from network signatures.
    """
    if ip_address in ("127.0.0.1", "localhost", "::1"):
        return {"company_name": "Local Test Environment", "is_b2b": False}

    url = f"https://ipinfo.io/{ip_address}?token={settings.IPINFO_TOKEN}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5.0)
            if response.status_code != 200:
                return {"company_name": "Unknown", "is_b2b": False}

            data = response.json()
            company_data = data.get("company", {})
            final_name = company_data.get("name")
            final_domain = company_data.get("domain")

            if not final_name:
                org_full = data.get("org", "Unknown")
                parts = org_full.split(" ")
                final_name = " ".join(parts[1:]) if parts[0].startswith("AS") and len(parts) > 1 else org_full

            asn_type = data.get("asn", {}).get("type", "").lower()
            
            # B2B Logic: Filter out Consumer ISPs and Hosting Bots
            is_b2b = True
            if is_consumer_traffic(final_name) or is_consumer_traffic(data.get("org", "")):
                is_b2b = False
            elif asn_type in ["hosting", "isp"]:
                is_b2b = False

            return {
                "company_name": final_name,
                "domain": final_domain or data.get("asn", {}).get("domain"),
                "is_b2b": is_b2b,
                "industry": asn_type or "unknown",
                "city": data.get("city"),
                "region": data.get("region")
            }
        except Exception as e:
            logger.error(f"IPinfo Failure: {e}")
            return {"company_name": "Error", "is_b2b": False}

async def get_departmental_intelligence(domain: str) -> List[Dict]:
    """
    Phase 02: Departmental Mapping via Apollo.io.
    Finds public contact points for specific industrial departments.
    """
    if not settings.APOLLO_API_KEY or not domain:
        return []

    url = "https://api.apollo.io/v1/people/search"
    
    # Industrial Department Personas
    target_departments = [
        "Procurement", "Engineering", "Maintenance", 
        "Operations", "Supply Chain", "Technical"
    ]

    payload = {
        "api_key": settings.APOLLO_API_KEY,
        "q_organization_domains": domain,
        "person_titles": target_departments,
        "organization_locations": ["South Africa"],
        "page": 1,
        "display_mode": "regular"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=10.0)
            if response.status_code != 200:
                return []

            data = response.json()
            people = data.get("people", [])
            
            departments_found = []
            for person in people:
                # Group by department keyword
                title = person.get("title", "")
                dept_name = next((d for d in target_departments if d.lower() in title.lower()), "General")
                
                departments_found.append({
                    "name": dept_name,
                    "email": person.get("email"),
                    "phone": person.get("phone_numbers", [{}])[0].get("raw_number"),
                    "head_of_dept_linkedin": f"https://www.linkedin.com/in/{person.get('linkedin_url', '').split('/')[-1]}" if person.get('linkedin_url') else None
                })
            
            return departments_found

        except Exception as e:
            logger.error(f"Apollo Enrichment Failure for {domain}: {e}")
            return []