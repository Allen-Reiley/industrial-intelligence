import httpx
import logging
import resend
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks, Depends
from sqlmodel import Session, select
from app.db import engine
from app.models.waitlist import WaitlistLead 
from app.core.config import settings
from app.services.intelligence import get_visitor_journey

router = APIRouter()
logger = logging.getLogger("uvicorn")

# --- UTILS: Clinical Formatting ---
def format_zar(value: str) -> str:
    """Formats raw price input into Clinical ZAR currency string for Slack."""
    if not value: return "N/A"
    clean_value = "".join(filter(str.isdigit, value))
    if clean_value:
        try:
            return f"R{int(clean_value):,}"
        except:
            return value
    return value

# --- TASK 1: Resend (The Welcome Signal) ---
async def send_welcome_email(email: str, name: str):
    """Dispatches the T+0 Phase 01 Welcome Email via Resend"""
    if not settings.RESEND_API_KEY:
        logger.warning("🔴 Resend API Key missing in environment.")
        return
    
    # Initialize key within the task to ensure it's fresh
    resend.api_key = settings.RESEND_API_KEY
    first_name = name.split(' ')[0] if name else "Partner"
    
    try:
        resend.Emails.send({
            "from": "AuraWorks <audit@auraworks.co.za>", # Must be a verified domain in Resend
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
        logger.info(f"📧 Resend: Welcome email dispatched to {email}")
    except Exception as e:
        logger.error(f"❌ Resend API Error: {str(e)}")

# --- TASK 2: Slack (The Intelligence Alert) ---
async def send_slack_notification(payload: dict, journey: dict = None):
    """Alerts Slack with lead credentials and forensic journey markers"""
    if not settings.SLACK_WEBHOOK_URL:
        logger.warning("🔴 Slack Webhook URL missing in environment.")
        return

    journey = journey or {}
    journey_text = (
        f"*Total Touches:* {journey.get('total_touches', 0)}\n"
        f"*Pathway:* `{journey.get('pathway', 'Direct')}`\n"
        f"*Context:* {journey.get('building_context', 'Solo Device')}"
    )

    formatted_price = format_zar(payload.get('avg_price'))

    slack_data = {
        "text": f"🚀 New Phase 01 Audit: {payload.get('company', 'Unknown Entity')}",
        "blocks": [
            {"type": "header", "text": {"type": "plain_text", "text": "🔔 New Partner Audit: Phase 01"}},
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Name:*\n{payload.get('name') or 'Unknown'}"},
                    {"type": "mrkdwn", "text": f"*Company:*\n{payload.get('company') or 'Unknown'}"}
                ]
            },
            {"type": "divider"},
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"*🕵️ Industrial Intelligence:*\n{journey_text}"}
            },
            {"type": "divider"},
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Industry:*\n{str(payload.get('industry', 'N/A')).title()}"},
                    {"type": "mrkdwn", "text": f"*Traffic:*\n{payload.get('traffic') or 'N/A'}"},
                    {"type": "mrkdwn", "text": f"*Avg Price:*\n{formatted_price}"},
                    {"type": "mrkdwn", "text": f"*CRM:*\n{str(payload.get('crm', 'N/A')).upper()}"}
                ]
            },
            {"type": "context", "elements": [{"type": "mrkdwn", "text": f"📍 Website: {payload.get('website') or 'Not provided'}"}]}
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(settings.SLACK_WEBHOOK_URL, json=slack_data, timeout=5.0)
            logger.info(f"📡 Slack Alert Status: {resp.status_code}")
        except Exception as e:
            logger.error(f"❌ Slack Webhook Error: {str(e)}")

# --- MAIN ROUTE: The Entry Point ---
@router.post("/join")
async def join_waitlist(payload: dict, request: Request, background_tasks: BackgroundTasks):
    email = payload.get("email")
    aura_id = payload.get("aura_id") or payload.get("client_id")
    
    # Resolve Real IP for South African ISP context
    client_ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip() or request.client.host

    if not email:
        raise HTTPException(status_code=400, detail="Work email required.")

    with Session(engine) as session:
        try:
            # 1. DB Persistence
            statement = select(WaitlistLead).where(WaitlistLead.email == email)
            lead = session.exec(statement).first()

            if not lead:
                lead = WaitlistLead(email=email)
            
            # Sync metadata from fixed snake_case payload
            lead.name = payload.get("name")
            lead.company = payload.get("company")
            lead.industry = payload.get("industry")
            lead.website = payload.get("website")
            lead.traffic = payload.get("traffic")
            lead.avg_price = payload.get("avg_price") 
            lead.crm = payload.get("crm")
            
            session.add(lead)
            session.commit()
            session.refresh(lead)

            # 2. Forensic Intelligence Resolution
            journey_data = await get_visitor_journey(aura_id, client_ip)

            # 3. Hand off to Background Tasks (Non-blocking)
            background_tasks.add_task(send_slack_notification, payload, journey_data)
            background_tasks.add_task(send_welcome_email, lead.email, lead.name)
            
            return {"status": "success", "message": "Phase 01 Audit Initiated"}

        except Exception as e:
            session.rollback()
            logger.error(f"🚨 CRITICAL DB ERROR: {str(e)}")
            # Return generic error to user to avoid leaking DB schema details
            raise HTTPException(status_code=500, detail="Synchronization delay in audit pipeline.")