# backend/app/core/scheduler.py
import logging
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlmodel import select
from app.db import async_session_maker
from app.models.company import Company
from app.models.department import Department
from app.services.enrichment import get_departmental_intelligence, process_enrichment_queue

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

                    logger.info(f"🔍 Forensic Enrichment: Querying {company.company_name} [{company.domain}]")
                    
                    # Direct async execution without breaking loop state or threading overhead
                    depts_data = await get_departmental_intelligence(company.domain)
                    
                    if not depts_data:
                        logger.info(f"ℹ️ Operational Intelligence: No structural departments identified for {company.domain}")
                        continue

                    for dept in depts_data:
                        priority_score = 1
                        role = dept.get('role', 'Lead').lower()
                        for kw in ["procurement", "supply chain", "chief engineer", "director"]:
                            if kw in role:
                                priority_score = 5
                                break
                        new_dept = Department(
                            company_id=company.id,
                            contact_name=dept.get('name', 'Unknown Contact'),
                            role_title=dept.get('role', 'Lead'),
                            email=dept.get('email'),
                            phone=dept.get('phone'),
                            linkedin_url=dept.get('linkedin_url'),
                            priority_score=priority_score
                        )
                        session.add(new_dept)
                    
                    # Commit updates per juristic node to keep database logs interactive and up to date
                    await session.commit()
                    logger.info(f"✅ Structural Map Saved: Tied {len(depts_data)} departments to {company.company_name}")

                except Exception as inner_error:
                    await session.rollback()
                    logger.error(f"❌ Structural Mapping Failure for {company.company_name}: {inner_error}")

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

    # Process enrichment queue every 15 minutes
    scheduler.add_job(
        process_enrichment_queue,
        'interval',
        minutes=15,
        id='enrichment_queue_processor',
        replace_existing=True
    )
    
    # Weekly reporting service scheduled every Monday at 06:00 SAST (04:00 UTC)
    scheduler.add_job(
        run_weekly_reporting_cycle,
        'cron',
        day_of_week='mon',
        hour=4,
        minute=0,
        id='weekly_pdf_reports',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("🚀 AuraWorks Async Scheduler: Online. Structural enrichment and weekly report loops active.")

# --- TASK 7.1 WEEKLY REPORTING CYCLE ---
from app.services.reports import compile_weekly_report, upload_report_to_r2, generate_signed_cdn_link, send_weekly_report_email
from app.models.client import Client

async def run_weekly_reporting_cycle():
    """
    Weekly Reporting cron task: compiles the report for each active client,
    uploads to R2, and dispatches an email with a 24-hour expiration token.
    """
    if not async_session_maker:
        return
        
    async with async_session_maker() as session:
        try:
            stmt = select(Client).where(Client.is_active == True)
            res = await session.execute(stmt)
            clients = res.scalars().all()
            
            for client in clients:
                try:
                    pdf_bytes = await compile_weekly_report(client.id, session)
                    filename = f"weekly_report_{client.id}_{datetime.now(timezone.utc).strftime('%Y%m%d')}.pdf"
                    
                    upload_success = await upload_report_to_r2(pdf_bytes, filename)
                    if upload_success:
                        download_link = generate_signed_cdn_link(filename)
                        recipient = f"reports@{client.domain}"
                        await send_weekly_report_email(recipient, download_link)
                        logger.info(f"📊 Weekly report successfully sent to {recipient}")
                except Exception as inner_e:
                    logger.error(f"❌ Failed compiling weekly report for client {client.id}: {inner_e}")
        except Exception as e:
            logger.error(f"❌ Weekly report global cycle failure: {e}")