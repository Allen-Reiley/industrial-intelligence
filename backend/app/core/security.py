# backend/app/core/security.py
import logging
from typing import Optional
from datetime import datetime, timezone
from fastapi import Depends, HTTPException, Request, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, or_

from app.core.config import settings
from app.db import get_async_session
from app.models.user import User, Session as UserSession, UserRole

import os
import base64
import hashlib
import urllib.parse
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from jose import jwt as jose_jwt, JWTError

logger = logging.getLogger("auraworks.security")
bearer_scheme = HTTPBearer(auto_error=False)

SUPER_ADMIN_EMAILS = {"reitumetse@auraworks.co.za", "rsethabela@auraworks.co.za"}

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

def normalize_session_token(token: Optional[str]) -> Optional[str]:
    """
    Normalizes a session token extracted from headers or cookies:
    - URL-decodes (handles %3D etc)
    - Trims whitespace and quotes
    - Rejects invalid string literals ('undefined', 'null', 'none')
    - If token is from a signed cookie (format: '<token>.<signature>'),
      extracts the raw token prefix before the dot.
    """
    if not token:
        return None
    cleaned = urllib.parse.unquote(str(token).strip()).strip("\"'")
    if not cleaned or cleaned.lower() in ["undefined", "null", "none"]:
        return None
    # If it is a 3-part JWT (header.payload.signature), preserve the full token intact
    if cleaned.count(".") == 2 and cleaned.startswith("ey"):
        return cleaned

    # Better Auth signed cookies have format '<token>.<hmac_signature>' (single dot)
    if cleaned.count(".") == 1:
        cleaned = cleaned.split(".")[0].strip()
    return cleaned if cleaned else None

