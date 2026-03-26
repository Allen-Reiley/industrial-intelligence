from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Industrial Intelligence Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/v1"

    # API Keys for Frontend (Waitlist) - Added to prevent validation crashes
    NEXT_PUBLIC_WAITLIST_API_KEY: Optional[str] = None
    NEXT_PUBLIC_WAITLIST_ID: Optional[str] = None
    
    # Security
    SECRET_KEY: str  # Required in .env
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database
    DATABASE_URL: str # Required in .env
    
    # Third Party APIs
    IPINFO_TOKEN: str # Required in .env
    
    # Email Settings
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = 587
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None

    # Modern Pydantic V2 Configuration
    model_config = SettingsConfigDict(
        env_file=".env", 
        case_sensitive=True,
        extra="ignore" # This stops the 'extra_forbidden' error
    )

settings = Settings()