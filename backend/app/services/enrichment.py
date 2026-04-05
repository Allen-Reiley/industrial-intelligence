import httpx
import logging
from app.core.config import settings
from typing import Optional, List, Dict

logger = logging.getLogger("uvicorn")

# --- AuraWorks Identity Bridge: Consumer ISP & Infrastructure Blacklist ---

def is_consumer_traffic(target_name: str) -> bool:
    """Detects if a visit is originating from a residential/consumer ISP."""
    if not target_name:
        return False
    normalized = target_name.lower()
    return any(keyword in normalized for keyword in CONSUMER_ISP_KEYWORDS)

async def enrich_visitor_data(ip_address: str) -> dict:
    """
    Phase 01: Forensic IP Resolution.
    Separates Industrial Entities from Residential Noise.
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

            # If IPinfo 'company' block is empty, fallback to 'org' parsing
            if not final_name:
                org_full = data.get("org", "Unknown")
                parts = org_full.split(" ")
                final_name = " ".join(parts[1:]) if parts[0].startswith("AS") and len(parts) > 1 else org_full

            asn_type = data.get("asn", {}).get("type", "").lower()
            
            # THE JURISTIC FILTER: Only allow actual Companies
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
    Phase 02: Industrial Cluster Mapping (Apollo.io).
    Scans the corporate domain for decision makers in key departments.
    """
    if not settings.APOLLO_API_KEY or not domain:
        return []

    # API endpoint for person search
    url = "https://api.apollo.io/v1/people/search"
    
    # Targeting the 'Industrial Buying Committee'
    target_departments = [
        "Procurement", "Operations", "Engineering", 
        "Maintenance", "Supply Chain", "Technical Director"
    ]

    payload = {
        "api_key": settings.APOLLO_API_KEY,
        "q_organization_domains": domain,
        "person_titles": target_departments,
        "organization_locations": ["South Africa"],
        "display_mode": "regular",
        "per_page": 10
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=12.0)
            if response.status_code != 200:
                logger.warning(f"Apollo API returned status {response.status_code}")
                return []

            data = response.json()
            people = data.get("people", [])
            
            departments_found = []
            for person in people:
                # Map titles to a simplified department name
                title = person.get("title", "").lower()
                matched_dept = "Operations" # Default
                for dept in target_departments:
                    if dept.lower() in title:
                        matched_dept = dept
                        break
                
                departments_found.append({
                    "name": matched_dept,
                    "email": person.get("email"),
                    "phone": person.get("phone_numbers", [{}])[0].get("raw_number"),
                    "head_of_dept_linkedin": person.get("linkedin_url")
                })
            
            return departments_found

        except Exception as e:
            logger.error(f"Apollo Enrichment Failure for {domain}: {e}")
            return []