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

# --- PHASE 01: The Orchestrator (Slack x DeepSeek Sync) ---

async def orchestrate_lead_audit(lead_id: int, aura_id: str, payload: dict):
    """
    The Central Brain: Ensures DeepSeek analysis is ready before notifying Slack.
    Uses Mailgun for high-deliverability signals.
    """
    logger.info(f"--- 🧠 ORCHESTRATING AUDIT: Lead {lead_id} ---")
    
    # 1. Wait for Behavioral Journey & DeepSeek Intent Analysis
    journey = await get_visitor_journey(aura_id)
    
    # 2. Sequential Delay: If intent is still calibrating, give it one short retry
    if "calibrating" in journey.get("intent_summary", "").lower():
        await asyncio.sleep(4)
        journey = await get_visitor_journey(aura_id)

    # 3. Dispatch Clinical Notifications
    await send_slack_notification(payload, journey)
    await send_mailgun_welcome(payload.get("email"), payload.get("name"))

# --- PHASE 02: DeepSeek-V3 Intent Analysis ---

async def analyze_corporate_intent(company_name: str, industry: str, pathway: str) -> str:
    if not settings.DEEPSEEK_API_KEY:
        return "Intent analysis pending (API Key missing)."

    prompt = f"""
    Analyze B2B traffic for:
    Entity: {company_name or 'Industrial Prospect'}
    Industry: {industry or 'Manufacturing'}
    Pathway: {pathway}

    Task: Provide a 2-sentence 'Executive Intent Summary'.
    Tone: Clinical, sophisticated, 'Quiet Premium'. Identify persona and intent 'Temperature'.
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
                    "temperature": 0.3 
                },
                timeout=20.0 
            )
            if response.status_code == 200:
                return response.json()['choices'][0]['message']['content'].strip()
            return "Intelligence engine calibrating. Analysis deferred."
        except Exception as e:
            logger.error(f"DeepSeek Failure: {e}")
            return "Intelligence engine temporarily offline."

# --- PHASE 03: Journey & Ghost Enrichment ---

async def get_visitor_journey(aura_id: str) -> Dict:
    """
    Retrieves behavioral ledger. Implements 'Ghost Enrichment' by checking
    local history if external identifiers are missing.
    """
    if not aura_id:
        return {"total_touches": 0, "pathway": "Direct", "intent_summary": "No forensic signature."}

    with Session(engine) as session:
        # Ghost Enrichment: Pull historical visits for this forensic ID
        statement = select(Visit).where(Visit.aura_id == aura_id).order_by(Visit.created_at)
        history = session.exec(statement).all()
        
        if not history:
            return {"total_touches": 0, "pathway": "First Contact", "intent_summary": "Initial touchpoint recorded."}

        # Pathway Mapping: Clean URL paths
        pages = [v.url.split('auraworks.co.za')[-1] if v.url else "/" for v in history]
        unique_pathway = []
        for p in pages:
            if not unique_pathway or p != unique_pathway[-1]:
                unique_pathway.append(p if p != "" else "/")
        
        pathway_str = " → ".join(unique_pathway)
        
        # Corporate Cluster Detection (Facility-Level Grouping)
        last_visit = history[-1]
        cluster_info = await get_building_activity(last_visit.ip_address, aura_id)

        # Context Harvest: Resolve Company Anchor
        company = None
        linked_visit = next((v for v in history if v.company_id), None)
        if linked_visit:
            company = session.get(Company, linked_visit.company_id)

        # Self-Healing: Ghost-linking via IP correlation if company is unknown
        if not company:
            last_ip = last_visit.ip_address
            past_lead = session.exec(
                select(WaitlistLead)
                .join(Visit, WaitlistLead.aura_id == Visit.aura_id)
                .where(Visit.ip_address == last_ip)
            ).first()
            
            if past_lead:
                company = session.get(Company, past_lead.company_id)
                cluster_info += f" | 🔗 Ghost-linked via IP to {company.name if company else 'Previous Lead'}"

        intent = await analyze_corporate_intent(
            company.name if company else "Anonymous Entity",
            company.industry if company else "Industrial",
            pathway_str
        )

        # Intelligence signal for Slack (Network signature context)
        network_context = f"[{last_visit.effective_connection_type or 'Standard'}]"

        return {
            "total_touches": len(history),
            "pathway": pathway_str,
            "intent_summary": f"{intent} \n\n{cluster_info} {network_context}",
            "is_high_intent": any(kw in pathway_str.lower() for kw in ["pricing", "audit", "waitlist"]) or (last_visit.intent_cluster is not None)
        }

# --- PHASE 04: Industrial Notifications (Slack & Mailgun) ---

async def send_slack_notification(payload: dict, journey: dict):
    if not settings.SLACK_WEBHOOK_URL: return
    
    is_hot = journey.get("is_high_intent", False)
    emoji = "🔴" if is_hot else "🔵"
    
    slack_data = {
        "blocks": [
            {"type": "header", "text": {"type": "plain_text", "text": f"{emoji} Phase 01: Identity Promoted"}},
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"*🕵️ Executive Intent Summary:*\n_{journey.get('intent_summary')}_"}
            },
            {"type": "divider"},
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Entity:*\n{payload.get('company_name_final')}"},
                    {"type": "mrkdwn", "text": f"*Lead:*\n{payload.get('name')} ({payload.get('email')})"},
                    {"type": "mrkdwn", "text": f"*Project Value:*\n{payload.get('formatted_price') or 'N/A'}"},
                    {"type": "mrkdwn", "text": f"*Pathway:* `{journey.get('pathway')}`"}
                ]
            }
        ]
    }
    async with httpx.AsyncClient() as client:
        await client.post(settings.SLACK_WEBHOOK_URL, json=slack_data)

async def send_mailgun_welcome(email: str, name: str):
    if not settings.MAILGUN_API_KEY or not settings.MAILGUN_DOMAIN:
        logger.warning("Mailgun credentials missing. Skipping email.")
        return

    async with httpx.AsyncClient() as client:
        try:
            await client.post(
                f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages",
                auth=("api", settings.MAILGUN_API_KEY),
                data={
                    "from": f"AuraWorks <audit@{settings.MAILGUN_DOMAIN}>",
                    "to": email,
                    "subject": "Phase 01: Audit Initiated",
                    "html": f"""
                        <div style="font-family: sans-serif; padding: 20px; color: #18181b;">
                            <h2 style="border-bottom: 1px solid #e4e4e7; padding-bottom: 10px;">Audit Initiated: {name}</h2>
                            <p>Our systems architect has successfully queued your industrial ROI analysis.</p>
                            <p style="font-size: 11px; color: #71717a; margin-top: 20px;">AuraWorks (Pty) Ltd // Automated Signal</p>
                        </div>
                    """
                }
            )
        except Exception as e:
            logger.error(f"Mailgun Failure: {e}")

async def get_building_activity(ip_address: str, current_aura_id: str) -> str:
    """
    Buying Committee Detection: Identifies multiple unique device signatures 
    from the same static IP within a 72-hour window.
    """
    if not ip_address: return ""
    time_threshold = datetime.now(timezone.utc) - timedelta(hours=72)
    with Session(engine) as session:
        statement = select(Visit).where(
            Visit.ip_address == ip_address, 
            Visit.aura_id != current_aura_id, 
            Visit.created_at >= time_threshold
        )
        others = session.exec(statement).all()
        if not others: return "📍 Solo Facility Entry"
        unique_ids = len({v.aura_id for v in others})
        return f"🏢 **Corporate Cluster:** {unique_ids} other device(s) active from this facility."