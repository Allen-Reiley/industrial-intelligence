# backend/app/services/enrichment.py
import httpx
import logging
import socket
from app.core.config import settings
from typing import Optional, List, Dict, Any

logger = logging.getLogger("uvicorn")

class EnrichmentError(Exception):
    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code

# --- AuraWorks Identity Bridge: Consumer ISP & Infrastructure Blacklist ---
# Tailored for the South African Market (National Expansion)
CONSUMER_ISP_KEYWORDS = [
    "vodacom", "mtn", "telkom", "liquid", "cool ideas", "vumatel", "rain", 
    "isp", "residential", "pool", "dynamic", "dsl", "fiber", "mobile",
    "webafrica", "afrihost", "mweb", "vox", "supersonic"
]

def is_consumer_traffic(target_name: str) -> bool:
    """Detects if a visit originates from a known consumer ISP."""
    if not target_name:
        return False
    normalized = target_name.lower()
    return any(keyword in normalized for keyword in CONSUMER_ISP_KEYWORDS)

def perform_local_reverse_dns(ip_address: str) -> Dict[str, Any]:
    """
    Layer 1: Zero-Cost Classification.
    Identifies cloud providers and obvious ISPs without burning API credits.
    """
    try:
        hostname, _, _ = socket.gethostbyaddr(ip_address)
        hostname = hostname.lower()
        
        # Cloud/Data Center filtration
        if any(cloud in hostname for cloud in ["amazonaws", "googleusercontent", "azure", "static.cloud", "hetzner"]):
            return {"type": "cloud", "provider": "Infrastructure", "confidence": 0.5}
        
        # Consumer ISP filtration
        if is_consumer_traffic(hostname):
            return {"type": "isp", "provider": "Consumer ISP", "confidence": 0.2}
        
        return {"type": "business_static", "provider": hostname, "confidence": 0.7}
    except Exception:
        return {"type": "unknown", "provider": "Unknown", "confidence": 0.0}

async def enrich_visitor_data(ip_address: str, volunteered_company: Optional[str] = None) -> dict:
    """
    Phase 01: Forensic IP Resolution with Warm Lead Overrides.
    If 'volunteered_company' is provided (from Banner), it forces a B2B high-confidence state.
    """
    # 0. Local/Dev Guard
    if ip_address in ("127.0.0.1", "localhost", "::1"):
        return {"company_name": "Local Test Environment", "is_b2b": False, "confidence_score": 1.0}

    # 1. Warm Lead Override: If the user provided a name via the industrial sync, use it.
    if volunteered_company and not is_consumer_traffic(volunteered_company):
        return {
            "company_name": volunteered_company,
            "domain": None,
            "is_b2b": True,
            "confidence_score": 1.0,
            "industry": "Volunteered Data",
            "provider_type": "Warm Lead"
        }

    # 2. Layer 1 Check (Local Reverse DNS)
    local_intel = perform_local_reverse_dns(ip_address)

    # 3. Layer 2 Check (IPinfo)
    if not settings.IPINFO_TOKEN:
        logger.warning("⚠️ IPinfo Token missing. Enrichment limited to Layer 1.")
        return {"company_name": local_intel["provider"], "is_b2b": False, "confidence_score": 0.3}

    url = f"https://ipinfo.io/{ip_address}?token={settings.IPINFO_TOKEN}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5.0)
            if response.status_code in (429, 503, 504):
                raise EnrichmentError(f"IPinfo gateway error: {response.status_code}", status_code=response.status_code)
            elif response.status_code != 200:
                raise EnrichmentError(f"IPinfo request error: {response.status_code}", status_code=response.status_code)

            data = response.json()
            company_data = data.get("company", {})
            asn_data = data.get("asn", {})
            
            final_name = company_data.get("name")
            final_domain = company_data.get("domain")

            # Fallback to ASN org name if company enrichment is empty
            if not final_name:
                org_full = data.get("org", "Unknown")
                final_name = " ".join(org_full.split(" ")[1:]) if org_full.startswith("AS") else org_full

            asn_type = asn_data.get("type", "").lower()
            
            # --- CALCULATE CONFIDENCE SCORE (Industrial Weighing) ---
            confidence = 0.5 # Baseline
            
            if asn_type == "business": confidence += 0.4
            if asn_type == "hosting": confidence -= 0.3 # Penalize VPNs/Bots
            if is_consumer_traffic(final_name) or is_consumer_traffic(data.get("org", "")):
                confidence -= 0.4 # Penalize Residential
            
            # Final determination for the 'Industrial' threshold
            is_b2b = confidence >= 0.5

            return {
                "company_name": final_name,
                "domain": final_domain or asn_data.get("domain"),
                "is_b2b": is_b2b,
                "confidence_score": round(max(0.0, min(1.0, confidence)), 2),
                "industry": asn_type or "unknown",
                "city": data.get("city"),
                "region": data.get("region"),
                "provider_type": local_intel["type"]
            }
        except (httpx.RequestError, socket.timeout) as e:
            logger.error(f"🚨 IPinfo Network Failure: {e}")
            raise EnrichmentError(f"IPinfo network failure: {e}", status_code=504)
        except EnrichmentError:
            raise
        except Exception as e:
            logger.error(f"🚨 IPinfo Unexpected Failure: {e}")
            raise EnrichmentError(f"IPinfo unexpected failure: {e}", status_code=500)

