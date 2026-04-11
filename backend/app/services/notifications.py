import os
import httpx
import logging
from app.core.config import settings

logger = logging.getLogger("uvicorn")

# --- PHASE 01: The #visit Channel (Industrial Pager) ---

async def post_to_visit_channel(visit_data: dict, journey: dict):
    """
    High-speed Signal for the #visit channel.
    Only triggers for High-Confidence (>= 0.5) or Verified traffic.
    """
    if not settings.SLACK_VISIT_WEBHOOK_URL:
        return

    # SPRINT B FILTER: Stop notification fatigue from residential noise
    confidence = visit_data.get("confidence_score", 0.0)
    if confidence < 0.5 and not visit_data.get("is_verified", False):
        logger.info(f"🤫 Noise Suppression: Skip Slack for {visit_data.get('aura_id')[:8]} (Score: {confidence})")
        return

    cluster_count = journey.get("cluster_count", 1)
    is_corporate_cluster = cluster_count >= 3
    
    # Industrial Visual Indicators: Clean & Clinical
    emoji = "🏢" if is_corporate_cluster else "🏭"
    header = f"{emoji} Corporate Cluster" if is_corporate_cluster else f"{emoji} Industrial Facility"

    # Deep Links for the Industrial Triad
    airtable_url = f"https://airtable.com/{os.getenv('AIRTABLE_BASE_ID', '')}"
    notion_url = f"https://www.notion.so/{os.getenv('NOTION_DATABASE_ID', '')}"

    payload = {
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": header}
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Entity:*\n{visit_data.get('company_name', 'Anonymous Entity')}"},
                    {"type": "mrkdwn", "text": f"*Confidence:*\n`{confidence * 100}%`"},
                    {"type": "mrkdwn", "text": f"*Attribution:*\n{visit_data.get('utm_source', 'Direct')} / {visit_data.get('utm_medium', 'None')}"},
                    {"type": "mrkdwn", "text": f"*Intent Score:*\n{journey.get('intent_score', 'Audit Pending')}"}
                ]
            },
            {
                "type": "context",
                "elements": [
                    {"type": "mrkdwn", "text": f"📍 Forensic Lock: `{visit_data.get('aura_id')[:8]}` | Location: {visit_data.get('city', 'Unknown')}, {visit_data.get('region', 'ZA')}"}
                ]
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "Airtable CRM"},
                        "url": airtable_url,
                        "style": "primary"
                    },
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "Notion Vault"},
                        "url": notion_url
                    }
                ]
            }
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(settings.SLACK_VISIT_WEBHOOK_URL, json=payload, timeout=10.0)
            response.raise_for_status()
        except Exception as e:
            logger.error(f"Visit Channel Pager Failure: {e}")

# --- PHASE 02: Lead Notifications (Identity Promotion) ---

async def post_to_slack(lead_data: dict, journey: dict = None):
    """
    Standard lead notification for identified conversions (Promotion).
    """
    if not settings.SLACK_WEBHOOK_URL:
        return

    journey = journey or {}
    status_emoji = "💎" # Premium Lead Icon
    notion_url = f"https://www.notion.so/{os.getenv('NOTION_DATABASE_ID', '')}"

    payload = {
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": f"{status_emoji} Identity Promoted"}
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Entity:*\n{lead_data.get('company_name_final', 'Anonymous Entity')}"},
                    {"type": "mrkdwn", "text": f"*Lead:*\n{lead_data.get('name')} ({lead_data.get('email')})"},
                    {"type": "mrkdwn", "text": f"*Capture Source:*\n`{lead_data.get('capture_source', 'Verification')}`"},
                    {"type": "mrkdwn", "text": f"*Pathway:*\n{journey.get('pathway', 'Direct Entry')}"}
                ]
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "Read Full Audit"},
                        "url": notion_url,
                        "style": "primary"
                    }
                ]
            }
        ]
    }
    
    async with httpx.AsyncClient() as client:
        try:
            await client.post(settings.SLACK_WEBHOOK_URL, json=payload, timeout=10.0)
        except Exception as e:
            logger.error(f"Lead Channel Dispatch Failure: {e}")

# --- PHASE 03: Industrial Mailer (Mailgun) ---

async def send_mailgun_notification(email: str, name: str, subject: str = "Phase 01: Audit Initiated"):
    """
    Industrial Email Dispatch via Mailgun API for Client Onboarding.
    """
    if not settings.MAILGUN_API_KEY or not settings.MAILGUN_DOMAIN:
        logger.warning("Mailgun credentials missing. Email skipped.")
        return

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages",
                auth=("api", settings.MAILGUN_API_KEY),
                data={
                    "from": f"AuraWorks <audit@{settings.MAILGUN_DOMAIN}>",
                    "to": email,
                    "subject": subject,
                    "html": f"""
                    <div style="font-family: sans-serif; color: #18181b;">
                        <h3>System Audit: {name}</h3>
                        <p>Your industrial intelligence audit has been queued for processing.</p>
                        <p style="color: #71717a; font-size: 12px;">Ref: Industrial Forensic Bridge v3.0</p>
                    </div>
                    """
                }
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Mailgun Dispatch Failure: {e}")
            return False