# backend/tests/test_phase4.py
import pytest
import hashlib
from uuid import uuid4
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, AsyncMock, MagicMock
from sqlmodel import select

# Internal Imports
from app.db import async_engine, async_session_maker
from app.models.client import Client, ClientCategory, SubscriptionStatus
from app.models.company import Company
from app.models.visit import Visit, VerificationStatus
from app.models.pageview import PageView
from app.services.intelligence import (
    scrape_homepage,
    run_daily_intent_batch,
    estimate_tokens,
    scrape_fallback_cache
)

pytestmark = pytest.mark.anyio

@pytest.fixture(autouse=True)
async def dispose_engine_fixture():
    scrape_fallback_cache.clear()
    yield
    await async_engine.dispose()

async def test_homepage_html_scraper_and_truncation():
    """
    Mock an external webpage containing heavy script blocks, styling data, and 1,200 words of content text.
    Execute the scraper utility.
    Assert that all scripting tags are stripped.
    Assert that the resulting output string is precisely truncated at the first 500 words.
    Assert that data sets cache correctly inside Redis with a 7-day TTL parameter.
    """
    # 1. Setup mock HTML page with heavy styling, scripts, nav, footer, and 600 words of main content
    style_content = "body { background-color: #fff; color: #333; } p { line-height: 1.5; }"
    script_content = "console.log('heavy script running...'); function test() { return 1; }"
    
    # Generate 600 words of content
    content_words = [f"word{i}" for i in range(600)]
    main_text = " ".join(content_words)
    
    html_content = f"""
    <html>
    <head>
        <style>{style_content}</style>
        <script>{script_content}</script>
        <title>Test Industrial Site</title>
    </head>
    <body>
        <nav>
            <a href="/home">Home Link</a>
            <a href="/about">About Us</a>
        </nav>
        <main>
            <h1>Anglo Coal Mining Facility</h1>
            <p>{main_text}</p>
        </main>
        <footer>
            <p>&copy; 2026 Anglo Coal. All rights reserved.</p>
        </footer>
    </body>
    </html>
    """
    
    domain = "test-industrial-site.co.za"
    
    # 2. Setup mock HTTP response for httpx
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.text = html_content
    
    # 3. Setup mock Redis client
    mock_redis = AsyncMock()
    mock_redis.get = AsyncMock(return_value=None)
    mock_redis.set = AsyncMock()
    mock_redis.__aenter__ = AsyncMock(return_value=mock_redis)
    mock_redis.__aexit__ = AsyncMock(return_value=None)
    
    # Patch settings to enable Redis, patch httpx, and patch redis.asyncio.from_url
    with patch("app.services.intelligence.settings.REDIS_URL", "redis://localhost:6379/0"):
        with patch("redis.asyncio.from_url", return_value=mock_redis) as mock_from_url:
            with patch("httpx.AsyncClient.get", return_value=mock_response) as mock_http_get:
                
                # Execute the scraper
                result = await scrape_homepage(domain)
                
                # Verify HTTP request was made to the URL
                mock_http_get.assert_called_once()
                assert mock_http_get.call_args[0][0] == f"https://{domain}"
                
                # Verify that style and script blocks and nav/footer were stripped
                # The output should NOT contain style declarations or script code
                assert style_content not in result
                assert script_content not in result
                assert "Home Link" not in result
                assert "All rights reserved" not in result
                
                # Verify the output is precisely truncated at the first 500 words
                words = result.split()
                # 500 words + heading words ("Anglo", "Coal", "Mining", "Facility")
                # Wait, "Anglo Coal Mining Facility" is 4 words, plus the 600 words.
                # So we expect precisely 500 words total in the truncated output
                assert len(words) == 500
                
                # Verify that it cached in Redis with a 7-day TTL (604,800 seconds)
                mock_redis.set.assert_called_once_with(
                    f"scrape:{domain}",
                    result,
                    ex=604800
                )

