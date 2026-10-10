# backend/app/api/v1/scripts.py
import logging
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.db import get_async_session
from app.core.security import require_admin
from app.models.user import User
from app.models.client import Client, SubscriptionStatus

logger = logging.getLogger("auraworks.scripts")
router = APIRouter()

@router.get("/{client_id}")
async def get_client_tracking_script(
    client_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    current_admin: User = Depends(require_admin)
):
    """
    Strictly Gated Admin Endpoint:
    Generates and returns the JavaScript tracking snippet for a client.
    Only accessible by users with the 'admin' role, and ONLY if the client
    has completed checkout with an ACTIVE or TRIAL subscription status.
    """
    client = await session.get(Client, client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found in registry."
        )

    # Validate subscription status gate
    if client.subscription_status not in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Tracking script generation is locked. Client '{client.company_name}' "
                f"has status '{client.subscription_status}'. Payment or trial activation required."
            )
        )

    snippet = f'<script src="https://cdn.auraworks.co.za/aura.js" data-client-id="{client.id}" defer></script>'

    logger.info(
        f"Admin {current_admin.email} retrieved tracking script for client {client.company_name} ({client.id})"
    )

    return {
        "status": "success",
        "client_id": str(client.id),
        "company_name": client.company_name,
        "subscription_status": client.subscription_status,
        "whitelisted_domains": client.whitelisted_domains,
        "snippet": snippet
    }


@router.get("/")
async def list_active_client_scripts(
    session: AsyncSession = Depends(get_async_session),
    current_admin: User = Depends(require_admin)
):
    """
    Returns all generated scripts for all active and trial clients for the Script Vault.
    Strictly restricted to Administrators.
    """
    stmt = select(Client).where(
        Client.subscription_status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL])
    ).order_by(Client.created_at.desc())

    res = await session.execute(stmt)
    clients = res.scalars().all()

    results = []
    for client in clients:
        snippet = f'<script src="https://cdn.auraworks.co.za/aura.js" data-client-id="{client.id}" defer></script>'
        results.append({
            "client_id": str(client.id),
            "company_name": client.company_name,
            "subscription_status": client.subscription_status,
            "whitelisted_domains": client.whitelisted_domains,
            "contact_email": client.contact_email,
            "snippet": snippet
        })

    return results
