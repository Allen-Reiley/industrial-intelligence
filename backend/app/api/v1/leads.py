# backend/app/api/v1/endpoints/leads.py
from fastapi import APIRouter, Query, HTTPException, Depends
from typing import List, Optional, Dict, Any
from sqlmodel import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.db import get_async_session
from app.models import Prospect, Company, Visit
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")

@router.get("/")
async def get_leads(
    client_id: str = Query(...),
    limit: int = Query(default=50, le=100),
    session: AsyncSession = Depends(get_async_session)
):
    """
    Industrial Ledger: Retrieves leads and prioritizes 'Warm Leads' (those with volunteered data).
    Joins with Company data to show total corporate engagement.
    """
    try:
        # 1. Build the Query: Order by creation but prioritize records with emails/positions
        # This surfaces 'Warm Leads' who interacted with the banner/waitlist first
        statement = (
            select(Prospect, Company)
            .where(Prospect.client_id == client_id)
            .outerjoin(Company, Prospect.company_id == Company.id)
            .order_by(desc(Prospect.created_at))
            .limit(limit)
        )
        
        results = await session.execute(statement)
        leads_data = []

        for lead, company in results:
            # Determine 'Warmth' based on data completeness
            is_warm = all([lead.email, lead.company_name_raw])
            
            leads_data.append({
                "id": lead.id,
                "created_at": lead.created_at,
                "name": lead.name or "Anonymous Lead",
                "email": lead.email,
                "position": lead.position,
                "department": lead.department,
                "aura_id": lead.aura_id,
                "is_warm": is_warm,
                "company": {
                    "name": company.company_name if company else lead.company_name_raw or "Unknown Entity",
                    "domain": company.domain if company else None,
                    "industry": company.industry if company else lead.industry,
                    "total_visits": company.total_visits if company else 1,
                    "is_verified": company.cipc_verified if company else False
                }
            })
            
        return leads_data

    except Exception as e:
        logger.error(f"🚨 Lead Retrieval Failure: {e}")
        raise HTTPException(status_code=500, detail="Internal Ledger Error")

@router.get("/intelligence")
async def get_lead_intelligence(
    aura_id: str, 
    session: AsyncSession = Depends(get_async_session)
):
    """
    Provides the forensic audit for a specific lead, including their 
    behavioral journey and facility activity clusters.
    """
    try:
        # 1. Resolve Lead Identity
        prospect_stmt = select(Prospect).where(Prospect.aura_id == aura_id)
        res_lead = await session.execute(prospect_stmt)
        lead = res_lead.scalars().first()
        
        if not lead:
            raise HTTPException(status_code=404, detail="Lead signature not found.")

        # 2. Resolve Company Forensic Data
        company = None
        if lead.company_id:
            company = await session.get(Company, lead.company_id)

        # 3. Pull Visit History for Activity Heatmap
        visit_stmt = select(Visit).where(Visit.aura_id == aura_id).order_by(Visit.created_at.desc())
        res_visits = await session.execute(visit_stmt)
        visits = res_visits.scalars().all()

        return {
            "lead_profile": {
                "name": lead.name,
                "position": lead.position,
                "department": lead.department,
                "email": lead.email
            },
            "company_intel": company,
            "forensic_trail": [
                {"timestamp": v.created_at, "url": v.url, "duration": v.duration} 
                for v in visits
            ],
            "total_engagement_points": len(visits)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 Intelligence Retrieval Failure: {e}")
        raise HTTPException(status_code=500, detail="Intelligence Engine Offline")