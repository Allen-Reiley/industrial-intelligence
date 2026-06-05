import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine

# Explicitly import all models so they register with SQLModel.metadata
from app.models.client import Client
from app.models.company import Company
from app.models.department import Department
from app.models.visit import Visit
from app.models.pageview import PageView
from app.models.waitlist_lead import WaitlistLead
from app.models.enrichment_queue import EnrichmentQueue, FailedEnrichment
from app.models.notification_throttle import NotificationThrottle

def reset_database():
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not found in .env file.")
        return

    print(f"Connecting to database...")
    engine = create_engine(database_url)

    try:
        print("🧹 Dropping all existing tables via nuclear CASCADE...")
        from sqlalchemy import text
        with engine.begin() as conn:
            conn.execute(text("DROP SCHEMA public CASCADE;"))
            conn.execute(text("CREATE SCHEMA public;"))
            conn.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
            conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        print("✅ Tables dropped.")
        
        # Run Alembic migrations programmatically to create tables and RLS
        print("🏗️ Creating tables and applying migrations via Alembic...")
        from alembic.config import Config
        from alembic import command
        
        current_dir = os.path.dirname(os.path.abspath(__file__))
        alembic_ini_path = os.path.abspath(os.path.join(current_dir, "alembic.ini"))
        if os.path.exists(alembic_ini_path):
            alembic_cfg = Config(alembic_ini_path)
            command.upgrade(alembic_cfg, "head")
            print("✅ Database successfully reset and migrated to head!")
        else:
            print(f"❌ alembic.ini not found at {alembic_ini_path}, cannot reset database.")
            raise FileNotFoundError("alembic.ini missing")
    except Exception as e:
        print(f"❌ Failed to reset database: {e}")

if __name__ == "__main__":
    reset_database()
