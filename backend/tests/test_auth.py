# backend/tests/test_auth.py
import pytest
import uuid
import httpx
from datetime import datetime, timezone, timedelta
from app.main import app
from app.core.config import settings
from app.models.user import User, Session as UserSession, UserRole
from sqlmodel import select
from app.db import get_async_session

pytestmark = pytest.mark.anyio

async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="https://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="https://test")


async def test_auth_me_authenticated_and_unauthenticated():
    """
    Asserts that:
    1. Unauthenticated request to /api/v1/auth/me returns 401.
    2. Authenticated request with Better Auth token returns user details and role.
    """
    client = await get_test_client()

    # 1. Unauthenticated request -> 401
    resp_unauth = await client.get(f"{settings.API_V1_STR}/auth/me")
    assert resp_unauth.status_code == 401

    # 2. Seed Better Auth user and session in database
    user_id = f"user_{uuid.uuid4().hex[:8]}"
    session_token = f"sess_token_{uuid.uuid4().hex[:12]}"
    test_email = f"auth_test_{uuid.uuid4().hex[:6]}@auraworks.co.za"

    async for session in get_async_session():
        user = User(
            id=user_id,
            email=test_email,
            name="Auth Tester",
            role=UserRole.SALES,
            is_active=True
        )
        session.add(user)
        await session.commit()

        user_session = UserSession(
            id=f"sess_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            token=session_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        session.add(user_session)
        await session.commit()
        break

    # 3. Authenticated request with cookie
    cookies = {"better-auth.session_token": session_token}
    resp_auth = await client.get(f"{settings.API_V1_STR}/auth/me", cookies=cookies)
    assert resp_auth.status_code == 200
    data = resp_auth.json()
    assert data["id"] == user_id
    assert data["email"] == test_email
    assert data["role"] == "sales"
    assert data["is_superuser"] is False

    # 4. Authenticated request with Bearer header
    headers = {"Authorization": f"Bearer {session_token}"}
    resp_bearer = await client.get(f"{settings.API_V1_STR}/auth/me", headers=headers)
    assert resp_bearer.status_code == 200
    assert resp_bearer.json()["id"] == user_id


async def test_admin_summary_route_protection():
    """
    Asserts that the admin summary route is protected and permits access with legacy
    headers or the Better Auth Cookie/Bearer session validation.
    """
    client = await get_test_client()
    admin_password = settings.ADMIN_API_KEY or "change-me-in-production"

    # 1. Reject without auth headers (returns 401 or 403)
    response = await client.get(f"{settings.API_V1_STR}/admin/summary")
    assert response.status_code in [401, 403]

    # 2. Accept with legacy X-Aura-Token header
    response_legacy = await client.get(
        f"{settings.API_V1_STR}/admin/summary",
        headers={"X-Aura-Token": admin_password}
    )
    assert response_legacy.status_code == 200

    # 3. Accept with admin user session
    admin_user_id = f"admin_{uuid.uuid4().hex[:8]}"
    admin_token = f"admin_token_{uuid.uuid4().hex[:12]}"
    test_email = f"admin_summary_{uuid.uuid4().hex[:6]}@auraworks.co.za"

    async for session in get_async_session():
        admin_user = User(
            id=admin_user_id,
            email=test_email,
            name="Admin User",
            role=UserRole.ADMIN,
            is_active=True
        )
        session.add(admin_user)
        await session.commit()

        user_session = UserSession(
            id=f"sess_{uuid.uuid4().hex[:8]}",
            user_id=admin_user_id,
            token=admin_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        session.add(user_session)
        await session.commit()
        break

    cookies = {"better-auth.session_token": admin_token}
    resp_admin = await client.get(
        f"{settings.API_V1_STR}/admin/summary",
        cookies=cookies
    )
    assert resp_admin.status_code == 200
    data = resp_admin.json()
    assert "total_warm_leads" in data
    assert "high_intent_companies" in data


async def test_reject_raw_user_id_or_email_backdoor():
    """
    CRITICAL SECURITY REGRESSION TEST:
    Asserts that passing a raw user ID or email in the Bearer header or session cookie
    is strictly rejected with HTTP 401 Unauthorized and cannot bypass authentication.
    """
    client = await get_test_client()

    # Seed an admin user WITHOUT any session
    admin_user_id = f"admin_{uuid.uuid4().hex[:8]}"
    test_email = f"backdoor_target_{uuid.uuid4().hex[:6]}@auraworks.co.za"

    async for session in get_async_session():
        admin_user = User(
            id=admin_user_id,
            email=test_email,
            name="Target Admin",
            role=UserRole.ADMIN,
            is_active=True
        )
        session.add(admin_user)
        await session.commit()
        break

    # 1. Try raw email as Bearer token -> 401
    resp_email_bearer = await client.get(
        f"{settings.API_V1_STR}/auth/me",
        headers={"Authorization": f"Bearer {test_email}"}
    )
    assert resp_email_bearer.status_code == 401, f"Expected 401, got {resp_email_bearer.status_code}"

    # 2. Try raw user ID as Bearer token -> 401
    resp_id_bearer = await client.get(
        f"{settings.API_V1_STR}/auth/me",
        headers={"Authorization": f"Bearer {admin_user_id}"}
    )
    assert resp_id_bearer.status_code == 401, f"Expected 401, got {resp_id_bearer.status_code}"

    # 3. Try raw email as cookie -> 401
    resp_email_cookie = await client.get(
        f"{settings.API_V1_STR}/auth/me",
        cookies={"better-auth.session_token": test_email}
    )
    assert resp_email_cookie.status_code == 401, f"Expected 401, got {resp_email_cookie.status_code}"

