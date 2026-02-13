from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Industrial Intelligence Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/v1"
    
    # Security
    SECRET_KEY: str  # Generated via 'openssl rand -hex 32'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database (Neon.tech or Local Postgres)
    DATABASE_URL: str
    
    # Third Party APIs
    IPINFO_TOKEN: str
    
    # Email Settings (for PDF reports later)
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = 587
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env", 
        case_sensitive=True
    )

settings = Settings()