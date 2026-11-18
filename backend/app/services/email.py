# backend/app/services/email.py
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from uuid import UUID
import httpx
from sqlmodel import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings

logger = logging.getLogger("auraworks.email")

import base64

async def send_resend_email(
    to_email: str, 
    subject: str, 
    html_content: str,
    attachment_bytes: Optional[bytes] = None,
    filename: Optional[str] = None,
    bypass_filter: bool = False
) -> bool:
    """
    Dispatches outbound email notifications using Resend's REST API.
    Asynchronous implementation ensures waitlist route submission stays fast.
    """
    if not to_email:
        return False
        
    lower_email = to_email.lower()
    blocked_keywords = [
        "fake", "spam", "dummy", 
        "localhost", "foo.com", "bar.com", "unknown@"
    ]
    if not bypass_filter and getattr(settings, "ENVIRONMENT", "") not in ["test", "testing"]:
        blocked_keywords.extend(["test", "example"])

    if not bypass_filter and any(keyword in lower_email for keyword in blocked_keywords):
        logger.info(f"🚫 Email dispatch skipped for test/blocked address: {to_email}")
        return False

    if not settings.RESEND_API_KEY:
        logger.error("Resend delivery failed: RESEND_API_KEY is not configured in settings.")
        return False

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "from": settings.RESEND_FROM_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }
    if attachment_bytes and filename:
        payload["attachments"] = [
            {
                "content": base64.b64encode(attachment_bytes).decode("utf-8"),
                "filename": filename
            }
        ]

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            
            if response.status_code in [200, 201]:
                data = response.json()
                logger.info(f"Waitlist confirmation email sent successfully. Resend ID: {data.get('id')}")
                return True
            else:
                logger.error(f"Resend rejected payload with status {response.status_code}: {response.text}")
                return False
                
    except httpx.RequestError as exc:
        logger.error(f"Network error trying to connect to Resend endpoint: {exc}")
        return False


