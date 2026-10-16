# backend/app/api/v1/prospects.py
import logging
from typing import Any
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Request
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_async_session, async_session_maker
from app.models import Prospect, Company, Visit
from app.services.intelligence import get_visitor_journey
# PHASE 1: Import the new Resend notification engine
from app.services.email import send_prospect_success_email
from app.core.security import encrypt_field

# GLOBALLY IMPORT THE VAULT BRIDGES TO FIX SCOPE ERRORS
from app.services.vault import sync_to_airtable, sync_to_notion

router = APIRouter()
logger = logging.getLogger("uvicorn")

# --- UTILS: Industrial Formatting ---
def format_zar(value: str) -> str:
    """Standardizes South African currency strings for industrial reporting."""
    if not value: 
        return "N/A"
    
    val_str = str(value).strip().lower()
    if "m" in val_str: 
        return "R1,000,000+"
    if "-" in val_str:
        parts = val_str.replace('k', '000').split('-')
        try:
            formatted_parts = [f"R{int(p.strip()):,}" for p in parts]
            return " - ".join(formatted_parts)
        except: 
            return str(value)
            
    clean_value = "".join(filter(str.isdigit, val_str.replace('k', '000')))
    return f"R{int(clean_value):,}" if clean_value else str(value)

async def background_prospect_analysis(prospect_id: Any, aura_id: str, payload: dict, ip_address: str):
    """
    Sequential Forensic Ingestion & Stitching Engine.
    Executes immediate IPinfo and Apollo background enrichment,
    performs entity stitching, updates models, and dispatches alerts.
    """
    if not async_session_maker:
        logger.error("❌ background_prospect_analysis: Aborted. Async Engine offline.")
        return

    async with async_session_maker() as session:
        try:
            logger.info(f"⏳ Ingesting Sequential Audit Pipeline for Lead ID: {prospect_id}")

            # 1. Pull the fresh lead record
            prospect_stmt = select(Prospect).where(Prospect.id == prospect_id)
            prospect_res = await session.execute(prospect_stmt)
            lead = prospect_res.scalars().first()

            if not lead:
                logger.error(f"❌ Sequential Pipeline Error: Lead ID {prospect_id} not found in DB.")
                return

            # 2. Immediate IPinfo Enrichment (Task 11.2 & Task 11.3)
            # Fetch enriched visitor data
            from app.services.enrichment import enrich_visitor_data, enrich_company_departments
            from app.services.intelligence import resolve_entity_stitching
            
            enriched_info = {}
            try:
                enriched_info = await enrich_visitor_data(ip_address)
            except Exception as e:
                logger.warning(f"⚠️ Immediate IPinfo enrichment failed for IP {ip_address}: {e}")
                
            enriched_company_name = enriched_info.get("company_name", "Anonymous Entity")
            volunteered_company = lead.company_name_raw or payload.get("company") or "Unknown"

            # Entity Stitching Resolution (Substring -> DeepSeek -> Fallback)
            final_company_name = await resolve_entity_stitching(volunteered_company, enriched_company_name)
            logger.info(f"Stitched Entity Name: {final_company_name} (from: volunteered='{volunteered_company}', enriched='{enriched_company_name}')")

            # Determine company domain
            domain = lead.website or enriched_info.get("domain")
            if domain:
                domain = domain.replace("https://", "").replace("http://", "").split("/")[0].lower()
            if not domain and lead.email and "@" in lead.email:
                domain = lead.email.split("@")[1].lower()
            if not domain or domain in ["unknown.com", "n/a"]:
                domain = "unknown-domain.com"

            # 3. Resolve/Create Company (Multi-Tenant, Task 11.1)
            company_stmt = select(Company).where(
                (Company.domain == domain) | (Company.company_name == final_company_name),
                Company.client_id == lead.client_id
            )
            company_res = await session.execute(company_stmt)
            company = company_res.scalars().first()

            if not company:
                company = Company(
                    client_id=lead.client_id,
                    company_name=final_company_name,
                    domain=domain,
                    industry=lead.industry or enriched_info.get("industry"),
                    cipc_verified=True, # Direct form submission acts as manual verification
                    total_visits=1
                )
                session.add(company)
                await session.commit()
                await session.refresh(company)
            else:
                company.company_name = final_company_name
                company.total_visits += 1
                session.add(company)
                await session.commit()
                await session.refresh(company)

            # Link Prospect and Visits to the resolved Company
            lead.company_id = company.id
            session.add(lead)

            if aura_id:
                visit_stmt = select(Visit).where(Visit.aura_id == aura_id, Visit.client_id == lead.client_id)
                res_visits = await session.execute(visit_stmt)
                past_visits = res_visits.scalars().all()
                for v in past_visits:
                    v.is_consented = True
                    v.verification_status = "verified"
                    v.company_id = company.id
                    session.add(v)

            await session.commit()

            # Trigger immediate Account Surge check (Task 11.4)
            from app.services.notifications import check_and_trigger_company_surge
            try:
                await check_and_trigger_company_surge(company.id, lead.client_id, session)
            except Exception as e:
                logger.error(f"❌ Failed to check surge alert: {e}")

            # 4. Immediate Apollo Enrichment (Task 11.2)
            if company.domain and company.domain != "unknown-domain.com":
                try:
                    await enrich_company_departments(company.id, company.domain)
                except Exception as e:
                    logger.error(f"❌ Immediate Apollo Enrichment failed: {e}")

            # 5. Compile Unified Journey & Ghost Enrichment
            journey = await get_visitor_journey(lead.client_id, aura_id, session)

            # 6. Pack the complete, unified data dictionary
            complete_prospect_payload = {
                "id": lead.id,
                "aura_id": lead.aura_id,
                "name": lead.name,
                "email": lead.email,
                "company_name_final": company.company_name,
                "company_id": lead.company_id,
                "client_id": lead.client_id,
                "department": lead.department or "Undetermined",
                "position": lead.position or "Evaluator",
                "industry": company.industry or "Industrial",
                "website": lead.website or "N/A",
                "capture_source": "waitlist_conversion",
                "traffic": lead.traffic or "N/A",
                "avg_price": lead.avg_price or "N/A",
                "city": journey.get("city", "Unknown"),
                "region": journey.get("region", "ZA")
            }

            logger.info(f"✨ DeepSeek Data compiled for Lead ID {prospect_id}. Releasing external notification gates...")

            # 7. Dispatch completed data packets
            from app.services.notifications import post_to_slack
            await post_to_slack(prospect_data=complete_prospect_payload, journey=journey, client_id=lead.client_id)
            await sync_to_airtable(lead.client_id, complete_prospect_payload, journey)
            await sync_to_notion(lead.client_id, complete_prospect_payload, journey)

            logger.info(f"✅ Full Synchronization & Enrichment Cycle Complete for Lead ID: {prospect_id}")

        except Exception as e:
            logger.error(f"🚨 Sequential Lead Pipeline Failure for Lead ID {prospect_id}: {e}")

