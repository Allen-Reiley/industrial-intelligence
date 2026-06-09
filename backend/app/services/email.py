# backend/app/services/email.py
import logging
from typing import Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("auraworks.email")

import base64

async def send_resend_email(
    to_email: str, 
    subject: str, 
    html_content: str,
    attachment_bytes: Optional[bytes] = None,
    filename: Optional[str] = None
) -> bool:
    """
    Dispatches outbound email notifications using Resend's REST API.
    Asynchronous implementation ensures waitlist route submission stays fast.
    """
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
    link = calendly_link or settings.CALENDLY_LINK
    
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