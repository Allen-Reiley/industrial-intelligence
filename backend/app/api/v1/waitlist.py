import httpx
import logging
import resend
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from sqlmodel import Session, select
from app.db import engine
from app.models.waitlist import WaitlistLead 
from app.models.company import Company
from app.models.visit import Visit
from app.core.config import settings
from app.services.intelligence import get_visitor_journey

router = APIRouter()
logger = logging.getLogger("uvicorn")

# --- UTILS: Industrial Formatting ---
def format_zar(value: str) -> str:
    if not value: return "N/A"
    clean_value = "".join(filter(str.isdigit, value))
    return f"R{int(clean_value):,}" if clean_value else value

# --- TASK 1: Resend (The Welcome Signal) ---
async def send_welcome_email(email: str, name: str):
    if not settings.RESEND_API_KEY: return
    resend.api_key = settings.RESEND_API_KEY
    first_name = name.split(' ')[0] if name else "Partner"
    
    try:
        resend.Emails.send({
            "from": "AuraWorks <audit@auraworks.co.za>",
            "to": [email],
            "subject": "Phase 01: Identity Verified & Audit Initiated",
            "html": f"""
                <body style="background-color: #09090b; color: #fafafa; font-family: sans-serif; padding: 40px;">
                    <div style="max-width: 600px; margin: 0 auto;">
                        <p style="letter-spacing: 0.2em; color: #71717a; font-size: 10px; text-transform: uppercase;">AURA WORKS // SYSTEMS</p>
                        <h1 style="font-size: 24px; margin-top: 20px;">Audit Initiated: {first_name}</h1>
                        <p style="color: #a1a1aa; line-height: 1.6;">Your industrial footprint is now being queued for a Phase 01 ROI audit. Our systems architect will review your data markers within the next 24 hours.</p>
                        <hr style="border: 0; border-top: 1px solid #27272a; margin-top: 30px;">
                        <p style="font-size: 11px; color: #52525b;">Automated Signal | AuraWorks (Pty) Ltd</p>
                    </div>
                </body>
            """
        })
    except Exception as e:
        logger.error(f"❌ Resend Error: {e}")

# --- TASK 2: Slack (The Intelligence Alert) ---
async def send_slack_notification(payload: dict, journey: dict = None):
    """
    Enhanced Slack Alert: Prioritizes Intent Analysis & Corporate Clustering.
    """
    if not settings.SLACK_WEBHOOK_URL: return
    journey = journey or {}
    
    is_hot = journey.get("is_high_intent", False)
    status_emoji = "🔴" if is_hot else "🔵"
    status_text = "HOT LEAD" if is_hot else "New Verified Inquiry"
    
    formatted_price = format_zar(payload.get('avg_price'))
    
    # Logic fallback for Company Name visibility
    display_company = payload.get('company_name_raw') or payload.get('company') or "Unknown Entity"

    slack_data = {
        "text": f"{status_emoji} {status_text}: {display_company}",
        "blocks": [
            {"type": "header", "text": {"type": "plain_text", "text": f"{status_emoji} Phase 01: Identity Promotion"}},
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Name:*\n{payload.get('name')}"},
                    {"type": "mrkdwn", "text": f"*Company:*\n{display_company}"}
                ]
            },
            {"type": "divider"},
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn", 
                    "text": f"*🕵️ Executive Intent Summary (DeepSeek-V3):*\n_{journey.get('intent_summary', 'Awaiting behavioral analysis...')}_"
                }
            },
            {"type": "divider"},
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Industry:*\n{str(payload.get('industry', 'N/A')).title()}"},
                    {"type": "mrkdwn", "text": f"*Avg Price:*\n{formatted_price}"},
                    {"type": "mrkdwn", "text": f"*Pathway:* `{journey.get('pathway', 'Direct')}`"},
                    {"type": "mrkdwn", "text": f"*Total Touches:* {journey.get('total_touches', 1)}"}
                ]
            },
            {"type": "context", "elements": [{"type": "mrkdwn", "text": f"📍 Origin: {payload.get('website') or 'Not provided'}"}]}
        ]
    }
    async with httpx.AsyncClient() as client:
        try:
            await client.post(settings.SLACK_WEBHOOK_URL, json=slack_data)
        except Exception as e:
            logger.error(f"❌ Slack Notification Failure: {e}")

# --- MAIN ROUTE: The Promotion Logic ---
@router.post("/join")
async def join_waitlist(payload: dict, request: Request, background_tasks: BackgroundTasks):
    # DEV LOG: Noisy input inspection
    logger.info(f"--- 💡 DEV LOG: WAITLIST PAYLOAD KEYS: {list(payload.keys())} ---")
    
    email = payload.get("email")
    aura_id = payload.get("aura_id")
    
    # Resilience for frontend key naming (company vs company_name)
    raw_company_name = payload.get("company") or payload.get("company_name") or payload.get("companyName")
    website = payload.get("website")

    if not email:
        raise HTTPException(status_code=400, detail="Work email required.")

    with Session(engine) as session:
        try:
            # 1. Resolve Jurisdictive Entity (Company)
            domain = None
            if website:
                domain = website.replace("https://", "").replace("http://", "").split("/")[0].lower()
            
            company = None
            if domain:
                company = session.exec(select(Company).where(Company.domain == domain)).first()
            
            # If no domain match, check by Name to prevent duplicate entries
            if not company and raw_company_name:
                company = session.exec(select(Company).where(Company.name == raw_company_name)).first()

            if not company:
                company = Company(
                    name=raw_company_name or "Unknown Industrial Entity", 
                    domain=domain,
                    industry=payload.get("industry")
                )
                session.add(company)
                session.commit()
                session.refresh(company)

            # 2. Update/Create Verified Secondary Entity (WaitlistLead)
            lead = session.exec(select(WaitlistLead).where(WaitlistLead.email == email)).first()
            if not lead:
                lead = WaitlistLead(email=email)
            
            lead.name = payload.get("name")
            lead.company_id = company.id
            lead.company_name_raw = raw_company_name
            lead.industry = payload.get("industry")
            lead.website = website
            lead.traffic = payload.get("traffic")
            lead.avg_price = payload.get("avg_price")
            lead.crm = payload.get("crm")
            lead.aura_id = aura_id
            
            session.add(lead)

            # 3. THE PROMOTION STITCH: Anchor anonymous history to this identity
            if aura_id:
                past_visits = session.exec(select(Visit).where(Visit.aura_id == aura_id)).all()
                for v in past_visits:
                    v.is_consented = True
                    v.company_id = company.id
                    session.add(v)

            session.commit()
            session.refresh(lead)

            # 4. Intelligence Execution (DeepSeek-V3 intent logic)
            # We call this journey_data here to pass to Slack
            journey_data = await get_visitor_journey(aura_id)
            
            # Update payload with enriched company name for Slack visibility
            payload["company_name_raw"] = company.name

            # 5. Hand off to Background Workers
            background_tasks.add_task(send_slack_notification, payload, journey_data)
            background_tasks.add_task(send_welcome_email, lead.email, lead.name)
            
            return {"status": "success", "message": "Phase 01 Audit Initiated"}

        except Exception as e:
            session.rollback()
            logger.error(f"🚨 Promotion Failure: {e}")
            raise HTTPException(status_code=500, detail="Synchronization delay.")