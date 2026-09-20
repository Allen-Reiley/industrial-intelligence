# backend/app/services/notifications.py
import logging
import httpx
import urllib.parse
from datetime import datetime, timedelta, timezone
from uuid import UUID
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

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

async def post_to_slack(prospect_data: dict, journey: dict = None, client_id: Optional[UUID] = None):
    """
    Standard lead notification for identified conversions (Promotion / Form Submission).
    Structures firmographic and forensic profile data clearly.
    """
    if not client_id:
        client_id_raw = prospect_data.get("client_id")
        if client_id_raw:
            client_id = UUID(str(client_id_raw))

    webhook_url = None
    if client_id and async_session_maker:
        from app.models.client import Client
        async with async_session_maker() as session:
            client = await session.get(Client, client_id)
            if client and client.slack_webhook_url:
                webhook_url = client.slack_webhook_url

    if not webhook_url:
        webhook_url = settings.SLACK_WEBHOOK_URL

    if not webhook_url:
        return

    company_id = prospect_data.get("company_id")
    
    if client_id and company_id:
        if await is_slack_notification_throttled(client_id, UUID(str(company_id))):
            logger.info(f"🔇 Slack Notification Throttled for company_id: {company_id}")
            return

    journey = journey or {}
    status_emoji = "💎"
    notion_db = getattr(settings, "NOTION_DATABASE_ID", "")
    notion_url = f"https://www.notion.so/{notion_db}" if notion_db else "#"

    # External lookups
    company_name = prospect_data.get("company_name_final") or prospect_data.get("company_name") or "Anonymous Entity"
    domain = prospect_data.get("website") or ""
    website_url = f"http://{domain}" if domain and not domain.startswith("http") else domain or "#"
    linkedin_url = f"https://www.linkedin.com/search/results/companies/?keywords={urllib.parse.quote(company_name)}"
    google_news_url = f"https://www.google.com/search?tbm=nws&q={urllib.parse.quote(company_name)}"
    external_links = f"<{website_url}|🌐 Website> | <{linkedin_url}|🔗 LinkedIn> | <{google_news_url}|📰 Google News>"

    fields = [
        {"type": "mrkdwn", "text": f"*Entity:*\n{company_name}"},
        {"type": "mrkdwn", "text": f"*Lead:*\n{prospect_data.get('name') or 'N/A'} ({prospect_data.get('email')})"},
        {"type": "mrkdwn", "text": f"*Role / Dept:*\n{prospect_data.get('position', 'Evaluator')} / {prospect_data.get('department', 'Undetermined')}"},
        {"type": "mrkdwn", "text": f"*Firmographics:*\nInd: {prospect_data.get('industry', 'Industrial')} | Traffic: {prospect_data.get('traffic', 'N/A')}"},
        {"type": "mrkdwn", "text": f"*ZAR Value:*\n{prospect_data.get('avg_price', 'N/A')}"},
        {"type": "mrkdwn", "text": f"*Capture Source:*\n`{prospect_data.get('capture_source', 'Verification')}`"},
        {"type": "mrkdwn", "text": f"*Pathway:*\n{journey.get('pathway', 'Direct Entry')}"},
        {"type": "mrkdwn", "text": f"*External Lookups:*\n{external_links}"}
    ]

    payload = {
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": f"{status_emoji} Identity Promoted"}
            },
            {
                "type": "section",
                "fields": fields
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
    
    async with httpx.AsyncClient() as http_client:
        try:
            response = await http_client.post(webhook_url, json=payload, timeout=10.0)
            response.raise_for_status()
        except Exception as e:
            logger.error(f"Lead Channel Dispatch Failure: {e}")


async def post_meeting_booked_to_slack(prospect_id: UUID, webhook_payload: dict):
    """
    Formulates and posts a Slack notification when a prospect books a Calendly call.
    Translates meeting times into SAST (UTC+2) and includes full firmographic context.
    """
    if not settings.SLACK_WEBHOOK_URL:
        return
        
    if not async_session_maker:
        logger.error("❌ post_meeting_booked_to_slack: Async Session Maker offline.")
        return

    from app.models import Prospect, Company
    from app.services.intelligence import get_visitor_journey

    async with async_session_maker() as session:
        try:
            prospect = await session.get(Prospect, prospect_id)
            if not prospect:
                logger.error(f"❌ post_meeting_booked_to_slack: Prospect {prospect_id} not found.")
                return

            company_name = "Anonymous Entity"
            domain = prospect.website or ""
            industry = prospect.industry or "Industrial"
            if prospect.company_id:
                company = await session.get(Company, prospect.company_id)
                if company:
                    company_name = company.company_name
                    domain = company.domain or domain
                    industry = company.industry or industry
            elif prospect.company_name_raw:
                company_name = prospect.company_name_raw

            # Extract invitee/meeting details from Calendly payload
            payload_data = webhook_payload.get("payload", {})
            event_name = payload_data.get("scheduled_event", {}).get("name", "Demo & Onboarding")
            
            # Format timeframes to SAST (UTC+2)
            start_utc = payload_data.get("scheduled_event", {}).get("start_time")
            end_utc = payload_data.get("scheduled_event", {}).get("end_time")
            
            sast_timeframe = "Scheduling Context TBD"
            if start_utc and end_utc:
                try:
                    start_dt = datetime.fromisoformat(start_utc.replace("Z", "+00:00"))
                    end_dt = datetime.fromisoformat(end_utc.replace("Z", "+00:00"))
                    sast_timezone = timezone(timedelta(hours=2))
                    start_sast = start_dt.astimezone(sast_timezone)
                    end_sast = end_dt.astimezone(sast_timezone)
                    
                    sast_timeframe = f"{start_sast.strftime('%Y-%m-%d %H:%M')} - {end_sast.strftime('%H:%M')} SAST"
                except Exception as ex:
                    logger.error(f"Error converting Calendly time to SAST: {ex}")
                    sast_timeframe = f"{start_utc} - {end_utc} UTC"

            # Location / Join Link
            location_data = payload_data.get("scheduled_event", {}).get("location", {})
            join_url = location_data.get("join_url") or "TBD"

            # External lookups
            website_url = f"http://{domain}" if domain and not domain.startswith("http") else domain or "#"
            linkedin_url = f"https://www.linkedin.com/search/results/companies/?keywords={urllib.parse.quote(company_name)}"
            google_news_url = f"https://www.google.com/search?tbm=nws&q={urllib.parse.quote(company_name)}"
            external_links = f"<{website_url}|🌐 Website> | <{linkedin_url}|🔗 LinkedIn> | <{google_news_url}|📰 Google News>"

            # Journey/forensics fallback
            journey = {}
            if prospect.aura_id:
                try:
                    journey = await get_visitor_journey(prospect.aura_id, session)
                except Exception:
                    pass

            location_str = f"Location: {journey.get('city', 'Unknown')}, {journey.get('region', 'ZA')}" if journey else "Location: Unknown"

            payload = {
                "blocks": [
                    {
                        "type": "header",
                        "text": {"type": "plain_text", "text": "📅 Meeting Booked"}
                    },
                    {
                        "type": "section",
                        "fields": [
                            {"type": "mrkdwn", "text": f"*Entity:*\n{company_name}"},
                            {"type": "mrkdwn", "text": f"*Prospect:*\n{prospect.name or 'N/A'} ({prospect.email})"},
                            {"type": "mrkdwn", "text": f"*SAST Timeframe:*\n`{sast_timeframe}`"},
                            {"type": "mrkdwn", "text": f"*Meeting Type:*\n{event_name}"},
                            {"type": "mrkdwn", "text": f"*Role / Dept:*\n{prospect.position or 'Evaluator'} / {prospect.department or 'Undetermined'}"},
                            {"type": "mrkdwn", "text": f"*Firmographics:*\nInd: {industry} | Traffic: {prospect.traffic or 'N/A'}"},
                            {"type": "mrkdwn", "text": f"*Join Link:*\n<{join_url}|Join Call>" if join_url != "TBD" else "*Join Link:*\nTBD"},
                            {"type": "mrkdwn", "text": f"*External Lookups:*\n{external_links}"}
                        ]
                    },
                    {
                        "type": "context",
                        "elements": [
                            {"type": "mrkdwn", "text": f"📍 Forensic Lock: `{prospect.aura_id or 'UNKNOWN'}` | {location_str}"}
                        ]
                    }
                ]
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(settings.SLACK_WEBHOOK_URL, json=payload, timeout=10.0)
                response.raise_for_status()
                logger.info(f"Slack notification sent successfully for booked meeting (Prospect ID: {prospect_id}).")
        except Exception as e:
            logger.error(f"🚨 post_meeting_booked_to_slack Failure: {e}")

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


async def post_inbound_email_to_slack(
    inbound_msg_id: UUID,
    sender_email: str,
    recipient_alias: str,
    subject: str,
    body: str
):
    """
    Routes an incoming message to distinct Slack channels based on the receiving alias:
    - legal@ and privacy@ -> #compliance channel.
    - customer@ -> #support channel.
    """
    recipient_alias_lower = recipient_alias.lower()
    
    if "legal" in recipient_alias_lower or "privacy" in recipient_alias_lower:
        webhook_url = settings.SLACK_COMPLIANCE_WEBHOOK_URL or settings.SLACK_WEBHOOK_URL
        channel_name = "#compliance"
    elif "customer" in recipient_alias_lower:
        webhook_url = settings.SLACK_SUPPORT_WEBHOOK_URL or settings.SLACK_WEBHOOK_URL
        channel_name = "#support"
    else:
        webhook_url = settings.SLACK_WEBHOOK_URL
        channel_name = "#general"
        
    if not webhook_url:
        logger.warning("Slack Dispatcher: No webhook URL configured for inbound email alerts.")
        return

    snippet = body[:150] + "..." if len(body) > 150 else body
    dashboard_url = f"https://auraworks.co.za/admin/tickets/{inbound_msg_id}"
    
    payload = {
        "text": f"New Inbound Email to {recipient_alias}",
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": f"✉️ New Inbound Message ({channel_name})"}
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Sender:*\n{sender_email}"},
                    {"type": "mrkdwn", "text": f"*Alias Emailed:*\n{recipient_alias}"},
                    {"type": "mrkdwn", "text": f"*Subject:*\n{subject}"}
                ]
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Snippet:*\n{snippet}"
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "View Thread in Dashboard"},
                        "url": dashboard_url,
                        "style": "primary"
                    }
                ]
            }
        ]
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(webhook_url, json=payload, timeout=10.0)
            response.raise_for_status()
            logger.info(f"Slack notification sent successfully for inbound email (ID: {inbound_msg_id}).")
        except Exception as e:
            logger.error(f"🚨 Inbound Email Slack Dispatch Failure: {e}")