async def test_daily_deepseek_batch_aggregation():
    """
    Populate the database with 5 distinct tracking sessions from the same company domain over a 24-hour cycle.
    Execute the daily batch processing task.
    Assert that exactly 1 structured completion request is dispatched to the LLM model pool.
    Verify that the history array truncates accurately at 10 pages or 4,000 tokens if the data limits are exceeded.
    """
    client_id = uuid4()
    company_id = uuid4()
    company_domain = f"prospect-miner-{uuid4()}.co.za"
    client_domain = f"client-partner-{uuid4()}.com"
    
    async with async_session_maker() as session:
        # Clean up existing telemetry to isolate this batch run
        from sqlalchemy import text
        await session.execute(text("DELETE FROM page_view;"))
        await session.execute(text("DELETE FROM visit;"))
        
        # 1. Seed Client
        client = Client(
            id=client_id,
            company_name=f"AuraWorks Partner {uuid4()}",
            domain=client_domain,
            category=ClientCategory.COMMERCIAL,
            client_product_description="Heavy Industrial Pumps and Excavator Equipment",
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
            total_visits=5
        )
        session.add(company)
        await session.commit()
        
        # 3. Seed 5 distinct tracking sessions (visits) in the last 24 hours
        # and 12 total page views linked to them to test truncation at 10 page views.
        now_time = datetime.now(timezone.utc)
        
        visits = []
        for i in range(5):
            visit_time = now_time - timedelta(hours=i * 2)
            visit = Visit(
                client_id=client_id,
                company_id=company_id,
                aura_id=f"aura-batch-visitor-{i}",
                ip_address=f"196.25.10.{i}",
                connection_type="corporate",
                is_b2b=True,
                high_intent=True,
                verification_status=VerificationStatus.VERIFIED,
                is_consented=True,
                duration=60,
                created_at=visit_time.replace(tzinfo=None),
                updated_at=visit_time.replace(tzinfo=None)
            )
            session.add(visit)
            visits.append(visit)
        
        await session.commit()
        
        for visit in visits:
            await session.refresh(visit)
            
        # Seed 12 PageViews in total spread across the 5 visits
        # We'll create them with distinct creation timestamps
        for i in range(12):
            pv_time = now_time - timedelta(minutes=i * 10)
            # Link to the visits round-robin style
            visit_idx = i % 5
            page_view = PageView(
                client_id=client_id,
                visit_id=visits[visit_idx].id,
                url_path=f"/products/pump-specification-sheet-v{i}",
                referrer="google.com",
                created_at=pv_time.replace(tzinfo=None)
            )
            session.add(page_view)
            
        await session.commit()

    # 4. Setup Mock DeepSeek API response
    mock_deepseek_response = MagicMock()
    mock_deepseek_response.status_code = 200
    mock_deepseek_response.json = MagicMock(return_value={
        "choices": [{
            "message": {
                "content": "Prospect is currently evaluating high-capacity slurry pumps for mining operations. Intent level: Technical Evaluation."
            }
        }]
    })

    # Setup Scraper Mock
    mock_scraped_copy = "Anglo Coal is a major mining conglomerate operating in South Africa."

    # 5. Patch external service calls (scraped homepage and DeepSeek API post)
    with patch("app.services.intelligence.settings.DEEPSEEK_API_KEY", "test-deepseek-key"):
        with patch("app.services.intelligence.scrape_homepage", return_value=mock_scraped_copy) as mock_scrape:
            with patch("httpx.AsyncClient.post", return_value=mock_deepseek_response) as mock_post:
                
                async with async_session_maker() as session:
                    await run_daily_intent_batch(session)
                
                # Assert that exactly 1 structured completion request is dispatched to the LLM model pool
                mock_post.assert_called_once()
                
                # Check that scraper was called for the domain
                mock_scrape.assert_called_once_with(company_domain)
                
                # Verify prompt contents and truncation
                post_payload = mock_post.call_args[1]["json"]
                messages = post_payload["messages"]
                prompt_content = messages[0]["content"]
                
                # Verify that the history array contains at most 10 pages
                # The page sequence in the prompt is joined by " -> "
                # We expect page-specification-sheet-v0 to v9 (the 10 most recent ones)
                # Since we created v0 to v11, with v0 being the newest (now_time) and v11 being the oldest (now_time - 110m),
                # the 10 most recent should be v0 to v9.
                for i in range(10):
                    assert f"/products/pump-specification-sheet-v{i}" in prompt_content
                # The oldest two (v10, v11) should be dropped by the 10 entries limit
                assert "/products/pump-specification-sheet-v10" not in prompt_content
                assert "/products/pump-specification-sheet-v11" not in prompt_content
                
                # 6. Verify that intent_summary was committed to the Company table
                async with async_session_maker() as session:
                    res = await session.execute(select(Company).where(Company.id == company_id))
                    updated_company = res.scalars().first()
                    assert updated_company is not None
                    assert updated_company.intent_summary == "Prospect is currently evaluating high-capacity slurry pumps for mining operations. Intent level: Technical Evaluation."
