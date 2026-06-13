from app.db import get_sanitized_db_url

def test_get_sanitized_db_url_none():
    assert get_sanitized_db_url(None) is None
    assert get_sanitized_db_url("") == ""

def test_get_sanitized_db_url_postgres_prefix():
    # Test synchronous conversion
    assert get_sanitized_db_url("postgres://user:pass@host:5432/db", is_async=False) == "postgresql://user:pass@host:5432/db"
    # Test asynchronous conversion
    assert get_sanitized_db_url("postgres://user:pass@host:5432/db", is_async=True) == "postgresql+asyncpg://user:pass@host:5432/db"

def test_get_sanitized_db_url_postgresql_prefix():
    # Test synchronous conversion
    assert get_sanitized_db_url("postgresql://user:pass@host:5432/db", is_async=False) == "postgresql://user:pass@host:5432/db"
    # Test asynchronous conversion
    assert get_sanitized_db_url("postgresql://user:pass@host:5432/db", is_async=True) == "postgresql+asyncpg://user:pass@host:5432/db"

def test_get_sanitized_db_url_async_prefix():
    # Test synchronous conversion
    assert get_sanitized_db_url("postgresql+asyncpg://user:pass@host:5432/db", is_async=False) == "postgresql://user:pass@host:5432/db"
    # Test asynchronous conversion
    assert get_sanitized_db_url("postgresql+asyncpg://user:pass@host:5432/db", is_async=True) == "postgresql+asyncpg://user:pass@host:5432/db"
