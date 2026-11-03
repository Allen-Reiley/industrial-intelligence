# backend/app/api/v1/checkout.py
import logging
from uuid import UUID
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.db import get_async_session
from app.core.security import require_sales, get_current_user
from app.models.user import User
from app.models.client import Client, SubscriptionStatus
from app.models.checkout_session import CheckoutSession, CheckoutSessionStatus
from app.services.payment import IkhokhaClient

logger = logging.getLogger("auraworks.checkout")
router = APIRouter()

PLAN_DEFAULT_PRICING = {
    "growth-foundation": 1000000,    # R10,000 / mo in cents
    "category-leader": 1850000,      # R18,500 / mo in cents
    "enterprise-corridor": 3200000,  # R32,000 / mo in cents
    "monthly": 1000000,              # R10,000 / mo
    "annual": 12000000               # R120,000 / yr
}

class CheckoutGeneratePayload(BaseModel):
    business_name: str
    contact_email: str
    contact_phone: Optional[str] = None
    selected_plan: str = "growth-foundation"
    custom_pricing: Optional[int] = None  # in integer cents (e.g. 1000000 for R10,000)
    domain: Optional[str] = None


@router.post("/generate")
async def generate_checkout_link(
    payload: CheckoutGeneratePayload,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(require_sales)
):
    """
    Creates a Client record (status: pending/suspended) and a short-lived CheckoutSession 
    strictly expiring 24 hours from creation, attributable to the authenticated sales representative.
    """
    if not payload.business_name or not payload.contact_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Business name and contact email are required."
        )

    # Determine pricing amount in cents
    amount = payload.custom_pricing or PLAN_DEFAULT_PRICING.get(payload.selected_plan.lower(), 1000000)

    # 1. Create client record
    client = Client(
        company_name=payload.business_name.strip(),
        contact_email=payload.contact_email.strip(),
        contact_phone=payload.contact_phone.strip() if payload.contact_phone else None,
        sales_rep_id=current_user.id,
        domain=payload.domain.strip() if payload.domain else None,
        whitelisted_domains=[payload.domain.strip()] if payload.domain else [],
        subscription_status=SubscriptionStatus.SUSPENDED,
        payment_plan=payload.selected_plan,
        custom_monthly_amount=amount,
        is_active=False
    )
    session.add(client)
    await session.commit()
    await session.refresh(client)

    # 2. Create 24-hour CheckoutSession
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=24)
    
    checkout_sess = CheckoutSession(
        client_id=client.id,
        sales_rep_id=current_user.id,
        status=CheckoutSessionStatus.PENDING,
        expires_at=expires_at,
        amount=amount,
        plan=payload.selected_plan,
        business_name=payload.business_name.strip(),
        contact_email=payload.contact_email.strip(),
        contact_phone=payload.contact_phone.strip() if payload.contact_phone else None
    )
    session.add(checkout_sess)
    await session.commit()
    await session.refresh(checkout_sess)

    logger.info(
        f"Generated 24-hour checkout session {checkout_sess.id} for client "
        f"{client.company_name} by sales rep {current_user.email} (Expires: {expires_at})"
    )

    return {
        "status": "success",
        "session_id": str(checkout_sess.id),
        "checkout_url": f"/checkout/{checkout_sess.id}",
        "expires_at": checkout_sess.expires_at.isoformat(),
        "client_id": str(client.id),
        "business_name": client.company_name,
        "amount": amount,
        "plan": payload.selected_plan
    }


