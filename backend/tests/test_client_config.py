import pytest
import uuid
import json
from unittest.mock import AsyncMock, MagicMock
import httpx

from app.main import app
from app.db import get_async_session
from app.models.client import Client, SubscriptionStatus, ClientCategory
from app.core.cache import TwoTierCache

pytestmark = pytest.mark.anyio

async def get_test_client():
    transport = httpx.ASGITransport(app=app)
    return httpx.AsyncClient(transport=transport, base_url="https://test")

@pytest.fixture(autouse=True)
def clear_cache():
    TwoTierCache.clear()
    yield
    TwoTierCache.clear()

async def test_client_config_respects_client_require_consent_banner_true_in_popia():
    """
    When client.require_consent_banner is True, it MUST return True even in Africa/POPIA mode.
    """
    client_id = uuid.uuid4()
    mock_client = Client(
        id=client_id,
        company_name="Industrial SA Ltd",
        whitelisted_domains=["industrials.co.za"],
        subscription_status=SubscriptionStatus.ACTIVE,
        is_active=True,
        require_consent_banner=True
    )

    mock_session = AsyncMock()
    mock_session.get.return_value = mock_client

    async def override_get_async_session():
        yield mock_session

    app.dependency_overrides[get_async_session] = override_get_async_session
    try:
        http_client = await get_test_client()
        res = await http_client.get(
            f"/v1/clients/config?client_id={client_id}&tz=Africa/Johannesburg",
            headers={"Origin": "https://industrials.co.za"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["require_consent_banner"] is True
        assert data["compliance_mode"] == "POPIA"
        assert data["is_active"] is True
    finally:
        app.dependency_overrides.pop(get_async_session, None)

async def test_client_config_gdpr_mandates_consent_even_if_client_setting_false():
    """
    When client.require_consent_banner is False, European timezones (GDPR) mandate require_consent_banner = True.
    """
    client_id = uuid.uuid4()
    mock_client = Client(
        id=client_id,
        company_name="Industrial SA Ltd",
        whitelisted_domains=["industrials.co.za"],
        subscription_status=SubscriptionStatus.ACTIVE,
        is_active=True,
        require_consent_banner=False
    )

    mock_session = AsyncMock()
    mock_session.get.return_value = mock_client

    async def override_get_async_session():
        yield mock_session

    app.dependency_overrides[get_async_session] = override_get_async_session
    try:
        http_client = await get_test_client()
        res = await http_client.get(
            f"/v1/clients/config?client_id={client_id}&tz=Europe/Berlin",
            headers={"Origin": "https://industrials.co.za"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["require_consent_banner"] is True
        assert data["compliance_mode"] == "GDPR"
    finally:
        app.dependency_overrides.pop(get_async_session, None)

async def test_client_config_popia_with_client_setting_false_returns_false():
    """
    When client.require_consent_banner is False and timezone is Africa, require_consent_banner returns False.
    """
    client_id = uuid.uuid4()
    mock_client = Client(
        id=client_id,
        company_name="Industrial SA Ltd",
        whitelisted_domains=["industrials.co.za"],
        subscription_status=SubscriptionStatus.ACTIVE,
        is_active=True,
        require_consent_banner=False
    )

    mock_session = AsyncMock()
    mock_session.get.return_value = mock_client

    async def override_get_async_session():
        yield mock_session

    app.dependency_overrides[get_async_session] = override_get_async_session
    try:
        http_client = await get_test_client()
        res = await http_client.get(
            f"/v1/clients/config?client_id={client_id}&tz=Africa/Johannesburg",
            headers={"Origin": "https://industrials.co.za"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["require_consent_banner"] is False
        assert data["compliance_mode"] == "POPIA"
    finally:
        app.dependency_overrides.pop(get_async_session, None)

async def test_client_config_origin_subdomain_and_vercel_preview():
    """
    Origin verification accepts:
    - Subdomains of whitelisted domain (e.g., app.industrials.co.za)
    - Vercel preview environments (*.vercel.app)
    And rejects unauthorized external domains (403).
    """
    client_id = uuid.uuid4()
    mock_client = Client(
        id=client_id,
        company_name="Industrial SA Ltd",
        whitelisted_domains=["industrials.co.za"],
        subscription_status=SubscriptionStatus.ACTIVE,
        is_active=True,
        require_consent_banner=True
    )

    mock_session = AsyncMock()
    mock_session.get.return_value = mock_client

    async def override_get_async_session():
        yield mock_session

    app.dependency_overrides[get_async_session] = override_get_async_session
    try:
        http_client = await get_test_client()
        # 1. Subdomain of whitelisted domain -> 200
        res_sub = await http_client.get(
            f"/v1/clients/config?client_id={client_id}",
            headers={"Origin": "https://portal.industrials.co.za"}
        )
        assert res_sub.status_code == 200

        # 2. Vercel preview staging environment -> 200
        res_vercel = await http_client.get(
            f"/v1/clients/config?client_id={client_id}",
            headers={"Origin": "https://industrial-intel-git-feature-preview.vercel.app"}
        )
        assert res_vercel.status_code == 200

        # 3. Disallowed external domain -> 403
        res_bad = await http_client.get(
            f"/v1/clients/config?client_id={client_id}",
            headers={"Origin": "https://attacker-domain.com"}
        )
        assert res_bad.status_code == 403
    finally:
        app.dependency_overrides.pop(get_async_session, None)

from app.api.v1.auth import get_current_admin_user
from app.models.user import User, UserRole

async def test_update_client_invalidates_config_cache():
    """
    Asserts that PATCH /v1/clients/{client_id} invalidates the TwoTierCache
    so updated configuration is returned immediately.
    """
    client_id = uuid.uuid4()
    mock_client = Client(
        id=client_id,
        company_name="Industrial SA Ltd",
        whitelisted_domains=["industrials.co.za"],
        subscription_status=SubscriptionStatus.ACTIVE,
        is_active=True,
        require_consent_banner=False
    )

    mock_session = AsyncMock()
    mock_session.get.return_value = mock_client
    mock_session.commit = AsyncMock()
    mock_session.refresh = AsyncMock()

    mock_admin = User(
        id=str(uuid.uuid4()),
        email="admin@auraworks.co.za",
        role=UserRole.ADMIN,
        is_active=True
    )

    async def override_get_async_session():
        yield mock_session

    async def override_get_current_admin_user():
        return mock_admin

    app.dependency_overrides[get_async_session] = override_get_async_session
    app.dependency_overrides[get_current_admin_user] = override_get_current_admin_user

    try:
        http_client = await get_test_client()

        # 1. First GET: seeds cache with require_consent_banner = False
        res1 = await http_client.get(
            f"/v1/clients/config?client_id={client_id}&tz=Africa/Johannesburg",
            headers={"Origin": "https://industrials.co.za"}
        )
        assert res1.status_code == 200
        assert res1.json()["require_consent_banner"] is False

        # 2. PATCH client to set require_consent_banner = True
        res_patch = await http_client.patch(
            f"/api/v1/clients/{client_id}",
            json={"require_consent_banner": True}
        )
        assert res_patch.status_code == 200
        assert mock_client.require_consent_banner is True

        # 3. Next GET: cache was invalidated by PATCH, so it queries fresh state and returns True
        res2 = await http_client.get(
            f"/v1/clients/config?client_id={client_id}&tz=Africa/Johannesburg",
            headers={"Origin": "https://industrials.co.za"}
        )
        assert res2.status_code == 200
        assert res2.json()["require_consent_banner"] is True
    finally:
        app.dependency_overrides.pop(get_async_session, None)
        app.dependency_overrides.pop(get_current_admin_user, None)

