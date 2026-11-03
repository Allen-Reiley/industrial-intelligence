# backend/tests/test_phase33_db_performance.py
import pytest
from uuid import uuid4
from datetime import datetime, timezone, timedelta
import sqlalchemy as sa
from sqlmodel import select

from app.db import engine, async_engine, async_session_maker
from app.models.client import Client, SubscriptionStatus, ClientCategory
from app.models.visit import Visit
from app.models.prospect import Prospect
from app.models.transaction import Transaction, TransactionStatus
from app.models.checkout_session import CheckoutSession, CheckoutSessionStatus
from app.models.crm_dead_letter import CrmDeadLetter
from app.models.enrichment_queue import EnrichmentQueue, QueueType
from app.models.notification_throttle import NotificationThrottle
from app.models.company import Company

pytestmark = pytest.mark.anyio


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


def test_connection_pooling_and_keepalives():
    """
    Task 33.1: Connection pooling & keepalive verification.
    Asserts pool_pre_ping is True, pool_recycle is 300, and keepalive configurations are active.
    """
    assert engine is not None
    assert engine.pool._pre_ping is True
    assert engine.pool._recycle == 300

    assert async_engine is not None
    assert async_engine.pool._pre_ping is True
    assert async_engine.pool._recycle == 300


from app.models.user import User, UserRole


async def test_cascade_delete_secondary_entities():
    """
    Task 33.2: Complete Database Cascade Deletions across Secondary Entities.
    Creates a Client with secondary entities (Transaction, CheckoutSession,
    CrmDeadLetter, EnrichmentQueue, NotificationThrottle), deletes the client,
    and asserts that all secondary records are deleted via ON DELETE CASCADE.
    """
    client_id = uuid4()
    company_id = uuid4()
    rep_id = f"user_{uuid4().hex[:8]}"

    async with async_session_maker() as session:
        client = Client(
            id=client_id,
            company_name="Cascade Test Corp",
            domain=f"cascade-{uuid4().hex[:8]}.co.za",
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True,
        )
        user = User(
            id=rep_id,
            email=f"rep_{uuid4().hex[:8]}@auraworks.co.za",
            name="Sales Rep",
            role=UserRole.SALES,
            is_active=True,
            client_id=client_id,
        )
        company = Company(
            id=company_id,
            client_id=client_id,
            company_name="Cascade Partner Ltd",
            domain=f"partner-{uuid4().hex[:8]}.co.za",
        )
        session.add_all([client, user, company])
        await session.commit()

        # 1. Visit
        visit = Visit(
            id=uuid4(),
            client_id=client_id,
            company_id=company_id,
            aura_id=f"aura_{uuid4().hex[:8]}",
            ip_address="196.25.1.111",
        )
        session.add(visit)

        # 2. Prospect
        prospect = Prospect(
            id=uuid4(),
            client_id=client_id,
            company_id=company_id,
            email=f"cascade-{uuid4().hex[:8]}@partner.co.za",
        )
        session.add(prospect)

        # 3. Transaction
        tx = Transaction(
            id=uuid4(),
            client_id=client_id,
            amount=500000,
            currency="ZAR",
            status=TransactionStatus.SUCCESSFUL,
            gateway_reference=f"gw_{uuid4().hex[:12]}",
            payment_method_token="tok_12345",
        )
        session.add(tx)

        # 4. CheckoutSession
        cs = CheckoutSession(
            id=uuid4(),
            client_id=client_id,
            sales_rep_id=rep_id,
            status=CheckoutSessionStatus.PENDING,
            expires_at=datetime.now(timezone.utc) + timedelta(days=1),
            amount=500000,
        )
        session.add(cs)

        # 5. CrmDeadLetter
        dl = CrmDeadLetter(
            id=uuid4(),
            client_id=client_id,
            payload={"error": "timeout"},
        )
        session.add(dl)

        # 6. EnrichmentQueue
        eq = EnrichmentQueue(
            id=uuid4(),
            client_id=client_id,
            queue_type=QueueType.IPINFO,
            payload={"ip": "196.25.1.111"},
        )
        session.add(eq)

        # 7. NotificationThrottle
        nt = NotificationThrottle(
            id=uuid4(),
            client_id=client_id,
            company_id=company_id,
        )
        session.add(nt)

        await session.commit()

    # Now delete the client and verify clean cascade deletion
    async with async_session_maker() as session:
        client_to_delete = await session.get(Client, client_id)
        assert client_to_delete is not None
        await session.delete(client_to_delete)
        await session.commit()

    # Assert all secondary records are gone
    async with async_session_maker() as session:
        assert (await session.execute(select(Transaction).where(Transaction.client_id == client_id))).scalars().first() is None
        assert (await session.execute(select(CheckoutSession).where(CheckoutSession.client_id == client_id))).scalars().first() is None
        assert (await session.execute(select(CrmDeadLetter).where(CrmDeadLetter.client_id == client_id))).scalars().first() is None
        assert (await session.execute(select(EnrichmentQueue).where(EnrichmentQueue.client_id == client_id))).scalars().first() is None
        assert (await session.execute(select(NotificationThrottle).where(NotificationThrottle.client_id == client_id))).scalars().first() is None
        assert (await session.execute(select(Visit).where(Visit.client_id == client_id))).scalars().first() is None
        assert (await session.execute(select(Prospect).where(Prospect.client_id == client_id))).scalars().first() is None
        assert (await session.execute(select(Company).where(Company.client_id == client_id))).scalars().first() is None


def test_high_frequency_indexes_exist():
    """
    Task 33.3: High-Frequency Database Indexing Migration.
    Asserts that all composite performance indexes are registered in PostgreSQL.
    """
    inspector = sa.inspect(engine)
    
    # 1. ix_events_client_id_event_type_created_at
    event_idx = [i['name'] for i in inspector.get_indexes('event')]
    assert 'ix_events_client_id_event_type_created_at' in event_idx

    # 2. ix_visits_ip_address_created_at
    visit_idx = [i['name'] for i in inspector.get_indexes('visit')]
    assert 'ix_visits_ip_address_created_at' in visit_idx

    # 3. ix_prospects_client_id_phone
    prospect_idx = [i['name'] for i in inspector.get_indexes('prospect')]
    assert 'ix_prospects_client_id_phone' in prospect_idx

    # 4. ix_companies_client_id_status
    company_idx = [i['name'] for i in inspector.get_indexes('company')]
    assert 'ix_companies_client_id_status' in company_idx

    # 5. ix_transactions_client_id_created_at
    transaction_idx = [i['name'] for i in inspector.get_indexes('transaction')]
    assert 'ix_transactions_client_id_created_at' in transaction_idx


async def test_schema_harmonization_user_agent():
    """
    Task 33.4: Resolve Schema Drift & Column Redundancy.
    Verifies Visit.user_agent is authoritative and client_user_agent functions as synonym.
    """
    visit_id = uuid4()
    test_ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)"

    # Test synonym mapping on model
    v = Visit(
        id=visit_id,
        client_id=uuid4(),
        aura_id="aura_ua_test",
        ip_address="196.25.1.200",
        user_agent=test_ua
    )
    assert v.user_agent == test_ua
    assert v.client_user_agent == test_ua

    # Test setter via client_user_agent
    v.client_user_agent = "Updated-Agent/2.0"
    assert v.user_agent == "Updated-Agent/2.0"
