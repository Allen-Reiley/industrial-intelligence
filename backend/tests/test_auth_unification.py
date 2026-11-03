# backend/tests/test_auth_unification.py
import pytest
import os
import uuid
from uuid import uuid4
from datetime import datetime, timezone, timedelta
import httpx
from sqlmodel import select

from app.main import app
from app.db import async_session_maker
from app.models.user import User, Session as UserSession, UserRole

pytestmark = pytest.mark.anyio


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="https://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="https://test")


async def test_session_token_validation_against_postgresql():
    """
    Task 35.1.1: Session token validation against PostgreSQL.
    Verifies that a valid session token in UserSession table authenticates the user
    and returns 200 OK with the user's profile from /v1/auth/me.
    """
    user_id = f"user_{uuid4().hex[:8]}"
    raw_token = f"sess_token_{uuid4().hex}"
    user_email = f"auth_test_{uuid4().hex[:6]}@auraworks.co.za"

    async with async_session_maker() as session:
        user = User(
            id=user_id,
            email=user_email,
            name="Auth Test User",
            role=UserRole.ADMIN,
            is_active=True
        )
        session.add(user)
        await session.commit()

        user_session = UserSession(
            id=f"sess_{uuid4().hex[:8]}",
            user_id=user_id,
            token=raw_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        session.add(user_session)
        await session.commit()

    client = await get_test_client()

    # Authenticate using Bearer token header
    resp = await client.get(
        "/v1/auth/me",
        headers={"Authorization": f"Bearer {raw_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == user_email
    assert data["id"] == user_id


async def test_cross_subdomain_cookie_parsing_and_signed_cookie_normalization():
    """
    Task 35.1.1: Cross-subdomain cookie parsing & signed cookie normalization.
    Verifies that cookies from wildcards (.auraworks.co.za) like '__Secure-better-auth.session_token'
    and 'better-auth.session_token' with HMAC signatures ('<token>.<signature>')
    are cleanly normalized and authenticated against PostgreSQL.
    """
    user_id = f"user_{uuid4().hex[:8]}"
    raw_token = f"sess_cookie_{uuid4().hex}"
    signed_cookie_val = f"{raw_token}.dGVzdF9zaWduYXR1cmVfaG1hYw"
    user_email = f"cookie_test_{uuid4().hex[:6]}@auraworks.co.za"

    async with async_session_maker() as session:
        user = User(
            id=user_id,
            email=user_email,
            name="Cookie Test User",
            role=UserRole.SALES,
            is_active=True
        )
        session.add(user)
        await session.commit()

        user_session = UserSession(
            id=f"sess_{uuid4().hex[:8]}",
            user_id=user_id,
            token=raw_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        session.add(user_session)
        await session.commit()

    client = await get_test_client()

    # 1. Test signed cookie format (__Secure-better-auth.session_token)
    client.cookies.set("__Secure-better-auth.session_token", signed_cookie_val)
    resp = await client.get("/v1/auth/me")
    assert resp.status_code == 200
    assert resp.json()["email"] == user_email

    # 2. Test standard better-auth.session_token cookie
    client.cookies.clear()
    client.cookies.set("better-auth.session_token", raw_token)
    resp2 = await client.get("/v1/auth/me")
    assert resp2.status_code == 200
    assert resp2.json()["email"] == user_email


async def test_auth_401_handling():
    """
    Task 35.1.1: 401 handling for unauthenticated, invalid, or expired sessions.
    """
    client = await get_test_client()

    # 1. Missing session token -> 401 Unauthorized
    resp_no_auth = await client.get("/v1/auth/me")
    assert resp_no_auth.status_code == 401
    assert "Authentication required" in resp_no_auth.json()["detail"]

    # 2. Non-existent session token -> 401 Unauthorized
    resp_bad_token = await client.get(
        "/v1/auth/me",
        headers={"Authorization": "Bearer non_existent_token_12345"}
    )
    assert resp_bad_token.status_code == 401
    assert any(msg in resp_bad_token.json()["detail"] for msg in ["Invalid session credentials", "Session invalid or expired", "Unauthorized"])

    # 3. Expired session token -> 401 Unauthorized
    user_id = f"user_{uuid4().hex[:8]}"
    expired_token = f"sess_expired_{uuid4().hex}"
    async with async_session_maker() as session:
        user = User(
            id=user_id,
            email=f"expired_{uuid4().hex[:6]}@auraworks.co.za",
            name="Expired User",
            role=UserRole.SALES,
            is_active=True
        )
        session.add(user)
        await session.commit()

        user_session = UserSession(
            id=f"sess_{uuid4().hex[:8]}",
            user_id=user_id,
            token=expired_token,
            expires_at=datetime.now(timezone.utc) - timedelta(hours=2)  # Expired
        )
        session.add(user_session)
        await session.commit()

    resp_expired = await client.get(
        "/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert resp_expired.status_code == 401
    assert "Session expired" in resp_expired.json()["detail"]


async def test_stateless_jwt_authentication():
    """
    Validates that a stateless JWT signed with the shared secret is decoded by FastAPI,
    authenticating the user and returning 200 OK from /v1/auth/me.
    """
    from jose import jwt as jose_jwt
    from app.core.config import settings

    client = await get_test_client()
    user_email = f"jwt_user_{uuid4().hex[:6]}@auraworks.co.za"
    jwt_secret = settings.SECRET_KEY or os.getenv("BETTER_AUTH_SECRET") or "development-better-auth-secret-key-1234567890"

    # 1. Valid active JWT token
    payload = {
        "sub": f"user_jwt_{uuid4().hex[:8]}",
        "email": user_email,
        "role": "admin",
        "name": "JWT Admin User",
        "exp": int((datetime.now(timezone.utc) + timedelta(hours=1)).timestamp())
    }
    signed_jwt = jose_jwt.encode(payload, jwt_secret, algorithm="HS256")

    resp = await client.get(
        "/v1/auth/me",
        headers={"Authorization": f"Bearer {signed_jwt}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == user_email
    assert data["role"] == "admin"

    # 2. Expired JWT -> 401 Unauthorized
    expired_payload = {
        "sub": f"user_jwt_{uuid4().hex[:8]}",
        "email": f"jwt_exp_{uuid4().hex[:6]}@auraworks.co.za",
        "role": "sales",
        "exp": int((datetime.now(timezone.utc) - timedelta(hours=1)).timestamp())
    }
    expired_jwt = jose_jwt.encode(expired_payload, jwt_secret, algorithm="HS256")
    resp_exp = await client.get(
        "/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_jwt}"}
    )
    assert resp_exp.status_code == 401
    assert "Session expired" in resp_exp.json()["detail"]

    # 3. Forged JWT (signed with wrong secret) -> 401 Unauthorized
    forged_jwt = jose_jwt.encode(payload, "wrong-forged-secret-key-99999999999", algorithm="HS256")
    resp_forged = await client.get(
        "/v1/auth/me",
        headers={"Authorization": f"Bearer {forged_jwt}"}
    )
    assert resp_forged.status_code == 401
    assert "Unauthorized" in resp_forged.json()["detail"]
