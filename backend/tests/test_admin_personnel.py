# backend/tests/test_admin_personnel.py
import pytest
import httpx
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from sqlmodel import select

from app.main import app
from app.db import async_session_maker
from app.models.user import User, Session as UserSession, Account, UserRole
from app.core.security import verify_password

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
async def test_admin_personnel_creation_and_permissions():
    """
    Asserts:
    1. Unauthenticated or non-admin cannot create users (401 / 403).
    2. Admin can create new sales rep profile with hashed password in Account table.
    3. Password hash is verifiable using Better Auth scrypt logic.
    4. Duplicate email creation returns 400 Bad Request.
    5. Admin can toggle route permissions via PATCH /permissions.
    """
    client = await get_test_client()
    admin_id = f"admin_{uuid4().hex[:8]}"
    sales_id = f"sales_{uuid4().hex[:8]}"
    admin_token = f"adm_tok_{uuid4().hex[:12]}"
    sales_token = f"sales_tok_{uuid4().hex[:12]}"

    async with async_session_maker() as session:
        admin_user = User(
            id=admin_id,
            email=f"admin_{uuid4().hex[:6]}@auraworks.co.za",
            name="Super Admin",
            role=UserRole.ADMIN,
            is_active=True
        )
        sales_user = User(
            id=sales_id,
            email=f"sales_{uuid4().hex[:6]}@auraworks.co.za",
            name="Field Rep",
            role=UserRole.SALES,
            is_active=True
        )
        session.add_all([admin_user, sales_user])
        await session.commit()

        admin_sess = UserSession(
            id=f"sess_{uuid4().hex[:8]}",
            user_id=admin_id,
            token=admin_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        sales_sess = UserSession(
            id=f"sess_{uuid4().hex[:8]}",
            user_id=sales_id,
            token=sales_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        session.add_all([admin_sess, sales_sess])
        await session.commit()

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    sales_headers = {"Authorization": f"Bearer {sales_token}"}

    # 1. Unauthenticated request -> 401
    new_user_email = f"newrep_{uuid4().hex[:6]}@auraworks.co.za"
    create_payload = {
        "name": "Jane Sales",
        "email": new_user_email,
        "password": "TemporaryPassword123!",
        "role": "sales",
        "job_title": "Enterprise Sales Executive",
        "permissions": ["sales", "analytics"]
    }
    resp_anon = await client.post("/api/v1/admin/users", json=create_payload)
    assert resp_anon.status_code == 401

    # 2. Sales rep request -> 403
    resp_sales = await client.post("/api/v1/admin/users", json=create_payload, headers=sales_headers)
    assert resp_sales.status_code == 403

    # 3. Admin request -> 201 Created
    resp_admin = await client.post("/api/v1/admin/users", json=create_payload, headers=admin_headers)
    assert resp_admin.status_code == 201, resp_admin.text
    created_data = resp_admin.json()
    assert created_data["status"] == "success"
    created_user = created_data["user"]
    assert created_user["email"] == new_user_email
    assert created_user["name"] == "Jane Sales"
    assert created_user["role"] == "sales"
    assert created_user["job_title"] == "Enterprise Sales Executive"
    assert "analytics" in created_user["permissions"]
    created_user_id = created_user["id"]

    # 4. Verify Account record and password verification
    async with async_session_maker() as session:
        stmt_acc = select(Account).where(Account.user_id == created_user_id)
        acc_record = (await session.execute(stmt_acc)).scalars().first()
        assert acc_record is not None
        assert acc_record.provider_id == "credential"
        assert acc_record.password is not None
        # Verify password matches scrypt hash
        assert verify_password("TemporaryPassword123!", acc_record.password) is True
        assert verify_password("WrongPassword!", acc_record.password) is False

    # 5. Duplicate email -> 400 Bad Request
    resp_dup = await client.post("/api/v1/admin/users", json=create_payload, headers=admin_headers)
    assert resp_dup.status_code == 400
    assert "already exists" in resp_dup.json()["detail"].lower()

    # 6. Toggle permissions -> PATCH /users/{user_id}/permissions
    patch_perm_payload = {"permissions": ["analytics", "sales", "vault"]}
    resp_perm = await client.patch(
        f"/api/v1/admin/users/{created_user_id}/permissions",
        json=patch_perm_payload,
        headers=admin_headers
    )
    assert resp_perm.status_code == 200
    assert resp_perm.json()["user"]["permissions"] == ["analytics", "sales", "vault"]

    # 7. Update job title and role -> PATCH /users/{user_id}
    patch_user_payload = {"job_title": "Senior Partner", "role": "admin"}
    resp_patch = await client.patch(
        f"/api/v1/admin/users/{created_user_id}",
        json=patch_user_payload,
        headers=admin_headers
    )
    assert resp_patch.status_code == 200
    assert resp_patch.json()["user"]["job_title"] == "Senior Partner"
    assert resp_patch.json()["user"]["role"] == "admin"


@pytest.mark.asyncio
async def test_reitumetse_permanent_super_admin_immunity():
    """
    Guarantees:
    1. Creating reitumetse@auraworks.co.za even with role="sales" forces role="admin".
    2. Attempting to demote reitumetse@auraworks.co.za to "sales" via PATCH is rejected (400).
    3. Attempting to deactivate reitumetse@auraworks.co.za via PATCH is rejected (400).
    4. Session authentication for reitumetse@auraworks.co.za runtime-resolves and self-heals to active ADMIN.
    """
    client = await get_test_client()
    admin_id = f"admin_{uuid4().hex[:8]}"
    admin_token = f"adm_tok_{uuid4().hex[:12]}"
    reitumetse_id = f"reitumetse_{uuid4().hex[:8]}"
    reitumetse_token = f"reit_tok_{uuid4().hex[:12]}"

    async with async_session_maker() as session:
        admin_user = User(
            id=admin_id,
            email=f"temp_admin_{uuid4().hex[:6]}@auraworks.co.za",
            name="Temp Admin",
            role=UserRole.ADMIN,
            is_active=True
        )
        session.add(admin_user)

        # Check if reitumetse user already exists
        stmt_find = select(User).where(User.email == "reitumetse@auraworks.co.za")
        existing_reitumetse = (await session.execute(stmt_find)).scalars().first()
        if existing_reitumetse:
            reitumetse_id = existing_reitumetse.id
            existing_reitumetse.role = UserRole.SALES
            existing_reitumetse.is_active = False
            session.add(existing_reitumetse)
        else:
            reitumetse_user = User(
                id=reitumetse_id,
                email="reitumetse@auraworks.co.za",
                name="Reitumetse Sethabela",
                role=UserRole.SALES,
                is_active=False
            )
            session.add(reitumetse_user)
        await session.commit()

        admin_sess = UserSession(
            id=f"sess_{uuid4().hex[:8]}",
            user_id=admin_id,
            token=admin_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        reitumetse_sess = UserSession(
            id=f"sess_{uuid4().hex[:8]}",
            user_id=reitumetse_id,
            token=reitumetse_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        session.add_all([admin_sess, reitumetse_sess])
        await session.commit()

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    reitumetse_headers = {"Authorization": f"Bearer {reitumetse_token}"}

    # 1. Runtime self-healing: Query /api/v1/auth/me with reitumetse's session
    resp_me = await client.get("/api/v1/auth/me", headers=reitumetse_headers)
    assert resp_me.status_code == 200, resp_me.text
    me_data = resp_me.json()
    assert me_data["email"] == "reitumetse@auraworks.co.za"
    assert me_data["role"] == "admin"
    assert me_data["is_active"] is True

    # Verify DB record was healed to admin & active
    async with async_session_maker() as session:
        db_user = await session.get(User, reitumetse_id)
        assert db_user.role == UserRole.ADMIN
        assert db_user.is_active is True

    # 2. Demotion attempt via PATCH /users/{user_id} -> 400 Bad Request
    resp_demote = await client.patch(
        f"/api/v1/admin/users/{reitumetse_id}",
        json={"role": "sales"},
        headers=admin_headers
    )
    assert resp_demote.status_code == 400
    assert "cannot be demoted" in resp_demote.json()["detail"].lower()

    # 3. Deactivation attempt via PATCH /users/{user_id} -> 400 Bad Request
    resp_deact = await client.patch(
        f"/api/v1/admin/users/{reitumetse_id}",
        json={"is_active": False},
        headers=admin_headers
    )
    assert resp_deact.status_code == 400
    assert "cannot be deactivated" in resp_deact.json()["detail"].lower()

