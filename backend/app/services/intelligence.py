# backend/app/services/intelligence.py
import httpx
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any, Union
from uuid import UUID
from sqlmodel import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from cachetools import TTLCache
import redis.asyncio as aioredis
from bs4 import BeautifulSoup

from app.models import Visit, Company, Prospect, PageView, Client, VerificationStatus
from app.core.config import settings

import socket
import asyncio
from app.core.cache import get_redis_client

logger = logging.getLogger("uvicorn")

# --- INDUSTRIAL CACHE LAYER ---
# TTLCache: Retains up to 2000 IP addresses with a 24-hour Time-To-Live (86400 seconds).
# Prevents redundant, costly HTTP requests to IPinfo.io and avoids token exhaustion on repeat traffic.
ip_cache = TTLCache(maxsize=2000, ttl=86400)

# --- REVERSE DNS CACHE LAYER (Task 34.1) ---
# 7-day TTL (604800 seconds) fallback cache for reverse DNS resolution
dns_fallback_cache = TTLCache(maxsize=5000, ttl=604800)

async def get_cached_dns(ip_address: str) -> Optional[str]:
    """Retrieve cached reverse DNS hostname from Redis (Tier 1) or in-memory TTLCache (Tier 2)."""
    key = f"ip_dns:{ip_address}"
    redis_client = get_redis_client()
    if redis_client:
        try:
            val = await redis_client.get(key)
            if val is not None:
                return val
        except Exception as e:
            logger.warning(f"Redis GET DNS failed (key={key}): {e}")
    return dns_fallback_cache.get(key)

async def set_cached_dns(ip_address: str, hostname: str) -> None:
    """Cache resolved reverse DNS hostname in Redis with 7-day TTL (604800s) and in-memory TTLCache fallback."""
    key = f"ip_dns:{ip_address}"
    redis_client = get_redis_client()
    if redis_client:
        try:
            await redis_client.set(key, hostname, ex=604800)
            return
        except Exception as e:
            logger.warning(f"Redis SET DNS failed (key={key}): {e}")
    dns_fallback_cache[key] = hostname

async def resolve_reverse_dns(visit_id: Any, ip_address: str) -> Optional[str]:
    """
    Task 34.1: Asynchronous Non-Blocking Reverse DNS Lookups.
    Runs out-of-band to prevent blocking the HTTP ingestion cycle.
    Enforces a strict 1.5-second timeout, caches results with a 7-day TTL (ip_dns:{ip}),
    and asynchronously updates Visit.hostname in the database.
    """
    if not ip_address or ip_address in ("127.0.0.1", "localhost", "::1", "test"):
        return None

    # 1. Tier 1 / Tier 2 Cache check
    hostname = await get_cached_dns(ip_address)
    
    # 2. If uncached, perform non-blocking PTR lookup with strict 1.5s timeout
    if not hostname:
        try:
            loop = asyncio.get_running_loop()
            res = await asyncio.wait_for(
                loop.run_in_executor(None, socket.gethostbyaddr, ip_address),
                timeout=1.5
            )
            hostname = res[0]
            await set_cached_dns(ip_address, hostname)
        except asyncio.TimeoutError:
            logger.warning(f"⏳ Reverse DNS lookup timed out (1.5s) for IP {ip_address}")
            return None
        except Exception as e:
            logger.debug(f"Reverse DNS lookup failed for IP {ip_address}: {e}")
            return None

    # 3. Asynchronously update Visit.hostname if visit_id provided
    if visit_id and hostname:
        try:
            from app.db import async_session_maker
            if async_session_maker:
                async with async_session_maker() as session:
                    v_uuid = UUID(str(visit_id)) if not isinstance(visit_id, UUID) else visit_id
                    visit = await session.get(Visit, v_uuid)
                    if visit:
                        visit.hostname = hostname
                        session.add(visit)
                        await session.commit()
        except Exception as e:
            logger.error(f"Failed to update Visit.hostname for visit {visit_id}: {e}")

    return hostname


# --- UTILS: Industrial Formatting ---
def format_zar(value: str) -> str:
    """Formats raw numerical strings into clinical ZAR currency representation."""
    if not value: return "N/A"
    if "m" in value.lower(): return "R1,000,000+"
    if "-" in value:
        parts = value.replace('k', '000').split('-')
        try:
            formatted_parts = [f"R{int(p.strip()):,}" for p in parts]
            return " - ".join(formatted_parts)
        except: return value
    clean_value = "".join(filter(str.isdigit, value))
    return f"R{int(clean_value):,}" if clean_value else value

