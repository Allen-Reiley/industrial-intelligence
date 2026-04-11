import logging
from datetime import datetime, timezone
from app.core.config import settings
from pyairtable import Api

logger = logging.getLogger("uvicorn")

class AirtableEngine:
    def __init__(self):
        # Using the centralized settings instead of direct os.getenv
        token = settings.AIRTABLE_API_KEY
        base_id = settings.AIRTABLE_BASE_ID
        
        if not token or not base_id:
            logger.warning("⚠️ Airtable credentials missing in settings. Engine on standby.")
            self.table = None
        else:
            self.api = Api(token)
            # Table name is 'Forensic Ledger' as per your B2B design
            self.table = self.api.table(base_id, "Forensic Ledger")

    async def push_visit(self, data: dict):
        """
        Pushes high-intent corporate signals to the Airtable Ledger.
        Matches the call in track.py to prevent AttributeErrors.
        """
        if not self.table:
            return

        try:
            # Structuring the record for industrial-grade reporting
            record = {
                "Entity Name": data.get("company_name", "Anonymous Facility"),
                "Domain": data.get("domain", "unknown.com"),
                "Status": "Forensic Capture",
                "IP Address": data.get("ip_address"),
                "Location": f"{data.get('city', 'Unknown')}, {data.get('region', 'ZA')}",
                "Intelligence Summary": data.get("summary", "Awaiting DeepSeek-V3 Audit..."),
                "Aura ID": data.get("aura_id"),
                "Connection Type": data.get("effective_connection_type", "Standard"),
                "Detected At": datetime.now(timezone.utc).isoformat()
            }
            
            # Sync execution within the async wrapper
            self.table.create(record)
            logger.info(f"✅ Airtable: Industrial Signal logged for {record['Entity Name']}")
            
        except Exception as e:
            logger.error(f"❌ Airtable Sync Failure: {e}")

# Instantiate the engine for use in background tasks
airtable_engine = AirtableEngine()