async def post_vsl_completion_to_slack(company_name: str, client_id: UUID, aura_id: str):
    """
    Alerts the prospects Slack channel when a known company completes watching the VSL.
    """
    if not settings.SLACK_WEBHOOK_URL:
        return
        
    dashboard_url = f"https://auraworks.co.za/admin/prospects?aura_id={aura_id}"

    payload = {
        "text": f"🔥 VSL Completed: {company_name}",
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "🔥 High Intent Activity"}
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*High Intent:* *{company_name}* just finished watching the core VSL."
                }
            },
            {
                "type": "context",
                "elements": [
                    {"type": "mrkdwn", "text": f"📍 Forensic Lock: `{aura_id}` | Client ID: `{client_id}`"}
                ]
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "View Prospect Details"},
                        "url": dashboard_url,
                        "style": "primary"
                    }
                ]
            }
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(settings.SLACK_WEBHOOK_URL, json=payload, timeout=10.0)
            response.raise_for_status()
            logger.info(f"VSL completion Slack alert successfully sent for company: {company_name}")
        except Exception as e:
            logger.error(f"🚨 post_vsl_completion_to_slack Failure: {e}")


async def post_surge_alert_to_slack(company_name: str, client_id: UUID, company_id: UUID, unique_visitor_count: int):
    """
    Alerts the Slack channel when an Account Surge is detected for a company.
    Enforces a 1-hour throttle per company to prevent duplicate alerts.
    """
    if not settings.SLACK_WEBHOOK_URL:
        return

    # Check and apply throttle (1 hour throttle per client/company)
    throttled = await is_slack_notification_throttled(client_id, company_id)
    if throttled:
        logger.info(f"⏭️ Surge alert throttled for company: {company_name}")
        return

    dashboard_url = f"https://auraworks.co.za/admin/companies?id={company_id}"

    payload = {
        "text": f"🚨 Account Surge: {company_name}",
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "⚡ Account Surge Detected"}
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Account Surge:* *{company_name}* has demonstrated high concentrated intent.\n*Intent Density:* *{unique_visitor_count}* unique individuals identified visiting within the last 72 hours."
                }
            },
            {
                "type": "context",
                "elements": [
                    {"type": "mrkdwn", "text": f"🏢 Company ID: `{company_id}` | Client ID: `{client_id}`"}
                ]
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "View Company Activity"},
                        "url": dashboard_url,
                        "style": "primary"
                    }
                ]
            }
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(settings.SLACK_WEBHOOK_URL, json=payload, timeout=10.0)
            response.raise_for_status()
            logger.info(f"⚡ Surge Slack alert successfully sent for company: {company_name}")
        except Exception as e:
            logger.error(f"🚨 post_surge_alert_to_slack Failure: {e}")


