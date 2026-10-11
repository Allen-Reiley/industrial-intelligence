# backend/tests/test_tasks.py
import pytest
import httpx
from uuid import uuid4
from datetime import datetime, timezone, timedelta

from app.main import app
from app.db import async_session_maker
from app.models.user import User, Session as UserSession, UserRole
from app.models.task import Task

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
async def test_tasks_crud_and_rbac():
    """
    Asserts:
    1. Unauthenticated request to /api/v1/tasks returns 401.
    2. Sales Reps can create tasks.
    3. Sales Rep only sees tasks created by or assigned to them.
    4. Admin sees all company tasks.
    5. Sales Rep cannot modify or delete other reps' tasks (403).
    6. Sales Rep can update status and details on their own tasks.
    7. Admin has global override to update and delete any task.
    """
    client = await get_test_client()
    rep_a_id = f"rep_a_{uuid4().hex[:8]}"
    rep_b_id = f"rep_b_{uuid4().hex[:8]}"
    admin_id = f"admin_{uuid4().hex[:8]}"
    token_a = f"tok_a_{uuid4().hex[:12]}"
    token_b = f"tok_b_{uuid4().hex[:12]}"
    token_admin = f"tok_adm_{uuid4().hex[:12]}"

    now = datetime.now(timezone.utc)

    async with async_session_maker() as session:
        user_a = User(id=rep_a_id, email=f"repa_{uuid4().hex[:6]}@auraworks.co.za", name="Rep A", role=UserRole.SALES, is_active=True)
        user_b = User(id=rep_b_id, email=f"repb_{uuid4().hex[:6]}@auraworks.co.za", name="Rep B", role=UserRole.SALES, is_active=True)
        admin = User(id=admin_id, email=f"admin_{uuid4().hex[:6]}@auraworks.co.za", name="Admin", role=UserRole.ADMIN, is_active=True)
        session.add_all([user_a, user_b, admin])
        await session.commit()

        sess_a = UserSession(id=f"sess_{uuid4().hex[:8]}", user_id=rep_a_id, token=token_a, expires_at=now + timedelta(days=7))
        sess_b = UserSession(id=f"sess_{uuid4().hex[:8]}", user_id=rep_b_id, token=token_b, expires_at=now + timedelta(days=7))
        sess_adm = UserSession(id=f"sess_{uuid4().hex[:8]}", user_id=admin_id, token=token_admin, expires_at=now + timedelta(days=7))
        session.add_all([sess_a, sess_b, sess_adm])
        await session.commit()

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}
    headers_admin = {"Authorization": f"Bearer {token_admin}"}

    # 1. Unauthenticated -> 401
    resp_unauth = await client.get("/api/v1/tasks")
    assert resp_unauth.status_code == 401

    # 2. Rep A creates a task
    payload_a = {
        "title": "Follow up with Sasol Procurement",
        "description": "Send compliance deck and schedule tech alignment call",
        "priority": "high",
        "status": "todo"
    }
    resp_create_a = await client.post("/api/v1/tasks", json=payload_a, headers=headers_a)
    assert resp_create_a.status_code == 201
    task_a_id = resp_create_a.json()["task"]["id"]
    assert resp_create_a.json()["task"]["title"] == "Follow up with Sasol Procurement"
    assert resp_create_a.json()["task"]["created_by_id"] == rep_a_id

    # 3. Rep B creates a task
    payload_b = {
        "title": "Exxaro Contract Review",
        "description": "Verify SLA parameters",
        "priority": "urgent",
        "status": "todo"
    }
    resp_create_b = await client.post("/api/v1/tasks", json=payload_b, headers=headers_b)
    assert resp_create_b.status_code == 201
    task_b_id = resp_create_b.json()["task"]["id"]

    # 4. Scoping: Rep A lists tasks -> sees task_a, does NOT see task_b
    resp_list_a = await client.get("/api/v1/tasks", headers=headers_a)
    assert resp_list_a.status_code == 200
    tasks_a = resp_list_a.json()
    task_ids_a = [t["id"] for t in tasks_a]
    assert task_a_id in task_ids_a
    assert task_b_id not in task_ids_a

    # 5. Admin lists tasks -> sees BOTH task_a and task_b
    resp_list_admin = await client.get("/api/v1/tasks", headers=headers_admin)
    assert resp_list_admin.status_code == 200
    tasks_admin = resp_list_admin.json()
    task_ids_admin = [t["id"] for t in tasks_admin]
    assert task_a_id in task_ids_admin
    assert task_b_id in task_ids_admin

    # 6. Rep B tries to update Rep A's task -> 403 Forbidden
    resp_hack = await client.patch(
        f"/api/v1/tasks/{task_a_id}",
        json={"status": "done"},
        headers=headers_b
    )
    assert resp_hack.status_code == 403

    # 7. Rep B tries to delete Rep A's task -> 403 Forbidden
    resp_del_hack = await client.delete(
        f"/api/v1/tasks/{task_a_id}",
        headers=headers_b
    )
    assert resp_del_hack.status_code == 403

    # 8. Rep A updates their own task status to 'in_progress' -> 200 OK
    resp_update_a = await client.patch(
        f"/api/v1/tasks/{task_a_id}",
        json={"status": "in_progress"},
        headers=headers_a
    )
    assert resp_update_a.status_code == 200
    assert resp_update_a.json()["task"]["status"] == "in_progress"

    # 9. Admin updates task_b -> 200 OK
    resp_update_admin = await client.patch(
        f"/api/v1/tasks/{task_b_id}",
        json={"priority": "low"},
        headers=headers_admin
    )
    assert resp_update_admin.status_code == 200
    assert resp_update_admin.json()["task"]["priority"] == "low"

    # 10. Admin deletes task_b -> 200 OK
    resp_del_admin = await client.delete(
        f"/api/v1/tasks/{task_b_id}",
        headers=headers_admin
    )
    assert resp_del_admin.status_code == 200
