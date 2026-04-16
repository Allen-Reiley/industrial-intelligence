# backend/app/main.py
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.core.config import settings
from app.db import init_db, get_async_session
from app.api.v1 import track, clients, identity, waitlist, leads
from app.models.waitlist import WaitlistLead
from app.models.company import Company 
from app.tasks.janitor import cleanup_unverified_visits

# Setup logging - Industrial Clinical Style
logger = logging.getLogger("uvicorn")

# --- SECURITY: Admin Access Guard ---
def verify_admin_token(x_aura_token: str = Header(...)):
    """
    Hardens debug and admin routes. 
    Rejects any request missing the correct ADMIN_API_KEY.
    """
    if x_aura_token != settings.ADMIN_API_KEY:
        logger.warning(f"🚨 UNAUTHORIZED ACCESS ATTEMPT: {datetime.now(timezone.utc)}")
        raise HTTPException(status_code=403, detail="Unauthorized Forensic Access")

async def run_janitor_loop():
    """
    Background worker that executes the 48-hour sweep every 6 hours.
    Protects the system from 'Noise' while preserving 'Verified' leads.
    """
    while True:
        try:
            await cleanup_unverified_visits()
            await asyncio.sleep(21600) # 6-hour interval
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
    
    if settings.DATABASE_URL:
        try:
            init_db()
            logger.info("✅ Database Ledger: Connection established and tables verified.")
        except Exception as e:
            logger.error(f"❌ Database Ledger: Failed to initialize. {e}")
    else:
        logger.warning("⚠️ Database Ledger: DATABASE_URL missing.")

    janitor_task = asyncio.create_task(run_janitor_loop())
    logger.info("扫 Janitor: Forensic sweep scheduled.")
    
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
app.include_router(leads.router, prefix=f"{settings.API_V1_STR}/leads", tags=["leads"]) # Primary Ledger

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "engine": settings.PROJECT_NAME,
        "database_connected": bool(settings.DATABASE_URL),
        "timestamp": datetime.now(timezone.utc)
    }

# --- INDUSTRIAL ADMIN DASHBOARD ENDPOINTS ---

@app.get(
    f"{settings.API_V1_STR}/admin/summary", 
    dependencies=[Depends(verify_admin_token)],
    tags=["admin"]
)
async def get_admin_summary(session: AsyncSession = Depends(get_async_session)):
    """
    Provides a high-level overview of the Industrial OS performance.
    Combines Lead totals with Company engagement metrics.
    """
    if not settings.DATABASE_URL:
        raise HTTPException(status_code=503, detail="Database Unavailable")
    
    # Count Warm Leads (Volunteered Data)
    lead_count_stmt = select(func.count(WaitlistLead.id))
    lead_count_res = await session.execute(lead_count_stmt)
    total_leads = lead_count_res.scalar()

    # Count High-Engagement Entities
    company_count_stmt = select(func.count(Company.id)).where(Company.total_visits > 5)
    company_count_res = await session.execute(company_count_stmt)
    hot_companies = company_count_res.scalar()

    return {
        "total_warm_leads": total_leads,
        "high_intent_companies": hot_companies,
        "engine_status": "operational",
        "timestamp": datetime.now(timezone.utc)
    }