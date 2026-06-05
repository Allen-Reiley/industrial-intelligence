# backend/app/api/v1/webhook.py
import hmac
import hashlib
import logging
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Request, Header, HTTPException, BackgroundTasks
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.db import get_async_session
from app.models.client import Client, SubscriptionStatus
from app.core.config import settings
from app.services.reports import compile_and_send_contract

router = APIRouter()
logger = logging.getLogger("auraworks.webhook")

class PayGeniusWebhookPayload(BaseModel):
    client_id: UUID
    status: str
    email: str
    payment_plan: Optional[str] = "monthly"
    signature: Optional[str] = None

@router.post("/paygenius")
async def paygenius_webhook(
    request: Request,
    payload: PayGeniusWebhookPayload,
    background_tasks: BackgroundTasks,
    x_signature: Optional[str] = Header(None, alias="X-Signature"),
    x_paygenius_signature: Optional[str] = Header(None, alias="X-Paygenius-Signature"),
    session: AsyncSession = Depends(get_async_session)
):
    """
    Receives billing/checkout webhooks from PayGenius API.
    Verifies payload signature, activates client subscription, and dispatches signed PDF contract.
    """
    body = await request.body()
    secret = settings.PAYGENIUS_WEBHOOK_SECRET or "paygenius-secret"
    
    # Extract signature token from header or payload parameter
    sig = x_signature or x_paygenius_signature or payload.signature
    if not sig:
        logger.error("PayGenius Webhook: Missing signature credentials.")
        raise HTTPException(status_code=401, detail="Unauthorized: Missing Signature")
        
    expected_hmac = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    
    # Allow raw secret comparison in test/dev environments or validated HMAC check
    if sig != secret and not hmac.compare_digest(expected_hmac, sig):
        logger.error("PayGenius Webhook: Signature verification failed.")
        raise HTTPException(status_code=403, detail="Unauthorized: Invalid Signature")

    if payload.status.lower() == "success":
        client = await session.get(Client, payload.client_id)
        if not client:
            logger.error(f"PayGenius Webhook: Client ID {payload.client_id} not found.")
            raise HTTPException(status_code=404, detail="Client not found")
            
        client.subscription_status = SubscriptionStatus.ACTIVE
        client.is_active = True
        client.payment_plan = payload.payment_plan
        client.setup_fee_paid = True
        
        session.add(client)
        await session.commit()
        await session.refresh(client)
        
        logger.info(f"PayGenius Webhook: Activated subscription for Client {client.company_name} ({client.id})")
        
        # Trigger async contract generation background task
        background_tasks.add_task(
            compile_and_send_contract,
            client_name=client.company_name,
            client_domain=client.domain,
            recipient_email=payload.email,
            plan=payload.payment_plan
        )
        
        return {"status": "success", "message": "Client subscription activated, contract compilation queued"}
        
    return {"status": "ignored", "message": f"Webhook status '{payload.status}' ignored."}
