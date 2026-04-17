# backend/app/services/enrichment.py
import httpx
import logging
import socket
from app.core.config import settings
from typing import Optional, List, Dict, Any

logger = logging.getLogger("uvicorn")

# --- AuraWorks Identity Bridge: Consumer ISP & Infrastructure Blacklist ---
# Tailored for the South African Market (National Expansion)
CONSUMER_ISP_KEYWORDS = [
    "vodacom", "mtn", "telkom", "liquid", "cool ideas", "vumatel", "rain", 
    "isp", "residential", "pool", "dynamic", "dsl", "fiber", "mobile",
    "webafrica", "afrihost", "mweb", "vox", "supersonic"
]

def is_consumer_traffic(target_name: str) -> bool:
    """Detects if a visit originates from a known consumer ISP."""
    if not target_name:
        return False
    normalized = target_name.lower()
    return any(keyword in normalized for keyword in CONSUMER_ISP_KEYWORDS)

def perform_local_reverse_dns(ip_address: str) -> Dict[str, Any]:
    """
    Layer 1: Zero-Cost Classification.
    Identifies cloud providers and obvious ISPs without burning API credits.
    """
    try:
        hostname, _, _ = socket.gethostbyaddr(ip_address)
        hostname = hostname.lower()
        
        # Cloud/Data Center filtration
        if any(cloud in hostname for cloud in ["amazonaws", "googleusercontent", "azure", "static.cloud", "hetzner"]):
            return {"type": "cloud", "provider": "Infrastructure", "confidence": 0.5}
        
        # Consumer ISP filtration
        if is_consumer_traffic(hostname):
            return {"type": "isp", "provider": "Consumer ISP", "confidence": 0.2}
        
        return {"type": "business_static", "provider": hostname, "confidence": 0.7}
    except Exception:
        return {"type": "unknown", "provider": "Unknown", "confidence": 0.0}

async def enrich_visitor_data(ip_address: str, volunteered_company: Optional[str] = None) -> dict:
    """
    Phase 01: Forensic IP Resolution with Warm Lead Overrides.
    If 'volunteered_company' is provided (from Banner), it forces a B2B high-confidence state.
    """
    # 0. Local/Dev Guard
    if ip_address in ("127.0.0.1", "localhost", "::1"):
        return {"company_name": "Local Test Environment", "is_b2b": False, "confidence_score": 1.0}

    # 1. Warm Lead Override: If the user provided a name via the industrial sync, use it.
    if volunteered_company and not is_consumer_traffic(volunteered_company):
        return {
            "company_name": volunteered_company,
            "domain": None,
            "is_b2b": True,
            "confidence_score": 1.0,
            "industry": "Volunteered Data",
            "provider_type": "Warm Lead"
        }

    # 2. Layer 1 Check (Local Reverse DNS)
    local_intel = perform_local_reverse_dns(ip_address)

    # 3. Layer 2 Check (IPinfo)
    if not settings.IPINFO_TOKEN:
        logger.warning("⚠️ IPinfo Token missing. Enrichment limited to Layer 1.")
        return {"company_name": local_intel["provider"], "is_b2b": False, "confidence_score": 0.3}

    url = f"https://ipinfo.io/{ip_address}?token={settings.IPINFO_TOKEN}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5.0)
            if response.status_code != 200:
                return {"company_name": "Unknown", "is_b2b": False, "confidence_score": 0.0}

            data = response.json()
            company_data = data.get("company", {})
            asn_data = data.get("asn", {})
            
            final_name = company_data.get("name")
            final_domain = company_data.get("domain")

            # Fallback to ASN org name if company enrichment is empty
            if not final_name:
                org_full = data.get("org", "Unknown")
                final_name = " ".join(org_full.split(" ")[1:]) if org_full.startswith("AS") else org_full

            asn_type = asn_data.get("type", "").lower()
            
            # --- CALCULATE CONFIDENCE SCORE (Industrial Weighing) ---
            confidence = 0.5 # Baseline
            
            if asn_type == "business": confidence += 0.4
            if asn_type == "hosting": confidence -= 0.3 # Penalize VPNs/Bots
            if is_consumer_traffic(final_name) or is_consumer_traffic(data.get("org", "")):
                confidence -= 0.4 # Penalize Residential
            
            # Final determination for the 'Industrial' threshold
            is_b2b = confidence >= 0.5

            return {
                "company_name": final_name,
                "domain": final_domain or asn_data.get("domain"),
                "is_b2b": is_b2b,
                "confidence_score": round(max(0.0, min(1.0, confidence)), 2),
                "industry": asn_type or "unknown",
                "city": data.get("city"),
                "region": data.get("region"),
                "provider_type": local_intel["type"]
            }
        except Exception as e:
            logger.error(f"🚨 IPinfo Failure: {e}")
            return {"company_name": "Error", "is_b2b": False, "confidence_score": 0.0}

async def get_departmental_intelligence(domain: str) -> List[Dict]:
    """
    Phase 02: Industrial Cluster Mapping (Apollo.io).
    Identifies departmental decision-makers within South African corporate domains.
    """
    if not settings.APOLLO_API_KEY or not domain or domain in ["unknown.com", "n/a"]:
        return []

    url = "https://api.apollo.io/v1/people/search"
    # Targeted industrial roles
    target_departments = ["Procurement", "Operations", "Engineering", "Maintenance", "Supply Chain", "Factory Manager"]

    payload = {
        "api_key": settings.APOLLO_API_KEY,
        "q_organization_domains": domain,
        "person_titles": target_departments,
        "organization_locations": ["South Africa"],
        "display_mode": "regular",
        "per_page": 5
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=12.0)
            if response.status_code == 200:
                data = response.json()
                people = data.get("people", [])
                
                return [{
                    "role": person.get("title", "Lead"),
                    "name": person.get("name"),
                    "email": person.get("email"),
                    "linkedin_url": person.get("linkedin_url")
                } for person in people]
            return []
        except Exception as e:
            logger.error(f"🚨 Apollo Enrichment Failure: {e}")
            return []