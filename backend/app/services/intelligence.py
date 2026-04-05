import httpx
import logging
import asyncio
import json
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict
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

    # Fallbacks to ensure the prompt never fails
    c_name = company_name or "Industrial Prospect"
    ind = industry or "Manufacturing/Industrial"
    path = pathway or "Direct Homepage Entry"

    prompt = f"""
    Analyze the following B2B website traffic for a South African industrial client.
    Company: {c_name}
    Industry: {ind}
    Browsing Pathway: {path}

    Task: Provide a 2-sentence 'Executive Intent Summary'. 
    - Sentence 1: Identify the likely buying persona (e.g., Engineering, Procurement, or Executive).
    - Sentence 2: Assess the 'Temperature' (Cold/Warm/Hot) based on page depth (e.g., Pricing/Docs = High Intent).
    Tone: Clinical, sophisticated, 'Quiet Premium'. No marketing fluff.
    """

    async with httpx.AsyncClient() as client:
        try:
            # Increased timeout to 15s for DeepSeek-V3's complex reasoning
            response = await client.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": "You are a B2B Intelligence Analyst focusing on high-ticket industrial sales."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3 
                },
                timeout=15.0
            )
            
            if response.status_code != 200:
                logger.error(f"DeepSeek Error: {response.text}")
                return "Intelligence engine calibrating. Analysis deferred."

            result = response.json()
            return result['choices'][0]['message']['content'].strip()
        except Exception as e:
            logger.error(f"DeepSeek Analysis Failed: {e}")
            return "Intelligence engine temporarily offline."

# --- PHASE 02: Journey & Stitching Logic ---

async def get_visitor_journey(aura_id: str) -> Dict:
    """
    Retrieves the full behavioral ledger for a specific forensic ID.
    Used to feed the Intent Analysis engine and populate Slack/Dashboards.
    """
    if not aura_id:
        return {
            "total_touches": 0, 
            "pathway": "Direct/Anonymous", 
            "intent_summary": "No forensic signature detected.",
            "is_high_intent": False
        }

    with Session(engine) as session:
        # Retrieve all historical visits for this forensic signature
        statement = select(Visit).where(Visit.aura_id == aura_id).order_by(Visit.created_at)
        history = session.exec(statement).all()

        if not history:
            return {
                "total_touches": 0, 
                "pathway": "First Contact", 
                "intent_summary": "Initial touchpoint recorded.",
                "is_high_intent": False
            }

        # Extract Clean Paths (stripping domain noise)
        pages = []
        for v in history:
            # Clean URL to show only path (e.g. /pricing)
            p = v.url.split('auraworks.co.za')[-1] if v.url else "/"
            if not p or p == "" or p == "undefined": p = "/"
            pages.append(p)
        
        # Deduplicate pathway sequence while preserving order
        unique_pathway = []
        for p in pages:
            if not unique_pathway or p != unique_pathway[-1]:
                unique_pathway.append(p)
        
        pathway_str = " → ".join(unique_pathway)
        
        # 🏢 Resolve Company Context for the LLM
        company = None
        # Check if any visit in history has a company_id (linked via IP or Waitlist)
        linked_visit = next((v for v in history if v.company_id), None)
        if linked_visit:
            company = session.get(Company, linked_visit.company_id)

        # 🧠 Run DeepSeek Intent Analysis
        # Even if no company is linked, we run it as 'Anonymous Prospect'
        intent_summary = await analyze_corporate_intent(
            company.name if company else "Anonymous Industrial Entity", 
            company.industry if company else "Unknown Industry", 
            pathway_str
        )

        return {
            "total_touches": len(history),
            "pathway": pathway_str,
            "first_seen": history[0].created_at.strftime("%Y-%m-%d %H:%M"),
            "intent_summary": intent_summary,
            "is_high_intent": any(kw in pathway_str.lower() for kw in ["pricing", "waitlist", "get-started", "audit"])
        }

# --- PHASE 03: The 'Building-Level' Cluster ---

async def get_building_activity(ip_address: str, current_aura_id: str) -> str:
    """
    Detects if multiple unique devices from the same IP are interacting.
    Signifies a 'Company-Wide' evaluation (Building-Level Cluster).
    """
    if not ip_address: return "Solo Device"
    
    # 72-hour window for active consideration
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
        return f"🏢 Corporate Cluster: {unique_devices} other device(s) active from this facility."