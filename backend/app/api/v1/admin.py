# backend/app/api/v1/admin.py
import logging
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func, desc, delete

from app.db import get_async_session
from app.core.security import require_admin
from app.models.user import User, UserRole
from app.models.client import Client, SubscriptionStatus
from app.models.checkout_session import CheckoutSession, CheckoutSessionStatus
from app.models.transaction import Transaction, TransactionStatus

logger = logging.getLogger("auraworks.admin_personnel")
router = APIRouter()

class UserUpdatePayload(BaseModel):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    name: Optional[str] = None


@router.get("/users")
async def list_personnel(
    session: AsyncSession = Depends(get_async_session),
    current_admin: User = Depends(require_admin)
):
    """
    Admin Personnel Management: Lists all registered sales reps and admins with their metrics.
    """
    stmt = select(User).order_by(desc(User.created_at))
    res = await session.execute(stmt)
    users = res.scalars().all()

    personnel = []
    for u in users:
        # Count sessions generated
        sess_count_stmt = select(func.count(CheckoutSession.id)).where(CheckoutSession.sales_rep_id == u.id)
        sess_count_res = await session.execute(sess_count_stmt)
        total_links = sess_count_res.scalar() or 0

        # Count paid conversions
        paid_count_stmt = select(func.count(CheckoutSession.id)).where(
            CheckoutSession.sales_rep_id == u.id,
            CheckoutSession.status == CheckoutSessionStatus.PAID
        )
        paid_count_res = await session.execute(paid_count_stmt)
        paid_conversions = paid_count_res.scalar() or 0

        personnel.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "image": u.image,
            "total_links_generated": total_links,
            "paid_conversions": paid_conversions,
            "created_at": u.created_at.isoformat() if u.created_at else None
        })

    return personnel


@router.patch("/users/{user_id}")
async def update_personnel(
    user_id: str,
    payload: UserUpdatePayload,
    session: AsyncSession = Depends(get_async_session),
    current_admin: User = Depends(require_admin)
):
    """
    Admin Personnel Management: Modify roles (admin / sales) and active status.
    """
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.name is not None:
        user.name = payload.name.strip()

    user.updated_at = datetime.now(timezone.utc)
    session.add(user)
    await session.commit()
    await session.refresh(user)

    logger.info(f"Admin {current_admin.email} updated user {user.email} (Role: {user.role}, Active: {user.is_active})")

    return {
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active
        }
    }


@router.delete("/users/{user_id}")
async def delete_personnel(
    user_id: str,
    session: AsyncSession = Depends(get_async_session),
    current_admin: User = Depends(require_admin)
):
    """
    Admin Personnel Management: Delete a sales rep or user profile.
    Prevents self-deletion.
    """
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own administrative account."
        )

    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await session.delete(user)
    await session.commit()

    logger.info(f"Admin {current_admin.email} deleted user profile {user_id}")
    return {"status": "success", "message": "User deleted successfully"}


@router.get("/overview-metrics")
async def get_admin_overview_metrics(
    session: AsyncSession = Depends(get_async_session),
    current_admin: User = Depends(require_admin)
):
    """
    Global Overview: Aggregate metrics across all sales reps and client accounts.
    """
    # Total Active Clients
    stmt_active_clients = select(func.count(Client.id)).where(Client.subscription_status == SubscriptionStatus.ACTIVE)
    res_ac = await session.execute(stmt_active_clients)
    active_clients = res_ac.scalar() or 0

    # Total Trial Clients
    stmt_trial_clients = select(func.count(Client.id)).where(Client.subscription_status == SubscriptionStatus.TRIAL)
    res_tc = await session.execute(stmt_trial_clients)
    trial_clients = res_tc.scalar() or 0

    # Total Links Generated
    stmt_total_links = select(func.count(CheckoutSession.id))
    res_tl = await session.execute(stmt_total_links)
    total_links = res_tl.scalar() or 0

    # Total Paid Conversions
    stmt_paid = select(func.count(CheckoutSession.id)).where(CheckoutSession.status == CheckoutSessionStatus.PAID)
    res_p = await session.execute(stmt_paid)
    total_conversions = res_p.scalar() or 0

    # Global Monthly Pipeline Value (ZAR cents)
    stmt_mrr = select(func.sum(Client.custom_monthly_amount)).where(
        Client.subscription_status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL])
    )
    res_mrr = await session.execute(stmt_mrr)
    total_mrr_cents = res_mrr.scalar() or 0

    # Total Sales Reps
    stmt_reps = select(func.count(User.id)).where(User.role == UserRole.SALES, User.is_active == True)
    res_reps = await session.execute(stmt_reps)
    sales_reps_count = res_reps.scalar() or 0

    conversion_rate = round((total_conversions / total_links * 100), 1) if total_links > 0 else 0.0

    return {
        "active_clients": active_clients,
        "trial_clients": trial_clients,
        "total_clients": active_clients + trial_clients,
        "total_links_generated": total_links,
        "total_conversions": total_conversions,
        "conversion_rate_percentage": conversion_rate,
        "total_mrr_cents": total_mrr_cents,
        "total_mrr_zar": total_mrr_cents / 100.0,
        "active_sales_reps": sales_reps_count
    }