async def get_departmental_intelligence(domain: str) -> List[Dict]:
    """
    Phase 02: Industrial Cluster Mapping (Apollo.io).
    Identifies departmental decision-makers within South African corporate domains.
    """
    if not settings.APOLLO_API_KEY or not domain or domain in ["unknown.com", "n/a"]:
        return []

    url = "https://api.apollo.io/v1/people/search"
    # Targeted industrial roles
    target_departments = ["Procurement", "Operations", "Engineering", "Maintenance", "Supply Chain", "Factory Manager"]

    payload = {
        "api_key": settings.APOLLO_API_KEY,
        "q_organization_domains": domain,
        "person_titles": target_departments,
        "organization_locations": ["South Africa"],
        "display_mode": "regular",
        "per_page": 5
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=12.0)
            if response.status_code in (429, 503, 504):
                raise EnrichmentError(f"Apollo gateway error: {response.status_code}", status_code=response.status_code)
            elif response.status_code != 200:
                raise EnrichmentError(f"Apollo request error: {response.status_code}", status_code=response.status_code)

            data = response.json()
            people = data.get("people", [])
            
            return [{
                "role": person.get("title", "Lead"),
                "name": person.get("name"),
                "email": person.get("email"),
                "linkedin_url": person.get("linkedin_url")
            } for person in people]
        except (httpx.RequestError, socket.timeout) as e:
            logger.error(f"🚨 Apollo Network Failure: {e}")
            raise EnrichmentError(f"Apollo network failure: {e}", status_code=504)
        except EnrichmentError:
            raise
        except Exception as e:
            logger.error(f"🚨 Apollo Unexpected Failure: {e}")
            raise EnrichmentError(f"Apollo unexpected failure: {e}", status_code=500)