async def check_and_trigger_company_surge(company_id: UUID, client_id: UUID, session: AsyncSession):
    """
    Monitors cluster density for a company. If 3 or more unique visitors (aura_id values)
    from the same company are identified within the last 72 hours, triggers an immediate
    surge Slack alert.
    """
    from datetime import datetime, timezone, timedelta
    from app.models.visit import Visit
    from app.models.company import Company
    from sqlmodel import select
    from sqlalchemy import func

    # Calculate 72 hours window
    time_offset = datetime.now(timezone.utc) - timedelta(hours=72)

    # Query unique visitor counts
    stmt = select(func.count(func.distinct(Visit.aura_id))).where(
        Visit.company_id == company_id,
        Visit.client_id == client_id,
        Visit.created_at >= time_offset
    )
    res = await session.execute(stmt)
    unique_visitors = res.scalar() or 0

    if unique_visitors >= 3:
        company = await session.get(Company, company_id)
        if company:
            # Trigger Slack alert
            await post_surge_alert_to_slack(
                company_name=company.company_name,
                client_id=client_id,
                company_id=company_id,
                unique_visitor_count=unique_visitors
            )


async def post_cancellation_pending_to_slack(client_id: UUID, company_name: str):
    """
    Pings the support Slack channel notifying that a client has requested cancellation.
    """
    webhook_url = settings.SLACK_SUPPORT_WEBHOOK_URL or settings.SLACK_WEBHOOK_URL
    if not webhook_url:
        logger.warning("Slack webhook url not configured, skipping cancellation ping.")
        return
        
    payload = {
        "text": f"⚠️ Cancellation Requested: {company_name}",
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "⚠️ Retention Alert: Cancellation Requested"}
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Retention Action Required:* Client *{company_name}* has requested subscription cancellation."
                }
            },
            {
                "type": "context",
                "elements": [
                    {"type": "mrkdwn", "text": f"Client ID: `{client_id}`"}
                ]
            }
        ]
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(webhook_url, json=payload, timeout=10.0)
            response.raise_for_status()
            logger.info(f"Cancellation alert successfully posted to Slack for client {client_id}")
        except Exception as e:
            logger.error(f"🚨 post_cancellation_pending_to_slack Failure: {e}")