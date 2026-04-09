import os
import logging
from notion_client import Client
from datetime import datetime

logger = logging.getLogger("uvicorn")

class NotionVault:
    def __init__(self):
        self.token = os.getenv("NOTION_TOKEN")
        self.database_id = os.getenv("NOTION_DATABASE_ID")
        
        if not self.token or not self.database_id:
            logger.warning("⚠️ Notion credentials missing. Vault on standby.")
            self.client = None
        else:
            self.client = Client(auth=self.token)

    async def archive_corporate_visit(self, data: dict):
        """Creates a clinical audit page in the Notion Vault."""
        if not self.client:
            return None

        try:
            new_page = self.client.pages.create(
                parent={"database_id": self.database_id},
                properties={
                    "Name": {"title": [{"text": {"content": data.get("company_name", "Anonymous Entity")}}]},
                    "Domain": {"url": data.get("domain") if data.get("domain") != "N/A" else None},
                    "Aura ID": {"rich_text": [{"text": {"content": data.get("aura_id", "N/A")}}]},
                    "Summary": {"rich_text": [{"text": {"content": data.get("summary", "Awaiting DeepSeek Audit...")}}]},
                    "Industry": {"rich_text": [{"text": {"content": data.get("industry", "Industrial")}}]}
                }
            )
            logger.info(f"🏛️ Forensic Record archived to Notion Vault: {data.get('company_name')}")
            return new_page["id"]
        except Exception as e:
            logger.error(f"❌ Notion Vault Archival Failure: {e}")
            return None

notion_vault = NotionVault()