import pytest
import os
from alembic.config import Config
from alembic import command
from sqlalchemy import text
from app.db import engine

def test_alembic_migration_integrity():
    """
    Verifies that the Alembic migration environment compiles correctly
    and can rebuild the database schema from scratch.
    """
    # 1. Purge database schema to mock a clean state
    with engine.connect() as conn:
        conn.execution_options(isolation_level="AUTOCOMMIT").execute(text(
            "SELECT pg_terminate_backend(pid) FROM pg_stat_activity "
            "WHERE datname = current_database() AND pid <> pg_backend_pid()"
        ))
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        
    # 2. Run Alembic upgrade programmatically
    current_dir = os.path.dirname(os.path.abspath(__file__))
    alembic_ini_path = os.path.abspath(os.path.join(current_dir, "..", "alembic.ini"))
    assert os.path.exists(alembic_ini_path), f"alembic.ini not found at {alembic_ini_path}"
    
    alembic_cfg = Config(alembic_ini_path)
    # Upgrade to head
    command.upgrade(alembic_cfg, "head")
    
    # 3. Verify that tables are created correctly
    with engine.connect() as conn:
        res = conn.execute(text(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        ))
        tables = [row[0] for row in res.fetchall()]
        
    assert "user" in tables
    assert "client" in tables
    assert "visit" in tables
    assert "prospect" in tables
    assert "company" in tables
    assert "admin_user" in tables
