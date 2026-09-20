import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings

def get_encryption_key() -> bytes:
    """
    Derives a 32-byte key from the SECRET_KEY for AES-256-GCM encryption.
    If the SECRET_KEY is not exactly 32 bytes, we hash it using SHA-256 to guarantee size.
    """
    secret_str = settings.SECRET_KEY or "dev-fallback-secret-key-1234567890"
    secret = secret_str.encode('utf-8')
    # AES-256 requires a key length of exactly 256 bits (32 bytes).
    # If the system secret is pre-configured to exactly 32 bytes, use it directly.
    if len(secret) == 32:
        return secret
    
    # Fallback: Hash the secret with SHA-256 to enforce a 32-byte cryptographic key.
    import hashlib
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
    
    # Generate a cryptographically secure 12-byte (96-bit) nonce (Initialization Vector).
    # GCM requires a unique nonce per encryption execution to guarantee security.
    # Reusing a nonce with the same key breaks AES-GCM's authenticity guarantees.
    nonce = os.urandom(12) 
    
    # Encrypt the UTF-8 encoded string.
    # AES-GCM provides authenticated encryption (AEAD), meaning it verifies both 
    # confidentiality and data integrity. The decryption will fail if the payload has been tampered with.
    ciphertext = aesgcm.encrypt(nonce, data.encode('utf-8'), None)
    
    # Package the payload:
    # 1. Prepend the 12-byte nonce directly to the ciphertext.
    # 2. Base64 encode the combined raw bytes to ensure safe serialization and database storage.
    encrypted_blob = nonce + ciphertext
    return base64.b64encode(encrypted_blob).decode('utf-8')

def decrypt_field(encrypted_data_b64: str) -> str:
    """
    Decrypts a base64 encoded AES-256-GCM string (nonce + ciphertext).
    """
    if not encrypted_data_b64:
        return ""
        
    try:
        # Decode the Base64 serialized database payload into raw bytes.
        encrypted_blob = base64.b64decode(encrypted_data_b64)
        key = get_encryption_key()
        aesgcm = AESGCM(key)
        
        # Extract the metadata:
        # Since the nonce is prepended and has a fixed size of 12 bytes, 
        # slice the first 12 bytes as the nonce and the remainder as the ciphertext (including the GCM auth tag).
        nonce = encrypted_blob[:12]
        ciphertext = encrypted_blob[12:]
        
        # Decrypt and authenticate.
        # This will verify the integrity tag embedded in the ciphertext.
        # If any bit has been modified, a cryptography.exceptions.InvalidTag will be raised.
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode('utf-8')
    except Exception as e:
        raise ValueError(f"Decryption failed: {str(e)}")

from typing import Any, Optional
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi_users.password import PasswordHelper

password_helper = PasswordHelper()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_helper.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return password_helper.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    secret = settings.SECRET_KEY or "dev-secret-key-12345678901234567890123456789012"
    encoded_jwt = jwt.encode(to_encode, secret, algorithm="HS256")
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    secret = settings.SECRET_KEY or "dev-secret-key-12345678901234567890123456789012"
    encoded_jwt = jwt.encode(to_encode, secret, algorithm="HS256")
    return encoded_jwt
