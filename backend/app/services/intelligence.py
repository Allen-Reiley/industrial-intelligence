# backend/app/services/intelligence.py
import httpx
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from cachetools import TTLCache

from app.models import Visit, Company, WaitlistLead
from app.core.config import settings

logger = logging.getLogger("uvicorn")

# --- INDUSTRIAL CACHE LAYER ---
# Prevents redundant API calls to IPinfo/DeepSeek within a 24-hour window
ip_cache = TTLCache(maxsize=2000, ttl=86400)

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
    """Retrieves corporate metadata for a specific IP."""
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
            # Corrected DeepSeek Base URL path mapping (Stripped out /v1/)
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

async def get_visitor_journey(aura_id: str, session: AsyncSession) -> Dict:
    """
    The Behavioral Ledger: Maps touchpoints and executes IP correlation.
    Identifies 'Ghost Links' where anonymous users share an IP with known Warm Leads.
    """
    if not aura_id:
        return {"total_touches": 0, "pathway": "Direct", "intent_summary": "No signature."}

    # 1. Forensic History Retrieval
    stmt = select(Visit).where(Visit.aura_id == aura_id).order_by(Visit.created_at)
    res = await session.execute(stmt)
    history = res.scalars().all()
    
    if not history:
        return {"total_touches": 0, "pathway": "First Contact", "intent_summary": "Initial touchpoint recorded."}

    last_visit = history[-1]

    # 2. Timezone-Naive DB Parity Safe Guard Check
    # Ensures database timestamp compatibility to avoid offset runtime crashes
    time_offset = datetime.now(timezone.utc) - timedelta(hours=72)
    # Convert safety boundary check to a naive datetime if database field lacks timezone indexing
    db_compatible_time = time_offset.replace(tzinfo=None)

    cluster_stmt = select(Visit).where(
        Visit.ip_address == last_visit.ip_address,
        Visit.created_at >= db_compatible_time
    )
    cluster_res = await session.execute(cluster_stmt)
    cluster_records = cluster_res.scalars().all()
    unique_id_count = len({v.aura_id for v in cluster_records})
    is_buying_committee = unique_id_count >= 3

    # 3. Pathway Mapping (Cleanup URL flow)
    pages = [v.url.split('auraworks.co.za')[-1] if v.url else "/" for v in history]
    unique_pathway = []
    for p in pages:
        if not unique_pathway or p != unique_pathway[-1]:
            unique_pathway.append(p if p != "" else "/")
    pathway_str = " → ".join(unique_pathway)

    # 4. Resolve Identity Context
    company = None
    lead = None
    
    # Check for volunteered data (The 'Warm' Check)
    lead_stmt = select(WaitlistLead).where(WaitlistLead.aura_id == aura_id)
    res_lead = await session.execute(lead_stmt)
    lead = res_lead.scalars().first()

    # Link to Company model if forensic stitching has already occurred
    linked_visit = next((v for v in history if v.company_id), None)
    if linked_visit:
        company = await session.get(Company, linked_visit.company_id)
    elif lead and lead.company_id:
        company = await session.get(Company, lead.company_id)

    # 5. Ghost-Enrichment (IP-based Corporate Mapping)
    cluster_info = f"📍 Facility Activity: {unique_id_count} device(s)"
    
    if not company and last_visit.ip_address:
        # If we don't know who this is, check if ANYONE from this IP ever identified themselves.
        # This is how we deanonymize colleagues in the same building.
        past_lead_stmt = select(WaitlistLead).join(
            Visit, WaitlistLead.aura_id == Visit.aura_id
        ).where(Visit.ip_address == last_visit.ip_address)
        
        past_lead_res = await session.execute(past_lead_stmt)
        past_lead = past_lead_res.scalars().first()
        
        if past_lead:
            company = await session.get(Company, past_lead.company_id)
            if company:
                cluster_info += f" | 🔗 Ghost-Linked: {company.name} (Identity via colleague)"

    # 6. DeepSeek Synthesis
    intent = await analyze_corporate_intent(
        company_name=company.name if company else (lead.company_name_raw if lead else "Anonymous Entity"),
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