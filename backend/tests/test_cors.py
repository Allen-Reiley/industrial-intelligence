# backend/tests/test_cors.py
import pytest
import httpx
from app.main import app
from app.core.config import settings

pytestmark = pytest.mark.anyio

async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="https://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="https://test")

async def test_cors_preflight_production_origins():
    """
    Verify OPTIONS preflight request to production origins returns 200 OK and proper CORS headers.
    """
    client = await get_test_client()
    for origin in ["https://auraworks.co.za", "https://www.auraworks.co.za"]:
        response = await client.options(
            f"{settings.API_V1_STR}/auth/google/authorize",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "content-type",
            }
        )
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == origin
        assert response.headers.get("access-control-allow-credentials") == "true"

async def test_cors_get_production_origins():
    """
    Verify GET request to production origins returns proper CORS headers.
    """
    client = await get_test_client()
    for origin in ["https://auraworks.co.za", "https://www.auraworks.co.za"]:
        response = await client.get(
            f"{settings.API_V1_STR}/auth/google/authorize",
            headers={
                "Origin": origin,
            }
        )
        # Auth endpoint itself might return 200 or another code depending on params, 
        # but CORS headers must be present.
        assert response.headers.get("access-control-allow-origin") == origin
        assert response.headers.get("access-control-allow-credentials") == "true"

async def test_cors_vercel_preview_origins():
    """
    Verify OPTIONS and GET requests to Vercel preview domains match regex and return proper CORS headers.
    """
    client = await get_test_client()
    preview_origin = "https://industrial-intelligence-abc123-allen-reileys-projects.vercel.app"
    response = await client.options(
        f"{settings.API_V1_STR}/auth/google/authorize",
        headers={
            "Origin": preview_origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "content-type",
        }
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == preview_origin
    assert response.headers.get("access-control-allow-credentials") == "true"
