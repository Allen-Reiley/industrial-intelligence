# backend/app/core/scheduler.py
import logging
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import async_session_maker
from app.models.company import Company
from app.models.department import Department
from app.services.enrichment import get_departmental_intelligence, process_enrichment_queue

logger = logging.getLogger("uvicorn")

def get_current_time() -> datetime:
    return datetime.now(timezone.utc)

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

async def check_trial_expirations():
    """
    Background worker: monitors trial_ends_at.
    Exactly 48 hours before the trial expires, Resend dispatches a warning email
    notifying the client of the upcoming automated charge.
    """
    if not async_session_maker:
        logger.error("❌ check_trial_expirations: Aborted. Async Database Engine not initialized.")
        return

    from app.services.email import send_trial_warning_email
    from app.models.client import Client, SubscriptionStatus
    from datetime import timedelta

    async with async_session_maker() as session:
        try:
            now = get_current_time()
            limit_time = now + timedelta(hours=48)
            
            stmt = select(Client).where(
                Client.subscription_status == SubscriptionStatus.TRIAL,
                Client.trial_warning_sent == False,
                Client.trial_ends_at != None,
                Client.trial_ends_at <= limit_time,
                Client.cancellation_requested == False
            )
            res = await session.execute(stmt)
            clients = res.scalars().all()

            for client in clients:
                logger.info(f"⏰ Trial expiring in < 48 hours for {client.company_name}. Sending warning email...")
                to_email = f"billing@{client.domain}" if client.domain else "billing@auraworks.co.za"
                sent = await send_trial_warning_email(to_email, client.id)
                if sent:
                    client.trial_warning_sent = True
                    session.add(client)
                    await session.commit()
                    logger.info(f"✅ Trial warning email sent successfully to {to_email}")
        except Exception as e:
            logger.error(f"❌ Error in check_trial_expirations background job: {e}")


