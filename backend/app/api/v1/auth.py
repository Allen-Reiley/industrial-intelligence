# backend/app/api/v1/auth.py
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from jose import jwt, JWTError

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token

from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_async_session

router = APIRouter()
logger = logging.getLogger("auraworks.auth")

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

async def get_current_admin(
    token: Optional[str] = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_async_session)
) -> str:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        secret = settings.SECRET_KEY or "dev-secret-key-12345678901234567890123456789012"
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if payload.get("type") == "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Cannot use refresh token as access token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if username == "admin":
            return username
            
        from app.models.admin_user import AdminUser
        from sqlmodel import select
        stmt = select(AdminUser).where(AdminUser.email == username)
        res = await session.execute(stmt)
        db_user = res.scalars().first()
        if db_user:
            return username
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    session: AsyncSession = Depends(get_async_session)
):
    content_type = request.headers.get("content-type", "")
    username = None
    password = None
    
    if "application/json" in content_type:
        try:
            body = await request.json()
            username = body.get("username")
            password = body.get("password")
        except Exception:
            pass
    else:
        try:
            form = await request.form()
            username = form.get("username")
            password = form.get("password")
        except Exception:
            pass
            
    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing username or password"
        )
        
    # Check database first
    from app.models.admin_user import AdminUser
    from app.core.security import verify_password
    from sqlmodel import select
    
    stmt = select(AdminUser).where(AdminUser.email == username)
    res = await session.execute(stmt)
    db_user = res.scalars().first()
    
    authenticated = False
    if db_user:
        if verify_password(password, db_user.hashed_password):
            authenticated = True
    else:
        expected_username = "admin"
        expected_password = settings.ADMIN_API_KEY or "change-me-in-production"
        if username == expected_username and password == expected_password:
            authenticated = True
            
    if not authenticated:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": username})
    refresh_token = create_refresh_token(data={"sub": username})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshRequest):
    try:
        secret = settings.SECRET_KEY or "dev-secret-key-12345678901234567890123456789012"
        token_data = jwt.decode(payload.refresh_token, secret, algorithms=["HS256"])
        username: str = token_data.get("sub")
        token_type: str = token_data.get("type")
        if username is None or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
        access_token = create_access_token(data={"sub": username})
        new_refresh_token = create_refresh_token(data={"sub": username})
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
