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
    logger.info("🚀 AuraWorks OS: Initializing Database Ledger...")
    init_db()
    
    # Activate the Janitor as a background coroutine
    janitor_task = asyncio.create_task(run_janitor_loop())
    
    yield
    
    logger.info("🛑 AuraWorks OS: Orderly shutdown initiated...")
    janitor_task.cancel()
    try:
        await janitor_task
    except asyncio.CancelledError:
        pass

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# --- CORS CONFIGURATION ---
origins = [ 
    "https://industrial-intelligence-xi.vercel.app", 
    "http://localhost:3000",
    "https://auraworks.co.za",
    "https://www.auraworks.co.za",
    "https://cdn.auraworks.co.za",
    "https://dynamic-flow-production-a5d6.up.railway.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc)}

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
    with Session(engine) as session:
        statement = select(Company).order_by(Company.created_at.desc())
        results = session.exec(statement).all()
        return results