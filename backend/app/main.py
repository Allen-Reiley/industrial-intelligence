from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
import os

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

# current_dir is .../backend/app
current_dir = os.path.dirname(os.path.abspath(__file__))

# Move up one level to .../backend/ and then into static/
static_dir = os.path.join(os.path.dirname(current_dir), "static")

# DEBUG PRINT: This will show up in Railway logs so we can verify the path
print(f"DEBUG: Looking for static files in: {static_dir}")

origins = [ 
        "https://industrial-intelligence-xi.vercel.app/", 
        "http://localhost:3000",
        "https://auraworks.co.za",
        "https://www.auraworks.co.za"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    print("✅ Static files mounted successfully.")
else:
    print(f"⚠️ Warning: Static directory not found at {static_dir}")

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