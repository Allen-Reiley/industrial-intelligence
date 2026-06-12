# backend/app/api/v1/auth.py
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

from app.core.users import fastapi_users_instance, auth_backend, oauth_auth_backend, google_oauth_client
from app.models.user import User
from app.core.config import settings

logger = logging.getLogger("auraworks.auth")

router = APIRouter()

# 1. Mount the FastAPI-Users standard authentication router (Cookie transport)
router.include_router(
    fastapi_users_instance.get_auth_router(auth_backend),
    prefix="",
)

# 2. Mount the Google OAuth router
router.include_router(
    fastapi_users_instance.get_oauth_router(
        google_oauth_client,
        oauth_auth_backend,
        settings.SECRET_KEY or "dev-secret-key-12345678901234567890123456789012",
        redirect_url=settings.OAUTH_REDIRECT_URI,
        associate_by_email=True,
        is_verified_by_default=True
    ),
    prefix="/google",
)

# 3. Expose the security dependency get_current_admin (relying strictly on cookie auth backend)
async def get_current_admin(
    user: User = Depends(fastapi_users_instance.current_user(active=True, get_enabled_backends=lambda: [auth_backend]))
) -> str:
    """
    Dependency to get the current authenticated active user.
    Rely strictly on fastapi_users_instance.current_user(active=True) mapped to the cookie backend.
    """
    return user.email

async def get_current_admin_user(
    user: User = Depends(fastapi_users_instance.current_user(active=True, get_enabled_backends=lambda: [auth_backend]))
) -> User:
    """
    Dependency to get the full authenticated active User object.
    """
    return user
