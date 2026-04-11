import logging
from datetime import datetime, timedelta, timezone
from sqlmodel import Session, select
from app.db import engine
from app.models.visit import Visit
from app.models.waitlist import WaitlistLead

logger = logging.getLogger("uvicorn")

async def cleanup_unverified_visits():
    """
    The Industrial Janitor: Purges residential/bot noise while 
    protecting high-intent leads and the 'Ghost Bridge'.
    """
    logger.info("🧹 AuraWorks OS: Activating 48-hour Janitor Sweep...")
    
    # 1. Define the 'Noise' Threshold (48 hours)
    # We extended this from 24h to 48h to allow for 'Late Promotion'
    threshold = datetime.now(timezone.utc) - timedelta(hours=48)
    
    with Session(engine) as session:
        try:
            # 2. Identify 'Verifying' records older than the threshold
            statement = select(Visit).where(
                Visit.verification_status == "verifying",
                Visit.created_at < threshold
            )
            candidates = session.exec(statement).all()
            
            if not candidates:
                logger.info("✅ Janitor: Forensic vault is already optimized.")
                return

            purged_count = 0
            for visit in candidates:
                # 3. SAFETY CHECK: The 'Waitlist Shield'
                # If an aura_id has a matching WaitlistLead, we NEVER delete it,
                # even if the individual visit status is still 'verifying'.
                has_lead = session.exec(
                    select(WaitlistLead).where(WaitlistLead.aura_id == visit.aura_id)
                ).first()
                
                if has_lead:
                    # Upgrade the visit instead of deleting
                    visit.verification_status = "verified"
                    session.add(visit)
                    continue

                # 4. Final Purge for actual noise (Residential/Bot traffic)
                session.delete(visit)
                purged_count += 1

            session.commit()
            logger.info(f"🗑️ Janitor: Purged {purged_count} noise signatures. Vault optimized.")

        except Exception as e:
            session.rollback()
            logger.error(f"🚨 Janitor Failure: {e}")