# --- PHASE 01: The Enrichment Engine ---

async def enrich_visitor_data(ip_address: str) -> Dict[str, Any]:
    """
    Standardized entry wrapper expected by app/api/v1/track.py.
    Retrieves and parses firmographic metadata for incoming traffic patterns.
    """
    raw_data = await enrich_ip_intel(ip_address)
    if not raw_data:
        return {"company_name": "Anonymous Entity", "domain": "unknown.com", "city": "Unknown", "region": "ZA"}
        
    # Standardize the IPinfo payload schema out to match the ingestion interface parameters
    asn_org = raw_data.get("org", "Unknown")
    company_name = "Anonymous Entity"
    domain = "unknown.com"
    
    # Simple extraction loop to strip typical ASN tags (e.g. "AS37054 AuraWorks (Pty) Ltd")
    # Filters out residential internet service providers (ISPs) to preserve focus on actual enterprise traffic.
    if " " in asn_org:
        parts = asn_org.split(" ", 1)
        potential_name = parts[1]
        if not any(provider in potential_name.lower() for provider in ["telkom", "vodacom", "mtn", "liquid", "mweb"]):
            company_name = potential_name
            # Generate dummy domain parameter reference if unavailable from basic IPinfo nodes
            domain = f"{company_name.lower().replace(' ', '').replace('(pty)ltd', '')}.co.za"

    return {
        "company_name": raw_data.get("company", {}).get("name") or company_name,
        "domain": raw_data.get("company", {}).get("domain") or domain,
        "city": raw_data.get("city", "Unknown"),
        "region": raw_data.get("region", "ZA")
    }

async def enrich_ip_intel(ip_address: str) -> Dict[str, Any]:
    """Retrieves corporate metadata for a specific IP from the IPinfo.io service."""
    if not ip_address or ip_address in ["127.0.0.1", "0.0.0.0", "::1"]:
        return {}
    if ip_address in ip_cache:
        return ip_cache[ip_address]
    if not settings.IPINFO_TOKEN:
        return {}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"https://ipinfo.io/{ip_address}?token={settings.IPINFO_TOKEN}", 
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                ip_cache[ip_address] = data
                return data
        except Exception as e:
            logger.error(f"🌐 IPinfo enrichment failure: {e}")
    return {}

# --- PHASE 02: DeepSeek-V3 Intent Analysis ---

