# backend/app/services/notifications.py
import logging
import httpx
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
        logger.info(f"🤫 Noise Suppression: Skip Slack for {visit_data.get('aura_id', 'UNKNOWN')[:8]} (Score: {confidence})")
        return

    cluster_count = journey.get("cluster_count", 1)
    is_corporate_cluster = cluster_count >= 3
    
    # Industrial Visual Indicators: Clean & Clinical
    emoji = "🏢" if is_corporate_cluster else "🏭"
    header = f"{emoji} Corporate Cluster" if is_corporate_cluster else f"{emoji} Industrial Facility"

    # Fallbacks derived gracefully from centralized settings
    airtable_base = getattr(settings, "AIRTABLE_BASE_ID", "")
    notion_db = getattr(settings, "NOTION_DATABASE_ID", "")
    
    airtable_url = f"https://airtable.com/{airtable_base}" if airtable_base else "#"
    notion_url = f"https://www.notion.so/{notion_db}" if notion_db else "#"

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
                    {"type": "mrkdwn", "text": f"*Confidence:*\n`{int(confidence * 100)}%`"},
                    {"type": "mrkdwn", "text": f"*Attribution:*\n{visit_data.get('utm_source', 'Direct')} / {visit_data.get('utm_medium', 'None')}"},
                    {"type": "mrkdwn", "text": f"*Intent Score:*\n{journey.get('intent_score', 'Audit Pending')}"}
                ]
            },
            {
                "type": "context",
                "elements": [
                    {"type": "mrkdwn", "text": f"📍 Forensic Lock: `{visit_data.get('aura_id', 'UNKNOWN')[:8]}` | Location: {visit_data.get('city', 'Unknown')}, {visit_data.get('region', 'ZA')}"}
                ]
            }
        ]
    }

    if airtable_base or notion_db:
        actions_block = {"type": "actions", "elements": []}
        if airtable_base:
            actions_block["elements"].append({
                "type": "button",
                "text": {"type": "plain_text", "text": "Airtable CRM"},
                "url": airtable_url,
                "style": "primary"
            })
        if notion_db:
            actions_block["elements"].append({
                "type": "button",
                "text": {"type": "plain_text", "text": "Notion Vault"},
                "url": notion_url
            })
        payload["blocks"].append(actions_block)

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
    status_emoji = "💎"
    notion_db = getattr(settings, "NOTION_DATABASE_ID", "")
    notion_url = f"https://www.notion.so/{notion_db}" if notion_db else "#"

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
            }
        ]
    }
    
    if notion_db:
        payload["blocks"].append({
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Read Full Audit"},
                    "url": notion_url,
                    "style": "primary"
                }
            ]
        })
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(settings.SLACK_WEBHOOK_URL, json=payload, timeout=10.0)
            response.raise_for_status()
        except Exception as e:
            logger.error(f"Lead Channel Dispatch Failure: {e}")