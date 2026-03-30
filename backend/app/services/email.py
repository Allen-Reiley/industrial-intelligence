import resend
from app.core.config import settings
import logging

logger = logging.getLogger("uvicorn")

# Initialize Resend
resend.api_key = settings.RESEND_API_KEY

def send_welcome_email(to_email: str, first_name: str):
    """Sends the Phase 01: Audit Confirmation Email"""
    if not settings.RESEND_API_KEY:
        logger.warning("⚠️ Resend API Key missing. Email not sent.")
        return

    try:
        params = {
            "from": "AuraWorks <intelligence@auraworks.co.za>",
            "to": [to_email],
            "subject": "Phase 01: Audit Initiated",
            "html": f"""
                <div style="font-family: sans-serif; max-width: 600px; color: #1a1a1a;">
                    <h2 style="letter-spacing: -0.02em;">System Identity Verified</h2>
                    <p>Hello {first_name},</p>
                    <p>Your request for the 100-partner cohort has been received. We have initiated the <strong>Phase 01 Audit</strong> for your infrastructure.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 14px; color: #666;">
                        <em>Industrial Intelligence Engine | AuraWorks (Pty) Ltd</em>
                    </p>
                </div>
            """
        }
        resend.Emails.send(params)
        logger.info(f"📧 Welcome email dispatched to {to_email}")
    except Exception as e:
        logger.error(f"❌ Email failed: {str(e)}")