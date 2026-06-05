# backend/app/api/v1/clients.py
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional

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
    """
    client = await session.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client registry not found.")
        
    if not client.is_active:
        raise HTTPException(status_code=403, detail="Client subscription is currently suspended.")

    # 1. Strict Referer / Origin Verification
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
        
    client_domain = client.domain
    if ":" in client_domain:
        client_domain = client_domain.split(":")[0]

    # Verify matching domain (strict matching of subdomain and staging domains)
    if request_domain and request_domain != client_domain:
        # Check if the domain whitelist is bypassed (e.g. standard local dev environments)
        if request_domain not in ["localhost", "127.0.0.1", "::1"]:
            logger.warning(f"AuraTracker: Strictly unauthorized domain match attempt: origin='{request_domain}', registered='{client_domain}'")
            raise HTTPException(status_code=403, detail="Unauthorized website tag origin.")

    # 2. Timezone-Based Compliance Routing
    compliance_mode = "POPIA"
    require_consent_banner = client.require_consent_banner
    
    if tz:
        tz_lower = tz.lower()
        # Timezone check to determine EU/GDPR vs SADC/POPIA bounds
        if "europe" in tz_lower:
            compliance_mode = "GDPR"
            require_consent_banner = True
        elif "africa" in tz_lower:
            compliance_mode = "POPIA"

    return {
        "client_id": client.id,
        "collect_personal_data": client.collect_personal_data,
        "require_consent_banner": require_consent_banner,
        "compliance_mode": compliance_mode,
        "is_active": client.is_active
    }