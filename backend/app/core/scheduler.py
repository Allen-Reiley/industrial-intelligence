from apscheduler.schedulers.background import BackgroundScheduler
from sqlmodel import Session, select
from app.db import engine
from app.models.company import Company
from app.models.department import Department
from app.services.enrichment import get_departmental_intelligence
# from app.services.intelligence import generate_corporate_summary (Building next)
import logging

logger = logging.getLogger("uvicorn")

def run_enrichment_cycle():
    """
    Overnight/Hourly task to map departments for new Juristic Entities.
    """
    with Session(engine) as session:
        # Find companies with domains that haven't been enriched yet
        statement = select(Company).where(Company.domain != None)
        companies = session.exec(statement).all()

        for company in companies:
            # Check if we already have departments to avoid API waste
            existing_depts = session.exec(
                select(Department).where(Department.company_id == company.id)
            ).first()
            
            if existing_depts:
                continue

            logger.info(f"🔍 Scheduled Enrichment: Researching {company.name}...")
            
            try:
                # We use a synchronous wrapper or run_in_executor for the async service
                import asyncio
                depts_data = asyncio.run(get_departmental_intelligence(company.domain))
                
                for dept in depts_data:
                    new_dept = Department(
                        company_id=company.id,
                        name=dept['name'],
                        email=dept['email'],
                        phone=dept['phone'],
                        head_of_dept_linkedin=dept['head_of_dept_linkedin']
                    )
                    session.add(new_dept)
                
                session.commit()
            except Exception as e:
                logger.error(f"❌ Enrichment Cycle Error for {company.name}: {e}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    
    # Task 1: Enrich new companies every hour
    scheduler.add_job(run_enrichment_cycle, 'interval', hours=1)
    
    # Task 2: (Optional) Weekly Report Generation - Every Monday at 08:00 SAST
    # scheduler.add_job(generate_weekly_audit_reports, 'cron', day_of_week='mon', hour=8)
    
    scheduler.start()
    logger.info("🚀 AuraWorks Scheduler: Online & Monitoring Entities.")