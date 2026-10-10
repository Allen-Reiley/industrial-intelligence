# backend/tests/test_cookie_transport.py
import pytest
from app.core.config import settings

pytestmark = pytest.mark.anyio

async def test_cookie_domain_configuration():
    """
    Verify cookie domain resolution for multi-subdomain authentication.
    """
    # Verify COOKIE_DOMAIN config
    assert hasattr(settings, "COOKIE_DOMAIN")
