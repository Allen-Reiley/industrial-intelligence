import pytest
from datetime import datetime, timedelta, timezone
from jose import jwt
import httpx
from unittest.mock import patch

from app.main import app
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token

pytestmark = pytest.mark.anyio

async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="http://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="http://test")

async def test_jwt_token_generation_and_validation():
    """
    Validates JWT generation, payload contents, and decoding with correct keys.
    """
    secret = settings.SECRET_KEY or "dev-secret-key-12345678901234567890123456789012"
    payload = {"sub": "admin"}
    
    # 1. Access Token
    access_token = create_access_token(payload)
    decoded_access = jwt.decode(access_token, secret, algorithms=["HS256"])
    assert decoded_access["sub"] == "admin"
    assert "exp" in decoded_access
    
    # 2. Refresh Token
    refresh_token = create_refresh_token(payload)
    decoded_refresh = jwt.decode(refresh_token, secret, algorithms=["HS256"])
    assert decoded_refresh["sub"] == "admin"
    assert decoded_refresh["type"] == "refresh"
    assert "exp" in decoded_refresh

async def test_auth_login_json_and_form():
    """
    Verifies that the /api/v1/auth/login endpoint accepts both JSON payloads
    and form fields, returning access and refresh tokens.
    """
    client = await get_test_client()
    admin_password = settings.ADMIN_API_KEY or "change-me-in-production"
    
    # 1. JSON Payload Login
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"username": "admin", "password": admin_password}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    
    # 2. Form Login
    response_form = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={"username": "admin", "password": admin_password}
    )
    assert response_form.status_code == 200
    data_form = response_form.json()
    assert "access_token" in data_form
    assert "refresh_token" in data_form

async def test_auth_login_unauthorized():
    """
    Asserts that incorrect usernames or passwords result in HTTP 401.
    """
    client = await get_test_client()
    
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"username": "admin", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"username": "not_admin", "password": "wrongpassword"}
    )
    assert response.status_code == 401

async def test_admin_summary_route_protection():
    """
    Asserts that /api/v1/admin/summary is protected by verify_admin_token,
    verifying access with a valid Bearer JWT and rejection without it.
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
    
    # 3. Accept with Bearer JWT token
    login_res = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"username": "admin", "password": admin_password}
    )
    token = login_res.json()["access_token"]
    
    response_jwt = await client.get(
        f"{settings.API_V1_STR}/admin/summary",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response_jwt.status_code == 200
    
    # 4. Reject with invalid JWT token
    response_invalid = await client.get(
        f"{settings.API_V1_STR}/admin/summary",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response_invalid.status_code == 403

async def test_auth_token_refresh():
    """
    Verifies that a valid refresh token can be used to retrieve new access/refresh tokens.
    """
    client = await get_test_client()
    admin_password = settings.ADMIN_API_KEY or "change-me-in-production"
    
    login_res = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"username": "admin", "password": admin_password}
    )
    refresh_token = login_res.json()["refresh_token"]
    
    # Refresh token exchange
    response = await client.post(
        f"{settings.API_V1_STR}/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    
    # Reject invalid/malformed refresh token
    response_invalid = await client.post(
        f"{settings.API_V1_STR}/auth/refresh",
        json={"refresh_token": "invalid_refresh_token"}
    )
    assert response_invalid.status_code == 401
