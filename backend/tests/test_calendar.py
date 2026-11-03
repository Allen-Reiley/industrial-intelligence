# backend/tests/test_calendar.py
import pytest
import httpx
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from sqlmodel import select

from app.main import app
from app.db import async_session_maker
from app.models.user import User, Session as UserSession, UserRole
from app.models.calendar import CalendarEvent

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
async def test_calendar_crud_and_rbac():
    """
    Asserts:
    1. Unauthenticated request to /api/v1/calendar/events is 401.
    2. Sales Rep and Admin can create calendar events.
    3. Both can list events.
    4. Sales Rep cannot edit or delete events created by other users (403).
    5. Sales Rep can edit and delete self-created events.
    6. Admin can edit and delete any calendar event.
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
    resp_unauth = await client.get("/api/v1/calendar/events")
    assert resp_unauth.status_code == 401

    # 2. Rep A creates an event
    payload_a = {
        "title": "Client Discovery Call",
        "start_time": (now + timedelta(days=1)).isoformat(),
        "end_time": (now + timedelta(days=1, hours=1)).isoformat(),
        "all_day": False,
        "category": "primary"
    }
    resp_create_a = await client.post("/api/v1/calendar/events", json=payload_a, headers=headers_a)
    assert resp_create_a.status_code == 201
    event_a_id = resp_create_a.json()["event"]["id"]
    assert resp_create_a.json()["event"]["title"] == "Client Discovery Call"

    # 3. List events as Rep B -> Can see Rep A's event
    resp_list_b = await client.get("/api/v1/calendar/events", headers=headers_b)
    assert resp_list_b.status_code == 200
    events_b = resp_list_b.json()
    assert any(e["id"] == event_a_id for e in events_b)

    # 4. Rep B tries to modify Rep A's event -> 403 Forbidden
    resp_edit_b = await client.put(
        f"/api/v1/calendar/events/{event_a_id}",
        json={"title": "Hacked Title"},
        headers=headers_b
    )
    assert resp_edit_b.status_code == 403

    # 5. Rep B tries to delete Rep A's event -> 403 Forbidden
    resp_del_b = await client.delete(
        f"/api/v1/calendar/events/{event_a_id}",
        headers=headers_b
    )
    assert resp_del_b.status_code == 403

    # 6. Rep A updates their own event -> 200 OK
    resp_update_a = await client.put(
        f"/api/v1/calendar/events/{event_a_id}",
        json={"title": "Updated Discovery Call", "category": "success"},
        headers=headers_a
    )
    assert resp_update_a.status_code == 200
    assert resp_update_a.json()["event"]["title"] == "Updated Discovery Call"
    assert resp_update_a.json()["event"]["extendedProps"]["category"] == "success"

    # 7. Admin updates Rep A's event -> 200 OK (Admin override)
    resp_update_admin = await client.put(
        f"/api/v1/calendar/events/{event_a_id}",
        json={"title": "Admin Modified Call"},
        headers=headers_admin
    )
    assert resp_update_admin.status_code == 200
    assert resp_update_admin.json()["event"]["title"] == "Admin Modified Call"

    # 8. Admin deletes event -> 200 OK
    resp_del_admin = await client.delete(
        f"/api/v1/calendar/events/{event_a_id}",
        headers=headers_admin
    )
    assert resp_del_admin.status_code == 200
    assert resp_del_admin.json()["status"] == "success"
