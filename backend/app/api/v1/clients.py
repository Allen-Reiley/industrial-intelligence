# backend/app/api/v1/clients.py
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional, List
from pydantic import BaseModel


from app.db import get_async_session
from app.models.client import Client, ClientCreate, ClientPublic, ClientCategory
from app.services.intelligence import scrape_homepage

router = APIRouter()
logger = logging.getLogger("auraworks.clients")

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
    "to", "of", "from", "by", "for", "in", "on", "at", "with", "about", "against", "between",
    "into", "through", "during", "before", "after", "above", "below", "to", "from", "up",
    "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once",
    "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few",
    "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same",
    "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now",
    "we", "our", "us", "you", "your", "they", "them", "their", "he", "him", "his", "she",
    "her", "it", "its", "i", "me", "my", "myself"
}

@router.post("/", response_model=ClientPublic)
async def create_client(client_in: ClientCreate, session: AsyncSession = Depends(get_async_session)):
    """
    Registers a new client and automatically evaluates its category (INDUSTRIAL vs COMMERCIAL)
    based on the semantic density of industrial keywords in its product description and homepage.
    """
    db_client = Client.model_validate(client_in)
    
    # Compile text properties to evaluate semantic category
    text_to_scan = db_client.client_product_description or ""
    
    if db_client.domain:
        try:
            homepage_text = await scrape_homepage(db_client.domain)
            if homepage_text and "scrape failed" not in homepage_text.lower():
                text_to_scan += f" {homepage_text}"
        except Exception as e:
            logger.warning(f"Failed to scrape client homepage for classification: {e}")
            
    # Calculate industrial keyword density
    words = [w.lower().strip(",.?!()\"'-/") for w in text_to_scan.split() if w]
    filtered_words = [w for w in words if w not in STOPWORDS]
    
    density = 0.0
    if filtered_words:
        industrial_terms = {
            "mining", "engineering", "logistics", "construction", "manufacturing",
            "plant", "processing", "chrome", "ore", "mineral", "steel", "machinery",
            "excavator", "mill", "smelter", "foundry", "factory", "refinery",
            "chemical", "warehouse", "heavy", "industrial", "coal", "iron", "gold",
            "metal", "metals", "drill", "drilling", "quarry", "excavation", "logistic"
        }
        matches = sum(1 for w in filtered_words if w in industrial_terms)
        density = matches / len(filtered_words)
        
    logger.info(f"Client classification scan for domain {db_client.domain}: density = {density:.4f}")
    
    if density >= 0.6:
        db_client.category = ClientCategory.INDUSTRIAL
    else:
        db_client.category = ClientCategory.COMMERCIAL
        
    db_client.auto_classified_at = datetime.now(timezone.utc)
    
    session.add(db_client)
    await session.commit()
    await session.refresh(db_client)
    return db_client

