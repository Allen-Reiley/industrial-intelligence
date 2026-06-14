# backend/tests/test_cookie_transport.py
import pytest
import importlib
from unittest.mock import patch
from app.core.config import settings

pytestmark = pytest.mark.anyio

async def test_cookie_transport_dev_environment():
    """
    Verify that in non-production environments, cookies are Lax and not Secure.
    """
    with patch("app.core.config.settings.ENVIRONMENT", "development"):
        import app.core.users
        importlib.reload(app.core.users)
        
        transport = app.core.users.cookie_transport
        assert transport.cookie_secure is False
        assert transport.cookie_samesite == "lax"

        oauth_transport = app.core.users.oauth_cookie_transport
        assert oauth_transport.cookie_secure is False
        assert oauth_transport.cookie_samesite == "lax"

async def test_cookie_transport_prod_environment():
    """
    Verify that in production environment, cookies are SameSite=None and Secure.
    """
    with patch("app.core.config.settings.ENVIRONMENT", "production"):
        import app.core.users
        importlib.reload(app.core.users)
        
        transport = app.core.users.cookie_transport
        assert transport.cookie_secure is True
        assert transport.cookie_samesite == "none"

        oauth_transport = app.core.users.oauth_cookie_transport
        assert oauth_transport.cookie_secure is True
        assert oauth_transport.cookie_samesite == "none"

    # Restore the original state for other tests
    importlib.reload(app.core.users)
