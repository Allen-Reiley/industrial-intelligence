import os
import httpx
import logging
from app.core.config import settings

logger = logging.getLogger("uvicorn")

# --- PHASE 01: The #visit Channel (Industrial Pager) ---

async def post_to_visit_channel(visit_data: dict, journey: dict):
    """
    High-speed Signal for the #visit channel.
    Provides immediate forensic links to Airtable and Notion.
    """
    if not settings.SLACK_VISIT_WEBHOOK_URL:
        return

    cluster_count = journey.get("cluster_count", 1)
    is_corporate_cluster = cluster_count >= 3
    
    # Industrial Visual Indicators
    emoji = "🚨" if is_corporate_cluster else "🕵️"
    header = f"{emoji} Corporate Cluster" if is_corporate_cluster else f"{emoji} Facility Entry"

    # Deep Links for the Industrial Triad
    # Airtable uses the Base ID, Notion uses the Database ID
    airtable_url = f"https://airtable.com/{os.getenv('AIRTABLE_BASE_ID')}"
    notion_url = f"https://www.notion.so/{os.getenv('NOTION_DATABASE_ID')}"

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
                    {"type": "mrkdwn", "text": f"*Attribution:*\n{visit_data.get('utm_source', 'Direct')} / {visit_data.get('utm_medium', 'None')}"},
                    {"type": "mrkdwn", "text": f"*Cluster:*\n{cluster_count} Unique ID(s)"}
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
                        "text": {"type": "plain_text", "text": "View Airtable Engine"},
                        "url": airtable_url,
                        "style": "primary"
                    },
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "Open Clinical Vault"},
                        "url": notion_url
                    }
                ]
            }
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(settings.SLACK_VISIT_WEBHOOK_URL, json=payload)
            response.raise_for_status()
        except Exception as e:
            logger.error(f"Visit Channel Pager Failure: {e}")

# --- PHASE 02: Lead Notifications (Identity Promotion) ---

async def post_to_slack(lead_data: dict, journey: dict = None):
    """
    Standard lead notification for identified conversions.
    Simplified to prevent Block Kit rendering errors.
    """
    if not settings.SLACK_WEBHOOK_URL:
        return

    journey = journey or {}
    is_hot = journey.get("is_high_intent", False)
    status_emoji = "🔴" if is_hot else "🔵"
    
    # We point to the Vault for the full DeepSeek summary instead of sending it here
    notion_url = f"https://www.notion.so/{os.getenv('NOTION_DATABASE_ID')}"

    payload = {
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": f"{status_emoji} Identity Promoted"}
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn", 
                    "text": f"*Audit Status:* Forensic analysis successfully archived to Notion Vault."
                }
            },
            {"type": "divider"},
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Entity:*\n{lead_data.get('company_name_final', 'Anonymous Entity')}"},
                    {"type": "mrkdwn", "text": f"*Lead:*\n{lead_data.get('name')} ({lead_data.get('email')})"},
                    {"type": "mrkdwn", "text": f"*Value:*\n{lead_data.get('formatted_price', 'N/A')}"},
                    {"type": "mrkdwn", "text": f"*Pathway:* `{journey.get('pathway', 'Direct')}`"}
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
            await client.post(settings.SLACK_WEBHOOK_URL, json=payload)
        except Exception as e:
            logger.error(f"Lead Channel Dispatch Failure: {e}")

# --- PHASE 03: Industrial Mailer (Mailgun) ---

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