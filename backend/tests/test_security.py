import pytest
from app.core.config import settings

if not settings.SECRET_KEY:
    settings.SECRET_KEY = "test_super_secret_key_for_aes_gcm_256"

from app.core.security import encrypt_field, decrypt_field

def test_encryption_decryption():
    """
    Test that AES-256-GCM encryption correctly encrypts and decrypts string data.
    """
    original_text = "+27 82 123 4567"
    encrypted_text = encrypt_field(original_text)
    
    # Ensure it's actually encrypted
    assert encrypted_text != original_text
    assert len(encrypted_text) > 0
    
    # Ensure we can decrypt it
    decrypted_text = decrypt_field(encrypted_text)
    assert decrypted_text == original_text

def test_empty_string():
    """
    Test empty string handling.
    """
    assert encrypt_field("") == ""
    assert decrypt_field("") == ""

def test_invalid_decryption():
    """
    Test that invalid data raises a ValueError.
    """
    with pytest.raises(ValueError):
        decrypt_field("invalid_base64_data_that_is_not_encrypted")
