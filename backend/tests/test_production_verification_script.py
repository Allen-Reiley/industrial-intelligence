# backend/tests/test_production_verification_script.py
import pytest
import os
import sys
from uuid import uuid4
from datetime import datetime, timezone, timedelta
import httpx

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.main import app
from app.db import async_session_maker
from app.models.client import Client, SubscriptionStatus
from app.models.user import User, Session as UserSession, UserRole
from scripts.verify_production import ProductionVerifier

pytestmark = pytest.mark.anyio


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


async def test_production_verifier_end_to_end():
    """
    Task 35.3: Production Verification Script Automation.
    Runs the ProductionVerifier against the application using an ASGI transport,
    verifying all 4 health and diagnostic checks:
    1. /health database connectivity
    2. /api/v1/admin/overview-metrics authenticated handshake
    3. /v1/track/event null aura_id probe
    4. CORS access control headers (credentials + matching origin)
    """
    client_id = uuid4()
    admin_id = f"admin_{uuid4().hex[:8]}"
    admin_token = f"sess_admin_{uuid4().hex}"

    async with async_session_maker() as session:
        # Seed test Client with whitelisted domain
        client = Client(
            id=client_id,
            company_name="Production Verification Tenant",
            whitelisted_domains=["app.auraworks.co.za", "auraworks.co.za"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client)

        # Seed Admin User and Session
        admin_user = User(
            id=admin_id,
            email=f"verify_admin_{uuid4().hex[:6]}@auraworks.co.za",
            name="Verify Admin",
            role=UserRole.ADMIN,
            is_active=True
        )
        session.add(admin_user)
        await session.commit()

        user_session = UserSession(
            id=f"sess_{uuid4().hex[:8]}",
            user_id=admin_id,
            token=admin_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        session.add(user_session)
        await session.commit()

    verifier = ProductionVerifier(
        base_url="https://app.auraworks.co.za",
        admin_token=admin_token,
        client_id=str(client_id),
        origin="https://app.auraworks.co.za"
    )

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="https://app.auraworks.co.za") as mock_client:
        # Run check 1
        h_passed = await verifier.check_health(mock_client)
        assert h_passed is True
        assert verifier.results["checks"]["1_health_and_db_connectivity"]["status"] == "PASSED"

        # Run check 2
        auth_passed = await verifier.check_admin_auth(mock_client)
        assert auth_passed is True
        assert verifier.results["checks"]["2_admin_authenticated_handshake"]["status"] == "PASSED"

        # Run check 3
        telemetry_passed = await verifier.check_telemetry_null_aura_id(mock_client)
        assert telemetry_passed is True
        assert verifier.results["checks"]["3_telemetry_null_aura_id_resilience"]["status"] == "PASSED"

        # Run check 4
        cors_passed = await verifier.check_cors_headers(mock_client)
        assert cors_passed is True
        assert verifier.results["checks"]["4_cors_subdomain_and_credentials_headers"]["status"] == "PASSED"

        # Also test run_all end-to-end
        all_passed = await verifier.run_all(mock_client)
        assert all_passed is True
        assert verifier.results["overall_status"] == "PASSED"
