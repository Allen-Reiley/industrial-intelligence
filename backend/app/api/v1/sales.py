# backend/app/api/v1/sales.py
import logging
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func, desc

from app.db import get_async_session
from app.core.security import require_sales
from app.models.user import User, UserRole
from app.models.client import Client, SubscriptionStatus
from app.models.checkout_session import CheckoutSession, CheckoutSessionStatus

logger = logging.getLogger("auraworks.sales")
router = APIRouter()

@router.get("/metrics")
async def get_sales_rep_metrics(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(require_sales)
):
    """
    Returns KPI metrics for the logged-in sales representative.
    Admin users can see global metrics or their own.
    """
    rep_id = current_user.id

    # Total Links Generated
    stmt_total = select(func.count(CheckoutSession.id)).where(CheckoutSession.sales_rep_id == rep_id)
    res_total = await session.execute(stmt_total)
    total_links = res_total.scalar() or 0

    # Successful Conversions (Paid)
    stmt_paid = select(func.count(CheckoutSession.id)).where(
        CheckoutSession.sales_rep_id == rep_id,
        CheckoutSession.status == CheckoutSessionStatus.PAID
    )
    res_paid = await session.execute(stmt_paid)
    paid_count = res_paid.scalar() or 0

    # Pending Sessions
    now = datetime.now(timezone.utc)
    stmt_pending = select(func.count(CheckoutSession.id)).where(
        CheckoutSession.sales_rep_id == rep_id,
        CheckoutSession.status == CheckoutSessionStatus.PENDING,
        CheckoutSession.expires_at > now
    )
    res_pending = await session.execute(stmt_pending)
    pending_count = res_pending.scalar() or 0

    # Active Pipeline Value (Sum of converted client amounts in ZAR cents)
    stmt_pipeline = select(func.sum(CheckoutSession.amount)).where(
        CheckoutSession.sales_rep_id == rep_id,
        CheckoutSession.status == CheckoutSessionStatus.PAID
    )
    res_pipeline = await session.execute(stmt_pipeline)
    pipeline_cents = res_pipeline.scalar() or 0

    conversion_rate = round((paid_count / total_links * 100), 1) if total_links > 0 else 0.0

    return {
        "sales_rep_id": rep_id,
        "sales_rep_name": current_user.name,
        "total_links_generated": total_links,
        "successful_conversions": paid_count,
        "pending_links": pending_count,
        "conversion_rate_percentage": conversion_rate,
        "active_pipeline_cents": pipeline_cents,
        "active_pipeline_zar": pipeline_cents / 100.0
    }


@router.get("/checkouts")
async def get_sales_checkouts(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(require_sales)
):
    """
    Returns the list of checkout sessions attributable to the sales rep.
    Updates expired sessions dynamically. Polled by the frontend every 5 seconds.
    """
    now = datetime.now(timezone.utc)
    
    # Bounded query: Sales reps only see their own generated links
    if current_user.role == UserRole.ADMIN:
        stmt = select(CheckoutSession).order_by(desc(CheckoutSession.created_at))
    else:
        stmt = select(CheckoutSession).where(
            CheckoutSession.sales_rep_id == current_user.id
        ).order_by(desc(CheckoutSession.created_at))

    res = await session.execute(stmt)
    sessions = res.scalars().all()

    results = []
    has_expired_updates = False

    for s in sessions:
        sess_expires = s.expires_at
        if sess_expires.tzinfo is None:
            sess_expires = sess_expires.replace(tzinfo=timezone.utc)

        # Mark expired if past 24h and still pending
        if s.status == CheckoutSessionStatus.PENDING and sess_expires < now:
            s.status = CheckoutSessionStatus.EXPIRED
            session.add(s)
            has_expired_updates = True

        results.append({
            "session_id": str(s.id),
            "client_id": str(s.client_id),
            "sales_rep_id": s.sales_rep_id,
            "business_name": s.business_name or "Client",
            "contact_email": s.contact_email or "",
            "contact_phone": s.contact_phone,
            "plan": s.plan,
            "amount": s.amount,
            "amount_zar": s.amount / 100.0,
            "status": s.status,
            "expires_at": s.expires_at.isoformat(),
            "created_at": s.created_at.isoformat(),
            "is_expired": sess_expires < now and s.status != CheckoutSessionStatus.PAID
        })

    if has_expired_updates:
        await session.commit()

    return results


@router.get("/clients")
async def get_sales_clients(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(require_sales)
):
    """
    Returns all clients assigned to the sales rep for commission and attribution tracking.
    """
    if current_user.role == UserRole.ADMIN:
        stmt = select(Client).order_by(desc(Client.created_at))
    else:
        stmt = select(Client).where(
            Client.sales_rep_id == current_user.id
        ).order_by(desc(Client.created_at))

    res = await session.execute(stmt)
    clients = res.scalars().all()

    return [
        {
            "id": str(c.id),
            "company_name": c.company_name,
            "contact_email": c.contact_email,
            "contact_phone": c.contact_phone,
            "domain": c.domain,
            "subscription_status": c.subscription_status,
            "payment_plan": c.payment_plan,
            "custom_monthly_amount": c.custom_monthly_amount,
            "is_active": c.is_active,
            "created_at": c.created_at.isoformat() if c.created_at else None
        }
        for c in clients
    ]
