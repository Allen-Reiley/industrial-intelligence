import logging
from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings

logger = logging.getLogger("uvicorn")

# --- ENGINE INITIALIZATION ---
# We check for the DATABASE_URL to prevent SQLAlchemy from crashing on 'None'
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
    # This allows the app to boot so you can debug Railway variables.
    logger.warning("🚨 DATABASE_URL not detected. Initializing NULL_MODE engine.")
    engine = create_engine("sqlite:///:memory:")

def init_db():
    """
    Creates all tables defined in the Juristic Ledger.
    Only executes if a valid production URL is present.
    """
    if not settings.DATABASE_URL:
        logger.error("❌ init_db: Operation aborted. No production database linked.")
        return

    try:
        # Note: Ensure all models are imported before calling this
        from app.models.visit import Visit
        from app.models.company import Company
        from app.models.client import Client 
        
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