async def analyze_corporate_intent(
    company_name: str, 
    industry: str, 
    pathway: str, 
    position: Optional[str] = None,
    is_cluster: bool = False
) -> str:
    """
    Executes clinical B2B intent analysis via verified DeepSeek endpoints.
    Identifies if the visitor is an 'Individual Evaluator' or part of a 'Buying Committee'.
    """
    if not settings.DEEPSEEK_API_KEY:
        return "Intelligence engine calibrating. Analysis deferred."

    persona_signal = f"Persona: {position if position else 'Undetermined'}"
    context_signal = "BUYING COMMITTEE ALERT: 3+ unique devices detected at this facility." if is_cluster else "Individual Facility Entry."

    prompt = f"""
    Analyze B2B industrial traffic profile parameters:
    Entity: {company_name}
    Industry: {industry}
    {persona_signal}
    Pathway: {pathway}
    Context: {context_signal}

    Task: Provide a 2-sentence 'Executive Intent Summary'.
    Tone: Clinical, sophisticated, direct, conversational. DO NOT add chat filler text or preambles.
    Labels: 'Discovery', 'Technical Evaluation', or 'Procurement'.
    """

    async with httpx.AsyncClient() as client:
        try:
            # Corrected DeepSeek Base URL path mapping (Stripped out /v1/ for standard API endpoints)
            response = await client.post(
                "https://api.deepseek.com/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2
                },
                timeout=15.0 
            )
            if response.status_code == 200:
                return response.json()['choices'][0]['message']['content'].strip()
            else:
                logger.error(f"🤖 DeepSeek API returned code {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"🤖 DeepSeek Failure: {e}")
    return "Intelligence engine temporarily offline."

# --- PHASE 03: Unified Journey & Ghost Enrichment ---

async def get_visitor_journey(
    client_id: Union[UUID, str, int],
    aura_id: str,
    session: AsyncSession,
    ip_address: Optional[str] = None
) -> Dict:
    """
    The Behavioral Ledger: Maps touchpoints and executes IP correlation within strict tenant boundaries.
    Identifies 'Ghost Links' where anonymous users share an IP with known Warm Leads belonging to the SAME client.
    """
    # Handle parameter order fallback if called as get_visitor_journey(aura_id, session)
    if isinstance(aura_id, AsyncSession):
        session = aura_id
        aura_id = client_id
        client_id = None

    if not aura_id:
        return {"total_touches": 0, "pathway": "Direct", "intent_summary": "No signature."}

    cid = None
    if client_id is not None:
        try:
            cid = UUID(str(client_id)) if isinstance(client_id, (str, UUID)) else client_id
        except ValueError:
            cid = client_id

    # 1. Forensic History Retrieval - strictly scoped to tenant perimeter
    if ip_address:
        if cid is not None:
            stmt = select(Visit).where(
                Visit.client_id == cid,
                or_(
                    Visit.aura_id == aura_id,
                    and_(Visit.ip_address == ip_address, Visit.client_id == cid)
                )
            ).order_by(Visit.created_at)
        else:
            stmt = select(Visit).where(
                or_(
                    Visit.aura_id == aura_id,
                    Visit.ip_address == ip_address
                )
            ).order_by(Visit.created_at)
    else:
        stmt = select(Visit).where(Visit.aura_id == aura_id)
        if cid is not None:
            stmt = stmt.where(Visit.client_id == cid)
        stmt = stmt.order_by(Visit.created_at)

    res = await session.execute(stmt)
    history = res.scalars().all()
    
    if not history:
        return {"total_touches": 0, "pathway": "First Contact", "intent_summary": "Initial touchpoint recorded."}

    last_visit = history[-1]
    target_ip = ip_address or last_visit.ip_address

    # 2. Timezone-Aware DB Parity Safe Guard Check (Tenant-scoped)
    time_offset = datetime.now(timezone.utc) - timedelta(hours=72)

    cluster_stmt = select(Visit).where(
        Visit.ip_address == target_ip,
        Visit.created_at >= time_offset
    )
    if cid is not None:
        cluster_stmt = cluster_stmt.where(Visit.client_id == cid)

    cluster_res = await session.execute(cluster_stmt)
    cluster_records = cluster_res.scalars().all()
    unique_id_count = len({v.aura_id for v in cluster_records})
    is_buying_committee = unique_id_count >= 3

    # 3. Pathway Mapping (Cleanup URL flow to show sequential pages visited, strictly tenant-scoped)
    pv_stmt = select(PageView).join(Visit, PageView.visit_id == Visit.id).where(Visit.aura_id == aura_id)
    if cid is not None:
        pv_stmt = pv_stmt.where(Visit.client_id == cid, PageView.client_id == cid)
    pv_stmt = pv_stmt.order_by(PageView.created_at)

    pv_res = await session.execute(pv_stmt)
    page_views = pv_res.scalars().all()
    pages = [pv.url_path.split('auraworks.co.za')[-1] if pv.url_path else "/" for pv in page_views]
    unique_pathway = []
    for p in pages:
        if not unique_pathway or p != unique_pathway[-1]:
            unique_pathway.append(p if p != "" else "/")
    pathway_str = " → ".join(unique_pathway)

    # 4. Resolve Identity Context (Tenant-scoped)
    company = None
    lead = None
    
    # Check for volunteered data (The 'Warm' Check)
    prospect_stmt = select(Prospect).where(Prospect.aura_id == aura_id)
    if cid is not None:
        prospect_stmt = prospect_stmt.where(Prospect.client_id == cid)
    res_lead = await session.execute(prospect_stmt)
    lead = res_lead.scalars().first()

    # Link to Company model if forensic stitching has already occurred
    linked_visit = next((v for v in history if v.company_id), None)
    if linked_visit:
        company = await session.get(Company, linked_visit.company_id)
    elif lead and lead.company_id:
        company = await session.get(Company, lead.company_id)

    # 5. Ghost-Enrichment (IP-based Corporate Mapping, strictly tenant-scoped)
    cluster_info = f"📍 Facility Activity: {unique_id_count} device(s)"
    
    if not company and target_ip:
        past_prospect_stmt = select(Prospect).join(
            Visit, Prospect.aura_id == Visit.aura_id
        ).where(Visit.ip_address == target_ip)
        if cid is not None:
            past_prospect_stmt = past_prospect_stmt.where(
                Prospect.client_id == cid,
                Visit.client_id == cid
            )
        
        past_prospect_res = await session.execute(past_prospect_stmt)
        past_lead = past_prospect_res.scalars().first()
        
        if past_lead and past_lead.company_id:
            company = await session.get(Company, past_lead.company_id)
            if company:
                cluster_info += f" | 🔗 Ghost-Linked: {company.company_name} (Identity via colleague)"

    # 6. DeepSeek Synthesis
    intent = await analyze_corporate_intent(
        company_name=company.company_name if company else (lead.company_name_raw if lead else "Anonymous Entity"),
        industry=company.industry if company else "Industrial",
        pathway=pathway_str,
        position=lead.position if lead else None,
        is_cluster=is_buying_committee
    )

    return {
        "total_touches": len(history),
        "pathway": pathway_str,
        "intent_summary": f"{intent} \n\n{cluster_info}",
        "is_cluster": is_buying_committee,
        "is_warm_lead": lead is not None,
        "is_high_intent": is_buying_committee or lead is not None or any(kw in pathway_str.lower() for kw in ["pricing", "audit", "waitlist"])
    }

# --- PHASE 4: DEEPSEEK SYNTHESIS & WEB CONTENT EXTRACTION ---

scrape_fallback_cache = TTLCache(maxsize=1000, ttl=604800)  # 7-day TTL fallback cache

async def get_cached_scrape(domain: str) -> Optional[str]:
    """Retrieves cached scrape content from Redis or local cache."""
    cache_key = f"scrape:{domain}"
    if settings.REDIS_URL:
        try:
            client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            async with client:
                return await client.get(cache_key)
        except Exception as e:
            logger.warning(f"Redis get failed for {cache_key}, falling back to memory: {e}")
    return scrape_fallback_cache.get(domain)

async def set_cached_scrape(domain: str, text: str):
    """Caches scrape content in Redis or local cache with 7-day expiry."""
    cache_key = f"scrape:{domain}"
    if settings.REDIS_URL:
        try:
            client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            async with client:
                await client.set(cache_key, text, ex=604800)  # 7-day TTL (604800 seconds)
                return
        except Exception as e:
            logger.warning(f"Redis set failed for {cache_key}, falling back to memory: {e}")
    scrape_fallback_cache[domain] = text

async def scrape_homepage(domain: str) -> str:
    """
    Constructs an asynchronous utility handler powered by httpx and BeautifulSoup
    to extract external company profile markers dynamically from a domain path.
    Enforces a strict 5.0-second timeout drop boundary, parses retrieved HTML streams,
    strips out all scripting, style, and HTML tags, extracts clean text, and restricts
    final outputs strictly to the first 500 readable words.
    Uses Redis caching with a 7-day TTL (or an in-memory fallback).
    """
    if not domain:
        return ""
        
    clean_domain = domain.strip().lower()
    if not clean_domain.startswith(("http://", "https://")):
        url = f"https://{clean_domain}"
    else:
        url = clean_domain
        # Extract clean domain name for cache key
        clean_domain = clean_domain.replace("https://", "").replace("http://", "").split("/")[0]

    # Check cache first
    cached_text = await get_cached_scrape(clean_domain)
    if cached_text:
        return cached_text

    headers = {
        "User-Agent": "AuraWorks Industrial Intelligence Bot/1.0"
    }

    html_content = ""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=5.0, follow_redirects=True)
            if response.status_code == 200:
                html_content = response.text
            elif url.startswith("https://"):
                # Fallback to http
                fallback_url = url.replace("https://", "http://")
                response = await client.get(fallback_url, headers=headers, timeout=5.0, follow_redirects=True)
                if response.status_code == 200:
                    html_content = response.text
    except Exception as e:
        logger.warning(f"Scrape attempt failed for {url}: {e}")
        if url.startswith("https://"):
            try:
                async with httpx.AsyncClient() as client:
                    fallback_url = url.replace("https://", "http://")
                    response = await client.get(fallback_url, headers=headers, timeout=5.0, follow_redirects=True)
                    if response.status_code == 200:
                        html_content = response.text
            except Exception as fallback_err:
                logger.warning(f"Scrape fallback attempt failed for {fallback_url}: {fallback_err}")

    if not html_content:
        return "Scrape failed: Unable to fetch page content."

    # Parse and clean HTML using BeautifulSoup
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Remove script, style, nav, footer, and other noise tags
    for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "iframe", "svg"]):
        tag.decompose()

    # Extract clean text strings
    raw_text = soup.get_text(separator=" ")
    
    # Clean whitespace and split into words
    words = [w for w in raw_text.split() if w]
    
    # Truncate strictly to the first 500 readable words
    truncated_words = words[:500]
    cleaned_text = " ".join(truncated_words)

    # Save to cache
    await set_cached_scrape(clean_domain, cleaned_text)
    
    return cleaned_text