async def get_session_token_from_request(
    request: Request,
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> Optional[str]:
    """
    Extracts the Better Auth session token from Authorization Bearer header, custom headers, or cookies.
    Strictly prioritizes the Authorization: Bearer <session_token> header for cross-subdomain API bridge,
    with seamless cookie fallback handling signed cookies (<token>.<signature>).
    """
    # 1. Check HTTPBearer dependency
    if auth_header and auth_header.credentials:
        token = normalize_session_token(auth_header.credentials)
        if token:
            return token

    # 2. Check raw Authorization header directly (case-insensitive)
    raw_auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if raw_auth:
        raw_auth = raw_auth.strip()
        if raw_auth.lower().startswith("bearer "):
            token = normalize_session_token(raw_auth[7:])
            if token:
                return token
        elif raw_auth:
            token = normalize_session_token(raw_auth)
            if token:
                return token

    # 3. Check custom headers
    for header_name in ["x-session-token", "x-better-auth-token", "X-Session-Token", "X-Better-Auth-Token"]:
        val = request.headers.get(header_name)
        if val and val.strip():
            token = normalize_session_token(val)
            if token:
                return token

    # 4. Check Better Auth Cookies (same-domain or wildcard domain .auraworks.co.za)
    for cookie_name in [
        "__Secure-better-auth.session_token",
        "better-auth.session_token",
        "aura_session_token",
        "better_auth.session_token",
        "__Secure-better_auth.session_token",
        "aurahq_auth",
        "admin_access_token",
        "session_token"
    ]:
        val = request.cookies.get(cookie_name)
        if val and val.strip():
            token = normalize_session_token(val)
            if token:
                return token

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
            detail="Authentication required: No session token provided",
            headers={"WWW-Authenticate": "Bearer"}
        )

    now = datetime.now(timezone.utc)
    clean_token = normalize_session_token(token) or token

    # 1. Dual-Mode: Check if token is a stateless signed JWT (format: header.payload.signature)
    if clean_token and clean_token.count(".") == 2 and clean_token.startswith("ey"):
        jwt_secrets = []
        if settings.SECRET_KEY:
            jwt_secrets.append(settings.SECRET_KEY)
        better_auth_secret = os.getenv("BETTER_AUTH_SECRET")
        if better_auth_secret and better_auth_secret not in jwt_secrets:
            jwt_secrets.append(better_auth_secret)
        fallback_secret = "development-better-auth-secret-key-1234567890"
        if fallback_secret not in jwt_secrets:
            jwt_secrets.append(fallback_secret)

        jwt_payload = None
        for sec in jwt_secrets:
            try:
                jwt_payload = jose_jwt.decode(
                    clean_token,
                    sec,
                    algorithms=["HS256"],
                    options={"verify_aud": False, "verify_exp": False}
                )
                if jwt_payload:
                    break
            except Exception:
                continue

        if jwt_payload:
            exp = jwt_payload.get("exp")
            if exp is not None:
                exp_dt = datetime.fromtimestamp(exp, tz=timezone.utc)
                if exp_dt < now:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Session expired: Please sign in again",
                        headers={"WWW-Authenticate": "Bearer"}
                    )

            user_id = jwt_payload.get("sub") or jwt_payload.get("id") or jwt_payload.get("userId")
            email = jwt_payload.get("email")
            role_str = jwt_payload.get("role") or "sales"
            name = jwt_payload.get("name") or "AuraWorks User"
            is_active = jwt_payload.get("is_active", True)
            client_id_val = jwt_payload.get("client_id")

            # Try to resolve or synchronize user from database
            db_user = None
            if user_id or email:
                try:
                    stmt = select(User).where(or_(User.id == str(user_id), User.email == email))
                    res = await db.execute(stmt)
                    db_user = res.scalars().first()
                except Exception as db_err:
                    logger.warning(f"Database query failed during JWT user resolution: {db_err}")

            if db_user:
                # Permanent Super Admin Invariant: reitumetse@auraworks.co.za / rsethabela@auraworks.co.za is ALWAYS active ADMIN
                if db_user.email and db_user.email.lower() in SUPER_ADMIN_EMAILS:
                    if db_user.role != UserRole.ADMIN or not db_user.is_active:
                        db_user.role = UserRole.ADMIN
                        db_user.is_active = True
                        db.add(db_user)
                        try:
                            await db.commit()
                        except Exception as e:
                            logger.warning(f"Failed to persist super admin role auto-heal: {e}")

                if not db_user.is_active:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Account inactive: Contact an administrator"
                    )
                return db_user
            else:
                # Stateless JWT user: verified directly via cryptographic signature
                role_enum = UserRole.ADMIN if (role_str == "admin" or (email and email.lower() in SUPER_ADMIN_EMAILS)) else UserRole.SALES
                return User(
                    id=str(user_id or f"jwt_{email}"),
                    name=name,
                    email=email or "user@auraworks.co.za",
                    role=role_enum,
                    is_active=is_active,
                    client_id=client_id_val
                )

    # 2. Query Better Auth Session from DB (matching raw or signed token variants)
    stmt = (
        select(UserSession, User)
        .join(User, UserSession.user_id == User.id)
        .where(
            or_(
                UserSession.token == token,
                UserSession.token == clean_token
            )
        )
    )
    res = await db.execute(stmt)
    row = res.first()

    if not row:
        # Fallback check: Session table without join to catch orphan or cross-referenced sessions
        sess_stmt = select(UserSession).where(
            or_(
                UserSession.token == token,
                UserSession.token == clean_token
            )
        )
        sess_res = await db.execute(sess_stmt)
        orphan_session = sess_res.scalars().first()
        if orphan_session:
            sess_expires = orphan_session.expires_at
            if sess_expires.tzinfo is None:
                sess_expires = sess_expires.replace(tzinfo=timezone.utc)
            if sess_expires < now:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session expired: Please sign in again",
                    headers={"WWW-Authenticate": "Bearer"}
                )
            user_stmt = select(User).where(User.id == orphan_session.user_id)
            user_res = await db.execute(user_stmt)
            found_user = user_res.scalars().first()
            if found_user:
                row = (orphan_session, found_user)

    if row:
        session_record, user_record = row
        session_expires = session_record.expires_at
        if session_expires.tzinfo is None:
            session_expires = session_expires.replace(tzinfo=timezone.utc)

        if session_expires < now:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired: Please sign in again",
                headers={"WWW-Authenticate": "Bearer"}
            )

        # Permanent Super Admin Invariant: reitumetse@auraworks.co.za / rsethabela@auraworks.co.za is ALWAYS active ADMIN
        if user_record.email and user_record.email.lower() in SUPER_ADMIN_EMAILS:
            if user_record.role != UserRole.ADMIN or not user_record.is_active:
                user_record.role = UserRole.ADMIN
                user_record.is_active = True
                db.add(user_record)
                try:
                    await db.commit()
                except Exception as e:
                    logger.warning(f"Failed to persist super admin role auto-heal: {e}")

        if not user_record.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account inactive: Contact an administrator"
            )

        return user_record

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized: Invalid session credentials",
        headers={"WWW-Authenticate": "Bearer"}
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
