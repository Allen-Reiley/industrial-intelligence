# backend/tests/test_phase3.py
import pytest
from uuid import uuid4
from datetime import datetime, timedelta, timezone
import hashlib
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

# Internal Imports
from app.db import async_engine, async_session_maker
from app.models.client import Client, ClientCategory, SubscriptionStatus
from app.models.company import Company
from app.models.visit import Visit, VerificationStatus
from app.models.pageview import PageView
from app.tasks.janitor import execute_janitor_scrub_cascade

pytestmark = pytest.mark.anyio

@pytest.fixture(autouse=True)
async def dispose_engine_fixture():
    yield
    await async_engine.dispose()

async def test_janitor_anonymization_cascade():
    """
    Seed the database with a test fixture containing an unconsented Visit marked as verifying
    where the created_at timestamp is set to 49 hours in the past.
    Execute the execute_janitor_scrub_cascade() background task.
    Assert that email and visitor_name parameters are set to None, verification_status shifts to
    anonymized_corporate, raw fingerprint columns are cleared, fingerprint_hash is anonymized,
    and the underlying company_id, duration, and page-view tracks are preserved.
    """
    client_id = uuid4()
    company_id = uuid4()
    aura_id = f"aura-janitor-test-{uuid4()}"
    client_domain = f"client-{uuid4()}.com"
    company_domain = f"prospect-{uuid4()}.co.za"

    async with async_session_maker() as session:
        # 1. Seed Client
        client = Client(
            id=client_id,
            company_name=f"Test Janitor Client",
            domain=client_domain,
            category=ClientCategory.COMMERCIAL,
            client_product_description="Compliance Testing",
            subscription_status=SubscriptionStatus.ACTIVE,
            payment_plan="enterprise",
            setup_fee_paid=True,
            is_active=True
        )
        session.add(client)

        # 2. Seed Company
        company = Company(
            id=company_id,
            company_name="Prospect Mining Corp",
            domain=company_domain,
            cipc_verified=True,
            total_visits=1
        )
        session.add(company)

        # 3. Seed Visit (49 hours ago, verifying, unconsented, with PII and raw fingerprint)
        past_time = datetime.now(timezone.utc) - timedelta(hours=49)
        past_time_naive = past_time.replace(tzinfo=None)
        
        visit = Visit(
            client_id=client_id,
            company_id=company_id,
            aura_id=aura_id,
            ip_address="196.25.1.5",
            connection_type="corporate",
            is_b2b=True,
            high_intent=False,
            verification_status=VerificationStatus.VERIFYING,
            is_consented=False,
            email="visitor@prospect.co.za",
            visitor_name="John Doe",
            canvas_hash="canvas_12345",
            webgl_renderer="webgl_intel",
            clock_drift="-2",
            fingerprint_hash="raw_fingerprint_hash",
            duration=30,
            created_at=past_time_naive,
            updated_at=past_time_naive
        )
        session.add(visit)
        await session.commit()
        await session.refresh(visit)
        visit_id = visit.id

        # 4. Seed PageView linked to the visit
        page_view = PageView(
            client_id=client_id,
            visit_id=visit_id,
            url_path="/products/heavy-machinery",
            referrer="google.com"
        )
        session.add(page_view)
        await session.commit()

    # 5. Execute the Janitor Scrub Cascade
    async with async_session_maker() as session:
        await execute_janitor_scrub_cascade(session)

    # 6. Verify Results
    async with async_session_maker() as session:
        # Retrieve the updated Visit
        stmt = select(Visit).where(Visit.id == visit_id)
        res = await session.execute(stmt)
        updated_visit = res.scalars().first()

        assert updated_visit is not None
        # Assert natural person identifiers are nullified
        assert updated_visit.email is None
        assert updated_visit.visitor_name is None
        
        # Assert verification_status shifted to anonymized_corporate
        assert updated_visit.verification_status == VerificationStatus.ANONYMIZED_CORPORATE
        
        # Assert raw fingerprint components are cleared
        assert updated_visit.canvas_hash is None
        assert updated_visit.webgl_renderer is None
        assert updated_visit.clock_drift is None
        
        # Assert fingerprint_hash is replaced with the SHA256 cryptographic hash of (canvas + webgl + drift + secret)
        from app.core.config import settings
        secret_key = settings.SECRET_KEY or "default_secret"
        expected_secret = hashlib.sha256(f"{secret_key}:{past_time_naive.strftime('%Y-%m-%d')}".encode()).hexdigest()
        expected_combined = f"canvas_12345webgl_intel-2{expected_secret}"
        expected_fingerprint_hash = hashlib.sha256(expected_combined.encode()).hexdigest()
        
        assert updated_visit.fingerprint_hash == expected_fingerprint_hash
        
        # Assert underlying juristic columns, duration and references are preserved
        assert updated_visit.company_id == company_id
        assert updated_visit.duration == 30
        
        # Assert PageView is preserved without deletion
        pv_stmt = select(PageView).where(PageView.visit_id == visit_id)
        pv_res = await session.execute(pv_stmt)
        assert pv_res.scalars().first() is not None

