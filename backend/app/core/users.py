# backend/app/core/users.py
import uuid
from typing import Optional
from fastapi import Depends, Request, Response
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import (
    AuthenticationBackend,
    CookieTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession
from httpx_oauth.clients.google import GoogleOAuth2

from app.core.config import settings
from app.db import get_async_session
from app.models.user import User, OAuthAccount

async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User, OAuthAccount)

class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.SECRET_KEY or "dev-secret-key-12345678901234567890123456789012"
    verification_token_secret = settings.SECRET_KEY or "dev-secret-key-12345678901234567890123456789012"

    async def authenticate(
        self, credentials: OAuth2PasswordRequestForm
    ) -> Optional[User]:
        from fastapi_users import exceptions
        from sqlmodel import select
        
        user = None
        # 1. Attempt lookup by email
        try:
            user = await self.get_by_email(credentials.username)
        except exceptions.UserNotExists:
            pass

        # 2. Attempt lookup by username if email lookup failed
        if not user:
            stmt = select(User).where(User.username == credentials.username)
            res = await self.user_db.session.execute(stmt)
            user = res.scalars().first()

        if not user:
            # Hash to mitigate timing attacks
            self.password_helper.hash(credentials.password)
            return None

        # 3. Perform credentials check
        verified, updated_password_hash = self.password_helper.verify_and_update(
            credentials.password, user.hashed_password
        )
        if not verified:
            return None
            
        if updated_password_hash is not None:
            await self.user_db.update(user, {"hashed_password": updated_password_hash})

        return user

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        pass

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        pass

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        pass

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)

# Use CookieTransport for storing the JWT session token in HttpOnly cookie
cookie_transport = CookieTransport(
    cookie_name="aurahq_auth",
    cookie_max_age=3600,
    cookie_httponly=True,
    cookie_secure=settings.ENVIRONMENT == "production",
    cookie_samesite="lax",
    cookie_domain=settings.COOKIE_DOMAIN
)

class RedirectCookieTransport(CookieTransport):
    async def get_login_response(self, token: str) -> Response:
        # Default to production redirect; fallback to localhost ONLY if ENVIRONMENT is explicitly local dev.
        if settings.ENVIRONMENT in ["development", "dev", "local"]:
            redirect_url = "http://localhost:3000/aurahq"
        else:
            redirect_url = "https://auraworks.co.za/aurahq"
            
        response = RedirectResponse(url=redirect_url, status_code=302)
        self._set_login_cookie(response, token)
        return response

oauth_cookie_transport = RedirectCookieTransport(
    cookie_name="aurahq_auth",
    cookie_max_age=3600,
    cookie_httponly=True,
    cookie_secure=settings.ENVIRONMENT == "production",
    cookie_samesite="lax",
    cookie_domain=settings.COOKIE_DOMAIN
)

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=settings.SECRET_KEY or "dev-secret-key-12345678901234567890123456789012",
        lifetime_seconds=3600
    )

auth_backend = AuthenticationBackend(
    name="jwt_cookie",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

oauth_auth_backend = AuthenticationBackend(
    name="oauth_jwt_cookie",
    transport=oauth_cookie_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users_instance = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend, oauth_auth_backend],
)

current_active_user = fastapi_users_instance.current_user(active=True)

# Google OAuth2 client instantiation
google_oauth_client = GoogleOAuth2(
    settings.GOOGLE_CLIENT_ID or "placeholder-id",
    settings.GOOGLE_CLIENT_SECRET or "placeholder-secret"
)
