# backend/tests/test_cookie_transport.py
import pytest
import importlib
from unittest.mock import patch
from app.core.config import settings

pytestmark = pytest.mark.anyio

async def test_cookie_transport_dev_environment():
    """
    Verify that in non-production environments, cookies are Lax, Secure, and domain is None.
    """
    with patch("app.core.config.settings.COOKIE_DOMAIN", None):
        import app.core.users
        importlib.reload(app.core.users)
        
        transport = app.core.users.cookie_transport
        assert transport.cookie_secure is True
        assert transport.cookie_samesite == "lax"
        assert transport.cookie_domain is None

        oauth_transport = app.core.users.oauth_cookie_transport
        assert oauth_transport.cookie_secure is True
        assert oauth_transport.cookie_samesite == "lax"
        assert oauth_transport.cookie_domain is None

async def test_cookie_transport_prod_environment():
    """
    Verify that in production environment, cookies are SameSite=Lax, Secure, and .auraworks.co.za domain.
    """
    with patch("app.core.config.settings.COOKIE_DOMAIN", ".auraworks.co.za"):
        import app.core.users
        importlib.reload(app.core.users)
        
        transport = app.core.users.cookie_transport
        assert transport.cookie_secure is True
        assert transport.cookie_samesite == "lax"
        assert transport.cookie_domain == ".auraworks.co.za"

        oauth_transport = app.core.users.oauth_cookie_transport
        assert oauth_transport.cookie_secure is True
        assert oauth_transport.cookie_samesite == "lax"
        assert oauth_transport.cookie_domain == ".auraworks.co.za"

    # Restore the original state for other tests
    importlib.reload(app.core.users)
