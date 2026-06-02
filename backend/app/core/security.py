import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings

def get_encryption_key() -> bytes:
    """
    Derives a 32-byte key from the SECRET_KEY for AES-256-GCM encryption.
    If the SECRET_KEY is not exactly 32 bytes, we hash it using SHA-256 to guarantee size.
    """
    secret = settings.SECRET_KEY.encode('utf-8')
    if len(secret) == 32:
        return secret
    
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
    nonce = os.urandom(12) # Standard 96-bit nonce for GCM
    
    ciphertext = aesgcm.encrypt(nonce, data.encode('utf-8'), None)
    
    # Prepend nonce to the ciphertext so we can decrypt it later
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
        
        # Extract the 12-byte nonce
        nonce = encrypted_blob[:12]
        ciphertext = encrypted_blob[12:]
        
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode('utf-8')
    except Exception as e:
        raise ValueError(f"Decryption failed: {str(e)}")
