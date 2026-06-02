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
    
    Compliance Strategy (POPIA / GDPR):
    Under SADC Protection of Personal Information Act (POPIA) and GDPR guidelines, 
    unconsented natural person identifiers cannot be retained indefinitely. 
    AuraWorks implements a 48-hour operational window (Tier 2/Personal Layer):
    1. During the first 48 hours, unconsented visitor signals undergo identity resolution.
    2. If a visitor actively consents (via waitlist or banner interaction), their forensic record
       is promoted and shielded.
    3. If no consent or identification is established after 48 hours, the individual forensic record is purged
       to prevent unlawful data retention, leaving only non-PII juristic metrics.
    """
    logger.info("🧹 AuraWorks OS: Activating 48-hour Janitor Sweep...")
    
    if not async_engine:
        logger.error("❌ Janitor Sweep aborted: Async Database Engine not initialized.")
        return

    # 1. Define the 'Noise' Threshold (48 hours)
    # Allows a window for 'Late Promotion' via the Banner/Waitlist.
    #
    # Database Safety Guard (Timezone Parity):
    # SQLModel structures database datetime columns without timezone annotations (TIMESTAMP WITHOUT TIME ZONE).
    # Comparing a timezone-aware Python datetime (e.g. datetime.now(timezone.utc)) with timezone-naive columns
    # causes sqlalchemy/psycopg2 to raise a comparison/type mismatch error on PostgreSQL.
    # We strip the timezone info (.replace(tzinfo=None)) after UTC calculation to align with the DB schema.
    threshold = (datetime.now(timezone.utc) - timedelta(hours=48)).replace(tzinfo=None)
    
    # Use the async_engine explicitly for background worker execution
    async with AsyncSession(async_engine) as session:
        try:
            # 2. Identify 'Verifying' records older than the threshold.
            # Only target visits that are still in "verifying" state (unconsented/unassociated).
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
                # Even if the visit record has expired (>48h) and is unconsented, we must check if 
                # the visitor subsequently converted into a Waitlist Lead (voluntarily providing email/PII).
                # If a matching aura_id exists in the WaitlistLead table, we shield the visit record.
                lead_stmt = select(WaitlistLead).where(WaitlistLead.aura_id == visit.aura_id)
                lead_res = await session.execute(lead_stmt)
                has_lead = lead_res.scalars().first()
                
                if has_lead:
                    # Upgrade the visit status: Shielded from future purges by promoting to "verified".
                    # Link the visit to the company identified by the waitlist registration.
                    visit.verification_status = "verified"
                    if has_lead.company_id:
                        visit.company_id = has_lead.company_id
                    
                    session.add(visit)
                    promoted_count += 1
                    continue

                # 4. Final Purge for actual noise (Residential/Bot traffic, unconsented telemetry)
                # Permanently erase the expired unverified visit record to satisfy data protection bounds.
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