from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from sqlmodel import Session, select
from app.db import engine
from app.models.waitlist import WaitlistLead
from app.models.company import Company
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")

@router.get("/", response_model=List[WaitlistLead])
async def get_leads(
    aura_id: Optional[str] = Query(None),
    limit: int = Query(default=10, le=100)
):
    """
    Retrieves captured leads. Returns an empty list if no leads are found,
    preventing 422 errors on the frontend.
    """
    try:
        with Session(engine) as session:
            statement = select(WaitlistLead).order_by(WaitlistLead.created_at.desc())
            
            if aura_id:
                statement = statement.where(WaitlistLead.aura_id == aura_id)
            
            statement = statement.limit(limit)
            results = session.exec(statement).all()
            
            return results
    except Exception as e:
        logger.error(f"🚨 Lead Retrieval Failure: {e}")
        raise HTTPException(status_code=500, detail="Internal Ledger Error")

@router.get("/intelligence")
async def get_lead_intelligence(domain: str):
    """
    Provides firmographic context for a specific lead's company.
    """
    try:
        with Session(engine) as session:
            statement = select(Company).where(Company.domain == domain)
            company = session.exec(statement).first()
            
            if not company:
                return {"status": "not_enriched", "reason": "Company not yet verified"}
                
            return company
    except Exception as e:
        logger.error(f"🚨 Intelligence Retrieval Failure: {e}")
        raise HTTPException(status_code=500, detail="Intelligence Engine Offline")