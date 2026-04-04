from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
import logging

from app.core.config import settings
from app.db import init_db, engine
from app.api.v1 import track, clients, identity, waitlist
from app.models.visit import Visit
from app.models.company import Company 
from app.core.scheduler import start_scheduler 

# Setup logging - Industrial Clinical Style
logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    The AuraWorks OS Lifecycle Manager.
    Initializes the Juristic Ledger and starts the Background Intelligence Brain.
    """
    logger.info("🚀 AuraWorks OS: Initializing Database Ledger...")
    init_db()
    
    logger.info("🧠 AuraWorks OS: Starting Intelligence Scheduler (Apollo & DeepSeek)...")
    start_scheduler()
    
    yield
    logger.info("🛑 AuraWorks OS: Orderly shutdown of systems...")

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# --- STATIC FILES: DECOUPLED ---
logger.info("⚡ Static asset delivery offloaded to Cloudflare CDN.")

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

# --- AURAWORKS FORENSIC DEBUGGER ---
@app.post(f"{settings.API_V1_STR}/track/{{endpoint}}")
async def debug_aura_signal(endpoint: str, request: Request):
    """
    Intercepts and logs forensic signals for real-time system monitoring.
    """
    try:
        data = await request.json()
        # NOISY DEV LOG: Detailed signal inspection
        logger.info(f"--- 📡 AURA SIGNAL: [{endpoint.upper()}] ---")
        logger.info(f"Aura ID: {data.get('aura_id')}")
        logger.info(f"Full Payload: {data}")
        
        if endpoint == "identity":
            sig = data.get('signature', {})
            logger.info(f"🧬 Forensic Signature: Drift={sig.get('drift')}ms")
        elif endpoint == "consent":
            logger.info(f"✅ Technical Consent Handshake for {data.get('aura_id')}")
            
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
    return {"status": "healthy"}

# --- DEBUG ROUTES: Unified Visibility ---

@app.get(f"{settings.API_V1_STR}/leads")
async def get_leads():
    """
    Restored to stop 404 errors. Returns raw visit data.
    """
    with Session(engine) as session:
        statement = select(Visit).order_by(Visit.created_at.desc())
        results = session.exec(statement).all()
        # NOISY DEV LOG
        logger.info(f"--- 💡 DEV LOG: FETCHING {len(results)} RAW VISITS ---")
        return results

@app.get(f"{settings.API_V1_STR}/debug/entities")
async def get_entities():
    """
    Direct access to the Juristic Entity ledger.
    Verify Apollo/IPinfo enrichment success here.
    """
    with Session(engine) as session:
        statement = select(Company).order_by(Company.created_at.desc())
        results = session.exec(statement).all()
        # NOISY DEV LOG
        logger.info(f"--- 💡 DEV LOG: FETCHING {len(results)} ENRICHED COMPANIES ---")
        return results