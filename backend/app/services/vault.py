# backend/app/services/vault.py
import httpx
import logging
import urllib.parse
from typing import Dict, Any, Optional, Union
from uuid import UUID
from app.core.config import settings

logger = logging.getLogger("uvicorn")


def _decrypt_vault_token(val: Optional[str]) -> Optional[str]:
    """Safely decrypts an encrypted credential or returns raw value if plaintext."""
    if not val:
        return None
    try:
        from app.core.security import decrypt_field
        return decrypt_field(val)
    except Exception:
        return val


async def _resolve_client(client_id: Optional[Any], client: Optional[Any] = None) -> Optional[Any]:
    """Resolves Client entity if not already provided."""
    if client is not None:
        return client
    if not client_id:
        return None
    try:
        try:
            from app.db import async_session_maker
        except ImportError:
            from app.core.database import async_session_maker
        from app.models.client import Client
        async with async_session_maker() as session:
            return await session.get(Client, UUID(str(client_id)))
    except Exception as e:
        logger.warning(f"⚠️ Vault client resolution error for {client_id}: {e}")
        return None


async def sync_to_airtable(
    arg1: Any = None,
    arg2: Any = None,
    arg3: Optional[Dict[str, Any]] = None,
    client_id: Optional[Union[UUID, str, int]] = None,
    client: Optional[Any] = None,
    prospect_data: Optional[Dict[str, Any]] = None,
    journey: Optional[Dict[str, Any]] = None,
):
    """
    Phase 3: The Airtable Bridge.
    Pushes the compiled lead metrics, session journey, URL footprints, 
    and DeepSeek intent summaries securely into tenant-specific Airtable.
    Supports signatures:
    - sync_to_airtable(client_id, prospect_data, journey)
    - sync_to_airtable(prospect_data, journey)
    - sync_to_airtable(prospect_data, journey, client_id=...)
    """
    if isinstance(arg1, (str, int, UUID)) or arg3 is not None:
        resolved_client_id = arg1
        resolved_prospect_data = arg2 or prospect_data or {}
        resolved_journey = arg3 or journey or {}
    elif isinstance(arg1, dict):
        resolved_prospect_data = arg1
        resolved_journey = arg2 if isinstance(arg2, dict) else (journey or {})
        resolved_client_id = client_id or (client.id if client else None) or resolved_prospect_data.get("client_id")
    else:
        resolved_client_id = client_id or (client.id if client else None)
        resolved_prospect_data = prospect_data or {}
        resolved_journey = journey or {}

    # Resolve client model
    client_obj = await _resolve_client(resolved_client_id, client=client)

    api_key = None
    base_id = None
    table_name = "Leads"

    if client_obj:
        integrations = getattr(client_obj, "integrations", None) or {}
        airtable_cfg = integrations.get("airtable") if isinstance(integrations.get("airtable"), dict) else {}
        api_key = (
            airtable_cfg.get("api_key")
            or airtable_cfg.get("token")
            or getattr(client_obj, "airtable_api_key", None)
            or integrations.get("airtable_api_key")
        )
        base_id = (
            airtable_cfg.get("base_id")
            or getattr(client_obj, "airtable_base_id", None)
            or integrations.get("airtable_base_id")
        )
        table_name = (
            airtable_cfg.get("table_name")
            or integrations.get("airtable_table_name")
            or getattr(settings, "AIRTABLE_TABLE_NAME", "Leads")
        )

    # Fallback for unit testing environments where settings are patched
    if not api_key and getattr(settings, "AIRTABLE_API_KEY", None):
        api_key = settings.AIRTABLE_API_KEY
    if not base_id and getattr(settings, "AIRTABLE_BASE_ID", None):
        base_id = settings.AIRTABLE_BASE_ID
    if not table_name:
        table_name = getattr(settings, "AIRTABLE_TABLE_NAME", "Leads")

    if not api_key or not base_id:
        logger.warning(f"⚠️ Airtable Sync skipped: Credentials not configured for client {resolved_client_id or 'unknown'}.")
        return

    # Decrypt token
    decrypted_api_key = _decrypt_vault_token(api_key)

    # URL Encoding handles any structural spaces inside table name configuration
    safe_table_name = urllib.parse.quote(table_name)
    url = f"https://api.airtable.com/v0/{base_id}/{safe_table_name}"
    
    headers = {
        "Authorization": f"Bearer {decrypted_api_key}",
        "Content-Type": "application/json"
    }

    # Map internal data schemas strictly to Airtable Column Headers
    raw_fields = {
        "Company": resolved_prospect_data.get("company_name_final") or "Unknown Entity",
        "Lead Name": resolved_prospect_data.get("name") or "Unknown Lead",
        "Email": resolved_prospect_data.get("email"),
        "Position": resolved_prospect_data.get("position") or "Evaluator",
        "Department": resolved_prospect_data.get("department") or "Undetermined",
        "Industry": resolved_prospect_data.get("industry") or "Industrial",
        "URL": resolved_prospect_data.get("website") or "N/A", 
        "Pathway": resolved_journey.get("pathway") or "Direct",
        "Intent Summary": resolved_journey.get("intent_summary") or "Pending Intelligence...",
        "Status": "Needs Review"
    }

    # Strip out any keys containing Python 'None' values
    clean_fields = {k: v for k, v in raw_fields.items() if v is not None}

    payload = {
        "records": [
            {
                "fields": clean_fields
            }
        ]
    }

    async with httpx.AsyncClient() as http_client:
        try:
            response = await http_client.post(url, headers=headers, json=payload, timeout=10.0)
            if response.status_code == 200:
                logger.info(f"🟢 Airtable Sync Success for Lead: {resolved_prospect_data.get('email')}")
            else:
                logger.error(f"❌ Airtable Sync Failed ({response.status_code}): {response.text}")
        except Exception as e:
            logger.error(f"🚨 Airtable Transport Error: {e}")


