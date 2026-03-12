from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

from app.core.config import settings
from app.db import init_db, engine
from app.api.v1 import track, clients
from app.models.visit import Visit

# 🛠️ THE FIX: Lifespan ensures tables are created correctly
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Initializing Database...")
    init_db()
    yield
    print("🛑 Shutting down...")

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Routes
app.include_router(track.router, prefix=settings.API_V1_STR + "/track", tags=["tracking"])
app.include_router(clients.router, prefix=settings.API_V1_STR + "/clients", tags=["clients"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get(settings.API_V1_STR + "/leads")
async def get_leads():
    with Session(engine) as session:
        # We temporarily remove the .where(is_b2b == True) so you can see your test data!
        statement = select(Visit).order_by(Visit.created_at.desc())
        results = session.exec(statement).all()
        print(f"DEBUG: Found {len(results)} total visits in database.")
        return results