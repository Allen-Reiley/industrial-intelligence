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


async def send_waitlist_success_email(recipient_email: str, recipient_name: Optional[str] = None) -> bool:
    """
    Sends a premium confirmation message to users who join the waitlist.
    """
    subject = "Submission Received — AuraWorks Waitlist"
    
    greeting = f"Hello {recipient_name}," if recipient_name else "Hello,"
    
    # Premium minimalist design framework matching a professional brand layout
    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa; color: #1a1a1a; margin: 0; padding: 40px; }}
            .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 4px; padding: 40px; }}
            .brand {{ font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #737373; margin-bottom: 32px; }}
            .greeting {{ font-size: 15px; font-weight: 500; margin-bottom: 16px; color: #171717; }}
            .body-text {{ font-size: 14px; line-height: 1.6; color: #404040; margin-bottom: 32px; }}
            .status-tag {{ display: inline-block; font-size: 12px; font-family: monospace; background: #f4f4f5; color: #18181b; padding: 6px 12px; border-radius: 2px; margin-bottom: 32px; font-weight: 500; }}
            .footer {{ border-top: 1px solid #f3f3f3; padding-top: 24px; font-size: 11px; color: #a3a3a3; letter-spacing: 0.05em; line-height: 1.5; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="brand">AuraWorks Industrial Intelligence</div>
            <div class="greeting">{greeting}</div>
            
            <div class="body-text">
                Your entry has been securely captured by our waitlist registration system. We appreciate your interest in our business intelligence and performance solutions.
            </div>
            
            <div class="status-tag">STATUS: QUEUED_FOR_REVIEW</div>
            
            <div class="body-text">
                Our team monitors submissions on an ongoing basis. An operational specialist will reach out to your provided contact path shortly to discuss access parameters.
            </div>
            
            <div class="footer">
                This is an automated tracking update.<br>
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