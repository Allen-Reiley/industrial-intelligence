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

import uuid
import time
import hmac
import hashlib
from datetime import datetime, timezone
from pydantic import BaseModel
from app.core.config import settings

class ProfileUpdatePayload(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    job_title: Optional[str] = None

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
        "job_title": current_user.job_title,
        "permissions": current_user.permissions_list,
        "is_superuser": current_user.is_superuser,
        "is_active": current_user.is_active,
        "image": current_user.image,
        "client_id": str(current_user.client_id) if current_user.client_id else None
    }


@router.patch("/me")
async def update_current_user_profile(
    payload: ProfileUpdatePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Allows the authenticated user to update their name, avatar image, and job title.
    """
    if payload.name is not None:
        current_user.name = payload.name.strip()
    if payload.image is not None:
        current_user.image = payload.image.strip()
    if payload.job_title is not None:
        current_user.job_title = payload.job_title.strip()

    current_user.updated_at = datetime.now(timezone.utc)
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return {
        "status": "success",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "image": current_user.image,
            "job_title": current_user.job_title,
            "role": current_user.role,
            "permissions": current_user.permissions_list
        }
    }


@router.get("/imagekit-auth")
async def get_imagekit_auth(
    current_user: User = Depends(get_current_user)
):
    """
    Generates authentication parameters required by ImageKit.io for client uploads.
    """
    token = str(uuid.uuid4())
    expire = int(time.time()) + 1800
    private_key = settings.IMAGEKIT_PRIVATE_KEY or "mock_private_key"

    signature = hmac.new(
        private_key.encode("utf-8"),
        f"{token}{expire}".encode("utf-8"),
        hashlib.sha1
    ).hexdigest()

    return {
        "token": token,
        "expire": expire,
        "signature": signature
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
        "admin_access_token",
        "user_role",
    ]:
        response.delete_cookie(cookie_name, path="/")

    return {"status": "success", "message": "Session terminated"}
