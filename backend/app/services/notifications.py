# backend/app/services/notifications.py
import logging
import httpx
import urllib.parse
from datetime import datetime, timedelta, timezone
from uuid import UUID
from sqlmodel import select

from app.core.config import settings
from app.db import async_session_maker
from app.models.notification_throttle import NotificationThrottle

logger = logging.getLogger("uvicorn")

async def is_slack_notification_throttled(client_id: UUID, company_id: UUID) -> bool:
    """
    Checks if a Slack alert was already sent for the given client_id and company_id
    within the last 1 hour. If not, updates/creates the throttle record and returns False.
    If throttled, returns True.
    """
    if not async_session_maker:
        return False
        
    async with async_session_maker() as session:
        try:
            one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
            
            stmt = select(NotificationThrottle).where(
                NotificationThrottle.client_id == client_id,
                NotificationThrottle.company_id == company_id,
                NotificationThrottle.last_notification_sent_at > one_hour_ago
            )
            res = await session.execute(stmt)
            throttle = res.scalars().first()
            
            if throttle:
                return True
                
            # No throttle record in the last hour, so create or update one
            stmt_exist = select(NotificationThrottle).where(
                NotificationThrottle.client_id == client_id,
                NotificationThrottle.company_id == company_id
            )
            res_exist = await session.execute(stmt_exist)
            existing = res_exist.scalars().first()
            
            if existing:
                existing.last_notification_sent_at = datetime.now(timezone.utc)
                session.add(existing)
            else:
                new_throttle = NotificationThrottle(
                    client_id=client_id,
                    company_id=company_id,
                    last_notification_sent_at=datetime.now(timezone.utc)
                )
                session.add(new_throttle)
                
            await session.commit()
            return False
        except Exception as e:
            logger.error(f"Error checking slack notification throttle: {e}")
            return False

# --- PHASE 01: The #visit Channel (Industrial Pager) ---

