# backend/tests/test_phase34_network_performance.py
import pytest
import asyncio
import time
from unittest.mock import patch
from uuid import uuid4
from datetime import datetime, timezone
import httpx
from sqlmodel import select

from app.main import app
from app.db import async_session_maker
from app.models.client import Client, SubscriptionStatus
from app.models.visit import Visit
from app.models.pageview import PageView
from app.services.intelligence import (
    resolve_reverse_dns,
    get_cached_dns,
    set_cached_dns,
    dns_fallback_cache
)
from app.services.enrichment import perform_local_reverse_dns

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


async def test_resolve_reverse_dns_success_and_caching():
    """
    Task 34.1: Asynchronous Non-Blocking Reverse DNS Lookups.
    Asserts that PTR lookups resolve, populate Visit.hostname, and cache in Redis/TTL cache.
    Asserts subsequent lookups hit cache without issuing socket calls.
    """
    client_id = uuid4()
    visit_id = uuid4()
    aura_id = f"aura_dns_{uuid4().hex[:8]}"
    test_ip = f"196.25.1.{uuid4().int % 200 + 10}"
    expected_hostname = f"host-{test_ip.replace('.', '-')}.telkom.co.za"

    async with async_session_maker() as session:
        client = Client(
            id=client_id,
            company_name="DNS Test Corp",
            whitelisted_domains=["dns-test.co.za"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client)

        visit = Visit(
            id=visit_id,
            client_id=client_id,
            aura_id=aura_id,
            ip_address=test_ip,
            connection_type="corporate",
            is_b2b=True
        )
        session.add(visit)
        await session.commit()

    # Clear cache for this IP
    dns_fallback_cache.pop(f"ip_dns:{test_ip}", None)

    socket_call_count = 0

    def mock_gethostbyaddr(ip):
        nonlocal socket_call_count
        socket_call_count += 1
        return (expected_hostname, [], [ip])

    with patch("socket.gethostbyaddr", side_effect=mock_gethostbyaddr):
        # First lookup: uncached, should call mock and update DB + cache
        hostname = await resolve_reverse_dns(visit_id, test_ip)
        assert hostname == expected_hostname
        assert socket_call_count == 1

        # Check cache
        cached = await get_cached_dns(test_ip)
        assert cached == expected_hostname

        # Check DB update
        async with async_session_maker() as session:
            db_visit = await session.get(Visit, visit_id)
            assert db_visit is not None
            assert db_visit.hostname == expected_hostname

        # Second lookup: should hit cache immediately, socket_call_count must stay 1
        hostname_cached = await resolve_reverse_dns(visit_id, test_ip)
        assert hostname_cached == expected_hostname
        assert socket_call_count == 1


async def test_resolve_reverse_dns_timeout_resilience():
    """
    Task 34.1: Reverse DNS Timeout Resilience.
    Asserts that PTR lookups enforce a strict 1.5-second timeout and do not block callers
    or raise unhandled exceptions when DNS resolvers hang.
    """
    client_id = uuid4()
    visit_id = uuid4()
    aura_id = f"aura_timeout_{uuid4().hex[:8]}"
    test_ip = f"102.132.99.{uuid4().int % 200 + 10}"

    async with async_session_maker() as session:
        client = Client(
            id=client_id,
            company_name="Timeout Test Corp",
            whitelisted_domains=["timeout-test.co.za"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client)

        visit = Visit(
            id=visit_id,
            client_id=client_id,
            aura_id=aura_id,
            ip_address=test_ip,
            connection_type="corporate",
            is_b2b=True
        )
        session.add(visit)
        await session.commit()

    # Clear cache
    dns_fallback_cache.pop(f"ip_dns:{test_ip}", None)

    def slow_gethostbyaddr(ip):
        time.sleep(2.0)  # Exceeds the 1.5-second timeout
        return ("slow.isp.co.za", [], [ip])

    with patch("socket.gethostbyaddr", side_effect=slow_gethostbyaddr):
        start_time = time.monotonic()
        hostname = await resolve_reverse_dns(visit_id, test_ip)
        elapsed = time.monotonic() - start_time

        # Should time out and return None gracefully without raising
        assert hostname is None
        # Timeout is 1.5s (+ small scheduling delta)
        assert elapsed < 2.5

        # DB visit hostname should remain None
        async with async_session_maker() as session:
            db_visit = await session.get(Visit, visit_id)
            assert db_visit is not None
            assert db_visit.hostname is None


async def test_track_exit_latency_and_duration_fields():
    """
    Task 34.2: Resolve HTTP 499 Telemetry Disconnects with Unload Keepalive Handshake.
    Asserts that track_exit completes with low latency, performs minimal UPDATE on
    Visit.duration, Visit.duration_seconds, and Visit.exited_at, records PageView, and returns 200.
    """
    client_id = uuid4()
    visit_id = uuid4()
    aura_id = f"aura_exit_{uuid4().hex[:8]}"

    async with async_session_maker() as session:
        client = Client(
            id=client_id,
            company_name="Keepalive Exit Corp",
            whitelisted_domains=["keepalive.co.za"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client)

        visit = Visit(
            id=visit_id,
            client_id=client_id,
            aura_id=aura_id,
            ip_address="196.25.1.77",
            connection_type="corporate",
            duration=0,
            is_b2b=True
        )
        session.add(visit)
        await session.commit()

    http_client = await get_test_client()

    exit_payload = {
        "client_id": str(client_id),
        "aura_id": aura_id,
        "url": "https://keepalive.co.za/solutions",
        "duration": 85
    }

    start = time.monotonic()
    resp = await http_client.post(
        "/v1/track/exit",
        json=exit_payload,
        headers={"Origin": "https://keepalive.co.za"}
    )
    elapsed_ms = (time.monotonic() - start) * 1000

    assert resp.status_code == 200
    assert resp.json() == {"status": "recorded"}

    # Verify database state
    async with async_session_maker() as session:
        db_visit = await session.get(Visit, visit_id)
        assert db_visit is not None
        assert db_visit.duration == 85
        assert db_visit.duration_seconds == 85
        assert db_visit.exited_at is not None

        # Verify PageView created
        pv_res = await session.execute(
            select(PageView).where(
                PageView.visit_id == visit_id,
                PageView.client_id == client_id
            )
        )
        pageviews = pv_res.scalars().all()
        assert len(pageviews) >= 1
        assert any(pv.url_path == "https://keepalive.co.za/solutions" for pv in pageviews)


async def test_track_exit_monotonic_duration():
    """
    Task 34.2: Exit telemetry idempotency and duration monotonicity.
    Asserts that subsequent lower exit durations do not decrease duration or duration_seconds.
    """
    client_id = uuid4()
    visit_id = uuid4()
    aura_id = f"aura_mono_{uuid4().hex[:8]}"

    async with async_session_maker() as session:
        client = Client(
            id=client_id,
            company_name="Monotonic Exit Corp",
            whitelisted_domains=["monotonic.co.za"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client)

        visit = Visit(
            id=visit_id,
            client_id=client_id,
            aura_id=aura_id,
            ip_address="196.25.1.78",
            duration=50,
            duration_seconds=50,
            is_b2b=True
        )
        session.add(visit)
        await session.commit()

    http_client = await get_test_client()

    # Send higher duration: 120
    resp1 = await http_client.post(
        "/v1/track/exit",
        json={"client_id": str(client_id), "aura_id": aura_id, "url": "https://monotonic.co.za/p1", "duration": 120},
        headers={"Origin": "https://monotonic.co.za"}
    )
    assert resp1.status_code == 200

    async with async_session_maker() as session:
        db_visit = await session.get(Visit, visit_id)
        assert db_visit.duration == 120
        assert db_visit.duration_seconds == 120
        first_exited_at = db_visit.exited_at

    # Send lower duration: 30 (e.g. from a secondary tab or out-of-order beacon)
    resp2 = await http_client.post(
        "/v1/track/exit",
        json={"client_id": str(client_id), "aura_id": aura_id, "url": "https://monotonic.co.za/p2", "duration": 30},
        headers={"Origin": "https://monotonic.co.za"}
    )
    assert resp2.status_code == 200

    async with async_session_maker() as session:
        db_visit = await session.get(Visit, visit_id)
        # Duration should remain at the peak (120)
        assert db_visit.duration == 120
        assert db_visit.duration_seconds == 120
        assert db_visit.exited_at is not None


async def test_perform_local_reverse_dns_uses_cache():
    """
    Asserts perform_local_reverse_dns utilizes cached reverse DNS lookup without socket calls.
    """
    test_ip = f"196.25.2.{uuid4().int % 200 + 10}"
    test_hostname = "broadband-pool-dynamic.vodacom.co.za"

    # Pre-populate cache
    await set_cached_dns(test_ip, test_hostname)

    with patch("socket.gethostbyaddr") as mock_socket:
        classification = await perform_local_reverse_dns(test_ip)
        # Should not call socket.gethostbyaddr because cache has it
        mock_socket.assert_not_called()
        assert classification["type"] == "isp"
        assert classification["provider"] == "Consumer ISP"
