import pytest
from uuid import uuid4
from datetime import datetime, timezone
from sqlalchemy import text
from sqlmodel import select, create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.db import get_async_session, current_client_id, async_engine
from app.models.client import Client, ClientCategory, SubscriptionStatus
from app.models.visit import Visit, VerificationStatus

pytestmark = pytest.mark.anyio

async def test_row_level_security_isolation():
    """
    Verifies that Row-Level Security constraints strictly isolate 
    client interaction records (Visit) across multi-tenant contexts.
    """
    if not async_engine or "postgresql" not in async_engine.url.drivername:
        pytest.skip("SQLAlchemy is not configured for a PostgreSQL driver. Skipping RLS tests.")

    # 1. Establish the non-owner RLS test user/role.
    # Clean up any existing instances of the role first using an isolated session.
    try:
        async with AsyncSession(async_engine) as cleanup_session:
            await cleanup_session.execute(text("REASSIGN OWNED BY rls_test_user TO postgres;"))
            await cleanup_session.execute(text("DROP OWNED BY rls_test_user;"))
            await cleanup_session.commit()
    except Exception:
        pass

    async with AsyncSession(async_engine) as admin_session:
        await admin_session.execute(text("DROP ROLE IF EXISTS rls_test_user;"))
        
        await admin_session.execute(
            text("CREATE ROLE rls_test_user WITH LOGIN PASSWORD 'rls_test_pass';")
        )
        await admin_session.execute(
            text("GRANT ALL PRIVILEGES ON SCHEMA public TO rls_test_user;")
        )
        await admin_session.execute(
            text("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rls_test_user;")
        )
        await admin_session.execute(
            text("GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rls_test_user;")
        )
        await admin_session.commit()

    # Create a separate connection URL and engine for the RLS test user
    base_url = str(async_engine.url)
    # Parse and swap username and password in connection string
    # Connection format: postgresql+asyncpg://postgres:postgres@localhost:5433/industrial_db
    import re
    rls_url = re.sub(r"://[^@]+@", "://rls_test_user:rls_test_pass@", base_url)
    
    rls_engine = create_async_engine(rls_url, echo=False)

    client_a_id = uuid4()
    client_b_id = uuid4()

    try:
        # 2. Insert root clients and visits using the admin session (which bypasses RLS).
        async with AsyncSession(async_engine) as admin_session:
            client_a = Client(
                id=client_a_id,
                company_name="RLS Client Alpha",
                domain="rls-alpha.com",
                category=ClientCategory.INDUSTRIAL,
                client_product_description="Alpha Products",
                subscription_status=SubscriptionStatus.ACTIVE,
                payment_plan="enterprise",
                setup_fee_paid=True,
                is_active=True,
                created_at=datetime.now(timezone.utc).replace(tzinfo=None)
            )
            client_b = Client(
                id=client_b_id,
                company_name="RLS Client Beta",
                domain="rls-beta.com",
                category=ClientCategory.INDUSTRIAL,
                client_product_description="Beta Products",
                subscription_status=SubscriptionStatus.ACTIVE,
                payment_plan="enterprise",
                setup_fee_paid=True,
                is_active=True,
                created_at=datetime.now(timezone.utc).replace(tzinfo=None)
            )
            admin_session.add(client_a)
            admin_session.add(client_b)
            await admin_session.commit()

            # Insert visits for Client A and Client B
            visit_a = Visit(
                client_id=client_a_id,
                aura_id="aura-rls-visitor-alpha",
                ip_address="192.168.10.100",
                connection_type="corporate",
                is_b2b=True,
                high_intent=True,
                verification_status=VerificationStatus.VERIFIED,
                is_consented=True,
                duration=120,
                created_at=datetime.now(timezone.utc).replace(tzinfo=None),
                updated_at=datetime.now(timezone.utc).replace(tzinfo=None)
            )
            visit_b = Visit(
                client_id=client_b_id,
                aura_id="aura-rls-visitor-beta",
                ip_address="192.168.10.200",
                connection_type="corporate",
                is_b2b=True,
                high_intent=True,
                verification_status=VerificationStatus.VERIFIED,
                is_consented=True,
                duration=240,
                created_at=datetime.now(timezone.utc).replace(tzinfo=None),
                updated_at=datetime.now(timezone.utc).replace(tzinfo=None)
            )
            admin_session.add(visit_a)
            admin_session.add(visit_b)
            await admin_session.commit()

        # 3. Query under Client A context using the RLS test user connection.
        async with AsyncSession(rls_engine) as rls_session:
            # Set Client A ID in session settings
            await rls_session.execute(
                text("SELECT set_config('app.current_client_id', :client_id, true)").bindparams(client_id=str(client_a_id))
            )
            stmt = select(Visit)
            res = await rls_session.execute(stmt)
            visits = res.scalars().all()
            
            # Assert only Client A's visit is visible
            assert len(visits) == 1
            assert visits[0].aura_id == "aura-rls-visitor-alpha"
            assert visits[0].client_id == client_a_id

        # 4. Query under Client B context using the RLS test user connection.
        async with AsyncSession(rls_engine) as rls_session:
            # Set Client B ID in session settings
            await rls_session.execute(
                text("SELECT set_config('app.current_client_id', :client_id, true)").bindparams(client_id=str(client_b_id))
            )
            stmt = select(Visit)
            res = await rls_session.execute(stmt)
            visits = res.scalars().all()
            
            # Assert only Client B's visit is visible
            assert len(visits) == 1
            assert visits[0].aura_id == "aura-rls-visitor-beta"
            assert visits[0].client_id == client_b_id

        # 5. Query with missing or unconfigured client context using the RLS test user connection.
        async with AsyncSession(rls_engine) as rls_session:
            # Explicitly set empty configuration
            await rls_session.execute(
                text("SELECT set_config('app.current_client_id', '', true)")
            )
            stmt = select(Visit)
            res = await rls_session.execute(stmt)
            visits = res.scalars().all()
            
            # Assert no visits are visible
            assert len(visits) == 0

    finally:
        # Clean up database entries using admin session
        async with AsyncSession(async_engine) as admin_session:
            await admin_session.execute(
                text('DELETE FROM "visit" WHERE client_id IN (:a, :b)').bindparams(a=client_a_id, b=client_b_id)
            )
            await admin_session.execute(
                text('DELETE FROM "client" WHERE id IN (:a, :b)').bindparams(a=client_a_id, b=client_b_id)
            )
            await admin_session.commit()
            
        # Drop the created RLS test role
        try:
            async with AsyncSession(async_engine) as cleanup_session:
                await cleanup_session.execute(text("REASSIGN OWNED BY rls_test_user TO postgres;"))
                await cleanup_session.execute(text("DROP OWNED BY rls_test_user;"))
                await cleanup_session.commit()
        except Exception:
            pass

        async with AsyncSession(async_engine) as admin_session:
            await admin_session.execute(text("DROP ROLE IF EXISTS rls_test_user;"))
            await admin_session.commit()
            
        await rls_engine.dispose()
