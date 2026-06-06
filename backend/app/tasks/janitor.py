# backend/app/tasks/janitor.py
import logging
from datetime import datetime, timedelta, timezone
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import async_engine
from app.models import Visit, Prospect

logger = logging.getLogger("uvicorn")

async def execute_janitor_scrub_cascade(session: AsyncSession):
    """
    Executes a precise column anonymization cascade matching POPIA parameters.
    Identifies unverified interaction traces where tracking stamps exceed 48 hours
    and nulls personal identifiers, replacing raw fingerprint arrays with a non-reversible hash.
    """
    threshold = (datetime.now(timezone.utc) - timedelta(hours=48)).replace(tzinfo=None)
    
    statement = select(Visit).where(
        Visit.verification_status == "verifying",
        Visit.created_at < threshold
    )
    result = await session.execute(statement)
    candidates = result.scalars().all()
    
    if not candidates:
        logger.info("✅ Janitor: Forensic vault is already optimized.")
        return

    purged_count = 0
    promoted_count = 0

    for visit in candidates:
        # Safety Check: The 'Waitlist Shield'
        prospect_stmt = select(Prospect).where(Prospect.aura_id == visit.aura_id)
        prospect_res = await session.execute(prospect_stmt)
        has_lead = prospect_res.scalars().first()
        
        if has_lead:
            visit.verification_status = "verified"
            if has_lead.company_id:
                visit.company_id = has_lead.company_id
            session.add(visit)
            promoted_count += 1
            continue

        # POPIA Column Anonymization
        visit.email = None
        visit.visitor_name = None
        
        # Calculate SHA256(canvas + webgl + drift + rotating_daily_secret)
        canvas = visit.canvas_hash or ""
        webgl = visit.webgl_renderer or ""
        drift = visit.clock_drift or ""
        
        from app.core.config import settings
        import hashlib
        date_str = visit.created_at.strftime("%Y-%m-%d")
        secret = settings.SECRET_KEY or "default_secret"
        rotating_daily_secret = hashlib.sha256(f"{secret}:{date_str}".encode()).hexdigest()
        
        combined_fingerprint = f"{canvas}{webgl}{drift}{rotating_daily_secret}"
        visit.fingerprint_hash = hashlib.sha256(combined_fingerprint.encode()).hexdigest()
        
        # Clear raw fingerprint columns to prevent tracking individual traits
        visit.canvas_hash = None
        visit.webgl_renderer = None
        visit.clock_drift = None
        
        visit.verification_status = "anonymized_corporate"
        visit.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        
        session.add(visit)
        purged_count += 1

    await session.commit()
    logger.info(
        f"🗑️ Janitor: Anonymized {purged_count} noise signatures. "
        f"🛡️ Promoted {promoted_count} high-intent visits. Vault optimized."
    )

async def cleanup_unverified_visits():
    """
    FastAPI background task entry point for the periodic Janitor Sweep.
    """
    logger.info("🧹 AuraWorks OS: Activating 48-hour Janitor Sweep...")
    
    if not async_engine:
        logger.error("❌ Janitor Sweep aborted: Async Database Engine not initialized.")
        return
        
    async with AsyncSession(async_engine) as session:
        try:
            await execute_janitor_scrub_cascade(session)
        except Exception as e:
            await session.rollback()
            logger.error(f"🚨 Janitor Failure: {e}")