import pytest
import asyncio
from app.core.config import settings
settings.COOKIE_DOMAIN = None
from app.db import async_engine

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

@pytest.fixture(autouse=True)
def dispose_global_engine():
    """
    Synchronous autouse fixture that safely disposes of the global async engine connection pool
    after every test, preventing connection leaks across event loops. Works with both
    sync and async tests by using the appropriate event loop run/scheduling method.
    """
    yield
    if async_engine:
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(async_engine.dispose())
        except RuntimeError:
            # No running loop, run synchronously
            loop = asyncio.new_event_loop()
            loop.run_until_complete(async_engine.dispose())
            loop.close()
