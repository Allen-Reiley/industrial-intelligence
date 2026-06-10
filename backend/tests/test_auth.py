# backend/tests/test_auth.py
import pytest
import uuid
from unittest.mock import AsyncMock, patch
import httpx
from urllib.parse import urlparse, parse_qs
from app.main import app
from app.core.config import settings
from app.models.user import User
from sqlmodel import select
from app.db import get_async_session

pytestmark = pytest.mark.anyio

async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="https://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="https://test")


async def test_google_oauth_authorize():
    """
    Verifies that the Google OAuth authorization redirection URL generation works.
    """
    client = await get_test_client()
    response = await client.get(
        f"{settings.API_V1_STR}/auth/google/authorize",
        params={"redirect_uri": "http://localhost:3000/callback"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "authorization_url" in data
    assert "accounts.google.com" in data["authorization_url"]

async def test_google_oauth_callback_success():
    """
    Verifies that the Google OAuth callback endpoint processes the code and state,
    creates the user (or logs them in), and issues the aurahq_auth session cookie.
    """
    client = await get_test_client()
    
    # 1. Call authorize to get the signed state
    response_auth = await client.get(
        f"{settings.API_V1_STR}/auth/google/authorize",
        params={"redirect_uri": "http://localhost:3000/callback"}
    )
    assert response_auth.status_code == 200
    auth_data = response_auth.json()
    auth_url = auth_data["authorization_url"]
    
    # Extract the state query parameter
    parsed_url = urlparse(auth_url)
    query_params = parse_qs(parsed_url.query)
    state = query_params["state"][0]
    
    mock_access_token = {
        "access_token": "mocked_google_access_token",
        "expires_in": 3600,
        "token_type": "Bearer",
        "scope": "openid email profile",
    }
    mock_id_email = ("google-oauth-id-12345", "oauth-user@auraworks.co.za")

    with patch(
        "app.core.users.google_oauth_client.get_access_token",
        new_callable=AsyncMock
    ) as mock_get_token, patch(
        "app.core.users.google_oauth_client.get_id_email",
        new_callable=AsyncMock
    ) as mock_get_email:

        
        mock_get_token.return_value = mock_access_token
        mock_get_email.return_value = mock_id_email
        
        response = await client.get(
            f"{settings.API_V1_STR}/auth/google/callback",
            params={
                "code": "mocked_google_code",
                "state": state,
                "redirect_uri": "http://localhost:3000/callback"
            }
        )
        
        assert response.status_code == 302
        assert response.headers["Location"] == "http://localhost:3000/aurahq"
        cookies = response.cookies
        assert "aurahq_auth" in cookies
        
        # Verify user was created in database
        async for session in get_async_session():
            stmt = select(User).where(User.email == "oauth-user@auraworks.co.za")
            res = await session.execute(stmt)
            db_user = res.scalars().first()
            assert db_user is not None
            assert db_user.is_active is True
            assert db_user.is_verified is True
            break

async def test_standard_login_and_logout():
    """
    Tests standard email/password login and logout using FastAPI-Users.
    """
    client = await get_test_client()
    from fastapi_users.password import PasswordHelper
    password_helper = PasswordHelper()
    
    test_email = "test-user-login@auraworks.co.za"
    test_password = "secure_password_123"
    hashed_pwd = password_helper.hash(test_password)
    
    async for session in get_async_session():
        stmt_cleanup = select(User).where(User.email == test_email)
        res_cleanup = await session.execute(stmt_cleanup)
        existing_user = res_cleanup.scalars().first()
        if existing_user:
            await session.delete(existing_user)
            await session.commit()
            
        user = User(
            id=uuid.uuid4(),
            email=test_email,
            hashed_password=hashed_pwd,
            is_active=True,
            is_verified=True,
            is_superuser=False
        )
        session.add(user)
        await session.commit()
        break
        
    # Login via POST /api/v1/auth/login (as form data)
    response_login = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={"username": test_email, "password": test_password}
    )
    assert response_login.status_code in [200, 204]
    assert "aurahq_auth" in response_login.cookies
    auth_cookies = response_login.cookies
    
    # Logout via POST /api/v1/auth/logout
    response_logout = await client.post(
        f"{settings.API_V1_STR}/auth/logout",
        cookies=auth_cookies
    )
    assert response_logout.status_code in [200, 204]

async def test_admin_summary_route_protection():
    """
    Asserts that the admin summary route is protected and permits access with legacy
    headers or the new Cookie session validation.
    """
    client = await get_test_client()
    admin_password = settings.ADMIN_API_KEY or "change-me-in-production"
    
    # 1. Reject without auth headers
    response = await client.get(f"{settings.API_V1_STR}/admin/summary")
    assert response.status_code == 403
    
    # 2. Accept with legacy X-Aura-Token header
    response_legacy = await client.get(
        f"{settings.API_V1_STR}/admin/summary",
        headers={"X-Aura-Token": admin_password}
    )
    assert response_legacy.status_code == 200
    
    # 3. Accept with cookie-based user session
    from fastapi_users.password import PasswordHelper
    password_helper = PasswordHelper()
    test_email = "admin-summary-test@auraworks.co.za"
    hashed_pwd = password_helper.hash("admin_pass_123")
    
    async for session in get_async_session():
        stmt_cleanup = select(User).where(User.email == test_email)
        res_cleanup = await session.execute(stmt_cleanup)
        existing_user = res_cleanup.scalars().first()
        if existing_user:
            await session.delete(existing_user)
            await session.commit()
            
        user = User(
            id=uuid.uuid4(),
            email=test_email,
            hashed_password=hashed_pwd,
            is_active=True,
            is_verified=True,
            is_superuser=True
        )
        session.add(user)
        await session.commit()
        break
        
    response_login = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={"username": test_email, "password": "admin_pass_123"}
    )
    assert response_login.status_code in [200, 204]
    
    response_cookie = await client.get(
        f"{settings.API_V1_STR}/admin/summary",
        cookies=response_login.cookies
    )
    assert response_cookie.status_code == 200


