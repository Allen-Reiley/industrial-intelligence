# backend/app/tasks/janitor.py
import logging
from datetime import datetime, timedelta, timezone
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import async_engine
from app.models import Visit, WaitlistLead

logger = logging.getLogger("uvicorn")

async def cleanup_unverified_visits():
    """
    The Industrial Janitor: Purges residential/bot noise while 
    protecting high-intent leads and the 'Ghost Bridge'.
    """
    logger.info("🧹 AuraWorks OS: Activating 48-hour Janitor Sweep...")
    
    if not async_engine:
        logger.error("❌ Janitor Sweep aborted: Async Database Engine not initialized.")
        return

    # 1. Define the 'Noise' Threshold (48 hours)
    # Allows a window for 'Late Promotion' via the Banner/Waitlist.
    threshold = datetime.now(timezone.utc) - timedelta(hours=48)
    
    # Use the async_engine explicitly for background worker execution
    async with AsyncSession(async_engine) as session:
        try:
            # 2. Identify 'Verifying' records older than the threshold
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
                # 3. SAFETY CHECK: The 'Waitlist Shield'
                # If an aura_id has a matching WaitlistLead, we promote the visit.
                # This ensures forensic data is saved for anyone who interacted with the banner.
                lead_stmt = select(WaitlistLead).where(WaitlistLead.aura_id == visit.aura_id)
                lead_res = await session.execute(lead_stmt)
                has_lead = lead_res.scalars().first()
                
                if has_lead:
                    # Upgrade the visit status: Shielded from future purges
                    visit.verification_status = "verified"
                    if has_lead.company_id:
                        visit.company_id = has_lead.company_id
                    
                    session.add(visit)
                    promoted_count += 1
                    continue

                # 4. Final Purge for actual noise (Residential/Bot traffic)
                await session.delete(visit)
                purged_count += 1

            await session.commit()
            logger.info(
                f"🗑️ Janitor: Purged {purged_count} noise signatures. "
                f"🛡️ Promoted {promoted_count} high-intent visits. Vault optimized."
            )

        except Exception as e:
            await session.rollback()
            logger.error(f"🚨 Janitor Failure: {e}")