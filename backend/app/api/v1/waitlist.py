import httpx
import asyncio
import logging
import resend
from fastapi import APIRouter, HTTPException, Request
from sqlmodel import Session, select
from app.db import engine
from app.models.waitlist import WaitlistLead 
from app.core.config import settings
from app.services.intelligence import get_visitor_journey

router = APIRouter()
logger = logging.getLogger("uvicorn")

# Initialize Resend SDK
resend.api_key = settings.RESEND_API_KEY

async def send_slack_notification(lead_data: dict, journey: dict = None):
    """Background task to alert Slack with lead data and forensic journey"""
    if not settings.SLACK_WEBHOOK_URL:
        logger.warning("🔴 Slack Webhook URL missing in settings.")
        return

    # Safe formatting for Slack blocks
    journey = journey or {}
    journey_text = (
        f"*Total Touches:* {journey.get('total_touches', 0)}\n"
        f"*Pathway:* `{journey.get('pathway', 'Direct')}`\n"
        f"*Context:* {journey.get('building_context', 'Solo Device')}"
    )

    payload = {
        "text": f"🚀 New Phase 01 Audit: {lead_data.get('company', 'Unknown Entity')}",
        "blocks": [
            {"type": "header", "text": {"type": "plain_text", "text": "🔔 New Partner Audit: Phase 01"}},
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Name:*\n{lead_data.get('name') or 'Unknown'}"},
                    {"type": "mrkdwn", "text": f"*Company:*\n{lead_data.get('company') or 'Unknown'}"}
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
                    {"type": "mrkdwn", "text": f"*Industry:*\n{lead_data.get('industry') or 'N/A'}"},
                    {"type": "mrkdwn", "text": f"*Traffic:*\n{lead_data.get('traffic') or 'N/A'}"},
                    {"type": "mrkdwn", "text": f"*Avg Price:*\n{lead_data.get('avg_price') or 'N/A'}"},
                    {"type": "mrkdwn", "text": f"*CRM:*\n{lead_data.get('crm') or 'N/A'}"}
                ]
            },
            {"type": "context", "elements": [{"type": "mrkdwn", "text": f"📍 Website: {lead_data.get('website') or 'Not provided'}"}]}
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(settings.SLACK_WEBHOOK_URL, json=payload, timeout=5.0)
            logger.info(f"📡 Slack Notification Sent. Status: {resp.status_code}")
        except Exception as e:
            logger.error(f"❌ Slack Webhook Failure: {e}")

async def send_welcome_email(email: str, name: str):
    """Background task to dispatch the Phase 01 Welcome Email"""
    if not settings.RESEND_API_KEY:
        logger.warning("🔴 Resend API Key missing.")
        return
    
    try:
        resend.Emails.send({
            "from": "AuraWorks <systems@auraworks.co.za>",
            "to": [email],
            "subject": "Phase 01: Identity Verified & Audit Initiated",
            "html": f"""
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8"></head>
                <body style="background-color: #09090b; color: #fafafa; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0;">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; padding: 20px;">
                    <tr>
                      <td style="padding-bottom: 30px;">
                        <p style="font-family: monospace; font-size: 10px; letter-spacing: 0.2em; color: #71717a; margin: 0; text-transform: uppercase;">
                          AURA WORKS // SYSTEMS
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 20px 0; color: #ffffff; letter-spacing: -0.02em;">
                          Audit Initiated
                        </h1>
                        <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 0 0 15px 0;">
                          The credentials for your organization have been successfully received. 
                          Your industrial footprint is now being queued for a <strong>Phase 01 ROI audit</strong>.
                        </p>
                        <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 0 0 30px 0;">
                          Our systems architect will review your data markers within the next 24 hours. 
                          If the alignment holds, we will move to Phase 02: Infrastructure Integration.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="border-top: 1px solid #27272a; padding-top: 20px;">
                        <p style="font-size: 11px; color: #52525b; margin: 0;">
                          This is an automated system signal from AuraWorks (Pty) Ltd.
                        </p>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
            """
        })
        logger.info(f"📧 Welcome email dispatched to {email}")
    except Exception as e:
        logger.error(f"❌ Resend API Error: {e}")

@router.post("/join")
async def join_waitlist(payload: dict, request: Request):
    email = payload.get("email")
    client_id = payload.get("aura_id") or payload.get("client_id")
    client_ip = "0.0.0.0"
    
    if request.client:
        client_ip = request.client.host
    
    logger.info(f"📥 Processing Waitlist Join: {email} from IP: {client_ip}")

    if not email:
        raise HTTPException(status_code=400, detail="Work email is required.")

    with Session(engine) as session:
        try:
            statement = select(WaitlistLead).where(WaitlistLead.email == email)
            lead = session.exec(statement).first()

            if not lead:
                lead = WaitlistLead(email=email)
                logger.info(f"🆕 Creating new record for {email}")
            else:
                logger.info(f"🔄 Updating existing record for {email}")

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
            logger.info(f"💾 DB Sync Successful for {email}")

            journey_data = get_visitor_journey(client_id, client_ip)
            logger.info(f"🕵️ Journey Resolved: {journey_data.get('total_touches')} touches")

            asyncio.create_task(send_slack_notification(payload, journey_data))
            asyncio.create_task(send_welcome_email(lead.email, lead.name))
            
            return {"status": "success", "message": "Phase 01 Audit Initiated"}

        except Exception as e:
            session.rollback()
            logger.error(f"🚨 CRITICAL DB ERROR: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database sync error: {str(e)}")