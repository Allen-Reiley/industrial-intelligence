import asyncio
import logging
from datetime import datetime, timedelta
from sqlmodel import Session, select, delete
from app.db import engine
from app.models.visit import Visit
from app.models.company import Company

logger = logging.getLogger("uvicorn")

async def run_janitor_sweep():
    while True:
        logger.info("🧹 Starting Janitor Sweep...")
        with Session(engine) as session:
            cutoff = datetime.now() - timedelta(hours=24)
            
            # Delete unverified visits older than 24h that haven't been promoted
            statement = delete(Visit).where(
                Visit.verification_status == "verifying",
                Visit.created_at < cutoff
            )
            result = session.exec(statement)
            session.commit()
            logger.info(f"🗑️ Purged {result.rowcount} unverified noise records.")
            
        await asyncio.sleep(21600) # Run every 6 hours