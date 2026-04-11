from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from sqlmodel import Session, select
from app.db import engine
from app.models.waitlist import WaitlistLead
from app.models.company import Company
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")

@router.get("/")
async def get_leads(
    aura_id: Optional[str] = Query(None),
    limit: int = Query(default=10, le=100)
):
    """
    Retrieves captured leads for the Identity Bridge.
    If aura_id is provided, it filters for a specific user's identification.
    """
    with Session(engine) as session:
        statement = select(WaitlistLead).order_by(WaitlistLead.created_at.desc())
        
        if aura_id:
            statement = statement.where(WaitlistLead.aura_id == aura_id)
        
        statement = statement.limit(limit)
        results = session.exec(statement).all()
        
        # Return as a simple list for the frontend to map over
        return results

@router.get("/intelligence")
async def get_lead_intelligence(domain: str):
    """
    Provides firmographic context for a specific lead's company.
    """
    with Session(engine) as session:
        statement = select(Company).where(Company.domain == domain)
        company = session.exec(statement).first()
        
        if not company:
            return {"status": "not_enriched", "reason": "Company not yet verified"}
            
        return company