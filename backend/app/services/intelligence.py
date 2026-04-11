import httpx
import logging
import asyncio
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict
from sqlmodel import Session, select
from app.models.visit import Visit
from app.models.company import Company
from app.models.waitlist import WaitlistLead
from app.db import engine
from app.core.config import settings

logger = logging.getLogger("uvicorn")

# --- UTILS: Industrial Formatting ---
def format_zar(value: str) -> str:
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

# --- PHASE 01: The Orchestrator ---

async def orchestrate_lead_audit(lead_id: int, aura_id: str, payload: dict):
    """
    The Central Brain: Ensures DeepSeek analysis is ready before notifying Slack.
    """
    logger.info(f"--- 🧠 ORCHESTRATING AUDIT: Lead {lead_id} ---")
    
    # 1. Wait for Behavioral Journey & DeepSeek Intent Analysis
    journey = await get_visitor_journey(aura_id)
    
    # 2. Sequential Delay: Calibration Retry
    if "calibrating" in journey.get("intent_summary", "").lower():
        await asyncio.sleep(4)
        journey = await get_visitor_journey(aura_id)

    # 3. Dispatch Clinical Notifications (Using your refactored notifications.py)
    # We pass the results to the specialized notification service
    from app.services.notifications import post_to_slack, send_mailgun_notification
    
    await post_to_slack(payload, journey)
    await send_mailgun_notification(payload.get("email"), payload.get("name"))

# --- PHASE 02: DeepSeek-V3 Intent Analysis ---

async def analyze_corporate_intent(
    company_name: str, 
    industry: str, 
    pathway: str, 
    is_cluster: bool = False
) -> str:
    """
    Clinical Intent Analysis: Calibrated for B2B facility detection.
    """
    if not settings.DEEPSEEK_API_KEY:
        return "Intelligence engine calibrating. Analysis deferred."

    context_signal = "BUYING COMMITTEE ALERT: 3+ unique devices detected." if is_cluster else "Individual Facility Entry."

    prompt = f"""
    Analyze B2B industrial traffic for:
    Entity: {company_name}
    Industry: {industry}
    Pathway: {pathway}
    Context: {context_signal}

    Task: Provide a 2-sentence 'Executive Intent Summary'.
    Tone: Clinical, sophisticated, 'Quiet Premium'. Identify persona and intent 'Temperature'.
    Labels: Categorize as 'Discovery', 'Technical Evaluation', or 'Procurement' phase.
    """

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2 
                },
                timeout=20.0 
            )
            if response.status_code == 200:
                return response.json()['choices'][0]['message']['content'].strip()
            return "Intelligence engine calibrating. Analysis deferred."
        except Exception as e:
            logger.error(f"DeepSeek Failure: {e}")
            return "Intelligence engine temporarily offline."

# --- PHASE 03: Unified Journey & Ghost Enrichment ---

async def get_visitor_journey(aura_id: str) -> Dict:
    """
    FIXED: Single source of truth for behavioral ledgers.
    Implements 'Ghost Enrichment' and Corporate Cluster detection.
    """
    if not aura_id:
        return {"total_touches": 0, "pathway": "Direct", "intent_summary": "No forensic signature.", "cluster_count": 0}

    with Session(engine) as session:
        # 1. Forensic History Retrieval
        statement = select(Visit).where(Visit.aura_id == aura_id).order_by(Visit.created_at)
        history = session.exec(statement).all()
        
        if not history:
            return {"total_touches": 0, "pathway": "First Contact", "intent_summary": "Initial touchpoint recorded.", "cluster_count": 0}

        last_visit = history[-1]

        # 2. Corporate Cluster Detection (The 3+ Unique ID Rule)
        time_threshold = datetime.now(timezone.utc) - timedelta(hours=72)
        cluster_statement = select(Visit).where(
            Visit.ip_address == last_visit.ip_address,
            Visit.created_at >= time_threshold
        )
        cluster_records = session.exec(cluster_statement).all()
        unique_id_count = len({v.aura_id for v in cluster_records})
        is_buying_committee = unique_id_count >= 3

        # 3. Pathway Mapping (Deduplicated URL sequence)
        pages = [v.url.split('auraworks.co.za')[-1] if v.url else "/" for v in history]
        unique_pathway = []
        for p in pages:
            if not unique_pathway or p != unique_pathway[-1]:
                unique_pathway.append(p if p != "" else "/")
        pathway_str = " → ".join(unique_pathway)

        # 4. Context Harvest: Resolve Company Anchor
        company = None
        linked_visit = next((v for v in history if v.company_id), None)
        if linked_visit:
            company = session.get(Company, linked_visit.company_id)

        # 5. Self-Healing: Ghost-linking via IP correlation
        cluster_info = f"📍 Facility Activity: {unique_id_count} IDs"
        if not company and last_visit.ip_address:
            # Check if this IP is associated with any previous Lead
            past_lead = session.exec(
                select(WaitlistLead)
                .join(Visit, WaitlistLead.aura_id == Visit.aura_id)
                .where(Visit.ip_address == last_visit.ip_address)
            ).first()
            
            if past_lead:
                company = session.get(Company, past_lead.company_id)
                if company:
                    cluster_info += f" | 🔗 Ghost-linked to {company.name}"

        # 6. DeepSeek Synthesis
        intent = await analyze_corporate_intent(
            company_name=company.name if company else "Anonymous Entity",
            industry=company.industry if company else "Industrial",
            pathway=pathway_str,
            is_cluster=is_buying_committee
        )

        network_context = f"[{last_visit.effective_connection_type or 'Standard'}]"

        return {
            "total_touches": len(history),
            "pathway": pathway_str,
            "intent_summary": f"{intent} \n\n{cluster_info} {network_context}",
            "cluster_count": unique_id_count,
            "is_cluster": is_buying_committee,
            "is_high_intent": is_buying_committee or any(kw in pathway_str.lower() for kw in ["pricing", "audit", "waitlist"]) or (last_visit.intent_cluster is not None)
        }