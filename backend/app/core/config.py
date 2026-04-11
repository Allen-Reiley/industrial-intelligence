from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # --- APP SETTINGS ---
    PROJECT_NAME: str = "AuraWorks Industrial Intelligence OS"
    VERSION: str = "3.2.0"
    API_V1_STR: str = "/api/v1"

    # --- SECURITY & AUTH ---
    # Used to secure /api/v1/leads and /api/v1/debug/entities
    ADMIN_API_KEY: str = "change-me-in-production" 
    SECRET_KEY: str  # Required in .env
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520  # 8 days
    
    # --- DATABASE ---
    DATABASE_URL: str # Required in .env
    
    # --- INDUSTRIAL TRIAD (ENRICHMENT) ---
    IPINFO_TOKEN: str # Required in .env
    APOLLO_API_KEY: Optional[str] = None # Added for contact discovery
    
    # --- INTELLIGENCE BRAIN ---
    DEEPSEEK_API_KEY: Optional[str] = None # Added for juristic research
    
    # --- VAULT & ENGINE (SINK) ---
    AIRTABLE_BASE_ID: Optional[str] = None # Moved from os.getenv
    AIRTABLE_API_KEY: Optional[str] = None
    NOTION_DATABASE_ID: Optional[str] = None # Moved from os.getenv
    NOTION_TOKEN: Optional[str] = None

    # --- NOTIFICATIONS & DISPATCH ---
    SLACK_WEBHOOK_URL: Optional[str] = None        # #leads channel
    SLACK_VISIT_WEBHOOK_URL: Optional[str] = None  # #visit channel
    MAILGUN_API_KEY: Optional[str] = None
    MAILGUN_DOMAIN: str = "mg.auraworks.co.za"
    
    # --- LEGACY / OTHER ---
    NEXT_PUBLIC_WAITLIST_API_KEY: Optional[str] = None
    NEXT_PUBLIC_WAITLIST_ID: Optional[str] = None
    RESEND_API_KEY: Optional[str] = None

    # Modern Pydantic V2 Configuration
    model_config = SettingsConfigDict(
        env_file=".env", 
        case_sensitive=True,
        extra="ignore" 
    )

settings = Settings()