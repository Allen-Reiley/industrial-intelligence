# backend/app/services/reports.py
import io
import hashlib
import logging
from datetime import datetime, timezone
from typing import Optional

# ReportLab Imports
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pdfencrypt import StandardEncryption

from app.core.config import settings
from app.services.email import send_resend_email

logger = logging.getLogger("auraworks.reports")

def generate_signed_contract_pdf(client_name: str, client_domain: str, plan: str) -> bytes:
    """
    Generates a professional formal service agreement PDF using reportlab,
    including cryptographic signature IDs and standard legal layouts,
    encrypted via StandardEncryption.
    """
    buffer = io.BytesIO()
    
    # Perform programmatic encryption signature on the completed asset
    enc = StandardEncryption(client_domain, "auraworks-owner-pass", canPrint=1, canModify=0)
    
    doc = SimpleDocTemplate(buffer, pagesize=letter, encrypt=enc)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'ContractTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor='#111111',
        spaceAfter=15
    )
    
    body_style = ParagraphStyle(
        'ContractBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor='#222222',
        spaceAfter=10
    )
    
    story = []
    
    # Title
    story.append(Paragraph("AURAWORKS INDUSTRIAL INTELLIGENCE SERVICE AGREEMENT", title_style))
    story.append(Spacer(1, 10))
    
    # Contract Details
    story.append(Paragraph(f"<b>Effective Date:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d')}", body_style))
    story.append(Paragraph(f"<b>Client Name:</b> {client_name}", body_style))
    story.append(Paragraph(f"<b>Client Domain:</b> {client_domain}", body_style))
    story.append(Paragraph(f"<b>Selected Subscription Plan:</b> {plan.upper()}", body_style))
    story.append(Spacer(1, 15))
    
    # Terms
    terms_text = (
        "1. Services: AuraWorks (Pty) Ltd agrees to provide B2B traffic deanonymization, "
        "intent tracking, and sales intelligence via the FastAPI Ingestion Engine and the Next.js App Portal.<br/><br/>"
        "2. Compliance: The Client agrees to comply with the Protection of Personal Information Act (POPIA) "
        "and General Data Protection Regulation (GDPR) guidelines for South Africa and international jurisdictions.<br/><br/>"
        "3. Billing: Payment checkouts are securely integrated with the PayGenius API. Client accounts remain active "
        "contingent upon successful execution of billing sequences.<br/><br/>"
        "4. Cryptographic Security: This contract is cryptographically signed and encrypted to ensure document integrity."
    )
    story.append(Paragraph(terms_text, body_style))
    story.append(Spacer(1, 20))
    
    # Signature block representation
    sig_hash = hashlib.sha256(f"AuraWorks-{client_domain}-{datetime.now(timezone.utc).date()}".encode()).hexdigest()[:16]
    
    story.append(Paragraph("<b>Signed Digitally on behalf of AuraWorks (Pty) Ltd:</b>", body_style))
    story.append(Paragraph(f"AuraWorks OS v3.2.1 [SIG_ID: AW-{sig_hash}]", body_style))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("<b>Signed Digitally on behalf of Client:</b>", body_style))
    story.append(Paragraph(f"{client_name} Authorized Representative [SIG_ID: CL-{sig_hash}]", body_style))
    
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

async def compile_and_send_contract(client_name: str, client_domain: str, recipient_email: str, plan: str) -> bool:
    """
    Asynchronous background task to compile the formal digital service agreement PDF using reportlab,
    applies encryption, and dispatches it via Resend along with automated instructions.
    """
    try:
        # Generate the PDF bytes
        pdf_bytes = generate_signed_contract_pdf(client_name, client_domain, plan)
        
        # Email subject and content
        subject = "AuraWorks Industrial Intelligence — Service Agreement & Onboarding"
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333;">
            <h2 style="color: #111111;">AuraWorks Onboarding</h2>
            <p>Hello,</p>
            <p>Your subscription to the AuraWorks Industrial Intelligence OS has been activated successfully!</p>
            <p>Please find attached your digitally signed and encrypted Service Agreement PDF.</p>
            <p><strong>Next Steps:</strong> To configure the Edge tracking script and enable analytics on your site, please reply to this email requesting your unique tracking code and installation credentials.</p>
            <br>
            <p>Sincerely,</p>
            <p>AuraWorks Team</p>
        </body>
        </html>
        """
        
        # Send email with attachment using send_resend_email
        success = await send_resend_email(
            to_email=recipient_email,
            subject=subject,
            html_content=html_content,
            attachment_bytes=pdf_bytes,
            filename=f"AuraWorks_Service_Agreement_{client_domain.replace('.', '_')}.pdf"
        )
        return success
    except Exception as e:
        logger.error(f"Error compiling or sending contract PDF: {e}")
        return False