def estimate_tokens(text: str) -> int:
    """Estimates the number of tokens in a string based on standard word/character metrics."""
    return int(len(text.split()) * 1.33)

async def run_daily_intent_batch(session: AsyncSession):
    """
    Consolidated daily batch processing execution background function to completely
    replace per-session analytical requests. Sweeps verified interactions in the
    preceding 24 hours, aggregates tracking details by enterprise domain, and constructs
    structured prompt strings compiling client descriptors, scraped prospect copy, and page
    navigation sequences. Commit results to persistent Company.intent_summary table field.
    """
    time_threshold = datetime.now(timezone.utc) - timedelta(hours=24)
    
    # Sweep verified B2B visits in the last 24 hours
    stmt = select(Visit).where(
        Visit.company_id is not None,
        Visit.verification_status == VerificationStatus.VERIFIED,
        Visit.created_at >= time_threshold
    )
    res = await session.execute(stmt)
    visits = res.scalars().all()
    
    if not visits:
        logger.info("Daily Intent Batch: No verified visits found in the last 24 hours.")
        return
        
    # Group visits by company_id
    company_visits = {}
    for v in visits:
        if v.company_id not in company_visits:
            company_visits[v.company_id] = []
        company_visits[v.company_id].append(v)
        
    for company_id, v_list in company_visits.items():
        if not company_id:
            continue
        company = await session.get(Company, company_id)
        if not company:
            continue
            
        # Get unique clients visited
        client_ids = {v.client_id for v in v_list}
        client_descriptors = []
        for cid in client_ids:
            client = await session.get(Client, cid)
            if client:
                desc_text = f"Client {client.company_name} offering: {client.client_product_description}"
                client_descriptors.append(desc_text)
                
        client_descriptors_str = "\n".join(client_descriptors)
        
        # Scrape company website homepage
        scraped_copy = ""
        if company.domain:
            scraped_copy = await scrape_homepage(company.domain)
            
        # Get page views sequence
        visit_ids = [v.id for v in v_list]
        pv_stmt = select(PageView).where(PageView.visit_id.in_(visit_ids)).order_by(PageView.created_at.desc())
        pv_res = await session.execute(pv_stmt)
        all_page_views = pv_res.scalars().all()
        
        # Limit historical page tracking arrays strictly to the last 10 entries
        recent_page_views = all_page_views[:10]
        recent_page_views.reverse()
        
        page_sequence = [pv.url_path for pv in recent_page_views]
        page_sequence_str = " -> ".join(page_sequence)
        
        # Absolute 4,000-token restriction boundary drops historical page tracking arrays if exceeded
        if estimate_tokens(page_sequence_str) > 4000:
            while page_sequence and estimate_tokens(page_sequence_str) > 4000:
                page_sequence.pop(0)  # Drop oldest page view path
                page_sequence_str = " -> ".join(page_sequence)
                
        # Construct structured prompt
        prompt = f"""
Analyze B2B industrial traffic profile and corporate intent.

Client Context:
{client_descriptors_str}

Prospect Scraped Homepage Copy:
{scraped_copy}

Prospect Navigation Journey:
{page_sequence_str}

Task: Synthesize a concise 2-sentence 'Executive Intent Summary' identifying if this company is currently evaluating client solutions, what specific areas they are looking at, and their intent level ('Discovery', 'Technical Evaluation', or 'Procurement'). Do not add preambles or filler text.
"""
        # Prompts are capped at 2,000 tokens per evaluation
        if estimate_tokens(prompt) > 2000:
            # Dynamically reduce scraped copy size to fit prompt within token budget
            while estimate_tokens(prompt) > 2000 and len(scraped_copy) > 50:
                words = scraped_copy.split()
                scraped_copy = " ".join(words[:-10])
                prompt = f"""
Analyze B2B industrial traffic profile and corporate intent.

Client Context:
{client_descriptors_str}

Prospect Scraped Homepage Copy:
{scraped_copy}

Prospect Navigation Journey:
{page_sequence_str}

Task: Synthesize a concise 2-sentence 'Executive Intent Summary' identifying if this company is currently evaluating client solutions, what specific areas they are looking at, and their intent level ('Discovery', 'Technical Evaluation', or 'Procurement'). Do not add preambles or filler text.
"""
            if estimate_tokens(prompt) > 2000:
                # Direct truncation if still too long
                prompt_words = prompt.split()
                prompt = " ".join(prompt_words[:1500])

        intent_summary = "Intelligence engine temporarily offline."
        if settings.DEEPSEEK_API_KEY:
            async with httpx.AsyncClient() as client:
                try:
                    response = await client.post(
                        "https://api.deepseek.com/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "deepseek-chat",
                            "messages": [{"role": "user", "content": prompt}],
                            "temperature": 0.2
                        },
                        timeout=15.0
                    )
                    if response.status_code == 200:
                        intent_summary = response.json()['choices'][0]['message']['content'].strip()
                    else:
                        logger.error(f"🤖 Daily Batch DeepSeek API returned code {response.status_code}: {response.text}")
                except Exception as e:
                    logger.error(f"🤖 Daily Batch DeepSeek Failure: {e}")
                    
        company.intent_summary = intent_summary
        session.add(company)
        
    await session.commit()


