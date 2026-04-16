# backend/app/db.py
import logging
from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings

logger = logging.getLogger("uvicorn")

# --- ENGINE INITIALIZATION ---
if settings.DATABASE_URL:
    # Standard Industrial Engine for Production (PostgreSQL)
    engine = create_engine(
        settings.DATABASE_URL, 
        echo=False,
        # pool_pre_ping is critical for Railway/Postgres to recover from idle timeouts
        pool_pre_ping=True 
    )
else:
    # Fallback Placeholder: Prevents the ArgumentError during app import.
    logger.warning("🚨 DATABASE_URL not detected. Initializing NULL_MODE engine.")
    engine = create_engine("sqlite:///:memory:")

def init_db():
    """
    Creates all tables defined in the Juristic Ledger.
    Explicit imports here ensure SQLModel registers all tables before metadata creation.
    """
    if not settings.DATABASE_URL:
        logger.error("❌ init_db: Operation aborted. No production database linked.")
        return

    try:
        # Import all modular models here to register them with SQLModel.metadata
        from app.models.client import Client
        from app.models.company import Company
        from app.models.visit import Visit
        from app.models.waitlist import WaitlistLead
        from app.models.pageview import PageView
        from app.models.department import Department
        from app.models.lead import Lead
        
        SQLModel.metadata.create_all(engine)
        logger.info("✅ Database Ledger: Schema verified and synchronized.")
    except Exception as e:
        logger.error(f"❌ Database Ledger: Synchronization failure: {e}")

def get_session():
    """
    Dependency generator for FastAPI routes.
    Yields a session for transactional integrity.
    """
    with Session(engine) as session:
        yield session