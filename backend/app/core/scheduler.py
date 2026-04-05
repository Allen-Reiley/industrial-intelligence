from apscheduler.schedulers.background import BackgroundScheduler
from sqlmodel import Session, select
from app.db import engine
from app.models.company import Company
from app.models.department import Department
from app.services.enrichment import get_departmental_intelligence
from datetime import datetime, timezone
import asyncio
import logging

logger = logging.getLogger("uvicorn")

def run_enrichment_cycle():
    """
    Industrial Enrichment Task:
    Maps corporate departments for Juristic Entities using Apollo.io.
    """
    # Create a dedicated event loop for this background thread to avoid loop conflicts
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    with Session(engine) as session:
        # Find companies with domains that require enrichment
        # Logic: Domain must exist, and we haven't found any departments yet
        statement = select(Company).where(Company.domain != None)
        companies = session.exec(statement).all()

        for company in companies:
            try:
                # 🛡️ API WASTE GATE:
                # We check if this company already has departmental records.
                # In a future update, we can check 'company.last_enriched_at' for 30-day refreshes.
                existing_depts = session.exec(
                    select(Department).where(Department.company_id == company.id)
                ).first()
                
                if existing_depts:
                    # Skip to save Apollo credits if already mapped
                    continue

                logger.info(f"🔍 Scheduled Enrichment: Researching {company.name} [{company.domain}]")
                
                # Execute the Apollo.io search via the async service
                depts_data = loop.run_until_complete(get_departmental_intelligence(company.domain))
                
                if not depts_data:
                    logger.info(f"ℹ️ No departments found for {company.domain}")
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
                
                # Update company metadata if you decide to add this field to your Company model
                # company.last_enriched_at = datetime.now(timezone.utc)
                # session.add(company)
                
                session.commit()
                logger.info(f"✅ Successfully mapped {len(depts_data)} departments for {company.name}")

            except Exception as e:
                session.rollback()
                logger.error(f"❌ Enrichment Cycle Error for {company.name}: {e}")
    
    loop.close()

def start_scheduler():
    """
    Initializes the AuraWorks Background Pipeline.
    """
    scheduler = BackgroundScheduler()
    
    # Task 1: Perform industrial enrichment every hour
    # This captures companies added via tracking or waitlist that haven't been mapped yet.
    scheduler.add_job(
        run_enrichment_cycle, 
        'interval', 
        hours=1, 
        id='industrial_enrichment',
        replace_existing=True
    )
    
    # Task 2: (Planned) Weekly ROI Audit Reports
    # scheduler.add_job(generate_weekly_audit_reports, 'cron', day_of_week='mon', hour=8)
    
    scheduler.start()
    logger.info("🚀 AuraWorks Scheduler: Online. Monitoring Juristic Entities.")