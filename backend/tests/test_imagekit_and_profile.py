# backend/tests/test_imagekit_and_profile.py
import pytest
import httpx
import hmac
import hashlib
from uuid import uuid4
from datetime import datetime, timezone, timedelta

from app.main import app
from app.db import async_session_maker
from app.models.user import User, Session as UserSession, UserRole
from app.core.config import settings

pytestmark = pytest.mark.anyio

@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"

async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="http://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="http://test")


@pytest.mark.asyncio
async def test_imagekit_auth_and_profile_update():
    """
    Asserts:
    1. Unauthenticated request to /imagekit-auth returns 401.
    2. Authenticated user receives valid ImageKit signature, token, and expire.
    3. Generated signature matches HMAC-SHA1 specification.
    4. Authenticated user can update their profile name, image URL, and job title via PATCH /me.
    5. GET /me returns updated user profile fields.
    """
    client = await get_test_client()
    user_id = f"user_{uuid4().hex[:8]}"
    token = f"tok_{uuid4().hex[:12]}"
    user_email = f"profile_test_{uuid4().hex[:6]}@auraworks.co.za"

    async with async_session_maker() as session:
        user = User(
            id=user_id,
            email=user_email,
            name="Initial Name",
            role=UserRole.SALES,
            job_title="Sales Rep",
            is_active=True
        )
        session.add(user)
        await session.commit()

        user_sess = UserSession(
            id=f"sess_{uuid4().hex[:8]}",
            user_id=user_id,
            token=token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        session.add(user_sess)
        await session.commit()

    headers = {"Authorization": f"Bearer {token}"}

    # 1. Unauthenticated ImageKit auth -> 401
    resp_unauth = await client.get("/api/v1/auth/imagekit-auth")
    assert resp_unauth.status_code == 401

    # 2. Authenticated ImageKit auth -> 200
    resp_ik = await client.get("/api/v1/auth/imagekit-auth", headers=headers)
    assert resp_ik.status_code == 200
    ik_data = resp_ik.json()
    assert "token" in ik_data
    assert "expire" in ik_data
    assert "signature" in ik_data

    # 3. Verify signature matches HMAC-SHA1
    ik_token = ik_data["token"]
    ik_expire = ik_data["expire"]
    private_key = settings.IMAGEKIT_PRIVATE_KEY or "mock_private_key"
    expected_sig = hmac.new(
        private_key.encode("utf-8"),
        f"{ik_token}{ik_expire}".encode("utf-8"),
        hashlib.sha1
    ).hexdigest()
    assert ik_data["signature"] == expected_sig

    # 4. Update profile via PATCH /me
    avatar_url = "https://ik.imagekit.io/auraworks/avatars/user_custom_pic.jpg"
    patch_payload = {
        "name": "Jane Doe, Director",
        "image": avatar_url,
        "job_title": "Director of Strategic Accounts"
    }
    resp_patch = await client.patch("/api/v1/auth/me", json=patch_payload, headers=headers)
    assert resp_patch.status_code == 200
    patch_data = resp_patch.json()
    assert patch_data["status"] == "success"
    assert patch_data["user"]["name"] == "Jane Doe, Director"
    assert patch_data["user"]["image"] == avatar_url
    assert patch_data["user"]["job_title"] == "Director of Strategic Accounts"

    # 5. Fetch profile via GET /me -> matches updated values
    resp_me = await client.get("/api/v1/auth/me", headers=headers)
    assert resp_me.status_code == 200
    me_data = resp_me.json()
    assert me_data["name"] == "Jane Doe, Director"
    assert me_data["image"] == avatar_url
    assert me_data["job_title"] == "Director of Strategic Accounts"
    assert "permissions" in me_data