async def evaluate_stitching_with_deepseek(volunteered_name: str, enriched_name: str) -> Dict[str, Any]:
    """
    Evaluates if volunteered_name and enriched_name refer to the same B2B entity,
    and checks if enriched_name is an ISP/infrastructure provider.
    Returns a dictionary: {"same_entity": bool, "is_isp": bool}
    """
    if not settings.DEEPSEEK_API_KEY:
        return {"same_entity": False, "is_isp": False}

    prompt = f"""
    Evaluate if two corporate names refer to the same B2B company entity.
    Volunteered Name: "{volunteered_name}"
    Enriched Name: "{enriched_name}"

    Also, check if the Enriched Name represents an Internet Service Provider (ISP), telecommunications carrier, or general internet infrastructure provider (e.g. Vodacom, MTN, Telkom, Liquid Telecom, Cloudflare, etc.).

    Return ONLY a JSON object with two fields:
    - "same_entity": true if they are the same company (even if formatted slightly differently), false otherwise.
    - "is_isp": true if the Enriched Name represents an ISP or carrier, false otherwise.
    """

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.deepseek.com/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1,
                    "response_format": {"type": "json_object"}
                },
                timeout=10.0
            )
            if response.status_code == 200:
                import json
                content = response.json()['choices'][0]['message']['content'].strip()
                return json.loads(content)
            else:
                logger.error(f"🤖 DeepSeek Stitching: API returned code {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"🤖 DeepSeek Stitching Failure: {e}")
    return {"same_entity": False, "is_isp": False}


async def resolve_entity_stitching(volunteered_name: str, enriched_name: str) -> str:
    """
    Stitches volunteered company name with enriched name:
    1. Substring Match (case-insensitive).
    2. DeepSeek evaluation.
    3. ISP/Infrastructure filter.
    """
    if not volunteered_name:
        return enriched_name or "Unknown Entity"
    if not enriched_name:
        return volunteered_name

    v_lower = volunteered_name.lower().strip()
    e_lower = enriched_name.lower().strip()

    # 1. Substring Match
    if v_lower in e_lower or e_lower in v_lower:
        return enriched_name

    # 2. DeepSeek Evaluation
    try:
        ds_res = await evaluate_stitching_with_deepseek(volunteered_name, enriched_name)
        if ds_res.get("same_entity"):
            return enriched_name
        elif ds_res.get("is_isp"):
            return volunteered_name
    except Exception as e:
        logger.error(f"❌ resolve_entity_stitching Error: {e}")

    # Fallback to volunteered name
    return volunteered_name