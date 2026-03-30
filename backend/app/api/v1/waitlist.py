from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from app.db import engine
# Pointing to your new model in models/waitlist.py
from app.models.waitlist import WaitlistLead 
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")

@router.post("/join")
async def join_waitlist(payload: dict):
    email = payload.get("email")
    aura_id = payload.get("aura_id")

    if not email:
        raise HTTPException(status_code=400, detail="Work email is required.")

    with Session(engine) as session:
        # 1. Check if this email already exists in the waitlist
        statement = select(WaitlistLead).where(WaitlistLead.email == email)
        lead = session.exec(statement).first()

        if not lead:
            # Create a fresh record if they aren't in the DB yet
            lead = WaitlistLead(email=email, name=payload.get("name", "Unknown"))
            logger.info(f"🆕 Creating new WaitlistLead for {email}")

        # 2. Map Frontend Data to Model Fields
        # Note: we map 'avgPrice' from Next.js to 'avg_price' in the DB
        try:
            lead.name = payload.get("name")
            lead.company = payload.get("company")
            lead.industry = payload.get("industry")
            lead.website = payload.get("website")
            lead.traffic = payload.get("traffic")
            lead.avg_price = payload.get("avgPrice") 
            lead.crm = payload.get("crm")
            
            # 3. Save to the database
            session.add(lead)
            session.commit()
            session.refresh(lead)
            
            logger.info(f"✅ Waitlist Success: {email} (Aura ID: {aura_id})")
            return {"status": "success", "message": "Phase 01 Audit Initiated"}

        except Exception as e:
            session.rollback()
            logger.error(f"❌ Database Error during waitlist join: {str(e)}")
            # If the table doesn't exist yet, this 500 will trigger
            raise HTTPException(
                status_code=500, 
                detail="The intelligence engine encountered a database sync error."
            )