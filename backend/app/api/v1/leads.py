# backend/app/api/v1/endpoints/leads.py
from fastapi import APIRouter, Query, HTTPException, Depends
from typing import List, Optional, Dict, Any
from sqlmodel import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.db import get_async_session
from app.models import Prospect, Company, Visit
from app.models.user import User
from app.api.v1.auth import get_current_admin_user
from uuid import UUID
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")

@router.get("/")
async def get_leads(
    client_id: Optional[str] = Query(default=None),
    limit: int = Query(default=50, le=100),
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Industrial Ledger: Retrieves leads and prioritizes 'Warm Leads' (those with volunteered data).
    Joins with Company data to show total corporate engagement.
    """
    # Resolve client_id if not provided
    if not client_id:
        if current_user.client_id:
            client_id = str(current_user.client_id)
        elif current_user.is_superuser:
            raise HTTPException(
                status_code=400,
                detail="client_id query parameter is required for superusers."
            )
        else:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: User is not assigned to any client."
            )

    # Tenant Isolation Gate
    if not current_user.is_superuser:
        if current_user.client_id is None or str(current_user.client_id) != client_id:
            raise HTTPException(
                status_code=403, 
                detail="Forbidden: Tenant data access violation. You are not assigned to this client."
            )

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

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 Lead Retrieval Failure: {e}")
        raise HTTPException(status_code=500, detail="Internal Ledger Error")

@router.get("/intelligence")
async def get_lead_intelligence(
    aura_id: str, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_admin_user)
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

        # Tenant Isolation Gate
        if not current_user.is_superuser:
            if current_user.client_id is None or current_user.client_id != lead.client_id:
                raise HTTPException(
                    status_code=403, 
                    detail="Forbidden: Tenant data access violation. You are not assigned to this client."
                )

        # 2. Resolve Company Forensic Data
        company = None
        if lead.company_id:
            company = await session.get(Company, lead.company_id)

        # 3. Pull PageView History for Activity Heatmap
        from app.models.pageview import PageView
        pv_stmt = (
            select(PageView)
            .join(Visit, PageView.visit_id == Visit.id)
            .where(Visit.aura_id == aura_id)
            .order_by(PageView.created_at.desc())
        )
        res_pv = await session.execute(pv_stmt)
        page_views = res_pv.scalars().all()

        return {
            "lead_profile": {
                "name": lead.name,
                "position": lead.position,
                "department": lead.department,
                "email": lead.email
            },
            "company_intel": company,
            "forensic_trail": [
                {"timestamp": pv.created_at, "url": pv.url_path, "duration": pv.duration} 
                for pv in page_views
            ],
            "total_engagement_points": len(page_views)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 Intelligence Retrieval Failure: {e}")
        raise HTTPException(status_code=500, detail="Intelligence Engine Offline")