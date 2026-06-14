# backend/tests/test_tenant_auth.py
import pytest
import uuid
from uuid import uuid4
import httpx

from app.main import app
from app.core.config import settings
from app.db import async_session_maker
from app.models.client import Client
from app.models.user import User
from sqlmodel import select
from fastapi_users.password import PasswordHelper
from app.core.users import get_jwt_strategy

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

async def get_auth_cookies_for_user(session, email: str, is_superuser: bool, client_id: uuid.UUID = None):
    stmt = select(User).where(User.email == email)
    res = await session.execute(stmt)
    user = res.scalars().first()
    if not user:
        password_helper = PasswordHelper()
        user = User(
            id=uuid.uuid4(),
            email=email,
            hashed_password=password_helper.hash("admin_pass_123"),
            is_active=True,
            is_verified=True,
            is_superuser=is_superuser,
            client_id=client_id
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
    else:
        user.client_id = client_id
        user.is_superuser = is_superuser
        session.add(user)
        await session.commit()
        await session.refresh(user)
    
    jwt_strategy = get_jwt_strategy()
    token = await jwt_strategy.write_token(user)
    return {"aurahq_auth": token}

async def test_tenant_gating_leads():
    client = await get_test_client()
    
    client_a_id = uuid4()
    client_b_id = uuid4()
    
    async with async_session_maker() as session:
        # Seed two clients
        client_a = Client(id=client_a_id, company_name="Client A", whitelisted_domains=["a.com"])
        client_b = Client(id=client_b_id, company_name="Client B", whitelisted_domains=["b.com"])
        session.add(client_a)
        session.add(client_b)
        await session.commit()
        
        # User 1: assigned to Client A (non-superuser)
        cookies_user_a = await get_auth_cookies_for_user(session, "user-a@tenant.com", is_superuser=False, client_id=client_a_id)
        
        # User 2: superuser
        cookies_superuser = await get_auth_cookies_for_user(session, "superuser@tenant.com", is_superuser=True, client_id=None)

    # 1. User A queries Client A (Authorized) -> Expect 200 OK
    res1 = await client.get(
        f"{settings.API_V1_STR}/leads/?client_id={client_a_id}",
        cookies=cookies_user_a
    )
    assert res1.status_code == 200

    # 2. User A queries Client B (Forbidden) -> Expect 403 Forbidden
    res2 = await client.get(
        f"{settings.API_V1_STR}/leads/?client_id={client_b_id}",
        cookies=cookies_user_a
    )
    assert res2.status_code == 403
    assert "Tenant data access violation" in res2.json()["detail"]

    # 3. Superuser queries Client B (Authorized because superuser bypasses tenant checks) -> Expect 200 OK
    res3 = await client.get(
        f"{settings.API_V1_STR}/leads/?client_id={client_b_id}",
        cookies=cookies_superuser
    )
    assert res3.status_code == 200

    # 4. User A queries leads WITHOUT client_id -> Expect 200 OK (resolves to Client A)
    res4 = await client.get(
        f"{settings.API_V1_STR}/leads/",
        cookies=cookies_user_a
    )
    assert res4.status_code == 200

    # 5. Superuser queries leads WITHOUT client_id -> Expect 400 Bad Request (since superuser has no client_id)
    res5 = await client.get(
        f"{settings.API_V1_STR}/leads/",
        cookies=cookies_superuser
    )
    assert res5.status_code == 400
    assert "client_id query parameter is required for superusers" in res5.json()["detail"]

