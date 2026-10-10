# backend/tests/test_cross_origin_auth.py
import pytest
import httpx
import uuid
from app.main import app
from app.core.config import settings
from app.models.user import User, UserRole
from app.db import get_async_session
from sqlmodel import select

pytestmark = pytest.mark.anyio

async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="https://api.auraworks.co.za")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="https://api.auraworks.co.za")

async def test_cross_origin_cookie_auth():
    """
    Mock an authenticated request from www.auraworks.co.za
    to api.auraworks.co.za, verifying that the cookie is parsed correctly.
    """
    client = await get_test_client()
    
    # 1. Create a test admin user
    user_id = f"cross_user_{uuid.uuid4().hex[:8]}"
    test_email = f"cross-origin-user-{uuid.uuid4().hex[:6]}@auraworks.co.za"
    
    async for session in get_async_session():
        user = User(
            id=user_id,
            email=test_email,
            name="Cross User",
            role=UserRole.ADMIN,
            is_active=True
        )
        session.add(user)
        await session.commit()
        break

    # 2. Perform a request simulating www.auraworks.co.za origin with session cookie
    headers = {
        "Origin": "https://www.auraworks.co.za",
        "Referer": "https://www.auraworks.co.za/",
    }
    
    cookies = {
        "better-auth.session_token": user_id
    }
    
    response = await client.get(
        f"{settings.API_V1_STR}/admin/summary",
        headers=headers,
        cookies=cookies
    )
    
    # Verify that the request succeeded and the cookie was parsed successfully
    assert response.status_code == 200
    data = response.json()
    assert "total_warm_leads" in data
    assert "high_intent_companies" in data
    
    # Clean up test user
    async for session in get_async_session():
        stmt_cleanup = select(User).where(User.id == user_id)
        res_cleanup = await session.execute(stmt_cleanup)
        existing_user = res_cleanup.scalars().first()
        if existing_user:
            await session.delete(existing_user)
            await session.commit()
        break
