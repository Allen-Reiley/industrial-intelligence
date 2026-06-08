# backend/tests/test_phase11.py
import pytest
from uuid import uuid4
from unittest.mock import patch, AsyncMock, MagicMock
from sqlmodel import select

# Internal Imports
from app.main import app
from app.db import async_session_maker, async_engine, init_db
from app.models import Prospect, Visit, Company
from app.models.client import Client, ClientCategory, SubscriptionStatus
from app.services.intelligence import resolve_entity_stitching
import httpx

pytestmark = pytest.mark.anyio

@pytest.fixture(autouse=True)
async def dispose_engine_fixture():
    init_db()
    yield
    await async_engine.dispose()

async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="http://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="http://test")

# --- TASK 11.3: stitching logic tests ---

async def test_entity_stitching_substring_match():
    # Substring matching (case-insensitive) should return the enriched name
    res1 = await resolve_entity_stitching("Standard Bank", "The Standard Bank of South Africa Limited")
    assert res1 == "The Standard Bank of South Africa Limited"

    res2 = await resolve_entity_stitching("Apex Mining", "Apex Mining Group")
    assert res2 == "Apex Mining Group"


@patch("app.services.intelligence.evaluate_stitching_with_deepseek")
async def test_entity_stitching_deepseek_match(mock_ds):
    # Simulated DeepSeek match (same entity)
    mock_ds.return_value = {"same_entity": True, "is_isp": False}
    
    res = await resolve_entity_stitching("Apex Group", "Apex Corp")
    assert res == "Apex Corp"
    mock_ds.assert_called_once_with("Apex Group", "Apex Corp")


@patch("app.services.intelligence.evaluate_stitching_with_deepseek")
async def test_entity_stitching_isp_fallback(mock_ds):
    # Enriched entity is an ISP, should fallback to volunteered name
    mock_ds.return_value = {"same_entity": False, "is_isp": True}
    
    res = await resolve_entity_stitching("Apex Mining", "Vodacom SA")
    assert res == "Apex Mining"
    mock_ds.assert_called_once_with("Apex Mining", "Vodacom SA")



# --- TASK 11.2: immediate workers tests ---

