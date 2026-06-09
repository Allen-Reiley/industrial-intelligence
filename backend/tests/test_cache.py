import pytest
from uuid import uuid4
from unittest.mock import patch, AsyncMock
import httpx
import json

from app.main import app
from app.db import async_session_maker, init_db, async_engine
from app.models.client import Client, SubscriptionStatus, ClientCategory
from app.core.config import settings
from app.core.cache import TwoTierCache

pytestmark = pytest.mark.anyio

@pytest.fixture(autouse=True)
async def dispose_engine_fixture():
    init_db()
    TwoTierCache.clear()
    yield
    await async_engine.dispose()

async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="http://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="http://test")

async def test_client_config_caching_and_whitelisting():
    """
    Verifies that the /v1/clients/config endpoint checks domain whitelists
    and caches the response, preventing database access on subsequent hits.
    """
    client_api = await get_test_client()
    client_id = uuid4()
    
    # 1. Seed test client
    async with async_session_maker() as session:
        client_row = Client(
            id=client_id,
            company_name="Caching Test Company",
            whitelisted_domains=["allowed.com", "another.com"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True,
            require_consent_banner=True
        )
        session.add(client_row)
        await session.commit()

    # 2. Make query with allowed domain referer -> Expect 200
    response = await client_api.get(
        f"/v1/clients/config?client_id={client_id}&tz=Africa/Johannesburg",
        headers={"referer": "https://allowed.com/some-page"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["require_consent_banner"] is True
    assert data["compliance_mode"] == "POPIA"

    # 3. Make query with disallowed domain referer -> Expect 403
    response_unauthorized = await client_api.get(
        f"/v1/clients/config?client_id={client_id}",
        headers={"referer": "https://malicious.com"}
    )
    assert response_unauthorized.status_code == 403

    # 4. Now modify the database row directly, changing require_consent_banner to False.
    # Since the configuration is cached, a subsequent query should STILL return require_consent_banner=True!
    async with async_session_maker() as session:
        client_row = await session.get(Client, client_id)
        client_row.require_consent_banner = False
        session.add(client_row)
        await session.commit()

    response_cached = await client_api.get(
        f"/v1/clients/config?client_id={client_id}&tz=Africa/Johannesburg",
        headers={"referer": "https://allowed.com/some-page"}
    )
    assert response_cached.status_code == 200
    assert response_cached.json()["require_consent_banner"] is True  # Serves from cache!

async def test_cache_graceful_failover_when_redis_broken():
    """
    Asserts that if Redis raises connection errors, the cache wrapper
    gracefully catches them and falls back to the in-memory TTLCache.
    """
    client_api = await get_test_client()
    client_id = uuid4()
    
    # 1. Seed client
    async with async_session_maker() as session:
        client_row = Client(
            id=client_id,
            company_name="Failover Test Corp",
            whitelisted_domains=["failover.com"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client_row)
        await session.commit()

    # Mock Redis client raising ConnectionError on get
    mock_redis = AsyncMock()
    mock_redis.get.side_effect = Exception("Redis connection refused!")
    mock_redis.set.side_effect = Exception("Redis connection refused!")

    with patch("app.core.cache.get_redis_client", return_value=mock_redis):
        # First request: fails Redis, queries DB, caches to TTLCache
        res1 = await client_api.get(
            f"/v1/clients/config?client_id={client_id}&tz=Africa/Johannesburg",
            headers={"referer": "https://failover.com"}
        )
        assert res1.status_code == 200
        assert res1.json()["client_id"] == str(client_id)

        # Update DB row directly
        async with async_session_maker() as session:
            client_row = await session.get(Client, client_id)
            client_row.require_consent_banner = True
            session.add(client_row)
            await session.commit()

        # Second request: fails Redis, hits local TTLCache, returns old value
        res2 = await client_api.get(
            f"/v1/clients/config?client_id={client_id}&tz=Africa/Johannesburg",
            headers={"referer": "https://failover.com"}
        )
        assert res2.status_code == 200
        assert res2.json()["require_consent_banner"] is False  # Hits in-memory cache!
