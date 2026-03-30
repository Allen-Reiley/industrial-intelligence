import httpx
import asyncio
import logging
from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from app.db import engine
from app.models.waitlist import WaitlistLead 
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger("uvicorn")

async def send_slack_notification(lead_data: dict):
    """Background task to alert Slack of a new Phase 01 partner"""
    if not settings.SLACK_WEBHOOK_URL:
        logger.warning("Slack Webhook URL is not configured.")
        return

    # "Quiet Premium" Slack Formatting
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
                    {"type": "mrkdwn", "text": f"*Company:*\n{lead_data.get('company')}"},
                    {"type": "mrkdwn", "text": f"*Industry:*\n{lead_data.get('industry')}"},
                    {"type": "mrkdwn", "text": f"*Traffic:*\n{lead_data.get('traffic')}"}
                ]
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Avg Price:*\n{lead_data.get('avg_price')}"},
                    {"type": "mrkdwn", "text": f"*CRM:*\n{lead_data.get('crm')}"}
                ]
            },
            {
                "type": "context",
                "elements": [{"type": "mrkdwn", "text": f"📍 Audit Link: {lead_data.get('website')}"}]
            }
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            # Short timeout to keep the background worker lean
            await client.post(settings.SLACK_WEBHOOK_URL, json=payload, timeout=5.0)
        except Exception as e:
            logger.error(f"Slack notification failed: {e}")

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
            # Map values
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
            
            # Fire-and-forget Slack notification so the user isn't kept waiting
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
            asyncio.create_task(send_slack_notification(lead_info))
            
            logger.info(f"✅ Waitlist Success: {email} (Aura ID: {aura_id})")
            return {"status": "success", "message": "Phase 01 Audit Initiated"}

        except Exception as e:
            session.rollback()
            logger.error(f"❌ Database Error during waitlist join: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail="The intelligence engine encountered a database sync error."
            )