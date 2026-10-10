# backend/app/api/v1/auth.py
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, delete

from app.core.security import (
    get_current_user,
    require_admin,
    require_sales,
    get_session_token_from_request,
    get_current_admin_user,
    get_current_admin
)
from app.models.user import User, Session as UserSession, UserRole
from app.db import get_async_session

logger = logging.getLogger("auraworks.auth")
router = APIRouter()

@router.get("/me")
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Returns the authenticated user's profile and RBAC role.
    """
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "is_superuser": current_user.is_superuser,
        "is_active": current_user.is_active,
        "image": current_user.image,
        "client_id": str(current_user.client_id) if current_user.client_id else None
    }


@router.post("/logout")
async def logout_user(
    request: Request,
    response: Response,
    token: Optional[str] = Depends(get_session_token_from_request),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Terminates the current Better Auth session in PostgreSQL and clears cookies.
    """
    if token:
        stmt = delete(UserSession).where(UserSession.token == token)
        await db.execute(stmt)
        await db.commit()

    for cookie_name in [
        "better-auth.session_token",
        "__Secure-better-auth.session_token",
        "aurahq_auth",
        "admin_access_token"
    ]:
        response.delete_cookie(cookie_name, path="/")

    return {"status": "success", "message": "Session terminated"}
