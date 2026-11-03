# backend/app/core/database.py
"""
Core database module providing connection pooling, session management,
and PostgreSQL keepalive configurations. Re-exports canonical database objects.
"""
from app.db import (
    engine,
    async_engine,
    async_session_maker,
    get_async_session,
    get_session,
    get_sanitized_db_url,
    sync_url,
    async_url,
    sync_connect_args,
    async_connect_args,
    init_db,
    current_client_id,
)

__all__ = [
    "engine",
    "async_engine",
    "async_session_maker",
    "get_async_session",
    "get_session",
    "get_sanitized_db_url",
    "sync_url",
    "async_url",
    "sync_connect_args",
    "async_connect_args",
    "init_db",
    "current_client_id",
]
