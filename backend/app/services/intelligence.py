import httpx
import logging
import asyncio
import json
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlmodel import Session, select
from app.models.visit import Visit
from app.models.company import Company
from app.db import engine
from app.core.config import settings

logger = logging.getLogger("uvicorn")

# --- PHASE 01: DeepSeek-V3 Intent Analysis ---

async def analyze_corporate_intent(company_name: str, industry: str, pathway: str) -> str:
    """
    Uses DeepSeek-V3 to generate a 'Clinical Intent Summary' based on browsing behavior.
    """
    if not settings.DEEPSEEK_API_KEY:
        return "Intent analysis pending (API Key missing)."

    prompt = f"""
    Analyze the following B2B website traffic for a South African industrial client.
    Company: {company_name}
    Industry: {industry}
    Browsing Pathway: {pathway}

    Task: Provide a 2-sentence 'Executive Intent Summary'. 
    - Sentence 1: Identify the likely buying persona (e.g., Engineering, Procurement, or Executive).
    - Sentence 2: Assess the 'Temperature' (Cold/Warm/Hot) based on page depth (e.g., Pricing/Docs = High Intent).
    Tone: Clinical, sophisticated, 'Quiet Premium'. No marketing fluff.
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
                    "temperature": 0.3 # Low temperature for clinical consistency
                },
                timeout=10.0
            )
            result = response.json()
            return result['choices'][0]['message']['content'].strip()
        except Exception as e:
            logger.error(f"DeepSeek Analysis Failed: {e}")
            return "Intelligence engine temporarily offline."

# --- PHASE 02: Journey & Stitching Logic ---

async def get_visitor_journey(aura_id: str):
    """
    Retrieves the full behavioral ledger for a specific forensic ID.
    Used to feed the Intent Analysis engine.
    """
    if not aura_id:
        return {"total_touches": 0, "pathway": "Anonymous", "intent": "None"}

    with Session(engine) as session:
        # Retrieve all historical visits for this forensic signature
        statement = select(Visit).where(Visit.aura_id == aura_id).order_by(Visit.created_at)
        history = session.exec(statement).all()

        if not history:
            return {"total_touches": 0, "pathway": "First Contact", "intent": "N/A"}

        # Extract Clean Paths (e.g., /pricing, /docs)
        pages = []
        for v in history:
            path = v.url.split('auraworks.co.za')[-1] if v.url else "/"
            if not path or path == "": path = "/"
            pages.append(path)
        
        # Unique pathway sequence
        pathway_str = " → ".join(list(dict.fromkeys(pages)))
        
        # 🏢 Resolve Company Context for the LLM
        company = None
        if history[0].company_id:
            company = session.get(Company, history[0].company_id)

        # 🧠 Run DeepSeek Intent Analysis if we have a Company
        intent_summary = "Awaiting Entity Resolution."
        if company:
            intent_summary = await analyze_corporate_intent(
                company.name, 
                company.industry or "Industrial", 
                pathway_str
            )

        return {
            "total_touches": len(history),
            "pathway": pathway_str,
            "first_seen": history[0].created_at.strftime("%Y-%m-%d %H:%M"),
            "intent_summary": intent_summary,
            "is_high_intent": "pricing" in pathway_str.lower() or "waitlist" in pathway_str.lower()
        }

# --- PHASE 03: The 'Building-Level' Cluster ---

async def get_building_activity(ip_address: str, current_aura_id: str) -> str:
    """
    Detects if multiple unique devices from the same IP are interacting.
    Signifies a 'Company-Wide' evaluation.
    """
    time_threshold = datetime.now(timezone.utc) - timedelta(hours=72)
    
    with Session(engine) as session:
        statement = select(Visit).where(
            Visit.ip_address == ip_address,
            Visit.aura_id != current_aura_id,
            Visit.created_at >= time_threshold
        )
        other_hits = session.exec(statement).all()
        
        if not other_hits:
            return "Solo Device"
            
        unique_devices = len({v.aura_id for v in other_hits})
        return f"🏢 Corporate Cluster: {unique_devices} other device(s) active."