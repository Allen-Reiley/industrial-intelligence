# backend/app/api/v1/auth.py
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

from app.core.users import fastapi_users_instance, auth_backend, google_oauth_client
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
        auth_backend,
        settings.SECRET_KEY or "dev-secret-key-12345678901234567890123456789012",
        redirect_url=settings.OAUTH_REDIRECT_URI,
        associate_by_email=True,
        is_verified_by_default=True
    ),
    prefix="/google",
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

# 3. Expose the security dependency get_current_admin (with legacy Bearer JWT fallback)
async def get_current_admin(
    token: Optional[str] = Depends(oauth2_scheme),
    user: Optional[User] = Depends(fastapi_users_instance.current_user(optional=True, active=True))
) -> str:
    """
    Dependency to get the current authenticated active user.
    Supports both FastAPI-Users cookie/JWT session AND legacy Bearer JWT tokens.
    """
    # A. Check if FastAPI-Users session is active
    if user and user.is_active:
        return user.email

    # B. Fallback to decoding custom legacy JWT tokens
    if token:
        try:
            secret = settings.SECRET_KEY or "dev-secret-key-12345678901234567890123456789012"
            payload = jwt.decode(token, secret, algorithms=["HS256"])
            username: str = payload.get("sub")
            if username and payload.get("type") != "refresh":
                return username
        except JWTError:
            pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
