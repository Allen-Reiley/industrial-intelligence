import httpx
import asyncio
import logging
import resend
from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from app.db import engine
from app.models.waitlist import WaitlistLead 
from app.models.visit import Visit  # Ensure this import matches your project structure
from app.core.config import settings
from app.services.intelligence import get_visitor_journey # Logic moved to service for cleanliness

router = APIRouter()
logger = logging.getLogger("uvicorn")

# Initialize Resend SDK
resend.api_key = settings.RESEND_API_KEY

async def send_slack_notification(lead_data: dict, journey: dict = None):
    """Background task to alert Slack with lead data and forensic journey"""
    if not settings.SLACK_WEBHOOK_URL:
        logger.warning("Slack Webhook URL is not configured.")
        return

    # Format the journey intelligence
    journey_text = "_No prior tracking data found._"
    if journey and isinstance(journey, dict):
        journey_text = (
            f"*Total Touches:* {journey['total_touches']}\n"
            f"*Pathway:* `{journey['pathway']}`\n"
            f"*First Interaction:* {journey['first_seen']}"
        )

    payload = {
        "text": f"🚀 New Phase 01 Audit: {lead_data.get('company')}",
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "🔔 New Partner Audit: Phase 01"}
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Name:*\n{lead_data.get('name')}"},
                    {"type": "mrkdwn", "text": f"*Company:*\n{lead_data.get('company')}"}
                ]
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn", 
                    "text": f"*🕵️ Industrial Intelligence (Visitor Journey):*\n{journey_text}"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Industry:*\n{lead_data.get('industry')}"},
                    {"type": "mrkdwn", "text": f"*Traffic:*\n{lead_data.get('traffic')}"},
                    {"type": "mrkdwn", "text": f"*Avg Price:*\n{lead_data.get('avg_price')}"},
                    {"type": "mrkdwn", "text": f"*CRM:*\n{lead_data.get('crm')}"}
                ]
            },
            {
                "type": "context",
                "elements": [{"type": "mrkdwn", "text": f"📍 Website: {lead_data.get('website')}"}]
            }
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            await client.post(settings.SLACK_WEBHOOK_URL, json=payload, timeout=5.0)
        except Exception as e:
            logger.error(f"Slack notification failed: {e}")

async def send_welcome_email(email: str, name: str):
    """Background task to dispatch the Phase 01 Welcome Email via Resend"""
    if not settings.RESEND_API_KEY:
        logger.warning("Resend API Key not configured.")
        return

    first_name = name.split()[0] if name else "Partner"
    
    try:
        resend.Emails.send({
            "from": "AuraWorks <intelligence@auraworks.co.za>",
            "to": [email],
            "subject": "Phase 01: Identity Verified & Audit Initiated",
            "html": f"""
                <div style="font-family: sans-serif; color: #1a1a1a; max-width: 600px;">
                    <h2 style="font-weight: 600; letter-spacing: -0.02em;">System Identity Verified</h2>
                    <p>Hello {first_name},</p>
                    <p>Your request to join the AuraWorks cohort has been received. Our engine has initiated the <strong>Phase 01 Infrastructure Audit</strong> for your domain.</p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                    <p>We will notify you once the industrial intelligence bridge is ready for review.</p>
                        AuraWorks (Pty) Ltd | Industrial Systems Architecture
                    </div>
                </div>
            """
        })
        logger.info(f"📧 Welcome email dispatched to {email}")
        return True
    except Exception as e:
        logger.error(f"Resend email failed: {e}")
        return False

@router.post("/join")
async def join_waitlist(payload: dict):
    email = payload.get("email")
    aura_id = payload.get("aura_id")

    if not email:
        raise HTTPException(status_code=400, detail="Work email is required.")

    with Session(engine) as session:
        statement = select(WaitlistLead).where(WaitlistLead.email == email)
        lead = session.exec(statement).first()

        if not lead:
            lead = WaitlistLead(email=email, name=payload.get("name", "Unknown"))
            logger.info(f"🆕 Creating new WaitlistLead for {email}")

        try:
            # Sync Lead Data
            lead.name = payload.get("name")
            lead.company = payload.get("company")
            lead.industry = payload.get("industry")
            lead.website = payload.get("website")
            lead.traffic = payload.get("traffic")
            lead.avg_price = payload.get("avgPrice") 
            lead.crm = payload.get("crm")
            
            session.add(lead)
            session.commit()
            session.refresh(lead)
            
            # 1. Trigger the Stitching Engine
            # This looks up the anonymous history before firing the Slack alert
            journey_data = get_visitor_journey(aura_id)
            
            lead_info = {
                "name": lead.name,
                "company": lead.company,
                "email": lead.email,
                "industry": lead.industry,
                "website": lead.website,
                "traffic": lead.traffic,
                "avg_price": lead.avg_price,
                "crm": lead.crm
            }
            
            # 2. Fire Background Automations
            asyncio.create_task(send_slack_notification(lead_info, journey=journey_data))
            asyncio.create_task(send_welcome_email(lead.email, lead.name))
            
            logger.info(f"✅ Waitlist Success: {email} (Aura ID: {aura_id})")
            return {"status": "success", "message": "Phase 01 Audit Initiated"}

        except Exception as e:
            session.rollback()
            logger.error(f"❌ Database Error during waitlist join: {str(e)}")
            raise HTTPException(status_code=500, detail="Database sync error.")