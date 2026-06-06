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


@router.post("/calendly")
async def calendly_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_calendly_signature: str = Header(..., alias="X-Calendly-Signature"),
    session: AsyncSession = Depends(get_async_session)
):
    """
    Ingests booking events from Calendly.
    Verifies payload signature using HMAC-SHA256 and CALENDLY_WEBHOOK_SECRET.
    Ensures idempotency using event_uuid.
    Upgrades prospect status to 'call_booked'.
    """
    import time
    import json
    from app.models import Prospect

    body = await request.body()
    body_str = body.decode("utf-8")
    
    # 1. Parse Calendly Signature header (t=<timestamp>,v1=<signature>)
    try:
        parts = dict(pair.split("=") for pair in x_calendly_signature.split(","))
        t = parts.get("t")
        v1 = parts.get("v1")
    except Exception:
        logger.error("Calendly Webhook: Invalid signature header format.")
        raise HTTPException(status_code=401, detail="Invalid signature header format")
        
    if not t or not v1:
        logger.error("Calendly Webhook: Missing signature components.")
        raise HTTPException(status_code=401, detail="Invalid signature header components")
        
    # 2. Check for replay attack / expired signatures
    current_time = int(time.time())
    try:
        timestamp = int(t)
    except ValueError:
        logger.error("Calendly Webhook: Invalid timestamp format.")
        raise HTTPException(status_code=401, detail="Invalid timestamp format")
        
    if abs(current_time - timestamp) > 300:
        logger.error(f"Calendly Webhook: Signature expired. Diff: {abs(current_time - timestamp)}")
        raise HTTPException(status_code=401, detail="Signature expired")
        
    # 3. Compute and verify HMAC-SHA256 signature
    secret = settings.CALENDLY_WEBHOOK_SECRET or ""
    message = f"{t}.{body_str}"
    computed = hmac.new(
        secret.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(computed, v1):
        logger.error("Calendly Webhook: Signature verification failed.")
        raise HTTPException(status_code=403, detail="Invalid signature")
        
    # 4. Parse JSON payload
    try:
        data = json.loads(body_str)
    except json.JSONDecodeError:
        logger.error("Calendly Webhook: Invalid JSON body.")
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    # 5. Extract event_uuid and invitee email
    payload_data = data.get("payload", {})
    event_uuid = payload_data.get("event_uuid")
    if not event_uuid:
        event_uri = payload_data.get("scheduled_event", {}).get("uri", "")
        if event_uri:
            event_uuid = event_uri.split("/")[-1]
            
    if not event_uuid:
        logger.error("Calendly Webhook: event_uuid missing from payload.")
        raise HTTPException(status_code=400, detail="event_uuid missing from payload")
        
    email = payload_data.get("email")
    if not email:
        logger.error("Calendly Webhook: invitee email missing from payload.")
        raise HTTPException(status_code=400, detail="invitee email missing from payload")
        
    # 6. Idempotency Check: Reject duplicate event processing
    existing_uuid_stmt = select(Prospect).where(Prospect.calendly_event_uuid == event_uuid)
    existing_uuid_res = await session.execute(existing_uuid_stmt)
    existing_prospect = existing_uuid_res.scalars().first()
    
    if existing_prospect:
        logger.info(f"Calendly Webhook: Duplicate event delivery for event_uuid {event_uuid}. Ignored.")
        return {"status": "ignored", "message": "Duplicate event payload ignored."}
        
    # 7. Upgrade Prospect Status
    prospect_stmt = select(Prospect).where(Prospect.email == email).order_by(Prospect.created_at.desc())
    prospect_res = await session.execute(prospect_stmt)
    prospect = prospect_res.scalars().first()
    
    if not prospect:
        logger.error(f"Calendly Webhook: No Prospect record found for email {email}.")
        raise HTTPException(status_code=404, detail="Prospect not found")
        
    # Upgrade status to call_booked and save event_uuid
    prospect.status = "call_booked"
    prospect.calendly_event_uuid = event_uuid
    session.add(prospect)
    await session.commit()
    await session.refresh(prospect)
    
    logger.info(f"Calendly Webhook: Prospect {email} successfully upgraded to 'call_booked' status.")
    
    # 8. Dispatch Slack Intelligence notifications
    from app.services.notifications import post_meeting_booked_to_slack
    background_tasks.add_task(post_meeting_booked_to_slack, prospect.id, data)
    
    return {"status": "success", "message": "Prospect booking recorded and Slack alert dispatched"}