async def enrich_company_departments(company_id: Any, domain: str):
    """
    Fires instantly inside an asynchronous background task right after IPinfo
    validates a valid non-consumer domain profile.
    """
    if not settings.APOLLO_API_KEY or not domain or domain in ["unknown.com", "n/a"]:
        return

    from app.db import async_session_maker
    from app.models.department import Department
    from sqlmodel import select

    if not async_session_maker:
        return

    try:
        logger.info(f"🔍 Immediate Apollo Enrichment: Resolving departments for {domain}")
        depts_data = await get_departmental_intelligence(domain)
        if not depts_data:
            logger.info(f"ℹ️ Immediate Apollo Enrichment: No departments found for {domain}")
            return

        async with async_session_maker() as session:
            for dept in depts_data:
                email = dept.get("email")
                if not email:
                    continue

                # Check if contact already exists for this company
                stmt = select(Department).where(
                    Department.company_id == company_id,
                    Department.email == email
                )
                existing_res = await session.execute(stmt)
                existing = existing_res.scalars().first()

                if not existing:
                    # Scale priority score from 1 to 5 based on keywords
                    priority_score = 1
                    role = dept.get("role", "Lead").lower()
                    
                    # Keywords priority map:
                    # "chief engineer" -> 5
                    # "director" -> 4
                    # "supply chain" -> 3
                    # "procurement" -> 2
                    # default -> 1
                    keywords_map = {
                        "chief engineer": 5,
                        "director": 4,
                        "supply chain": 3,
                        "procurement": 2
                    }
                    for kw, score in keywords_map.items():
                        if kw in role:
                            priority_score = score
                            break

                    new_dept = Department(
                        company_id=company_id,
                        contact_name=dept.get("name", "Unknown Contact"),
                        role_title=dept.get("role", "Lead"),
                        email=email,
                        phone=dept.get("phone"),
                        linkedin_url=dept.get("linkedin_url"),
                        priority_score=priority_score
                    )
                    session.add(new_dept)
            await session.commit()
            logger.info(f"✅ Immediate Apollo Enrichment: Saved contacts for {domain}")
    except Exception as e:
        logger.error(f"❌ Immediate Apollo Enrichment Failed for {domain}: {e}")

