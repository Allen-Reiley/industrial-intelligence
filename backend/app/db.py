from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings

# 1. Create the Engine
# 'echo=True' will log every SQL query to your terminal (great for debugging)
# We disable it for production to keep logs clean.
engine = create_engine(
    settings.DATABASE_URL, 
    echo=False,
    # pool_pre_ping ensures the connection is still alive before using it
    pool_pre_ping=True 
)

def init_db():
    """
    Creates all tables defined in your SQLModel models.
    Run this when the app starts.
    """
    # Note: Ensure all models are imported before calling this
    from app.models.visit import Visit
    from app.models.client import Client 
    
    SQLModel.metadata.create_all(engine)

def get_session():
    """
    Dependency generator for FastAPI routes.
    Ensures the session is closed after the request is finished.
    """
    with Session(engine) as session:
        yield session