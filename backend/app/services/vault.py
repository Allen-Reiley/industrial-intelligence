# backend/app/services/vault.py
import httpx
import logging
import urllib.parse
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger("uvicorn")

async def sync_to_airtable(prospect_data: Dict[str, Any], journey: Dict[str, Any]):
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
    raw_fields = {
        "Company": prospect_data.get("company_name_final") or "Unknown Entity",
        "Lead Name": prospect_data.get("name") or "Unknown Lead",
        "Email": prospect_data.get("email"),
        "Position": prospect_data.get("position") or "Evaluator",
        "Department": prospect_data.get("department") or "Undetermined",
        "Industry": prospect_data.get("industry") or "Industrial",
        "URL": prospect_data.get("website") or "N/A", 
        "Pathway": journey.get("pathway") or "Direct",
        "Intent Summary": journey.get("intent_summary") or "Pending Intelligence...",
        "Status": "Needs Review"
    }

    # Safety Barrier: Strip out any keys containing Python 'None' values
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
                logger.info(f"🟢 Airtable Sync Success for Lead: {prospect_data.get('email')}")
            else:
                logger.error(f"❌ Airtable Sync Failed ({response.status_code}): {response.text}")
        except Exception as e:
            logger.error(f"🚨 Airtable Transport Error: {e}")


async def sync_to_notion(prospect_data: Dict[str, Any], journey: Dict[str, Any]):
    """
    Phase 4: The Notion Vault Bridge.
    Creates an itemized ledger entry mapping ALL associated firmographic,
    behavioral, and DeepSeek intelligence assets to the Notion Workspace canvas.
    """
    if not settings.NOTION_TOKEN or not settings.NOTION_DATABASE_ID:
        logger.warning("⚠️ Notion Sync skipped: Credentials not configured.")
        return

    url = "https://api.notion.com/v1/pages"
    
    headers = {
        "Authorization": f"Bearer {settings.NOTION_TOKEN}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }

    # Extract clean parameters with fallback safe-guards
    company_name = prospect_data.get("company_name_final") or prospect_data.get("company_name") or "Anonymous Entity"
    lead_name = prospect_data.get("name") or "Unknown Lead"
    email = prospect_data.get("email") or "unknown@entity.co.za"
    position = prospect_data.get("position") or "Evaluator"
    department = prospect_data.get("department") or "Undetermined"
    industry = prospect_data.get("industry") or "Industrial"
    website_url = prospect_data.get("website") or "https://auraworks.co.za"
    
    # Extract journey stats
    total_touches = str(journey.get("total_touches", "1"))
    pathway_text = journey.get("pathway") or "Direct Ingestion"
    summary_text = journey.get("intent_summary") or "No intelligence data compiled."
    
    # Location data mapping
    city = prospect_data.get("city") or journey.get("city") or "Unknown"
    region = prospect_data.get("region") or journey.get("region") or "ZA"
    location_str = f"{city}, {region}"

    # Deeply structured properties to map ALL parameters into Notion types
    payload = {
        "parent": {"database_id": settings.NOTION_DATABASE_ID},
        "properties": {
            "Entity": {
                "title": [{"text": {"content": company_name}}]
            },
            "Lead Name": {
                "rich_text": [{"text": {"content": lead_name}}]
            },
            "Email": {
                "email": email
            },
            "Position": {
                "rich_text": [{"text": {"content": position}}]
            },
            "Department": {
                "rich_text": [{"text": {"content": department}}]
            },
            "Industry": {
                "rich_text": [{"text": {"content": industry}}]
            },
            "Location": {
                "rich_text": [{"text": {"content": location_str}}]
            },
            "Total Touches": {
                "rich_text": [{"text": {"content": total_touches}}]
            },
            "URL": {
                "url": website_url if website_url.startswith("http") else f"https://{website_url}"
            },
            "Status": {
                "select": {"name": "New Lead"}
            }
        },
        "children": [
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": "DeepSeek Industrial Intent Analysis"}}]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": summary_text}}]
                }
            },
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": "Complete Behavioral Pathway Trail"}}]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": pathway_text}}]
                }
            }
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload, timeout=10.0)
            if response.status_code in [200, 201]:
                logger.info(f"🟢 Notion Sync Success for Entity: {company_name}")
            else:
                logger.error(f"❌ Notion Sync Failed ({response.status_code}): {response.text}")
        except Exception as e:
            logger.error(f"🚨 Notion Transport Error: {e}")