async def send_prospect_success_email(
    recipient_email: str,
    recipient_name: Optional[str] = None,
    calendly_link: Optional[str] = None
) -> bool:
    """
    Sends a premium demo onboarding confirmation email to prospects.
    Introduces AuraWorks' Identity Resolution engine and requests booking.
    """
    subject = "Confirm Your AuraWorks Demo & Onboarding"
    
    greeting = f"Hello {recipient_name}," if recipient_name else "Hello,"
    link = calendly_link or getattr(settings, "BOOKING_LINK", None) or settings.CALENDLY_LINK or "https://cal.com/reitumetse-sethabela/30min"
    
    # Premium minimalist design framework matching a professional brand layout
    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa; color: #1a1a1a; margin: 0; padding: 40px; }}
            .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 4px; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); }}
            .brand {{ font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #737373; margin-bottom: 32px; }}
            .greeting {{ font-size: 15px; font-weight: 500; margin-bottom: 16px; color: #171717; }}
            .body-text {{ font-size: 14px; line-height: 1.6; color: #404040; margin-bottom: 24px; }}
            .cta-container {{ margin: 32px 0; text-align: left; }}
            .cta-button {{ display: inline-block; font-size: 13px; font-weight: 600; color: #ffffff !important; background: #000000; padding: 12px 24px; text-decoration: none; border-radius: 4px; letter-spacing: 0.05em; }}
            .cta-button:hover {{ background: #262626; }}
            .status-tag {{ display: inline-block; font-size: 12px; font-family: monospace; background: #f4f4f5; color: #18181b; padding: 6px 12px; border-radius: 2px; margin-bottom: 24px; font-weight: 500; }}
            .footer {{ border-top: 1px solid #f3f3f3; padding-top: 24px; font-size: 11px; color: #a3a3a3; letter-spacing: 0.05em; line-height: 1.5; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="brand">AuraWorks Industrial Intelligence</div>
            <div class="greeting">{greeting}</div>
            
            <div class="body-text">
                Thank you for requesting a demonstration of AuraWorks. Your inquiry has been securely registered in our system.
            </div>
            
            <div class="status-tag">STATUS: DEMO_REQUESTED</div>
            
            <div class="body-text">
                AuraWorks specializes in industrial-grade <strong>Identity Resolution</strong>, bridging the gap between anonymous traffic and verified operational profiles to reveal hidden demand.
            </div>

            <div class="body-text">
                To proceed with your demo, please select a convenient timeframe for your onboarding call with our technical engineering team:
            </div>

            <div class="cta-container">
                <a href="{link}" class="cta-button" target="_blank">Book Onboarding Session</a>
            </div>

            <div class="body-text">
                If you have any questions before our session, simply reply directly to this email to contact our team.
            </div>
            
            <div class="footer">
                This is an automated demo onboarding dispatch.<br>
                AuraWorks (Pty) Ltd &bull; Where presence meets performance.
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_resend_email(
        to_email=recipient_email,
        subject=subject,
        html_content=html_template
    )


async def send_prospect_recovery_email(
    recipient_email: str,
    recipient_name: Optional[str] = None,
    booking_link: Optional[str] = None
) -> bool:
    """
    Sends an executive lead-recovery email to prospects who signed the form but
    encountered an invalid/broken 404 scheduling link.
    """
    subject = "Updated Scheduling Link: Your AuraWorks Technical Strategy Session"
    
    greeting = f"Hello {recipient_name}," if recipient_name else "Hello,"
    link = booking_link or getattr(settings, "BOOKING_LINK", None) or settings.CALENDLY_LINK or "https://cal.com/reitumetse-sethabela/30min"
    
    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa; color: #1a1a1a; margin: 0; padding: 40px; }}
            .card {{ max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 6px; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); }}
            .brand {{ font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #737373; margin-bottom: 28px; }}
            .greeting {{ font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #171717; }}
            .body-text {{ font-size: 14px; line-height: 1.65; color: #404040; margin-bottom: 20px; }}
            .highlight-box {{ background: #f9fafb; border-left: 3px solid #18181b; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #374151; line-height: 1.5; }}
            .cta-container {{ margin: 32px 0; text-align: left; }}
            .cta-button {{ display: inline-block; font-size: 13px; font-weight: 600; color: #ffffff !important; background: #000000; padding: 13px 26px; text-decoration: none; border-radius: 4px; letter-spacing: 0.05em; }}
            .cta-button:hover {{ background: #262626; }}
            .status-tag {{ display: inline-block; font-size: 11px; font-family: monospace; background: #fef3c7; color: #92400e; padding: 5px 10px; border-radius: 3px; margin-bottom: 20px; font-weight: 600; }}
            .agenda-list {{ margin: 16px 0; padding-left: 20px; font-size: 13px; color: #4b5563; line-height: 1.7; }}
            .footer {{ border-top: 1px solid #f3f3f3; padding-top: 24px; font-size: 11px; color: #a3a3a3; letter-spacing: 0.05em; line-height: 1.6; margin-top: 32px; }}
            .signature {{ margin-top: 24px; font-size: 14px; color: #1f2937; line-height: 1.5; }}
            .signature strong {{ color: #111827; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="brand">AuraWorks Industrial Intelligence</div>
            <div class="status-tag">PRIORITY ACTION: SCHEDULE ONBOARDING</div>
            <div class="greeting">{greeting}</div>
            
            <div class="body-text">
                Thank you for recently requesting an onboarding demonstration and technical walk-through with AuraWorks.
            </div>

            <div class="highlight-box">
                <strong>Notice regarding your scheduling link:</strong> We identified that our previous calendar booking link was temporarily returning a 404 error, which may have prevented you from finalizing your session on our calendar. We apologize for the inconvenience and have migrated to our verified calendar system.
            </div>
            
            <div class="body-text">
                To ensure you receive your technical discovery session and discoverability audit, please use our direct calendar link below to select a date and time that suits your availability:
            </div>

            <div class="cta-container">
                <a href="{link}" class="cta-button" target="_blank">Select Your Time Slot &rarr;</a>
            </div>

            <div class="body-text">
                During this 15–30 minute engineering walkthrough, we will examine:
            </div>
            <ul class="agenda-list">
                <li><strong>Search &amp; AI Visibility:</strong> Your domain&rsquo;s current organic positioning and citability across Google and AI search engines.</li>
                <li><strong>B2B Traffic Unmasking:</strong> How our POPIA-compliant engine identifies anonymous corporate visitors from industrial and mining clusters.</li>
                <li><strong>Operational Cashflow:</strong> Workflows to convert unmasked corporate interest into qualified sales pipeline.</li>
            </ul>

            <div class="body-text">
                If you prefer to coordinate a time directly or have urgent questions, simply reply directly to this email.
            </div>

            <div class="signature">
                Best regards,<br>
                <strong>Reitumetse Sethabela</strong><br>
                Founder &amp; Systems Architect &bull; AuraWorks (Pty) Ltd<br>
                <a href="mailto:reitumetse@auraworks.co.za" style="color: #6b7280; text-decoration: none;">reitumetse@auraworks.co.za</a>
            </div>
            
            <div class="footer">
                AuraWorks (Pty) Ltd &bull; Industrial Intelligence Engine<br>
                South Africa &bull; Private &amp; Confidential
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_resend_email(
        to_email=recipient_email,
        subject=subject,
        html_content=html_template
    )


async def recover_prospect_leads(
    session: AsyncSession,
    booking_link: Optional[str] = None,
    client_id: Optional[UUID] = None,
    only_unbooked: bool = True,
    dry_run: bool = False,
    days_back: Optional[int] = None,
    limit: Optional[int] = None
) -> Dict[str, Any]:
    """
    Recovers prospects from the database whose demo/audit booking may have failed
    due to a broken 404 scheduling link.
    """
    from app.models.prospect import Prospect

    target_link = booking_link or getattr(settings, "BOOKING_LINK", None) or settings.CALENDLY_LINK or "https://cal.com/reitumetse-sethabela/30min"

    stmt = select(Prospect)
    if client_id:
        stmt = stmt.where(Prospect.client_id == client_id)

    if only_unbooked:
        stmt = stmt.where(
            or_(
                Prospect.status != "call_booked",
                Prospect.status.is_(None),
                Prospect.calendly_event_uuid.is_(None)
            )
        )

    if days_back:
        threshold = datetime.now(timezone.utc) - timedelta(days=days_back)
        stmt = stmt.where(Prospect.created_at >= threshold)

    stmt = stmt.order_by(Prospect.created_at.desc())
    if limit:
        stmt = stmt.limit(limit)

    result = await session.execute(stmt)
    prospects = result.scalars().all()

    sent_count = 0
    failed_count = 0
    skipped_count = 0
    details = []

    for p in prospects:
        # Filter invalid or synthetic addresses
        if not p.email or "@" not in p.email or p.email.endswith("@unverified.aura"):
            skipped_count += 1
            details.append({"id": str(p.id), "email": p.email, "status": "skipped", "reason": "invalid_or_placeholder_email"})
            continue

        if dry_run:
            sent_count += 1
            details.append({"id": str(p.id), "email": p.email, "name": p.name, "status": "dry_run_ready"})
            continue

        try:
            success = await send_prospect_recovery_email(
                recipient_email=p.email,
                recipient_name=p.name,
                booking_link=target_link
            )
            if success:
                sent_count += 1
                p.welcome_email_sent = True
                p.updated_at = datetime.now(timezone.utc)
                session.add(p)
                details.append({"id": str(p.id), "email": p.email, "name": p.name, "status": "sent"})
            else:
                failed_count += 1
                details.append({"id": str(p.id), "email": p.email, "name": p.name, "status": "delivery_failed"})
        except Exception as e:
            failed_count += 1
            logger.error(f"Error recovering lead {p.email}: {e}")
            details.append({"id": str(p.id), "email": p.email, "name": p.name, "status": "error", "error": str(e)})

    if not dry_run and sent_count > 0:
        await session.commit()

    return {
        "total_candidates": len(prospects),
        "sent": sent_count,
        "failed": failed_count,
        "skipped": skipped_count,
        "dry_run": dry_run,
        "booking_link": target_link,
        "details": details
    }


async def send_inbound_auto_reply(to_email: str, recipient_alias: str) -> bool:
    """
    Sends an immediate contextual auto-reply based on the recipient alias.
    Prevents infinite email loops.
    """
    sender_lower = to_email.lower()
    loop_indicators = [
        "legal@auraworks.co.za",
        "privacy@auraworks.co.za",
        "customer@auraworks.co.za",
        "noreply",
        "no-reply",
        "mailer-daemon",
        "bounce",
        "postmaster"
    ]
    if any(indicator in sender_lower for indicator in loop_indicators):
        logger.info(f"🚫 Auto-reply skipped for {to_email} to prevent infinite loops.")
        return False

    recipient_alias_lower = recipient_alias.lower()
    if "privacy" in recipient_alias_lower:
        subject = "We have received your inquiry regarding data privacy"
        message_text = "We have received your inquiry regarding data privacy. Our Information Officer will review your request and respond shortly."
    elif "legal" in recipient_alias_lower:
        subject = "We have received your legal inquiry"
        message_text = "We have received your legal inquiry. Our compliance team will review your request and respond shortly."
    else:
        subject = "We have received your inquiry"
        message_text = "We have received your inquiry. Our support team will review your request and respond shortly."

    # Premium minimalist design framework
    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa; color: #1a1a1a; margin: 0; padding: 40px; }}
            .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 4px; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); }}
            .brand {{ font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #737373; margin-bottom: 32px; }}
            .greeting {{ font-size: 15px; font-weight: 500; margin-bottom: 16px; color: #171717; }}
            .body-text {{ font-size: 14px; line-height: 1.6; color: #404040; margin-bottom: 24px; }}
            .footer {{ border-top: 1px solid #f3f3f3; padding-top: 24px; font-size: 11px; color: #a3a3a3; letter-spacing: 0.05em; line-height: 1.5; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="brand">AuraWorks Correspondence</div>
            <div class="greeting">Hello,</div>
            <div class="body-text">
                {message_text}
            </div>
            <div class="footer">
                AuraWorks (Pty) Ltd &bull; Where presence meets performance.
            </div>
        </div>
    </body>
    </html>
    """

    return await send_resend_email(
        to_email=to_email,
        subject=subject,
        html_content=html_template
    )

from uuid import UUID

async def send_trial_warning_email(recipient_email: str, client_id: UUID) -> bool:
    """
    Sends a warning email to clients exactly 48 hours before their free trial expires,
    notifying them of the upcoming automated billing.
    Provides a retention gate cancellation link.
    """
    subject = "Important: Your AuraWorks Free Trial is Expiring in 48 Hours"
    cancel_link = f"http://localhost:3000/cancel-request?client_id={client_id}"
    
    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa; color: #1a1a1a; margin: 0; padding: 40px; }}
            .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 4px; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); }}
            .brand {{ font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #737373; margin-bottom: 32px; }}
            .greeting {{ font-size: 15px; font-weight: 500; margin-bottom: 16px; color: #171717; }}
            .body-text {{ font-size: 14px; line-height: 1.6; color: #404040; margin-bottom: 24px; }}
            .cta-container {{ margin: 32px 0; text-align: left; }}
            .cta-button {{ display: inline-block; font-size: 13px; font-weight: 600; color: #ef4444 !important; background: #fee2e2; border: 1px solid #fca5a5; padding: 12px 24px; text-decoration: none; border-radius: 4px; letter-spacing: 0.05em; }}
            .cta-button:hover {{ background: #fecaca; }}
            .status-tag {{ display: inline-block; font-size: 12px; font-family: monospace; background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 2px; margin-bottom: 24px; font-weight: 500; }}
            .footer {{ border-top: 1px solid #f3f3f3; padding-top: 24px; font-size: 11px; color: #a3a3a3; letter-spacing: 0.05em; line-height: 1.5; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="brand">AuraWorks Account Billing</div>
            <div class="greeting">Hello,</div>
            
            <div class="body-text">
                This email is to notify you that your 14-day free trial of AuraWorks is expiring in 48 hours.
            </div>
            
            <div class="status-tag">STATUS: TRIAL_EXPIRING_WARNING</div>
            
            <div class="body-text">
                If you choose to continue unmasking high-value industrial traffic, no action is required on your part. Your card on file will be automatically charged in 48 hours for your chosen plan.
            </div>

            <div class="body-text">
                If you wish to cancel your subscription, please submit a cancellation request below:
            </div>

            <div class="cta-container">
                <a href="{cancel_link}" class="cta-button" target="_blank">Request Subscription Cancellation</a>
            </div>
            
            <div class="footer">
                AuraWorks (Pty) Ltd &bull; Where presence meets performance.
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_resend_email(
        to_email=recipient_email,
        subject=subject,
        html_content=html_template
    )