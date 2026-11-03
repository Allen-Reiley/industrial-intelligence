# backend/update_client_consent.py
import asyncio
import uuid
import logging
from dotenv import load_dotenv

# Load local environment variables
load_dotenv()

from sqlmodel import select, text
from app.db import async_session_maker, engine
from app.models.client import Client
from app.core.cache import TwoTierCache

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("update_client_consent")

async def update_client_consent():
    """
    Updates client records to set require_consent_banner = True
    and invalidates the TwoTierCache so changes take effect immediately.
    """
    default_client_id = uuid.UUID("c4a6c9b1-8355-4de2-985d-a04f4dcd63a0")

    if not async_session_maker:
        logger.error("Database connection unavailable. Check DATABASE_URL.")
        return False

    async with async_session_maker() as session:
        # 1. Update specific default client
        stmt = select(Client).where(Client.id == default_client_id)
        res = await session.execute(stmt)
        default_client = res.scalars().first()

        if default_client:
            default_client.require_consent_banner = True
            session.add(default_client)
            logger.info(f"Updated default client {default_client_id}: require_consent_banner = True")
        else:
            logger.warning(f"Default client {default_client_id} not found in database.")

        # 2. Update any other existing clients where require_consent_banner is False
        stmt_all = select(Client).where(Client.require_consent_banner == False)
        res_all = await session.execute(stmt_all)
        clients_to_update = res_all.scalars().all()
        for c in clients_to_update:
            c.require_consent_banner = True
            session.add(c)
            logger.info(f"Updated client {c.id} ({c.company_name}): require_consent_banner = True")

        await session.commit()
        logger.info("Database changes committed successfully.")

    # 3. Invalidate/flush config caches
    try:
        await TwoTierCache.delete_prefix("client_config")
        TwoTierCache.clear()
        logger.info("TwoTierCache client_config keys successfully flushed.")
    except Exception as e:
        logger.warning(f"Failed to flush TwoTierCache: {e}")

    return True

if __name__ == "__main__":
    asyncio.run(update_client_consent())
