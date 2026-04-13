import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from datetime import datetime, timezone

from app.core.config import settings
from app.db import init_db, engine
from app.api.v1 import track, clients, identity, waitlist
from app.models.visit import Visit
from app.models.company import Company 
from app.tasks.janitor import cleanup_unverified_visits

# Setup logging - Industrial Clinical Style
logger = logging.getLogger("uvicorn")

# --- SECURITY: Admin Access Guard ---
def verify_admin_token(x_aura_token: str = Header(...)):
    """
    Hardens debug routes. Rejects any request missing the correct ADMIN_API_KEY.
    """
    if x_aura_token != settings.ADMIN_API_KEY:
        logger.warning(f"🚨 UNAUTHORIZED ACCESS ATTEMPT: {datetime.now(timezone.utc)}")
        raise HTTPException(status_code=403, detail="Unauthorized Forensic Access")

async def run_janitor_loop():
    """
    Background worker that executes the 48-hour sweep every 6 hours.
    """
    while True:
        try:
            # Check if specialized cleanup is needed based on engine status
            await cleanup_unverified_visits()
            # Sleep for 6 hours between sweeps
            await asyncio.sleep(21600) 
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Janitor Loop Error: {e}")
            await asyncio.sleep(60)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    The AuraWorks OS Lifecycle Manager.
    """
    logger.info(f"🚀 {settings.PROJECT_NAME} v{settings.VERSION}: Initializing...")
    
    # RESILIENT DATABASE INITIALIZATION
    if settings.DATABASE_URL:
        try:
            init_db()
            logger.info("✅ Database Ledger: Connection established and tables verified.")
        except Exception as e:
            logger.error(f"❌ Database Ledger: Failed to initialize. {e}")
    else:
        logger.warning("⚠️ Database Ledger: DATABASE_URL missing. Operating in restricted mode.")
    
    # Audit secondary engine status at startup
    if settings.AIRTABLE_API_KEY and settings.AIRTABLE_BASE_ID:
        logger.info("✅ Vault Engine: Airtable Sync Active.")
    else:
        logger.warning("⚠️ Vault Engine: Airtable on Standby.")

    # Activate the Janitor as a background coroutine
    janitor_task = asyncio.create_task(run_janitor_loop())
    logger.info("🧹 Janitor: Forensic sweep scheduled (6-hour intervals).")
    
    yield
    
    logger.info("🛑 AuraWorks OS: Orderly shutdown initiated...")
    janitor_task.cancel()
    try:
        await janitor_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME, 
    version=settings.VERSION,
    lifespan=lifespan
)

# --- CORS CONFIGURATION ---
# Dynamically pull from settings to prevent production pre-flight blocks
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTE REGISTRATION ---
app.include_router(track.router, prefix=f"{settings.API_V1_STR}/track", tags=["tracking"])
app.include_router(clients.router, prefix=f"{settings.API_V1_STR}/clients", tags=["clients"])
app.include_router(identity.router, prefix=f"{settings.API_V1_STR}/identity", tags=["identity"])
app.include_router(waitlist.router, prefix=f"{settings.API_V1_STR}/waitlist", tags=["waitlist"])

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "engine": settings.PROJECT_NAME,
        "database_connected": bool(settings.DATABASE_URL),
        "timestamp": datetime.now(timezone.utc)
    }

# --- INDUSTRIAL DASHBOARD ENDPOINTS (Hardened) ---

@app.get(
    f"{settings.API_V1_STR}/leads", 
    dependencies=[Depends(verify_admin_token)],
    tags=["admin"]
)
async def get_leads():
    """
    Access point for verified leads. Requires ADMIN_API_KEY.
    """
    if not settings.DATABASE_URL:
        raise HTTPException(status_code=503, detail="Database Unavailable")
        
    with Session(engine) as session:
        statement = select(Visit).where(Visit.verification_status == "verified").order_by(Visit.created_at.desc())
        results = session.exec(statement).all()
        return results

@app.get(
    f"{settings.API_V1_STR}/debug/entities", 
    dependencies=[Depends(verify_admin_token)],
    tags=["admin"]
)
async def get_entities():
    """
    Direct access to the Juristic Entity ledger. Requires ADMIN_API_KEY.
    """
    if not settings.DATABASE_URL:
        raise HTTPException(status_code=503, detail="Database Unavailable")

    with Session(engine) as session:
        statement = select(Company).order_by(Company.created_at.desc())
        results = session.exec(statement).all()
        return results