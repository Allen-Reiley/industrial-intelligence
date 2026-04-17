# backend/app/tasks/bridge.py
import logging
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("uvicorn")

class VaultBridge:
    """
    The Industrial Sink: Responsible for pushing enriched forensic leads 
    into the AuraWorks Airtable Vault.
    """
    
    def __init__(self):
        self.api_key = settings.AIRTABLE_API_KEY
        self.base_id = settings.AIRTABLE_BASE_ID
        self.table_name = settings.AIRTABLE_TABLE_NAME
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        self.url = f"https://api.airtable.com/v0/{self.base_id}/{self.table_name}"

    async def push_to_vault(self, lead_data: Dict[str, Any], journey_data: Dict[str, Any]) -> bool:
        """
        Synchronizes forensic data and behavioral intent with the Airtable schema.
        """
        if not all([self.api_key, self.base_id]):
            logger.warning("⚠️ Vault Bridge deactivated: Missing Airtable Credentials.")
            return False

        # Prepare the clinical record for the Vault
        # Note: Field names must match your Airtable column names exactly
        payload = {
            "records": [
                {
                    "fields": {
                        "Entity Name": lead_data.get("company_name", "Anonymous Entity"),
                        "Domain": lead_data.get("domain", "N/A"),
                        "Region": lead_data.get("region", "South Africa"),
                        "City": lead_data.get("city", "Unknown"),
                        "Industry": lead_data.get("industry", "Industrial"),
                        "Intent Summary": journey_data.get("intent_summary", "No analysis available."),
                        "Touchpoints": journey_data.get("total_touches", 1),
                        "Pathway": journey_data.get("pathway", "/"),
                        "High Intent": journey_data.get("is_high_intent", False),
                        "Buying Committee": journey_data.get("is_cluster", False),
                        "Aura_ID": lead_data.get("aura_id", "Unknown"),
                        "Last Seen": lead_data.get("timestamp") or "Just Now"
                    }
                }
            ]
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.url, headers=self.headers, json=payload, timeout=10.0)
                if response.status_code == 200:
                    logger.info(f"✅ Vault Sync Successful: {lead_data.get('company_name')}")
                    return True
                else:
                    logger.error(f"❌ Vault Sync Error {response.status_code}: {response.text}")
                    return False
            except Exception as e:
                logger.error(f"🚨 Vault Bridge Critical Failure: {e}")
                return False

async def sync_lead_to_external_vault(lead_data: Dict[str, Any], journey_data: Dict[str, Any]):
    """
    Entry point for BackgroundTasks to ensure the API response is not blocked 
    by external network latency.
    """
    bridge = VaultBridge()
    await bridge.push_to_vault(lead_data, journey_data)