def send_welcome_email(to_email: str, first_name: str):
    if not settings.RESEND_API_KEY:
        logger.warning("⚠️ Resend API Key missing.")
        return

    try:
        # Check if the API key is initialized correctly
        resend.api_key = settings.RESEND_API_KEY 
        
        params = {
            "from": "AuraWorks <intelligence@auraworks.co.za>", # Verify this domain in Resend
            "to": [to_email],
            "subject": "Phase 01: Audit Initiated",
            "html": f"""..."""
        }
        r = resend.Emails.send(params)
        logger.info(f"📧 Email sent. ID: {r.get('id')}")
    except Exception as e:
        logger.error(f"❌ Resend Error: {str(e)}")