import httpx
import logging
from app.core.config import settings

logger = logging.getLogger("uvicorn")

async def post_to_slack(lead_data: dict, journey: dict = None):
    """
    Industrial Slack Dispatcher: Surfacing forensic signals and intent clusters.
    """
    if not settings.SLACK_WEBHOOK_URL:
        logger.warning("Slack Webhook URL missing. Notification skipped.")
        return

    # Extract forensic markers from journey/lead data
    journey = journey or {}
    is_hot = journey.get("is_high_intent", False)
    intent_summary = journey.get("intent_summary", "Forensic analysis pending.")
    
    # Industrial Status Indicators
    status_emoji = "🔴" if is_hot else "🔵"
    header_text = f"{status_emoji} Phase 01: Identity Promoted"
    
    # Build a clinical, structured block payload
    payload = {
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": header_text}
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn", 
                    "text": f"*🕵️ Executive Intent Summary (DeepSeek-V3):*\n_{intent_summary}_"
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
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn", 
                        "text": f"📍 *Network:* {lead_data.get('network_type', 'Standard')} | *Touches:* {journey.get('total_touches', 1)}"
                    }
                ]
            }
        ]
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(settings.SLACK_WEBHOOK_URL, json=payload)
            if response.status_code != 200:
                logger.error(f"Slack Error {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Slack Dispatch Failure: {e}")

async def notify_buying_committee(ip_address: str, count: int, company_name: str):
    """
    High-Priority Alert: Triggered when multiple unique devices from one building
    show intent activity simultaneously.
    """
    if not settings.SLACK_WEBHOOK_URL: return

    payload = {
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn", 
                    "text": f"🚨 *Buying Committee Detected: {company_name}*\n"
                           f"Forensic logic identified *{count} unique devices* active from this facility "
                           f"under IP `{ip_address}`. High probability of internal procurement discussion."
                }
            }
        ]
    }
    async with httpx.AsyncClient() as client:
        await client.post(settings.SLACK_WEBHOOK_URL, json=payload)