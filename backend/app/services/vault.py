# backend/app/services/vault.py
import httpx
import logging
import urllib.parse
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger("uvicorn")

async def sync_to_airtable(lead_data: Dict[str, Any], journey: Dict[str, Any]):
    """
    Phase 3: The Airtable Bridge.
    Pushes the compiled lead and DeepSeek intent securely into Airtable.
    """
    if not settings.AIRTABLE_API_KEY or not settings.AIRTABLE_BASE_ID:
        logger.warning("⚠️ Airtable Sync skipped: Credentials not configured.")
        return

    # URL Encoding protects against spaces in the table name string
    safe_table_name = urllib.parse.quote(settings.AIRTABLE_TABLE_NAME)
    url = f"https://api.airtable.com/v0/{settings.AIRTABLE_BASE_ID}/{safe_table_name}"
    
    headers = {
        "Authorization": f"Bearer {settings.AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }

    # 1. Map raw properties
    raw_fields = {
        "Name": lead_data.get("name") or "Unknown Entity",
        "Email": lead_data.get("email"),
        "Company": lead_data.get("company_name_final") or "Unknown",
        "Position": lead_data.get("position") or "Evaluator",
        "Department": lead_data.get("department") or "Undetermined",
        "Industry": lead_data.get("industry") or "Industrial",
        "Pathway": journey.get("pathway") or "Direct",
        "Intent Summary": journey.get("intent_summary") or "Pending",
        "Status": "Needs Review" # IMPORTANT: Create this tag exactly in your Airtable drop-down
    }

    # 2. Airtable API Safety Filter: Strip completely empty (None) values to prevent 422 schema crashes
    clean_fields = {k: v for k, v in raw_fields.items() if v is not None}

    payload = {
        "records": [
            {
                "fields": clean_fields
            }
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload, timeout=10.0)
            if response.status_code == 200:
                logger.info(f"🟢 Airtable Sync Success for Lead: {lead_data.get('email')}")
            else:
                logger.error(f"❌ Airtable Sync Failed ({response.status_code}): {response.text}")
        except Exception as e:
            logger.error(f"🚨 Airtable Transport Error: {e}")