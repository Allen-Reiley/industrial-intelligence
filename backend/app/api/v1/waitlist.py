from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.db import get_session
from app.models.waitlist import WaitlistLead

router = APIRouter()

@router.post("/")
async def join_waitlist(lead_data: WaitlistLead, session: Session = Depends(get_session)):
    # Check if email already exists to prevent duplicates
    existing_lead = session.query(WaitlistLead).filter(WaitlistLead.email == lead_data.email).first()
    if existing_lead:
        raise HTTPException(status_code=400, detail="This email is already on the waitlist.")
    
    session.add(lead_data)
    session.commit()
    session.refresh(lead_data)
    return {"status": "success", "message": "Identity registered in the 100-partner cohort."}