async def post_to_visit_channel(visit_data: dict, journey: dict):
    """
    High-speed Signal for the #visit channel.
    Only triggers for High-Confidence (>= 0.5) or Verified traffic.
    """
    if not settings.SLACK_VISIT_WEBHOOK_URL:
        return

    confidence = visit_data.get("confidence_score", 0.0)
    if confidence < 0.5 and not visit_data.get("is_verified", False):
        logger.info(f"🤫 Noise Suppression: Skip Slack for {visit_data.get('aura_id', 'UNKNOWN')[:8]} (Score: {confidence})")
        return

    client_id = visit_data.get("client_id")
    company_id = visit_data.get("company_id")
    
    if client_id and company_id:
        if await is_slack_notification_throttled(UUID(str(client_id)), UUID(str(company_id))):
            logger.info(f"🔇 Slack Notification Throttled for company_id: {company_id}")
            return

    cluster_count = journey.get("cluster_count", 1)
    is_corporate_cluster = cluster_count >= 3
    
    # Industrial Visual Indicators: Clean & Clinical
    emoji = "🏢" if is_corporate_cluster else "🏭"
    header = f"{emoji} Corporate Cluster" if is_corporate_cluster else f"{emoji} Industrial Facility"

    airtable_base = getattr(settings, "AIRTABLE_BASE_ID", "")
    notion_db = getattr(settings, "NOTION_DATABASE_ID", "")
    
    airtable_url = f"https://airtable.com/{airtable_base}" if airtable_base else "#"
    notion_url = f"https://www.notion.so/{notion_db}" if notion_db else "#"

    # External lookups
    company_name = visit_data.get('company_name', 'Anonymous Entity')
    domain = visit_data.get('domain', '')
    website_url = f"http://{domain}" if domain else "#"
    linkedin_url = f"https://www.linkedin.com/search/results/companies/?keywords={urllib.parse.quote(company_name)}"
    google_news_url = f"https://www.google.com/search?tbm=nws&q={urllib.parse.quote(company_name)}"
    external_links = f"<{website_url}|🌐 Website> | <{linkedin_url}|🔗 LinkedIn> | <{google_news_url}|📰 Google News>"

    payload = {
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": header}
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Entity:*\n{company_name}"},
                    {"type": "mrkdwn", "text": f"*Confidence:*\n`{int(confidence * 100)}%`"},
                    {"type": "mrkdwn", "text": f"*Attribution:*\n{visit_data.get('utm_source', 'Direct')} / {visit_data.get('utm_medium', 'None')}"},
                    {"type": "mrkdwn", "text": f"*Intent Score:*\n{journey.get('intent_score', 'Audit Pending')}"},
                    {"type": "mrkdwn", "text": f"*External Lookups:*\n{external_links}"}
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

    client_id = lead_data.get("client_id")
    company_id = lead_data.get("company_id")
    
    if client_id and company_id:
        if await is_slack_notification_throttled(UUID(str(client_id)), UUID(str(company_id))):
            logger.info(f"🔇 Slack Notification Throttled for company_id: {company_id}")
            return

    journey = journey or {}
    status_emoji = "💎"
    notion_db = getattr(settings, "NOTION_DATABASE_ID", "")
    notion_url = f"https://www.notion.so/{notion_db}" if notion_db else "#"

    # External lookups
    company_name = lead_data.get("company_name_final") or lead_data.get("company_name") or "Anonymous Entity"
    domain = lead_data.get("website") or ""
    website_url = f"http://{domain}" if domain and not domain.startswith("http") else domain or "#"
    linkedin_url = f"https://www.linkedin.com/search/results/companies/?keywords={urllib.parse.quote(company_name)}"
    google_news_url = f"https://www.google.com/search?tbm=nws&q={urllib.parse.quote(company_name)}"
    external_links = f"<{website_url}|🌐 Website> | <{linkedin_url}|🔗 LinkedIn> | <{google_news_url}|📰 Google News>"

    payload = {
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": f"{status_emoji} Identity Promoted"}
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Entity:*\n{company_name}"},
                    {"type": "mrkdwn", "text": f"*Lead:*\n{lead_data.get('name')} ({lead_data.get('email')})"},
                    {"type": "mrkdwn", "text": f"*Capture Source:*\n`{lead_data.get('capture_source', 'Verification')}`"},
                    {"type": "mrkdwn", "text": f"*Pathway:*\n{journey.get('pathway', 'Direct Entry')}"},
                    {"type": "mrkdwn", "text": f"*External Lookups:*\n{external_links}"}
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

async def handle_juristic_only_alert(company, journey: dict, client_id: str):
    """
    Alerts Slack when high-intent juristic visitor leaves the site (no personal data).
    """
    webhook_url = settings.SLACK_WEBHOOK_URL or settings.SLACK_VISIT_WEBHOOK_URL
    if not webhook_url:
        return

    if client_id and company.id:
        if await is_slack_notification_throttled(UUID(str(client_id)), UUID(str(company.id))):
            logger.info(f"🔇 Slack Notification Throttled for company_id: {company.id}")
            return

    # External lookups
    company_name = company.company_name
    domain = company.domain or ""
    website_url = f"http://{domain}" if domain else "#"
    linkedin_url = f"https://www.linkedin.com/search/results/companies/?keywords={urllib.parse.quote(company_name)}"
    google_news_url = f"https://www.google.com/search?tbm=nws&q={urllib.parse.quote(company_name)}"
    external_links = f"<{website_url}|🌐 Website> | <{linkedin_url}|🔗 LinkedIn> | <{google_news_url}|📰 Google News>"

    payload = {
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "🏢 Juristic Intent Detected"}
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Entity:*\n{company_name}"},
                    {"type": "mrkdwn", "text": f"*Domain:*\n{domain}"},
                    {"type": "mrkdwn", "text": f"*Industry:*\n{company.industry or 'Industrial'}"},
                    {"type": "mrkdwn", "text": f"*Pathway:*\n{journey.get('pathway', 'Direct')}"},
                    {"type": "mrkdwn", "text": f"*External Lookups:*\n{external_links}"}
                ]
            },
            {
                "type": "context",
                "elements": [
                    {"type": "mrkdwn", "text": f"📍 Forensic Audit: `{journey.get('intent_summary', '')[:200]}`"}
                ]
            }
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(webhook_url, json=payload, timeout=10.0)
            response.raise_for_status()
        except Exception as e:
            logger.error(f"🚨 Juristic Alert Slack Dispatch Failure: {e}")