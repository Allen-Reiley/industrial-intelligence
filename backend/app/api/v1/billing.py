# backend/app/api/v1/billing.py
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from pydantic import BaseModel

from sqlmodel import select
from app.db import get_async_session
from app.models.client import Client
from app.services.payment import IkhokhaClient

from app.api.v1.auth import get_current_admin

router = APIRouter()
logger = logging.getLogger("auraworks.billing")

class BillingSetupPayload(BaseModel):
    client_id: UUID
    amount: Optional[int] = None  # in cents
    redirect_url: str

@router.post("/setup")
async def billing_setup(
    payload: BillingSetupPayload,
    session: AsyncSession = Depends(get_async_session),
    admin: str = Depends(get_current_admin)
):
    """
    Initiates the billing card setup flow by creating a payment intent on Ikhokha.
    """
    client = await session.get(Client, payload.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    # Default to custom_monthly_amount or 1000000 (R10,000)
    amount = payload.amount or client.custom_monthly_amount or 1000000
    
    try:
        ik_client = IkhokhaClient()
        intent = await ik_client.create_payment_intent(
            client_id=client.id,
            amount=amount,
            redirect_url=payload.redirect_url
        )
        return {
            "status": "success",
            "intent_id": intent.get("intentId") or intent.get("id"),
            "payment_url": intent.get("paymentUrl") or intent.get("redirectUrl"),
            "amount": amount
        }
    except Exception as e:
        logger.error(f"Failed to setup billing checkout: {e}")
        raise HTTPException(status_code=502, detail=f"Payment gateway communication failure: {str(e)}")


@router.get("/transactions")
async def get_transactions(
    client_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    admin: str = Depends(get_current_admin)
):
    """
    Exposes the transaction history data table query endpoint.
    """
    from app.models.transaction import Transaction
    stmt = select(Transaction).where(Transaction.client_id == client_id).order_by(Transaction.created_at.desc())
    res = await session.execute(stmt)
    return res.scalars().all()


class SimulateWebhookPayload(BaseModel):
    client_id: UUID
    status: str = "successful"
    amount: Optional[int] = None


@router.post("/simulate-webhook")
async def simulate_webhook(
    payload: SimulateWebhookPayload,
    session: AsyncSession = Depends(get_async_session),
    admin: str = Depends(get_current_admin)
):
    """
    Testing utility that simulates an Ikhokha webhook event delivery,
    recording a ledger entry and performing client activation side-effects.
    """
    from app.models.transaction import Transaction, TransactionStatus
    from app.models.client import SubscriptionStatus
    import uuid

    client = await session.get(Client, payload.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    tx_amount = payload.amount or client.custom_monthly_amount or 1000000
    gateway_ref = f"mock_ref_{uuid.uuid4()}"
    token = f"mock_token_{uuid.uuid4().hex[:10]}"

    status_lower = payload.status.lower()
    if status_lower in ("successful", "success"):
        tx_status = TransactionStatus.SUCCESSFUL
    elif status_lower in ("failed", "fail", "failure"):
        tx_status = TransactionStatus.FAILED
    elif status_lower in ("refunded", "refund"):
        tx_status = TransactionStatus.REFUNDED
    else:
        tx_status = TransactionStatus.PENDING

    new_tx = Transaction(
        client_id=payload.client_id,
        amount=tx_amount,
        currency="ZAR",
        status=tx_status,
        gateway_reference=gateway_ref,
        payment_method_token=token,
        error_message=None if tx_status == TransactionStatus.SUCCESSFUL else "Mock failed transaction"
    )
    session.add(new_tx)

    if tx_status == TransactionStatus.SUCCESSFUL:
        client.subscription_status = SubscriptionStatus.ACTIVE
        client.is_active = True
        client.payment_method_token = token
        session.add(client)

    await session.commit()
    await session.refresh(new_tx)

    return {
        "status": "success",
        "message": "Manual payment webhook simulation completed",
        "transaction_id": str(new_tx.id),
        "gateway_reference": gateway_ref
    }