@router.post("/join")
async def join_prospects(
    payload: dict, 
    background_tasks: BackgroundTasks,
    request: Request,
    session: AsyncSession = Depends(get_async_session)
):
    """
    The Promotion Engine: 
    Converts anonymous traffic into a POPIA-consented 'Warm Lead'.
    Synchronizes volunteered company data with backend forensic signatures.
    """
    logger.info(f"--- 📡 AURA SIGNAL: [PROMOTION INITIATED] ---")
    
    email = payload.get("email")
    aura_id = payload.get("aura_id")
    client_id = payload.get("client_id") # Anchor for multi-tenancy
    raw_company_name = payload.get("company") or payload.get("company_name")
    website = payload.get("website")
    recipient_name = payload.get("name")

    if not email or not client_id:
        raise HTTPException(status_code=400, detail="Incomplete lead parameters (Email/Client ID missing).")

    try:
        # 1. Resolve Jurisdictive Entity (Company Anchor)
        domain = None
        if website:
            domain = website.replace("https://", "").replace("http://", "").split("/")[0].lower()
        if not domain and email and "@" in email:
            domain = email.split("@")[1].lower()
        
        # Search for company by domain or name globally (since Company is a shared table)
        company_stmt = select(Company).where(
            (Company.domain == domain) if domain else (Company.company_name == raw_company_name),
            Company.client_id == client_id
        )
        res_company = await session.execute(company_stmt)
        company = res_company.scalars().first()

        if not company:
            # Create a new Juristic record if this is a first-time encounter
            company = Company(
                client_id=client_id,
                company_name=raw_company_name or "Unknown Industrial Entity", 
                domain=domain,
                industry=payload.get("industry"),
                cipc_verified=True # Direct form submission serves as manual verification
            )
            session.add(company)
            await session.commit()
            await session.refresh(company)


        # 2. Identity Promotion & Lead Deep-Merge
        # Check if we already have a partial record for this person
        prospect_stmt = select(Prospect).where(
            Prospect.email == email,
            Prospect.client_id == client_id
        )
        res_lead = await session.execute(prospect_stmt)
        lead = res_lead.scalars().first()
        
        if not lead and aura_id:
            # Fallback: check if we have a record based on their browser ID
            aura_prospect_stmt = select(Prospect).where(
                Prospect.aura_id == aura_id,
                Prospect.client_id == client_id
            )
            res_aura = await session.execute(aura_prospect_stmt)
            lead = res_aura.scalars().first()

        if not lead:
            lead = Prospect(email=email, client_id=client_id, aura_id=aura_id)
        
        # Merge volunteered context into the Lead object
        lead.name = recipient_name or lead.name
        lead.email = email
        lead.company_id = company.id
        lead.company_name_raw = raw_company_name or lead.company_name_raw
        lead.department = payload.get("department") or lead.department
        lead.position = payload.get("position") or payload.get("job_title") or lead.position
        lead.industry = payload.get("industry") or lead.industry
        lead.website = website or lead.website
        
        # Security Shield: AES-256-GCM
        if payload.get("phone"):
            lead.phone_encrypted = encrypt_field(payload.get("phone"))
        
        # Industrial-specific metrics formatting normalization
        lead.traffic = payload.get("traffic")
        lead.avg_price = format_zar(payload.get("avg_price")) if payload.get("avg_price") else lead.avg_price
        lead.aura_id = aura_id or lead.aura_id
        
        session.add(lead)

        # 3. Forensic Stitching & The Janitor Shield
        # Promote all historical visits to 'verified' to prevent 48h automated deletion
        if aura_id:
            visit_stmt = select(Visit).where(Visit.aura_id == aura_id)
            res_visits = await session.execute(visit_stmt)
            past_visits = res_visits.scalars().all()
            for v in past_visits:
                v.is_consented = True
                v.verification_status = "verified" # The Janitor Shield active
                v.company_id = company.id
                session.add(v)

        # Resolve visitor IP address
        ip_address = None
        if aura_id:
            visit_stmt = select(Visit).where(Visit.aura_id == aura_id).order_by(Visit.created_at.desc())
            res_visits = await session.execute(visit_stmt)
            latest_visit = res_visits.scalars().first()
            if latest_visit:
                ip_address = latest_visit.ip_address
        if not ip_address:
            ip_address = request.client.host if request.client else "127.0.0.1"

        await session.commit()
        await session.refresh(lead)

        # 4. DEFERRED JOURNEY MAPPING & NOTIFICATIONS
        # Launch heavy intelligence analysis without blocking the UI response
        background_tasks.add_task(
            background_prospect_analysis, 
            prospect_id=lead.id, 
            aura_id=aura_id, 
            payload=payload,
            ip_address=ip_address
        )
        
        # PHASE 1: Schedule the Resend confirmation email dispatch asynchronously
        background_tasks.add_task(
            send_prospect_success_email,
            recipient_email=email,
            recipient_name=recipient_name
        )
        
        return {"status": "success", "message": "Lead promoted and forensic history shielded. Confirmation queued."}

    except Exception as e:
        await session.rollback()
        logger.error(f"🚨 Promotion Failure: {e}")
        raise HTTPException(status_code=500, detail="Industrial sync failed during promotion.")