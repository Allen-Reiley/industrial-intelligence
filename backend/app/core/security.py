# backend/app/core/security.py
import logging
from typing import Optional
from datetime import datetime, timezone
from fastapi import Depends, HTTPException, Request, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.config import settings
from app.db import get_async_session
from app.models.user import User, Session as UserSession, UserRole

import os
import base64
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

logger = logging.getLogger("auraworks.security")
bearer_scheme = HTTPBearer(auto_error=False)

def get_encryption_key() -> bytes:
    """
    Derives a 32-byte key from the SECRET_KEY for AES-256-GCM encryption.
    If the SECRET_KEY is not exactly 32 bytes, we hash it using SHA-256 to guarantee size.
    """
    secret = (settings.SECRET_KEY or "fallback-secret-key-32-chars-long!").encode('utf-8')
    if len(secret) == 32:
        return secret
    return hashlib.sha256(secret).digest()

def encrypt_field(data: str) -> str:
    """
    Encrypts a plaintext string using AES-256-GCM.
    Returns the nonce + ciphertext encoded in base64.
    """
    if not data:
        return ""
    key = get_encryption_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # Standard 96-bit nonce for GCM
    ciphertext = aesgcm.encrypt(nonce, data.encode('utf-8'), None)
    encrypted_blob = nonce + ciphertext
    return base64.b64encode(encrypted_blob).decode('utf-8')

def decrypt_field(encrypted_data_b64: str) -> str:
    """
    Decrypts a base64 encoded AES-256-GCM string (nonce + ciphertext).
    """
    if not encrypted_data_b64:
        return ""
    try:
        encrypted_blob = base64.b64decode(encrypted_data_b64)
        key = get_encryption_key()
        aesgcm = AESGCM(key)
        nonce = encrypted_blob[:12]
        ciphertext = encrypted_blob[12:]
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode('utf-8')
    except Exception as e:
        raise ValueError(f"Decryption failed: {str(e)}")

import unicodedata

def hash_password(password: str) -> str:
    """
    Hashes a password using scrypt matching Better Auth's standard:
    `${salt_hex}:${scrypt_key_hex}`
    """
    salt_hex = os.urandom(16).hex()
    norm_pw = unicodedata.normalize("NFKC", password).encode("utf-8")
    salt_bytes = salt_hex.encode("utf-8")
    key = hashlib.scrypt(norm_pw, salt=salt_bytes, n=16384, r=16, p=1, maxmem=67108864, dklen=64)
    return f"{salt_hex}:{key.hex()}"

def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verifies a password against the Better Auth scrypt hash.
    """
    try:
        salt_hex, key_hex = hashed_password.split(":")
        norm_pw = unicodedata.normalize("NFKC", password).encode("utf-8")
        salt_bytes = salt_hex.encode("utf-8")
        key = hashlib.scrypt(norm_pw, salt=salt_bytes, n=16384, r=16, p=1, maxmem=67108864, dklen=64)
        return key.hex() == key_hex
    except Exception:
        return False

async def get_session_token_from_request(
    request: Request,
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> Optional[str]:
    """
    Extracts the Better Auth session token from cookies or Authorization Bearer header.
    """
    # 1. Check Bearer header
    if auth_header and auth_header.credentials:
        return auth_header.credentials.strip()

    # 2. Check Better Auth Cookies
    for cookie_name in [
        "better-auth.session_token",
        "__Secure-better-auth.session_token",
        "aurahq_auth",
        "admin_access_token"
    ]:
        val = request.cookies.get(cookie_name)
        if val:
            return val.strip()

    # 3. Check custom headers
    custom_token = request.headers.get("x-session-token") or request.headers.get("x-better-auth-token")
    if custom_token:
        return custom_token.strip()

    return None


async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(get_session_token_from_request),
    db: AsyncSession = Depends(get_async_session)
) -> User:
    """
    Authenticates the user from the Better Auth PostgreSQL session table or API key.
    """
    # Check Admin API Key override (Internal / Janitor / Testing)
    x_aura_token = request.headers.get("x-aura-token")
    if x_aura_token and settings.ADMIN_API_KEY and x_aura_token == settings.ADMIN_API_KEY:
        # Fetch or return system superuser
        stmt = select(User).where(User.role == UserRole.ADMIN, User.is_active == True)
        res = await db.execute(stmt)
        admin_user = res.scalars().first()
        if admin_user:
            return admin_user
        # Return fallback system user
        return User(
            id="system_admin",
            name="System Administrator",
            email="admin@auraworks.co.za",
            role=UserRole.ADMIN,
            is_active=True
        )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: No session token provided"
        )

    # 1. Query Better Auth Session from DB
    stmt = (
        select(UserSession, User)
        .join(User, UserSession.user_id == User.id)
        .where(UserSession.token == token)
    )
    res = await db.execute(stmt)
    row = res.first()

    now = datetime.now(timezone.utc)
    if row:
        session_record, user_record = row
        session_expires = session_record.expires_at
        if session_expires.tzinfo is None:
            session_expires = session_expires.replace(tzinfo=timezone.utc)

        if session_expires < now:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired: Please sign in again"
            )

        if not user_record.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account inactive: Contact an administrator"
            )

        return user_record

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized: Invalid session credentials"
    )


async def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Role-Based Access Control: Strictly ensures user role is 'admin'.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Administrative privileges required"
        )
    return current_user


async def require_sales(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Role-Based Access Control: Ensures user role is 'sales' or 'admin'.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.SALES]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Sales representative privileges required"
        )
    return current_user


# Compatibility Aliases
get_current_admin_user = get_current_user
get_current_admin = get_current_user
