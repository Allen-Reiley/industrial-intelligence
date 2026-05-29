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
    Pushes the compiled lead metrics, session journey, URL footprints, 
    and DeepSeek intent summaries securely into Airtable.
    """
    if not settings.AIRTABLE_API_KEY or not settings.AIRTABLE_BASE_ID:
        logger.warning("⚠️ Airtable Sync skipped: Credentials not configured.")
        return

    # URL Encoding handles any structural spaces inside your table name configuration
    safe_table_name = urllib.parse.quote(settings.AIRTABLE_TABLE_NAME)
    url = f"https://api.airtable.com/v0/{settings.AIRTABLE_BASE_ID}/{safe_table_name}"
    
    headers = {
        "Authorization": f"Bearer {settings.AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }

    # Map internal data schemas strictly to your Airtable Column Headers
    # NOTE: Ensure the spelling and casing match your actual Airtable configuration exactly.
    raw_fields = {
        "Company": lead_data.get("company_name_final") or "Unknown Entity",
        "Lead Name": lead_data.get("name") or "Unknown Lead",
        "Email": lead_data.get("email"),
        "Position": lead_data.get("position") or "Evaluator",
        "Department": lead_data.get("department") or "Undetermined",
        "Industry": lead_data.get("industry") or "Industrial",
        "URL": lead_data.get("website") or "N/A",  # Added field tracking the corporate entry web address
        "Pathway": journey.get("pathway") or "Direct",
        "Intent Summary": journey.get("intent_summary") or "Pending Intelligence...",
        "Status": "Needs Review"  # Ensure this exact select tag exists in your Status column drop-down
    }

    # Safety Barrier: Strip out any keys containing Python 'None' values to prevent 422 payload rejections
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