async def sync_to_notion(
    arg1: Any = None,
    arg2: Any = None,
    arg3: Optional[Dict[str, Any]] = None,
    client_id: Optional[Union[UUID, str, int]] = None,
    client: Optional[Any] = None,
    prospect_data: Optional[Dict[str, Any]] = None,
    journey: Optional[Dict[str, Any]] = None,
):
    """
    Phase 4: The Notion Vault Bridge.
    Creates an itemized ledger entry mapping ALL associated firmographic,
    behavioral, and DeepSeek intelligence assets to the tenant's Notion Workspace canvas.
    Supports signatures:
    - sync_to_notion(client_id, prospect_data, journey)
    - sync_to_notion(prospect_data, journey)
    - sync_to_notion(prospect_data, journey, client_id=...)
    """
    if isinstance(arg1, (str, int, UUID)) or arg3 is not None:
        resolved_client_id = arg1
        resolved_prospect_data = arg2 or prospect_data or {}
        resolved_journey = arg3 or journey or {}
    elif isinstance(arg1, dict):
        resolved_prospect_data = arg1
        resolved_journey = arg2 if isinstance(arg2, dict) else (journey or {})
        resolved_client_id = client_id or (client.id if client else None) or resolved_prospect_data.get("client_id")
    else:
        resolved_client_id = client_id or (client.id if client else None)
        resolved_prospect_data = prospect_data or {}
        resolved_journey = journey or {}

    # Resolve client model
    client_obj = await _resolve_client(resolved_client_id, client=client)

    token = None
    database_id = None

    if client_obj:
        integrations = getattr(client_obj, "integrations", None) or {}
        notion_cfg = integrations.get("notion") if isinstance(integrations.get("notion"), dict) else {}
        token = (
            notion_cfg.get("token")
            or notion_cfg.get("api_key")
            or integrations.get("notion_token")
            or integrations.get("notion_api_key")
        )
        database_id = (
            notion_cfg.get("database_id")
            or integrations.get("notion_database_id")
        )

    # Fallback for unit testing environments where settings are patched
    if not token and getattr(settings, "NOTION_TOKEN", None):
        token = settings.NOTION_TOKEN
    elif not token and getattr(settings, "NOTION_API_KEY", None):
        token = settings.NOTION_API_KEY

    if not database_id and getattr(settings, "NOTION_DATABASE_ID", None):
        database_id = settings.NOTION_DATABASE_ID

    if not token or not database_id:
        logger.warning(f"⚠️ Notion Sync skipped: Credentials not configured for client {resolved_client_id or 'unknown'}.")
        return

    # Decrypt token
    decrypted_token = _decrypt_vault_token(token)

    url = "https://api.notion.com/v1/pages"
    
    headers = {
        "Authorization": f"Bearer {decrypted_token}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }

    # Extract clean parameters with fallback safe-guards
    company_name = (
        resolved_prospect_data.get("company_name_final")
        or resolved_prospect_data.get("company_name")
        or "Anonymous Entity"
    )
    lead_name = resolved_prospect_data.get("name") or "Unknown Lead"
    email = resolved_prospect_data.get("email") or "unknown@entity.co.za"
    position = resolved_prospect_data.get("position") or "Evaluator"
    department = resolved_prospect_data.get("department") or "Undetermined"
    industry = resolved_prospect_data.get("industry") or "Industrial"
    website_url = resolved_prospect_data.get("website") or "https://auraworks.co.za"
    
    # Extract journey stats
    total_touches = str(resolved_journey.get("total_touches", "1"))
    pathway_text = resolved_journey.get("pathway") or "Direct Ingestion"
    summary_text = resolved_journey.get("intent_summary") or "No intelligence data compiled."
    
    # Location data mapping
    city = resolved_prospect_data.get("city") or resolved_journey.get("city") or "Unknown"
    region = resolved_prospect_data.get("region") or resolved_journey.get("region") or "ZA"
    location_str = f"{city}, {region}"

    # Deeply structured properties to map ALL parameters into Notion types
    payload = {
        "parent": {"database_id": database_id},
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

    async with httpx.AsyncClient() as http_client:
        try:
            response = await http_client.post(url, headers=headers, json=payload, timeout=10.0)
            if response.status_code in [200, 201]:
                logger.info(f"🟢 Notion Sync Success for Entity: {company_name}")
            else:
                logger.error(f"❌ Notion Sync Failed ({response.status_code}): {response.text}")
        except Exception as e:
            logger.error(f"🚨 Notion Transport Error: {e}")