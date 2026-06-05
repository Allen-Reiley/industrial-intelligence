# backend/app/services/crm.py
import httpx
import logging
import asyncio
from datetime import datetime, timezone
from uuid import UUID
from app.db import async_session_maker
from app.models.crm_dead_letter import CrmDeadLetter

logger = logging.getLogger("uvicorn")

async def sync_lead_to_crm(client_id: UUID, lead_data: dict, crm_url: str = None, backoff_base: float = 1.0) -> bool:
    """
    Asynchronously synchronizes a promoted lead matrix to an outbound CRM webhook endpoint.
    Attempts up to 3 times with exponential backoff on connection failure,
    and writes to CrmDeadLetter dead-letter queue if it fails persistently.
    """
    if not crm_url:
        crm_url = f"https://api.auraworks.co.za/api/v1/webhook/crm/{client_id}"
        
    attempts = 0
    max_attempts = 3
    last_error = None
    
    while attempts < max_attempts:
        attempts += 1
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(crm_url, json=lead_data, timeout=5.0)
                if response.status_code in [200, 201]:
                    logger.info(f"🟢 CRM Sync Success for client {client_id} (Attempt {attempts})")
                    return True
                else:
                    last_error = f"HTTP Error {response.status_code}: {response.text}"
        except Exception as e:
            last_error = str(e)
            
        if attempts < max_attempts:
            # Exponential backoff: base * (2 ** (attempts - 1))
            delay = backoff_base * (2 ** (attempts - 1))
            await asyncio.sleep(delay)
            
    # If we reached here, CRM synchronization failed persistently
    logger.error(f"❌ CRM Sync failed persistently after {max_attempts} attempts. Logging to Dead Letter Queue. Error: {last_error}")
    
    if async_session_maker:
        async with async_session_maker() as session:
            try:
                dead_letter = CrmDeadLetter(
                    client_id=client_id,
                    payload=lead_data,
                    attempts=max_attempts,
                    last_error=last_error,
                    failed_at=datetime.now(timezone.utc)
                )
                session.add(dead_letter)
                await session.commit()
            except Exception as db_err:
                logger.error(f"🚨 Failed to write to CrmDeadLetter: {db_err}")
                
    return False
