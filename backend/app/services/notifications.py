import httpx
import logging
from app.core.config import settings

logger = logging.getLogger("uvicorn")

# --- PHASE 01: The #visit Channel (Deanonymization Hub) ---

async def post_to_visit_channel(visit_data: dict, journey: dict):
    """
    Reporting for the #visit channel: Surfacing anonymous facility traffic.
    Triggers 'Corporate Cluster' alerts for 3+ unique IDs.
    """
    if not settings.SLACK_VISIT_WEBHOOK_URL:
        return

    cluster_count = journey.get("cluster_count", 1)
    is_corporate_cluster = cluster_count >= 3
    
    # Industrial Visual Indicators
    emoji = "🚨" if is_corporate_cluster else "🕵️"
    header = f"{emoji} Corporate Cluster Detected" if is_corporate_cluster else f"{emoji} Anonymous Facility Entry"

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
                    {"type": "mrkdwn", "text": f"*Network Profile:*\n`{visit_data.get('network_type', 'Standard')}`"},
                    {"type": "mrkdwn", "text": f"*Attribution (UTM):*\n{visit_data.get('utm_source', 'Direct')} / {visit_data.get('utm_medium', 'None')}"},
                    {"type": "mrkdwn", "text": f"*Facility Cluster:*\n{cluster_count} Unique ID(s)"}
                ]
            },
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"*Pathway:* `{journey.get('pathway', '/')}`"}
            },
            {
                "type": "context",
                "elements": [
                    {"type": "mrkdwn", "text": f"📍 Forensic Lock: `{visit_data.get('aura_id')[:8]}` | Location: {visit_data.get('city', 'Unknown')}, {visit_data.get('region', 'ZA')}"}
                ]
            }
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            await client.post(settings.SLACK_VISIT_WEBHOOK_URL, json=payload)
        except Exception as e:
            logger.error(f"Visit Channel Dispatch Failure: {e}")

# --- PHASE 02: Lead Notifications (Waitlist Submissions) ---

async def post_to_slack(lead_data: dict, journey: dict = None):
    """
    Standard lead notification for identified conversions.
    """
    if not settings.SLACK_WEBHOOK_URL:
        return

    journey = journey or {}
    is_hot = journey.get("is_high_intent", False)
    status_emoji = "🔴" if is_hot else "🔵"
    
    payload = {
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": f"{status_emoji} Phase 01: Identity Promoted"}
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn", 
                    "text": f"*🕵️ Executive Intent Summary (DeepSeek-V3):*\n_{journey.get('intent_summary', 'Forensic analysis pending.')}_"
                }
            },
            {"type": "divider"},
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Entity:*\n{lead_data.get('company_name_final', 'Anonymous Entity')}"},
                    {"type": "mrkdwn", "text": f"*Lead:*\n{lead_data.get('name')} ({lead_data.get('email')})"},
                    {"type": "mrkdwn", "text": f"*Project Value:*\n{lead_data.get('formatted_price', 'N/A')}"},
                    {"type": "mrkdwn", "text": f"*Pathway:* `{journey.get('pathway', 'Direct')}`"}
                ]
            }
        ]
    }
    
    async with httpx.AsyncClient() as client:
        await client.post(settings.SLACK_WEBHOOK_URL, json=payload)

# --- PHASE 03: Industrial Mailer (Mailgun Replacement for Resend) ---

async def send_mailgun_notification(email: str, name: str, subject: str = "Phase 01: Audit Initiated"):
    """
    Industrial Email Dispatch via Mailgun API.
    """
    if not settings.MAILGUN_API_KEY or not settings.MAILGUN_DOMAIN:
        logger.warning("Mailgun credentials missing. Notification skipped.")
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
                    "html": f"<html><body><h3>System Audit: {name}</h3><p>Your industrial ROI analysis has been queued.</p></body></html>"
                }
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Mailgun Dispatch Failure: {e}")
            return False