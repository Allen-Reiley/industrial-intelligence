import os
from pyairtable import Api
from datetime import datetime
import logging

logger = logging.getLogger("uvicorn")

class AirtableEngine:
    def __init__(self):
        token = os.getenv("AIRTABLE_ACCESS_TOKEN")
        base_id = os.getenv("AIRTABLE_BASE_ID")
        
        if not token or not base_id:
            logger.warning("⚠️ Airtable credentials missing. Engine standby.")
            self.table = None
        else:
            self.api = Api(token)
            # This matches the table name in your Airtable Base
            self.table = self.api.table(base_id, "Forensic Ledger")

    async def push_visit(self, data: dict):
        """Pushes a high-intent corporate visit to the Airtable Ledger."""
        if not self.table:
            return

        try:
            # Preparing the record structure for a 'Quiet Premium' look
            record = {
                "Entity Name": data.get("company_name", "Unknown Entity"),
                "Domain": data.get("domain", "N/A"),
                "Status": "Raw Capture",
                "IP Address": data.get("ip_address"),
                "Location": f"{data.get('city')}, {data.get('region')}",
                "Intelligence Summary": data.get("summary", "Awaiting DeepSeek Audit..."),
                "Aura ID": data.get("aura_id"),
                "Detected At": datetime.utcnow().isoformat()
            }
            
            self.table.create(record)
            logger.info(f"✅ Industrial Signal logged to Airtable: {record['Entity Name']}")
            
        except Exception as e:
            logger.error(f"❌ Airtable Dispatch Failure: {e}")

airtable_engine = AirtableEngine()