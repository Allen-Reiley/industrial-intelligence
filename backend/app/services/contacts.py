import httpx
import logging
from typing import Optional, List, Dict
from app.core.config import settings

logger = logging.getLogger("uvicorn")

# Keywords to strictly avoid for "Call Center" filtering
EXCLUDED_KEYWORDS = ["support", "help", "customer", "service", "complaints", "info", "reception"]

async def get_corporate_contacts(domain: str) -> Dict:
    """
    Main service to fetch HQ phone and departmental emails.
    Filters out generic call center/support lines.
    """
    if not domain or domain == "Unknown":
        return {"hq_phone": None, "corp_emails": []}

    # This is a placeholder for the Apollo/Hunter API call
    # In V2, we will replace this with a real HTTP request
    try:
        # 1. Logic for HQ Phone (Preferred: Direct or HQ line)
        # 2. Logic for Emails (Filtered by Dept: Sales, Executive, Finance)
        
        # Example structure of what we'll return:
        return {
            "hq_phone": "Pending Enrichment", # To be filled by API
            "corp_emails": [], 
            "linkedin_url": f"https://www.linkedin.com/company/{domain.split('.')[0]}"
        }
    except Exception as e:
        logger.error(f"Contact Enrichment Failed for {domain}: {str(e)}")
        return {"hq_phone": None, "corp_emails": []}

def filter_business_contacts(contacts: List[Dict]) -> List[Dict]:
    """
    Helper to strip out 'support@' or 'help@' style addresses 
    to ensure the client only gets high-value leads.
    """
    filtered = [
        c for c in contacts 
        if not any(word in c.get("email", "").lower() for word in EXCLUDED_KEYWORDS)
    ]
    return filtered