async def process_enrichment_queue():
    """
    Background Task Runner: Processes queued items across a strict 3-stage exponential backoff pattern.
    Runs on a 15-minute cron loop (orchestrated via APScheduler).
    """
    from app.db import async_session_maker
    from app.models.enrichment_queue import EnrichmentQueue, QueueType, FailedEnrichment
    from app.models.visit import Visit
    from app.models.company import Company
    from app.models.department import Department
    from sqlmodel import select
    from datetime import datetime, timezone, timedelta
    from uuid import UUID

    if not async_session_maker:
        return

    current_time = datetime.now(timezone.utc).replace(tzinfo=None)
    cutoff_time = current_time - timedelta(days=7)

    async with async_session_maker() as session:
        # 1. Purge expired entries (> 7 days continuous failure) to FailedEnrichment
        try:
            expired_stmt = select(EnrichmentQueue).where(
                EnrichmentQueue.created_at <= cutoff_time
            )
            expired_res = await session.execute(expired_stmt)
            expired_items = expired_res.scalars().all()

            for item in expired_items:
                failed = FailedEnrichment(
                    client_id=item.client_id,
                    visit_id=item.visit_id,
                    aura_id=item.aura_id,
                    queue_type=item.queue_type,
                    payload=item.payload,
                    failed_at=current_time,
                    error_message="Enrichment failures persisted beyond 7 days cutoff"
                )
                session.add(failed)
                logger.error(f"🚨 Telemetry Alert: Enrichment task {item.id} (type: {item.queue_type}) failed for > 7 days. Relocated to FailedEnrichment.")
                await session.delete(item)
            
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"🚨 Enrichment Queue Janitor Error: {e}")

        # 2. Process active queued entries (pending or scheduled for retry)
        try:
            active_stmt = select(EnrichmentQueue).where(
                EnrichmentQueue.status != "completed",
                (EnrichmentQueue.next_attempt_at == None) | (EnrichmentQueue.next_attempt_at <= current_time)
            )
            active_res = await session.execute(active_stmt)
            active_items = active_res.scalars().all()

            for item in active_items:
                try:
                    if item.queue_type == QueueType.IPINFO:
                        ip_address = item.payload.get("ip_address")
                        if not ip_address:
                            item.status = "completed" # Invalid payload
                            session.add(item)
                            await session.commit()
                            continue
                            
                        # Perform IPinfo lookup
                        info = await enrich_visitor_data(ip_address)
                        
                        # Resolve Company
                        domain = info.get("domain")
                        company = None
                        if domain and domain not in ["unknown.com", "n/a"]:
                            comp_stmt = select(Company).where(Company.domain == domain, Company.client_id == item.client_id)
                            company_res = await session.execute(comp_stmt)
                            company = company_res.scalars().first()
                            if not company:
                                company = Company(
                                    client_id=item.client_id,
                                    company_name=info.get("company_name", "Unknown"),
                                    domain=domain,
                                    cipc_verified=False,
                                    total_visits=1
                                )
                                session.add(company)

                                await session.commit()
                                await session.refresh(company)
                                if company:
                                    visit = await session.get(Visit, item.visit_id)
                                    if visit:
                                        visit.company_id = company.id
                                        session.add(visit)
                                        await session.commit()

                                    # Check and trigger company intent surge alerts
                                    from app.services.notifications import check_and_trigger_company_surge
                                    await check_and_trigger_company_surge(company.id, item.client_id, session)
                            else:
                                company.total_visits += 1
                                session.add(company)
                                await session.commit()

                        # Update corresponding Visit row
                        if item.visit_id:
                            visit = await session.get(Visit, item.visit_id)
                            if visit:
                                if company:
                                    visit.company_id = company.id
                                visit.verification_status = "verified" if (company and company.cipc_verified) else "verifying"
                                session.add(visit)
                                await session.commit()

                        # Trigger immediate Apollo enrichment
                        if company and company.domain and info.get("is_b2b", False):
                            import asyncio
                            asyncio.create_task(enrich_company_departments(company.id, company.domain))

                    elif item.queue_type == QueueType.APOLLO:
                        domain = item.payload.get("domain")
                        if not domain:
                            item.status = "completed"
                            session.add(item)
                            await session.commit()
                            continue
                            
                        # Perform Apollo lookup
                        depts_data = await get_departmental_intelligence(domain)
                        
                        # Resolve Company
                        comp_stmt = select(Company).where(Company.domain == domain, Company.client_id == item.client_id)
                        company_res = await session.execute(comp_stmt)
                        company = company_res.scalars().first()


                        if company and depts_data:
                            # Map departments and contacts
                            for dept in depts_data:
                                # Avoid duplicate contacts
                                dept_exist_stmt = select(Department).where(
                                    Department.company_id == company.id,
                                    Department.email == dept.get("email")
                                )
                                existing_dept_res = await session.execute(dept_exist_stmt)
                                existing_dept = existing_dept_res.scalars().first()
                                if not existing_dept:
                                    # Priority score mapping (1 to 5)
                                    priority_score = 1
                                    role = dept.get("role", "Lead").lower()
                                    for kw in ["procurement", "supply chain", "chief engineer", "director"]:
                                        if kw in role:
                                            priority_score = 5
                                            break
                                    new_dept = Department(
                                        company_id=company.id,
                                        contact_name=dept.get("name", "Unknown Contact"),
                                        role_title=dept.get("role", "Lead"),
                                        email=dept.get("email"),
                                        phone=dept.get("phone"),
                                        linkedin_url=dept.get("linkedin_url"),
                                        priority_score=priority_score
                                    )
                                    session.add(new_dept)
                            await session.commit()

                    # Success: mark completed
                    item.status = "completed"
                    item.last_attempt_at = datetime.now(timezone.utc).replace(tzinfo=None)
                    session.add(item)
                    await session.commit()

                except EnrichmentError as e:
                    # Exponential Backoff calculation
                    item.retry_count += 1
                    item.last_attempt_at = datetime.now(timezone.utc).replace(tzinfo=None)
                    
                    if item.retry_count == 1:
                        delay = timedelta(minutes=15)
                    elif item.retry_count == 2:
                        delay = timedelta(hours=1)
                    else:
                        delay = timedelta(hours=6)
                        
                    item.next_attempt_at = item.last_attempt_at + delay
                    item.status = "failed_retry"
                    session.add(item)
                    await session.commit()
                    logger.warning(f"⚠️ Enrichment queue item {item.id} failed attempt {item.retry_count}: {e}. Scheduled retry at {item.next_attempt_at}")

        except Exception as e:
            logger.error(f"🚨 Enrichment Queue processing cycle error: {e}")