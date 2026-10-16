# backend/tests/test_tenant_isolation.py
import pytest
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from sqlmodel import select

from app.db import async_session_maker
from app.models.client import Client, SubscriptionStatus
from app.models.visit import Visit
from app.models.pageview import PageView
from app.models.prospect import Prospect
from app.services.intelligence import get_visitor_journey

pytestmark = pytest.mark.anyio


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


async def test_visitor_journey_strict_tenant_isolation():
    """
    Task 35.1.4: Multi-tenant perimeter isolation on get_visitor_journey.
    Creates two distinct clients (Client Alpha and Client Beta).
    Assigns the exact same device footprint (aura_id) and IP address to visits across both.
    Verifies that get_visitor_journey for Client Alpha returns strictly Client Alpha data,
    with zero leakage of visits, pageviews, or prospects from Client Beta.
    """
    client_a_id = uuid4()
    client_b_id = uuid4()
    shared_aura_id = f"aura_shared_{uuid4().hex[:8]}"
    shared_ip = "196.25.1.99"

    async with async_session_maker() as session:
        # Seed Client Alpha & Client Beta
        client_a = Client(
            id=client_a_id,
            company_name="Tenant Alpha Ltd",
            whitelisted_domains=["alpha.co.za"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        client_b = Client(
            id=client_b_id,
            company_name="Tenant Beta Ltd",
            whitelisted_domains=["beta.co.za"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add_all([client_a, client_b])

        # Client Alpha: 2 visits, 3 pageviews, 1 prospect
        visit_a1 = Visit(
            id=uuid4(),
            client_id=client_a_id,
            aura_id=shared_aura_id,
            ip_address=shared_ip,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=10)
        )
        visit_a2 = Visit(
            id=uuid4(),
            client_id=client_a_id,
            aura_id=shared_aura_id,
            ip_address=shared_ip,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=5)
        )
        session.add_all([visit_a1, visit_a2])

        pv_a1 = PageView(client_id=client_a_id, visit_id=visit_a1.id, url_path="/alpha/home")
        pv_a2 = PageView(client_id=client_a_id, visit_id=visit_a1.id, url_path="/alpha/catalogue")
        pv_a3 = PageView(client_id=client_a_id, visit_id=visit_a2.id, url_path="/alpha/contact")
        session.add_all([pv_a1, pv_a2, pv_a3])

        prospect_a = Prospect(
            id=uuid4(),
            client_id=client_a_id,
            aura_id=shared_aura_id,
            name="Alpha Lead",
            email="lead@alpha.co.za"
        )
        session.add(prospect_a)

        # Client Beta: 3 visits, 4 pageviews, 1 prospect
        visit_b1 = Visit(
            id=uuid4(),
            client_id=client_b_id,
            aura_id=shared_aura_id,
            ip_address=shared_ip,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=8)
        )
        visit_b2 = Visit(
            id=uuid4(),
            client_id=client_b_id,
            aura_id=shared_aura_id,
            ip_address=shared_ip,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=4)
        )
        visit_b3 = Visit(
            id=uuid4(),
            client_id=client_b_id,
            aura_id=shared_aura_id,
            ip_address=shared_ip,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=1)
        )
        session.add_all([visit_b1, visit_b2, visit_b3])

        pv_b1 = PageView(client_id=client_b_id, visit_id=visit_b1.id, url_path="/beta/home")
        pv_b2 = PageView(client_id=client_b_id, visit_id=visit_b2.id, url_path="/beta/pricing")
        pv_b3 = PageView(client_id=client_b_id, visit_id=visit_b2.id, url_path="/beta/checkout")
        pv_b4 = PageView(client_id=client_b_id, visit_id=visit_b3.id, url_path="/beta/confirmed")
        session.add_all([pv_b1, pv_b2, pv_b3, pv_b4])

        prospect_b = Prospect(
            id=uuid4(),
            client_id=client_b_id,
            aura_id=shared_aura_id,
            name="Beta Lead",
            email="lead@beta.co.za"
        )
        session.add(prospect_b)

        await session.commit()

    # Query journey for Client Alpha
    async with async_session_maker() as session:
        journey_a = await get_visitor_journey(str(client_a_id), shared_aura_id, session)

        # Assert total visits strictly matches Client Alpha's count
        assert journey_a["total_touches"] == 2

        # Assert pathway strictly reflects Client Alpha pages
        assert "/alpha/" in journey_a["pathway"]

        # Assert no Client Beta pages are present in Client Alpha's pathway
        assert "/beta/" not in journey_a["pathway"]

    # Query journey for Client Beta
    async with async_session_maker() as session:
        journey_b = await get_visitor_journey(str(client_b_id), shared_aura_id, session)

        # Assert total visits strictly matches Client Beta's count
        assert journey_b["total_touches"] == 3

        # Assert pathway strictly reflects Client Beta pages
        assert "/beta/" in journey_b["pathway"]

        # Assert no Client Alpha pages are present in Client Beta's pathway
        assert "/alpha/" not in journey_b["pathway"]
