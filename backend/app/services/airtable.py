import logging
import asyncio
from datetime import datetime, timezone
from app.core.config import settings
from pyairtable import Api

logger = logging.getLogger("uvicorn")

class AirtableEngine:
    def __init__(self):
        """
        Initializes the Airtable connection using ProductionSettings.
        """
        # Centralized configuration access from settings
        self.token = settings.AIRTABLE_API_KEY
        self.base_id = settings.AIRTABLE_BASE_ID
        self.table_name = settings.AIRTABLE_TABLE_NAME 
        
        if not self.token or not self.base_id:
            logger.warning("⚠️ Airtable Engine: Missing credentials in environment. Standing by...")
            self.table = None
        else:
            try:
                self.api = Api(self.token)
                self.table = self.api.table(self.base_id, self.table_name)
                logger.info(f"✅ Airtable Engine: Linked to Vault '{self.table_name}'")
            except Exception as e:
                logger.error(f"❌ Airtable Engine: Initialization failed: {e}")
                self.table = None

    async def push_visit(self, data: dict):
        """
        Pushes high-intent corporate signals to the Airtable Ledger.
        Uses clinical validation and thread offloading for production performance.
        """
        # Final safety check: Pull fresh state from settings
        # This prevents crashes if credentials are changed in Railway during runtime
        current_token = settings.AIRTABLE_API_KEY
        current_base = settings.AIRTABLE_BASE_ID

        if not all([current_token, current_base]):
            # Silently exit if credentials are removed in production variables
            return {"status": "standby", "reason": "missing_credentials"}

        if not self.table:
            # Re-attempt initialization if keys were provided after startup
            try:
                self.api = Api(current_token)
                self.table = self.api.table(current_base, self.table_name)
            except:
                return {"status": "error", "reason": "vault_not_initialized"}

        try:
            # Map Jura-level data to the Airtable Schema
            record = {
                "Entity Name": data.get("company_name", "Anonymous Facility"),
                "Domain": data.get("domain", "unknown.com"),
                "Status": "Forensic Capture",
                "IP Address": data.get("ip_address"),
                "Location": f"{data.get('city', 'Unknown')}, {data.get('country_name', 'South Africa')}",
                "Intelligence Summary": data.get("summary", "Awaiting Intelligence Audit..."),
                "Aura ID": data.get("aura_id"),
                "Connection": data.get("effective_connection_type", "Standard"),
                "Detected At": datetime.now(timezone.utc).isoformat()
            }
            
            # Execute blocking pyairtable call in a separate thread
            await asyncio.to_thread(self.table.create, record)
            
            logger.info(f"💼 Vault: Industrial Signal logged for {record['Entity Name']}")
            return {"status": "success"}
            
        except Exception as e:
            logger.error(f"❌ Vault Sync Failure: {e}")
            return {"status": "error", "message": str(e)}

# Global instantiation for use throughout AuraWorks OS
airtable_engine = AirtableEngine()