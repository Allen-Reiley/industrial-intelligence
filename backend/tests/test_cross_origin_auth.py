# backend/tests/test_cross_origin_auth.py
import pytest
import httpx
import uuid
from app.main import app
from app.core.config import settings
from app.core.users import get_jwt_strategy
from app.models.user import User
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
    Test Task 3: Mock an authenticated request from www.auraworks.co.za
    to api.auraworks.co.za, verifying that the cookie is parsed correctly
    under the .auraworks.co.za wildcard domain.
    """
    client = await get_test_client()
    
    # 1. Create a test user
    test_email = f"cross-origin-user-{uuid.uuid4()}@auraworks.co.za"
    test_password = "secure_password_123"
    
    from fastapi_users.password import PasswordHelper
    password_helper = PasswordHelper()
    hashed_pwd = password_helper.hash(test_password)
    
    async for session in get_async_session():
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

    # 2. Generate authentication token using the backend's JWT strategy
    strategy = get_jwt_strategy()
    token = await strategy.write_token(user)
    
    # 3. Perform a request to api.auraworks.co.za simulating coming from www.auraworks.co.za
    # We pass the aurahq_auth cookie. Because the cookie domain is .auraworks.co.za, 
    # it matches api.auraworks.co.za.
    headers = {
        "Origin": "https://www.auraworks.co.za",
        "Referer": "https://www.auraworks.co.za/",
    }
    
    cookies = {
        "aurahq_auth": token
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
        stmt_cleanup = select(User).where(User.email == test_email)
        res_cleanup = await session.execute(stmt_cleanup)
        existing_user = res_cleanup.scalars().first()
        if existing_user:
            await session.delete(existing_user)
            await session.commit()
        break