@patch("app.services.enrichment.enrich_visitor_data")
@patch("app.services.enrichment.enrich_company_departments")
@patch("app.services.intelligence.evaluate_stitching_with_deepseek")
@patch("app.services.notifications.post_to_slack")
@patch("app.services.vault.sync_to_airtable")
@patch("app.services.vault.sync_to_notion")
async def test_immediate_enrichment_workers_triggered(
    mock_notion, mock_airtable, mock_slack, mock_ds, mock_apollo, mock_ipinfo
):
    client = await get_test_client()
    client_id = uuid4()
    aura_id = f"aura-p11-test-{uuid4()}"
    
    # 1. Seed Client and Visit
    async with async_session_maker() as session:
        client_row = Client(
            id=client_id,
            company_name="AuraWorks Test Client P11",
            domain=f"p11client-{uuid4()}.co.za",
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client_row)
        
        visit_row = Visit(
            id=uuid4(),
            client_id=client_id,
            aura_id=aura_id,
            ip_address="196.25.1.99",
            connection_type="corporate"
        )
        session.add(visit_row)
        await session.commit()

    # Setup Mocks
    mock_ipinfo.return_value = {
        "company_name": "Standard Bank SA",
        "domain": "standardbank.co.za",
        "is_b2b": True
    }
    mock_ds.return_value = {"same_entity": True, "is_isp": False}
    mock_apollo.return_value = None
    mock_slack.return_value = None
    mock_airtable.return_value = None
    mock_notion.return_value = None

    payload = {
        "email": "test@standardbank.co.za",
        "name": "John Doe",
        "company": "Standard Bank",
        "client_id": str(client_id),
        "aura_id": aura_id,
        "website": "standardbank.co.za",
        "industry": "banking"
    }

    # 2. Trigger join endpoint
    response = await client.post("/api/v1/prospects/join", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    # Wait for background tasks to complete
    # In httpx test client, background tasks run synchronously during/after the request lifecycle.
    
    # Assert enrichment workers were triggered immediately with correct parameters
    mock_ipinfo.assert_called_once_with("196.25.1.99")
    
    # Verify Company created and Prospect linked
    async with async_session_maker() as session:
        stmt = select(Prospect).where(Prospect.aura_id == aura_id)
        res = await session.execute(stmt)
        prospect = res.scalars().first()
        assert prospect is not None
        assert prospect.company_id is not None
        
        comp = await session.get(Company, prospect.company_id)
        assert comp is not None
        assert comp.company_name == "Standard Bank SA"  # Stitched result
        
        # Verify apollo was triggered immediately for company id
        mock_apollo.assert_called_once_with(comp.id, "standardbank.co.za")


@patch("httpx.AsyncClient.post")
async def test_surge_alert_trigger_and_throttling(mock_post):
    mock_post.return_value = MagicMock(status_code=200)

    client_id = uuid4()
    company_id = uuid4()

    # Seed Client and Company
    async with async_session_maker() as session:
        client_row = Client(
            id=client_id,
            company_name="AuraWorks Test Client P11 Surge",
            domain=f"p11client-surge-{uuid4()}.co.za",
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client_row)

        company_row = Company(
            id=company_id,
            client_id=client_id,
            company_name="Standard Bank SA Surge",
            domain="standardbank.co.za",
            cipc_verified=True,
            total_visits=0
        )
        session.add(company_row)
        await session.commit()

    # Now let's test throttling and surge trigger
    from app.services.notifications import check_and_trigger_company_surge
    from app.core.config import settings

    original_webhook = settings.SLACK_WEBHOOK_URL
    settings.SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/surge-webhook"

    try:
        # 1. First Visit (unique visitor count = 1)
        async with async_session_maker() as session:
            visit1 = Visit(
                id=uuid4(),
                client_id=client_id,
                company_id=company_id,
                aura_id="visitor-1",
                ip_address="196.25.1.1",
                connection_type="corporate"
            )
            session.add(visit1)
            await session.commit()
            
            # Check surge
            await check_and_trigger_company_surge(company_id, client_id, session)
            mock_post.assert_not_called()

        # 2. Second Visit (unique visitor count = 2)
        async with async_session_maker() as session:
            visit2 = Visit(
                id=uuid4(),
                client_id=client_id,
                company_id=company_id,
                aura_id="visitor-2",
                ip_address="196.25.1.2",
                connection_type="corporate"
            )
            session.add(visit2)
            await session.commit()
            
            # Check surge
            await check_and_trigger_company_surge(company_id, client_id, session)
            mock_post.assert_not_called()

        # 3. Third Visit (unique visitor count = 3)
        async with async_session_maker() as session:
            visit3 = Visit(
                id=uuid4(),
                client_id=client_id,
                company_id=company_id,
                aura_id="visitor-3",
                ip_address="196.25.1.3",
                connection_type="corporate"
            )
            session.add(visit3)
            await session.commit()
            
            # Check surge
            await check_and_trigger_company_surge(company_id, client_id, session)
            mock_post.assert_called_once()
            
            args, kwargs = mock_post.call_args
            assert args[0] == "https://hooks.slack.com/services/surge-webhook"
            payload = kwargs["json"]
            assert "Account Surge: Standard Bank SA Surge" in payload["text"]
            assert "3" in payload["blocks"][1]["text"]["text"]

        # 4. Fourth Visit (unique visitor count = 4, but throttled)
        async with async_session_maker() as session:
            visit4 = Visit(
                id=uuid4(),
                client_id=client_id,
                company_id=company_id,
                aura_id="visitor-4",
                ip_address="196.25.1.4",
                connection_type="corporate"
            )
            session.add(visit4)
            await session.commit()
            
            # Reset mock to verify it doesn't get called again
            mock_post.reset_mock()
            
            # Check surge
            await check_and_trigger_company_surge(company_id, client_id, session)
            mock_post.assert_not_called()

    finally:
        settings.SLACK_WEBHOOK_URL = original_webhook