def start_scheduler():
    """
    Initializes the Asynchronous AuraWorks Background Engine Pipeline.
    """
    scheduler = AsyncIOScheduler()
    
    # Check trial expirations every hour
    scheduler.add_job(
        check_trial_expirations,
        'interval',
        hours=1,
        id='trial_expiration_checker',
        replace_existing=True
    )

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
    
    # Run recurring billing daily at 01:00 UTC
    scheduler.add_job(
        execute_recurring_billing,
        'cron',
        hour=1,
        minute=0,
        id='recurring_billing_engine',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("🚀 AuraWorks Async Scheduler: Online. Structural enrichment, trial warning, recurring billing, and weekly report loops active.")

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
                    filename = f"weekly_report_{client.id}_{get_current_time().strftime('%Y%m%d')}.pdf"
                    
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


async def charge_and_log(session: AsyncSession, client: Client, amount: int, description: str) -> bool:
    """
    Charges the client's token via IkhokhaClient and logs a transaction entry.
    Returns True if successful, False if failed.
    """
    from app.services.payment import IkhokhaClient, IkhokhaError
    from app.models.transaction import Transaction, TransactionStatus
    import uuid

    ik_client = IkhokhaClient()
    logger.info(f"Executing charge of {amount} cents against token for client {client.company_name} - {description}")
    
    try:
        res = await ik_client.charge_token(client.id, amount, client.payment_method_token)
        if res.get("status") in ("successful", "success"):
            new_tx = Transaction(
                client_id=client.id,
                amount=amount,
                currency="ZAR",
                status=TransactionStatus.SUCCESSFUL,
                gateway_reference=res.get("transactionId") or f"ik_tx_{uuid.uuid4()}",
                payment_method_token=client.payment_method_token,
                error_message=None
            )
            session.add(new_tx)
            await session.commit()
            return True
        else:
            raise IkhokhaError(res.get("errorMessage") or "Transaction failed")
    except Exception as e:
        logger.error(f"🚨 Failed transaction for {client.company_name}: {e}")
        new_tx = Transaction(
            client_id=client.id,
            amount=amount,
            currency="ZAR",
            status=TransactionStatus.FAILED,
            gateway_reference=f"fail_ref_{uuid.uuid4()}",
            payment_method_token=client.payment_method_token,
            error_message=str(e)
        )
        session.add(new_tx)
        await session.commit()
        return False


from sqlalchemy.ext.asyncio import AsyncSession

async def execute_recurring_billing():
    """
    Cron/worker task: executes recurring payments daily.
    - Triggers monthly billing on the 1st of every month.
    - Triggers annual billing on the 1st of the anniversary month (if year > trial_ends_at.year).
    - Checks for failed monthly charges and retries after 3 days.
    - Checks for failed annual charges and retries after 7 days.
    - Suspends accounts if retry fails.
    - Transitions trial-end clients to active by executing their initial real charge.
    """
    if not async_session_maker:
        logger.error("❌ execute_recurring_billing: Aborted. Async Database Engine not initialized.")
        return

    from app.services.payment import calculate_prorated_amount
    from app.models.client import Client, SubscriptionStatus
    from app.models.transaction import Transaction, TransactionStatus
    from datetime import datetime, timezone, timedelta

    async with async_session_maker() as session:
        try:
            now = get_current_time()
            is_first_of_month = (now.day == 1)
            
            # --- PART 1: 1st of Month Billing Triggers ---
            if is_first_of_month:
                logger.info("📅 1st of Month recurring billing trigger active.")
                # 1. Monthly Active Clients
                stmt_monthly = select(Client).where(
                    Client.subscription_status == SubscriptionStatus.ACTIVE,
                    Client.is_active == True,
                    Client.billing_cycle == "monthly",
                    Client.payment_method_token != None
                )
                res_monthly = await session.execute(stmt_monthly)
                for client in res_monthly.scalars().all():
                    amount = client.custom_monthly_amount or 1000000
                    await charge_and_log(session, client, amount, "Monthly renewal charge")
                
                # 2. Annual Active Clients (Anniversary month)
                stmt_annual = select(Client).where(
                    Client.subscription_status == SubscriptionStatus.ACTIVE,
                    Client.is_active == True,
                    Client.billing_cycle == "annual",
                    Client.payment_method_token != None,
                    Client.trial_ends_at != None
                )
                res_annual = await session.execute(stmt_annual)
                for client in res_annual.scalars().all():
                    trial_end_utc = client.trial_ends_at.replace(tzinfo=timezone.utc)
                    if trial_end_utc.month == now.month and trial_end_utc.year < now.year:
                        amount = 12000000
                        await charge_and_log(session, client, amount, "Annual renewal charge")

            # --- PART 2: Trial Expired T-Zero Automated Charging ---
            stmt_trials = select(Client).where(
                Client.subscription_status == SubscriptionStatus.TRIAL,
                Client.trial_ends_at != None,
                Client.trial_ends_at <= now,
                Client.cancellation_requested == False,
                Client.payment_method_token != None
            )
            res_trials = await session.execute(stmt_trials)
            for client in res_trials.scalars().all():
                logger.info(f"⏳ Trial ended for client {client.company_name}. Executing T-Zero billing...")
                if client.billing_cycle == "monthly":
                    amount = calculate_prorated_amount(client.trial_ends_at.replace(tzinfo=timezone.utc), client.custom_monthly_amount or 1000000)
                else:
                    amount = 12000000
                
                success = await charge_and_log(session, client, amount, f"Trial-end charge ({client.billing_cycle})")
                if success:
                    client.subscription_status = SubscriptionStatus.ACTIVE
                    client.is_active = True
                    session.add(client)
                    await session.commit()
                    logger.info(f"🎉 Client {client.company_name} is now ACTIVE.")
                else:
                    client.subscription_status = SubscriptionStatus.SUSPENDED
                    client.is_active = False
                    session.add(client)
                    await session.commit()
                    logger.error(f"❌ Initial trial-end charge failed for {client.company_name}. Client suspended.")

            # --- PART 3: Grace Period Retries & Suspensions ---
            stmt_active = select(Client).where(
                Client.subscription_status == SubscriptionStatus.ACTIVE,
                Client.is_active == True,
                Client.payment_method_token != None
            )
            res_active = await session.execute(stmt_active)
            for client in res_active.scalars().all():
                last_tx_stmt = select(Transaction).where(
                    Transaction.client_id == client.id
                ).order_by(Transaction.created_at.desc()).limit(1)
                tx_res = await session.execute(last_tx_stmt)
                last_tx = tx_res.scalars().first()
                
                if last_tx and last_tx.status == TransactionStatus.FAILED:
                    tx_age = now - last_tx.created_at.replace(tzinfo=timezone.utc)
                    
                    if client.billing_cycle == "monthly":
                        if tx_age.days >= 3:
                            logger.info(f"🔁 Retrying failed monthly charge for {client.company_name}...")
                            amount = client.custom_monthly_amount or 1000000
                            success = await charge_and_log(session, client, amount, "Monthly renewal retry charge")
                            if not success:
                                client.subscription_status = SubscriptionStatus.SUSPENDED
                                client.is_active = False
                                session.add(client)
                                await session.commit()
                                logger.error(f"❌ Monthly retry failed. Client {client.company_name} suspended.")
                    elif client.billing_cycle == "annual":
                        if tx_age.days >= 7:
                            logger.info(f"🔁 Retrying failed annual charge for {client.company_name}...")
                            amount = 12000000
                            success = await charge_and_log(session, client, amount, "Annual renewal retry charge")
                            if not success:
                                client.subscription_status = SubscriptionStatus.SUSPENDED
                                client.is_active = False
                                session.add(client)
                                await session.commit()
                                logger.error(f"❌ Annual retry failed. Client {client.company_name} suspended.")

        except Exception as e:
            logger.error(f"❌ execute_recurring_billing Global Failure: {e}")