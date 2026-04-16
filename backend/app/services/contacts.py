# backend/app/services/contacts.py
import httpx
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, timezone
from app.core.config import settings  # Use centralized settings
from sqlmodel import Session, select
from app.db import engine
from app.models.company import Company

logger = logging.getLogger("uvicorn")

# Keywords to strictly avoid for "Call Center" filtering
EXCLUDED_KEYWORDS = ["support", "help", "customer", "service", "complaints", "info", "reception", "noreply"]

async def get_corporate_contacts(domain: str, client_id: str) -> Dict[str, Any]:
    """
    Fetches HQ phone and professional contacts via Apollo People API.
    Includes a local cache check to prevent redundant credit consumption.
    Now uses multi-tenant client_id to scope cache lookups.
    """
    if not domain or domain in ["Unknown", "unknown.com", "n/a"]:
        return {"hq_phone": None, "corp_emails": [], "linkedin_url": None}

    # 1. Local Cache Check (Audit Layer)
    # Scoped to domain AND client_id to ensure agency-specific data integrity
    with Session(engine) as session:
        statement = select(Company).where(
            Company.domain == domain,
            Company.client_id == client_id
        )
        cached_company = session.exec(statement).first()
        
        # Check if cache is fresh (30 days)
        if cached_company and cached_company.hq_phone:
            # Handle timezone-aware comparison
            now = datetime.now(timezone.utc)
            updated_at = cached_company.updated_at
            if updated_at.tzinfo is None:
                updated_at = updated_at.replace(tzinfo=timezone.utc)
                
            if updated_at > (now - timedelta(days=30)):
                logger.info(f"♻️  Using cached industrial data for {domain}")
                return {
                    "hq_phone": cached_company.hq_phone,
                    "corp_emails": [], 
                    "linkedin_url": f"https://www.linkedin.com/company/{domain.split('.')[0]}"
                }

    # 2. External Enrichment (Apollo V2 Implementation)
    # Technical Debt Fixed: Using settings.APOLLO_API_KEY instead of os.getenv
    apollo_key = settings.APOLLO_API_KEY
    if not apollo_key:
        logger.warning("⚠️  APOLLO_API_KEY missing in settings. Skipping deep enrichment.")
        return {"hq_phone": "Manual Audit Required", "corp_emails": []}

    async with httpx.AsyncClient() as client:
        try:
            url = "https://api.apollo.io/v1/people/match"
            payload = {
                "api_key": apollo_key,
                "domain": domain,
                "reveal_personal_emails": False 
            }
            
            response = await client.post(url, json=payload, timeout=10.0)
            
            if response.status_code == 200:
                data = response.json()
                person = data.get("person", {})
                org = person.get("organization", {})
                
                hq_phone = org.get("primary_phone") or org.get("phone")
                linkedin_url = org.get("linkedin_url") or f"https://www.linkedin.com/company/{domain.split('.')[0]}"
                
                logger.info(f"🧬 Apollo Match Success: Resolved {domain} to {org.get('name')}")
                
                return {
                    "hq_phone": hq_phone,
                    "linkedin_url": linkedin_url,
                    "industry": org.get("industry"),
                    "employee_count": org.get("estimated_num_employees")
                }
                
            elif response.status_code == 429:
                logger.error("🚫 Apollo Rate Limit Exceeded. Check Credit Balance.")
            else:
                logger.warning(f"⚠️  Apollo returned {response.status_code} for {domain}")
                
        except Exception as e:
            logger.error(f"❌ Apollo V2 Enrichment Failure: {str(e)}")

    return {
        "hq_phone": None, 
        "corp_emails": [], 
        "linkedin_url": f"https://www.linkedin.com/company/{domain.split('.')[0]}"
    }

def filter_business_contacts(contacts: List[Dict]) -> List[Dict]:
    """
    Strips out generic support/info emails to maintain 'Quiet Premium' lead quality.
    """
    return [
        c for c in contacts 
        if not any(word in c.get("email", "").lower() for word in EXCLUDED_KEYWORDS)
    ]