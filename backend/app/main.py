import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from datetime import datetime

from app.core.config import settings
from app.db import init_db, engine
from app.api.v1 import track, clients, identity, waitlist
from app.models.visit import Visit
from app.models.company import Company 
from app.tasks.janitor import run_janitor_sweep

# Setup logging - Industrial Clinical Style
logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    The AuraWorks OS Lifecycle Manager.
    Initializes the Juristic Ledger and activates the 24-hour Janitor Sweep.
    """
    logger.info("🚀 AuraWorks OS: Initializing Database Ledger...")
    init_db()
    
    # STARTING SPRINT C: THE JANITOR TASK
    # This runs as a background coroutine for the duration of the app life.
    logger.info("🧹 AuraWorks OS: Activating 24-hour Janitor Sweep...")
    janitor_task = asyncio.create_task(run_janitor_sweep())
    
    yield
    
    logger.info("🛑 AuraWorks OS: Orderly shutdown of systems...")
    janitor_task.cancel()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# --- CORS CONFIGURATION ---
origins = [ 
    "https://industrial-intelligence-xi.vercel.app", 
    "http://localhost:3000",
    "https://auraworks.co.za",
    "https://www.auraworks.co.za",
    "https://cdn.auraworks.co.za"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"], 
    allow_headers=["*"],
)

# --- AURAWORKS FORENSIC DEBUGGER (Hardened for Production) ---
@app.post(f"{settings.API_V1_STR}/track/{{endpoint}}")
async def debug_aura_signal(endpoint: str, request: Request):
    """
    Intercepts signals for monitoring. Sanitizes logs to prevent PII leakage.
    """
    try:
        data = await request.json()
        # Clinical Log: No raw PII in production-level logging
        logger.info(f"📡 AURA_SIGNAL | Endpoint: {endpoint.upper()} | ID: {data.get('aura_id')}")
        
        if endpoint == "identity":
            sig = data.get('signature', {})
            logger.debug(f"🧬 Forensic Signature Received: Drift={sig.get('drift')}ms")
            
        return {"status": "debug_captured"}
    except Exception as e:
        logger.error(f"❌ Debug Capture Error: {str(e)}")
        return {"status": "error"}

# --- ROUTE REGISTRATION ---
app.include_router(track.router, prefix=f"{settings.API_V1_STR}/track", tags=["tracking"])
app.include_router(clients.router, prefix=f"{settings.API_V1_STR}/clients", tags=["clients"])
app.include_router(identity.router, prefix=f"{settings.API_V1_STR}/identity", tags=["identity"])
app.include_router(waitlist.router, prefix=f"{settings.API_V1_STR}/waitlist", tags=["waitlist"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

# --- INDUSTRIAL DASHBOARD ENDPOINTS ---

@app.get(f"{settings.API_V1_STR}/leads")
async def get_leads():
    """
    Fetches visits that have passed the 24-hour quarantine or been verified.
    """
    with Session(engine) as session:
        # Filter: Show only verified or active 'verifying' hits (hide purged data)
        statement = select(Visit).where(Visit.verification_status != "unverified").order_by(Visit.created_at.desc())
        results = session.exec(statement).all()
        return results

@app.get(f"{settings.API_V1_STR}/debug/entities")
async def get_entities():
    """
    Direct access to the Juristic Entity ledger for manual audit.
    """
    with Session(engine) as session:
        statement = select(Company).order_by(Company.created_at.desc())
        results = session.exec(statement).all()
        return results