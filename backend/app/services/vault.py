# backend/app/services/vault.py
import httpx
import logging
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger("uvicorn")

# ... (keep your sync_to_airtable function exactly the same as previously fixed) ...

async def sync_to_notion(lead_data: Dict[str, Any], journey: Dict[str, Any]):
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

    # Extract clean parameters from both incoming dictionaries with fallback safe-guards
    company_name = lead_data.get("company_name_final") or lead_data.get("company_name") or "Anonymous Entity"
    lead_name = lead_data.get("name") or "Unknown Lead"
    email = lead_data.get("email") or "unknown@entity.co.za"
    position = lead_data.get("position") or "Evaluator"
    department = lead_data.get("department") or "Undetermined"
    industry = lead_data.get("industry") or "Industrial"
    website_url = lead_data.get("website") or "https://auraworks.co.za"
    
    # Extract journey stats
    total_touches = str(journey.get("total_touches", "1"))
    pathway_text = journey.get("pathway") or "Direct Ingestion"
    summary_text = journey.get("intent_summary") or "No intelligence data compiled."
    
    # Location data mapping from track.py / enrichment payloads
    city = lead_data.get("city") or journey.get("city") or "Unknown"
    region = lead_data.get("region") or journey.get("region") or "ZA"
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