async def test_google_oauth_callback_production():
    """
    Verifies that under production scheme / proxy headers, the callback endpoint
    correctly resolves proxy headers and issues a 302 redirect strictly matching the production domain.
    """
    client = await get_test_client()
    
    # 1. Call authorize to get the signed state
    response_auth = await client.get(
        f"{settings.API_V1_STR}/auth/google/authorize",
        params={"redirect_uri": "https://auraworks.co.za/login/callback"}
    )
    assert response_auth.status_code == 200
    auth_data = response_auth.json()
    auth_url = auth_data["authorization_url"]
    
    parsed_url = urlparse(auth_url)
    query_params = parse_qs(parsed_url.query)
    state = query_params["state"][0]
    
    mock_access_token = {
        "access_token": "mocked_google_access_token_prod",
        "expires_in": 3600,
        "token_type": "Bearer",
        "scope": "openid email profile",
    }
    mock_id_email = ("google-oauth-id-54321", "oauth-user-prod@auraworks.co.za")

    # Force production settings for the request duration
    from app.core.users import cookie_transport, oauth_cookie_transport
    with patch.object(settings, "ENVIRONMENT", "production"), \
         patch.object(settings, "API_DOMAIN", "api.auraworks.co.za"), \
         patch.object(settings, "COOKIE_DOMAIN", "auraworks.co.za"), \
         patch.object(cookie_transport, "cookie_secure", True), \
         patch.object(oauth_cookie_transport, "cookie_secure", True), \
         patch.object(cookie_transport, "cookie_domain", "auraworks.co.za"), \
         patch.object(oauth_cookie_transport, "cookie_domain", "auraworks.co.za"), \
         patch("app.core.users.google_oauth_client.get_access_token", new_callable=AsyncMock) as mock_get_token, \
         patch("app.core.users.google_oauth_client.get_id_email", new_callable=AsyncMock) as mock_get_email:
         
        mock_get_token.return_value = mock_access_token
        mock_get_email.return_value = mock_id_email
        
        response = await client.get(
            f"{settings.API_V1_STR}/auth/google/callback",
            params={
                "code": "mocked_google_code_prod",
                "state": state,
                "redirect_uri": "https://auraworks.co.za/login/callback"
            },
            headers={
                "x-forwarded-proto": "https",
                "x-forwarded-host": "api.auraworks.co.za"
            }
        )
        
        assert response.status_code == 302
        assert response.headers["Location"] == "https://auraworks.co.za/aurahq"
        cookie_header = response.headers.get("set-cookie", "")
        assert "aurahq_auth" in cookie_header
        assert "domain=auraworks.co.za" in cookie_header.lower()
        assert "secure" in cookie_header.lower()
        assert "samesite=lax" in cookie_header.lower()
