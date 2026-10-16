# backend/tests/test_cascade_deletes.py
import pytest
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from sqlmodel import select

from app.db import async_session_maker
from app.models.user import User, UserRole
from app.models.client import Client, SubscriptionStatus
from app.models.company import Company
from app.models.visit import Visit
from app.models.pageview import PageView
from app.models.event import Event
from app.models.prospect import Prospect
from app.models.transaction import Transaction, TransactionStatus
from app.models.checkout_session import CheckoutSession, CheckoutSessionStatus
from app.models.crm_dead_letter import CrmDeadLetter
from app.models.enrichment_queue import EnrichmentQueue, QueueType
from app.models.notification_throttle import NotificationThrottle

pytestmark = pytest.mark.anyio


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


async def test_complete_cascade_deletion_on_client_removal():
    """
    Task 35.1.5: Database cascade delete verification across all secondary entities.
    Creates a Client with associated visits, pageviews, events, prospects, transactions,
    checkout sessions, CRM dead letters, enrichment queues, and notification throttles.
    Deletes the Client and verifies that all associated secondary rows are cleanly cascade-deleted.
    """
    client_id = uuid4()
    company_id = uuid4()
    visit_id = uuid4()
    prospect_id = uuid4()
    aura_id = f"aura_cascade_{uuid4().hex[:8]}"

    async with async_session_maker() as session:
        # 1. Create Client
        client = Client(
            id=client_id,
            company_name="Cascade Deletion Corp",
            whitelisted_domains=["cascade-del.co.za"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client)

        # 2. Create Company
        company = Company(
            id=company_id,
            client_id=client_id,
            company_name="Cascade Subsidiary",
            domain="cascade-del.co.za"
        )
        session.add(company)

        # 3. Create Visit, PageView, Event
        visit = Visit(
            id=visit_id,
            client_id=client_id,
            company_id=company_id,
            aura_id=aura_id,
            ip_address="196.25.1.44"
        )
        session.add(visit)

        pageview = PageView(
            client_id=client_id,
            visit_id=visit_id,
            url_path="/products"
        )
        session.add(pageview)

        event = Event(
            client_id=client_id,
            visit_id=visit_id,
            event_type="catalog_download",
            timestamp=datetime.now(timezone.utc)
        )
        session.add(event)

        # 4. Create Prospect
        prospect = Prospect(
            id=prospect_id,
            client_id=client_id,
            aura_id=aura_id,
            name="Cascade Lead",
            email="lead@cascade-del.co.za"
        )
        session.add(prospect)

        # 5. Create Sales Rep User for CheckoutSession foreign key
        rep_id = f"user_{uuid4().hex[:8]}"
        rep_user = User(
            id=rep_id,
            email=f"rep_{uuid4().hex[:6]}@auraworks.co.za",
            name="Cascade Sales Rep",
            role=UserRole.SALES,
            is_active=True
        )
        session.add(rep_user)
        await session.commit()

        # 6. Create Secondary Entities: Transaction, CheckoutSession, CRMDeadLetter, EnrichmentQueue, NotificationThrottle
        transaction = Transaction(
            id=uuid4(),
            client_id=client_id,
            amount=500000,
            status=TransactionStatus.SUCCESSFUL,
            gateway_reference=f"gw_{uuid4().hex[:12]}",
            payment_method_token="tok_12345"
        )
        session.add(transaction)

        checkout_session = CheckoutSession(
            id=uuid4(),
            client_id=client_id,
            sales_rep_id=rep_id,
            plan="enterprise",
            amount=500000,
            status=CheckoutSessionStatus.PAID,
            expires_at=datetime.now(timezone.utc) + timedelta(days=1)
        )
        session.add(checkout_session)

        crm_dead_letter = CrmDeadLetter(
            id=uuid4(),
            client_id=client_id,
            endpoint="https://crm.cascade-del.co.za/leads",
            payload={"lead": "test"},
            error_message="Gateway timeout"
        )
        session.add(crm_dead_letter)

        enrichment_item = EnrichmentQueue(
            id=uuid4(),
            client_id=client_id,
            visit_id=visit_id,
            aura_id=aura_id,
            queue_type=QueueType.IPINFO,
            payload={"ip": "196.25.1.44"},
            status="pending"
        )
        session.add(enrichment_item)

        throttle = NotificationThrottle(
            id=uuid4(),
            client_id=client_id,
            company_id=company_id
        )
        session.add(throttle)

        await session.commit()

    # 6. Delete the Client
    async with async_session_maker() as session:
        client_to_delete = await session.get(Client, client_id)
        assert client_to_delete is not None
        await session.delete(client_to_delete)
        await session.commit()

    # 7. Assert that all related records have been cascade-deleted
    async with async_session_maker() as session:
        # Client deleted
        assert await session.get(Client, client_id) is None

        # Visits deleted
        visits = (await session.execute(select(Visit).where(Visit.client_id == client_id))).scalars().all()
        assert len(visits) == 0

        # PageViews deleted
        pvs = (await session.execute(select(PageView).where(PageView.client_id == client_id))).scalars().all()
        assert len(pvs) == 0

        # Events deleted
        events = (await session.execute(select(Event).where(Event.client_id == client_id))).scalars().all()
        assert len(events) == 0

        # Prospects deleted
        prospects = (await session.execute(select(Prospect).where(Prospect.client_id == client_id))).scalars().all()
        assert len(prospects) == 0

        # Transactions deleted
        txs = (await session.execute(select(Transaction).where(Transaction.client_id == client_id))).scalars().all()
        assert len(txs) == 0

        # CheckoutSessions deleted
        css = (await session.execute(select(CheckoutSession).where(CheckoutSession.client_id == client_id))).scalars().all()
        assert len(css) == 0

        # CRM Dead Letters deleted
        cdls = (await session.execute(select(CrmDeadLetter).where(CrmDeadLetter.client_id == client_id))).scalars().all()
        assert len(cdls) == 0

        # Enrichment items deleted
        eqs = (await session.execute(select(EnrichmentQueue).where(EnrichmentQueue.client_id == client_id))).scalars().all()
        assert len(eqs) == 0

        # Notification throttles deleted
        nthr = (await session.execute(select(NotificationThrottle).where(NotificationThrottle.client_id == client_id))).scalars().all()
        assert len(nthr) == 0