@router.get("/session/{session_id}")
async def get_checkout_session(
    session_id: UUID,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Validates checkout session existence and expiration.
    Returns 410 Gone if expired.
    Hydrates frontend checkout dynamic page with client & pricing details.
    """
    stmt = select(CheckoutSession).where(CheckoutSession.id == session_id)
    res = await session.execute(stmt)
    checkout_sess = res.scalars().first()

    if not checkout_sess:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checkout session not found."
        )

    now = datetime.now(timezone.utc)
    sess_expires = checkout_sess.expires_at
    if sess_expires.tzinfo is None:
        sess_expires = sess_expires.replace(tzinfo=timezone.utc)

    # Check 24-hour expiration boundary
    if sess_expires < now or checkout_sess.status == CheckoutSessionStatus.EXPIRED:
        if checkout_sess.status != CheckoutSessionStatus.PAID and checkout_sess.status != CheckoutSessionStatus.EXPIRED:
            checkout_sess.status = CheckoutSessionStatus.EXPIRED
            session.add(checkout_sess)
            await session.commit()

        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Checkout session has expired. Please request a new checkout link from your sales representative."
        )

    client = await session.get(Client, checkout_sess.client_id)

    return {
        "session_id": str(checkout_sess.id),
        "client_id": str(checkout_sess.client_id),
        "sales_rep_id": checkout_sess.sales_rep_id,
        "status": checkout_sess.status,
        "expires_at": checkout_sess.expires_at.isoformat(),
        "amount": checkout_sess.amount,
        "plan": checkout_sess.plan,
        "business_name": checkout_sess.business_name or (client.company_name if client else "Enterprise Client"),
        "contact_email": checkout_sess.contact_email or (client.contact_email if client else None),
        "contact_phone": checkout_sess.contact_phone or (client.contact_phone if client else None)
    }


class CheckoutSessionPayPayload(BaseModel):
    redirect_url: str
    tc_accepted: bool
    tc_accepted_ip: Optional[str] = None
    billing_cycle: Optional[str] = "monthly"


@router.post("/session/{session_id}/pay")
async def pay_checkout_session(
    session_id: UUID,
    payload: CheckoutSessionPayPayload,
    request: Request,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Handoff to Ikhokha payment intent from the dynamic checkout session page.
    Enforces T&C acceptance and 24-hour session validity.
    """
    stmt = select(CheckoutSession).where(CheckoutSession.id == session_id)
    res = await session.execute(stmt)
    checkout_sess = res.scalars().first()

    if not checkout_sess:
        raise HTTPException(status_code=404, detail="Checkout session not found.")

    now = datetime.now(timezone.utc)
    sess_expires = checkout_sess.expires_at
    if sess_expires.tzinfo is None:
        sess_expires = sess_expires.replace(tzinfo=timezone.utc)

    if sess_expires < now or checkout_sess.status == CheckoutSessionStatus.EXPIRED:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Checkout session has expired. Please request a new checkout link."
        )

    if not payload.tc_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Terms & Conditions must be accepted to proceed with checkout."
        )

    client = await session.get(Client, checkout_sess.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client record not found.")

    ip_address = payload.tc_accepted_ip or (request.client.host if request.client else "127.0.0.1")

    # Update Client status to Trial, set 14-day trial end date and log T&Cs acceptance
    client.billing_cycle = payload.billing_cycle or "monthly"
    client.tc_accepted_at = now
    client.tc_accepted_ip = ip_address
    client.subscription_status = SubscriptionStatus.TRIAL
    client.trial_ends_at = now + timedelta(days=14)
    client.is_active = True

    session.add(client)
    await session.commit()
    await session.refresh(client)

    amount = checkout_sess.amount

    try:
        ik_client = IkhokhaClient()
        intent = await ik_client.create_payment_intent(
            client_id=client.id,
            amount=amount,
            redirect_url=payload.redirect_url
        )
        return {
            "status": "success",
            "session_id": str(checkout_sess.id),
            "intent_id": intent.get("intentId") or intent.get("id"),
            "payment_url": intent.get("paymentUrl") or intent.get("redirectUrl"),
            "amount": amount
        }
    except Exception as e:
        logger.error(f"Failed to create Ikhokha checkout intent for session {session_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Payment gateway communication failure: {str(e)}"
        )