@router.get("/config")
async def get_client_config(
    client_id: UUID,
    tz: Optional[str] = None,
    request: Request = None,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Returns remote configuration parameters for the embedded tracking tag.
    Performs strict domain validation and maps compliance rules dynamically via browser timezone.
    Utilizes Two-Tier Caching for sub-millisecond responses.
    """
    import json
    from app.core.cache import TwoTierCache

    # 1. Strict Referer / Origin Extraction
    referer = request.headers.get("referer")
    origin = request.headers.get("origin")
    request_domain = ""

    if referer:
        try:
            from urllib.parse import urlparse
            request_domain = urlparse(referer).netloc
        except Exception:
            pass
    elif origin:
        try:
            from urllib.parse import urlparse
            request_domain = urlparse(origin).netloc
        except Exception:
            pass

    # Normalize domain by stripping port numbers (e.g. localhost:8080 -> localhost)
    if ":" in request_domain:
        request_domain = request_domain.split(":")[0]

    cache_key = f"client_config:{client_id}:{request_domain}:{tz or ''}"
    try:
        cached_val = await TwoTierCache.get(cache_key)
        if cached_val:
            return json.loads(cached_val)
    except Exception as e:
        logger.warning(f"Failed to read from TwoTierCache: {e}")

    client = await session.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client registry not found.")
        
    if not client.is_active:
        raise HTTPException(status_code=403, detail="Client subscription is currently suspended.")
        
    # Verify matching domain against whitelisted_domains
    if request_domain and request_domain not in ["localhost", "127.0.0.1", "::1"]:
        whitelisted = []
        for d in client.whitelisted_domains:
            if ":" in d:
                d = d.split(":")[0]
            whitelisted.append(d.lower())

        req_domain_lower = request_domain.lower()

        # Check exact domain match or subdomain match (e.g. www.auraworks.co.za -> auraworks.co.za)
        is_whitelisted = False
        for wd in whitelisted:
            if req_domain_lower == wd or req_domain_lower.endswith(f".{wd}"):
                is_whitelisted = True
                break

        # Support preview environments via settings-driven regex
        if not is_whitelisted:
            from app.core.config import settings
            import re
            if settings.ALLOWED_ORIGIN_REGEX:
                origin_with_scheme = f"https://{req_domain_lower}"
                if re.match(settings.ALLOWED_ORIGIN_REGEX, origin_with_scheme):
                    is_whitelisted = True

        if not is_whitelisted:
            logger.warning(f"AuraTracker: Strictly unauthorized domain match attempt: origin='{request_domain}', registered={client.whitelisted_domains}")
            raise HTTPException(status_code=403, detail="Unauthorized website tag origin.")

    # 2. Timezone-Based Compliance Routing
    compliance_mode = "POPIA"
    if tz:
        tz_lower = tz.lower()
        # Timezone check to determine EU/GDPR vs SADC/POPIA bounds
        if "europe" in tz_lower:
            compliance_mode = "GDPR"
        elif "africa" in tz_lower:
            compliance_mode = "POPIA"

    # The client's registered require_consent_banner setting is the primary driver.
    # If client.require_consent_banner is True, it returns True regardless of timezone.
    # If GDPR applies (compliance_mode == "GDPR"), consent banner is mandatory.
    require_consent_banner = bool(client.require_consent_banner or (compliance_mode == "GDPR"))

    response_data = {
        "client_id": str(client.id),
        "collect_personal_data": client.collect_personal_data,
        "require_consent_banner": require_consent_banner,
        "compliance_mode": compliance_mode,
        "is_active": client.is_active
    }

    try:
        await TwoTierCache.set(cache_key, json.dumps(response_data), expire=300)
    except Exception as e:
        logger.warning(f"Failed to write to TwoTierCache: {e}")

    return response_data

from app.api.v1.auth import get_current_admin, get_current_admin_user
from app.models.user import User
from sqlalchemy import func
from typing import List

@router.get("/", response_model=List[ClientPublic])
async def list_clients(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Lists registered clients in the tenant ledger.
    Superusers can view all, sales reps can view their attributed clients,
    and client users can view their assigned client.
    """
    if not current_user.is_superuser:
        conditions = []
        if current_user.client_id is not None:
            conditions.append(Client.id == current_user.client_id)
        conditions.append(Client.sales_rep_id == current_user.id)
        
        from sqlalchemy import or_
        stmt = select(Client).where(or_(*conditions))
    else:
        stmt = select(Client)
        
    res = await session.execute(stmt)
    return res.scalars().all()


@router.get("/{client_id}/verify")
async def verify_client_installation(
    client_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Queries the Visit table to check if a tracking payload containing the specific client_id
    has been received, confirming successful installation.
    """
    if not current_user.is_superuser:
        if current_user.client_id is None or current_user.client_id != client_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: Tenant data access violation. You are not assigned to this client."
            )

    from app.models.visit import Visit
    stmt = select(func.count(Visit.id)).where(Visit.client_id == client_id)
    res = await session.execute(stmt)
    count = res.scalar() or 0
    return {"installed": count > 0, "visit_count": count}


class ClientUpdatePayload(BaseModel):
    company_name: Optional[str] = None
    contact_email: Optional[str] = None
    whitelisted_domains: Optional[List[str]] = None
    subscription_status: Optional[str] = None
    require_consent_banner: Optional[bool] = None
    collect_personal_data: Optional[bool] = None
    is_active: Optional[bool] = None
    custom_monthly_amount: Optional[int] = None
    payment_plan: Optional[str] = None
    theme_config: Optional[dict] = None

@router.patch("/{client_id}", response_model=ClientPublic)
async def update_client(
    client_id: UUID,
    payload: ClientUpdatePayload,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Updates a client tenant profile's configurations and fields.
    """
    if not current_user.is_superuser:
        if current_user.client_id is None or current_user.client_id != client_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: Tenant data access violation. You are not assigned to this client."
            )

    from app.models.client import SubscriptionStatus

    client = await session.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    if payload.company_name is not None:
        client.company_name = payload.company_name
    if payload.contact_email is not None:
        client.contact_email = payload.contact_email
    if payload.whitelisted_domains is not None:
        client.whitelisted_domains = payload.whitelisted_domains
    if payload.subscription_status is not None:
        client.subscription_status = SubscriptionStatus(payload.subscription_status)
    if payload.require_consent_banner is not None:
        client.require_consent_banner = payload.require_consent_banner
    if payload.collect_personal_data is not None:
        client.collect_personal_data = payload.collect_personal_data
    if payload.is_active is not None:
        client.is_active = payload.is_active
    if payload.custom_monthly_amount is not None:
        client.custom_monthly_amount = payload.custom_monthly_amount
    if payload.payment_plan is not None:
        client.payment_plan = payload.payment_plan
    if payload.theme_config is not None:
        client.theme_config = payload.theme_config

    session.add(client)
    await session.commit()
    await session.refresh(client)

    # Invalidate cached configuration so changes reflect immediately
    try:
        from app.core.cache import TwoTierCache
        await TwoTierCache.delete_prefix(f"client_config:{client_id}")
    except Exception as e:
        logger.warning(f"Failed to invalidate TwoTierCache for client {client_id}: {e}")

    return client

@router.delete("/{client_id}")
async def delete_client(
    client_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Permanently deletes a client tenant profile.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Only superusers can delete clients."
        )

    client = await session.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    await session.delete(client)
    await session.commit()

    return {"message": "Client deleted successfully"}