# backend/app/core/scheduler.py
import logging
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlmodel import select
from app.db import async_session_maker
from app.models.company import Company
from app.models.department import Department
from app.services.enrichment import get_departmental_intelligence

logger = logging.getLogger("uvicorn")

async def run_enrichment_cycle():
    """
    Industrial Async Enrichment Task:
    Maps corporate departments for captured Juristic Entities via Apollo.io.
    """
    if not async_session_maker:
        logger.error("❌ Scheduler Enrichment Cycle: Aborted. Async Database Engine not initialized.")
        return

    async with async_session_maker() as session:
        try:
            # Locate target companies requiring deep intelligence routing
            statement = select(Company).where(Company.domain != None)
            result = await session.execute(statement)
            companies = result.scalars().all()

            for company in companies:
                try:
                    # 🛡️ CREDIT WASTE GATE:
                    # Verify if this company already possesses parsed industrial department layers.
                    dept_stmt = select(Department).where(Department.company_id == company.id)
                    dept_result = await session.execute(dept_stmt)
                    existing_dept = dept_result.scalars().first()
                    
                    if existing_dept:
                        # Skip execution block to preserve Apollo/Enrichment API token allocation
                        continue

                    logger.info(f"🔍 Forensic Enrichment: Querying {company.name} [{company.domain}]")
                    
                    # Direct async execution without breaking loop state or threading overhead
                    depts_data = await get_departmental_intelligence(company.domain)
                    
                    if not depts_data:
                        logger.info(f"ℹ️ Operational Intelligence: No structural departments identified for {company.domain}")
                        continue

                    for dept in depts_data:
                        new_dept = Department(
                            company_id=company.id,
                            name=dept.get('name', 'General'),
                            email=dept.get('email'),
                            phone=dept.get('phone'),
                            head_of_dept_linkedin=dept.get('head_of_dept_linkedin')
                        )
                        session.add(new_dept)
                    
                    # Commit updates per juristic node to keep database logs interactive and up to date
                    await session.commit()
                    logger.info(f"✅ Structural Map Saved: Tied {len(depts_data)} departments to {company.name}")

                except Exception as inner_error:
                    await session.rollback()
                    logger.error(f"❌ Structural Mapping Failure for {company.name}: {inner_error}")

        except Exception as global_error:
            logger.error(f"❌ Global Enrichment Pipeline Exception: {global_error}")

def start_scheduler():
    """
    Initializes the Asynchronous AuraWorks Background Engine Pipeline.
    """
    scheduler = AsyncIOScheduler()
    
    # Ingest target juristic entities every hour for firmographic lead enrichment
    scheduler.add_job(
        run_enrichment_cycle, 
        'interval', 
        hours=1, 
        id='industrial_enrichment',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("🚀 AuraWorks Async Scheduler: Online. Structural enrichment loop active.")