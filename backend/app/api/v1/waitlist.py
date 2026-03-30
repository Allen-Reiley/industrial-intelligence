from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from app.db import engine
from app.models.visit import Visit
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")

@router.post("/join")
async def join_waitlist(payload: dict):
    aura_id = payload.get("aura_id")
    email = payload.get("email")

    if not aura_id or not email:
        raise HTTPException(status_code=400, detail="Missing required identification fields.")

    with Session(engine) as session:
        # 1. Find the existing forensic record
        statement = select(Visit).where(Visit.aura_id == aura_id).order_by(Visit.created_at.desc())
        lead = session.exec(statement).first()

        if not lead:
            # If no visit exists yet, create a fresh entry
            lead = Visit(aura_id=aura_id, client_id="manual_entry")
            logger.info(f"🆕 Creating new lead record for {email}")
        
        # 2. Update with form data
        lead.email = email
        lead.name = payload.get("name")
        lead.company = payload.get("company")
        lead.industry = payload.get("industry")
        lead.website = payload.get("website")
        lead.traffic = payload.get("traffic")
        lead.avg_price = payload.get("avgPrice")
        lead.crm = payload.get("crm")
        lead.is_waitlist = True
        
        session.add(lead)
        session.commit()
        
        logger.info(f"✅ Waitlist Success: {email} stitched to Aura ID {aura_id}")
        return {"status": "success", "message": "Phase 01 Audit Initiated"}