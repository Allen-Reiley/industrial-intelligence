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
        print("🧹 Dropping all existing tables...")
        SQLModel.metadata.drop_all(engine)
        print("✅ Tables dropped.")
        
        print("🏗️ Creating new tables with UUID schema...")
        SQLModel.metadata.create_all(engine)
        print("✅ Database schema successfully reset!")
    except Exception as e:
        print(f"❌ Failed to reset database: {e}")

if __name__ == "__main__":
    reset_database()
