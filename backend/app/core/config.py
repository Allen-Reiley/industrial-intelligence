from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, Union

class Settings(BaseSettings):
    # --- APP SETTINGS ---
    PROJECT_NAME: str = "AuraWorks Industrial Intelligence OS"
    VERSION: str = "3.2.0"
    API_V1_STR: str = "/api/v1"

    # --- SECURITY & AUTH ---
    # Used to secure /api/v1/leads and /api/v1/debug/entities
    ADMIN_API_KEY: str = "change-me-in-production" 
    SECRET_KEY: str  # Injected via Railway Vars
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520  # 8 days
    
    # --- DATABASE ---
    # Railway provides this automatically when linked
    DATABASE_URL: str 
    
    # --- INDUSTRIAL TRIAD (ENRICHMENT) ---
    IPINFO_TOKEN: str 
    APOLLO_API_KEY: Optional[str] = None 
    
    # --- INTELLIGENCE BRAIN ---
    DEEPSEEK_API_KEY: Optional[str] = None 
    
    # --- VAULT & ENGINE (SINK) ---
    # These now match the tokens you added to Railway
    AIRTABLE_BASE_ID: Optional[str] = None 
    AIRTABLE_API_KEY: Optional[str] = None
    AIRTABLE_TABLE_NAME: str = "Forensic_Leads" # Added for consistency
    NOTION_DATABASE_ID: Optional[str] = None 
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

    # --- CORS SETTINGS ---
    # Authorizing your production domains explicitly
    ALLOWED_ORIGINS: list[str] = [
        "https://www.auraworks.co.za",
        "https://auraworks.co.za",
        "https://dynamic-flow-production-a5d6.up.railway.app"
    ]

    # Modern Pydantic V2 Configuration
    model_config = SettingsConfigDict(
        # In production, env_file is ignored if variables are in the environment
        env_file=None, 
        case_sensitive=True,
        extra="ignore" 
    )

settings = Settings()