from unittest.mock import patch, AsyncMock
from app.models.department import Department
from app.models.visit import VisitCreate
from app.api.v1.track import process_entry_logic

@patch("app.services.enrichment.get_departmental_intelligence", new_callable=AsyncMock)
async def test_immediate_departmental_contact_mapping(mock_apollo):
    """
    Configure Apollo mapping to fire instantly right after IPinfo validates a B2B profile.
    Verify that contacts are mapped to Department table and priority_score is scaled from 1 to 5.
    """
    # Setup mock return data with scaling keywords
    mock_apollo.return_value = [
        {"name": "Alice Smith", "role": "Chief Engineer", "email": "alice@anglocoal.co.za", "linkedin_url": "li/alice"},
        {"name": "Bob Jones", "role": "Director of Logistics", "email": "bob@anglocoal.co.za"},
        {"name": "Charlie Brown", "role": "Supply Chain Coordinator", "email": "charlie@anglocoal.co.za"},
        {"name": "David Davis", "role": "Procurement Lead", "email": "david@anglocoal.co.za"},
        {"name": "Frank Miller", "role": "HR Manager", "email": "frank@anglocoal.co.za"}
    ]

    client_id = uuid4()
    company_id = uuid4()
    aura_id = f"aura-apollo-test-{uuid4()}"
    client_domain = f"client-{uuid4()}.com"
    company_domain = "anglocoal.co.za"

    async with async_session_maker() as session:
        # Seed Client
        client = Client(
            id=client_id,
            company_name="AuraWorks Test Client",
            domain=client_domain,
            category=ClientCategory.COMMERCIAL,
            client_product_description="Compliance Testing",
            subscription_status=SubscriptionStatus.ACTIVE,
            payment_plan="enterprise",
            setup_fee_paid=True,
            is_active=True
        )
        session.add(client)
        await session.commit()

    # Mock APOLLO_API_KEY to avoid early exit in get_departmental_intelligence
    with patch("app.services.enrichment.settings.APOLLO_API_KEY", "test-apollo-key"):
        # Mock IPinfo to return B2B Anglo Coal profile
        with patch("app.api.v1.track.enrich_visitor_data", new_callable=AsyncMock) as mock_ipinfo:
            mock_ipinfo.return_value = {
                "company_name": "Anglo Coal",
                "domain": company_domain,
                "is_b2b": True,
                "confidence_score": 0.9,
                "industry": "business",
                "city": "Johannesburg",
                "region": "GP",
                "provider_type": "business_static"
            }

            # Call process_entry_logic directly to test background flow
            payload = VisitCreate(
                client_id=client_id,
                aura_id=aura_id,
                url="/contact"
            )
            
            await process_entry_logic(payload, "196.25.1.10")

            # Give background tasks time to execute
            import asyncio
            await asyncio.sleep(0.5)

    # Verify that the departments were inserted into the Department table with scaled priority_scores
    async with async_session_maker() as session:
        # Fetch company
        comp_stmt = select(Company).where(Company.domain == company_domain)
        comp_res = await session.execute(comp_stmt)
        company = comp_res.scalars().first()
        assert company is not None

        # Fetch departments
        dept_stmt = select(Department).where(Department.company_id == company.id)
        dept_res = await session.execute(dept_stmt)
        depts = dept_res.scalars().all()

        assert len(depts) == 5

        # Check scaling priority scores
        dept_map = {d.email: d for d in depts}
        
        assert dept_map["alice@anglocoal.co.za"].priority_score == 5
        assert dept_map["alice@anglocoal.co.za"].role_title == "Chief Engineer"

        assert dept_map["bob@anglocoal.co.za"].priority_score == 4
        assert dept_map["bob@anglocoal.co.za"].role_title == "Director of Logistics"

        assert dept_map["charlie@anglocoal.co.za"].priority_score == 3
        assert dept_map["charlie@anglocoal.co.za"].role_title == "Supply Chain Coordinator"

        assert dept_map["david@anglocoal.co.za"].priority_score == 2
        assert dept_map["david@anglocoal.co.za"].role_title == "Procurement Lead"

        assert dept_map["frank@anglocoal.co.za"].priority_score == 1
        assert dept_map["frank@anglocoal.co.za"].role_title == "HR Manager"
