# backend/app/core/config.py
from dotenv import load_dotenv
load_dotenv()

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List


class Settings(BaseSettings):
    # --- APP SETTINGS ---
    PROJECT_NAME: str = "AuraWorks Industrial Intelligence OS"
    VERSION: str = "3.2.1"  # Forensic v3.2.1 Async Support
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    API_DOMAIN: Optional[str] = None

    # --- SECURITY & AUTH ---
    # Formal authentication for the industrial dashboard
    ADMIN_API_KEY: str = "change-me-in-production" 
    SECRET_KEY: Optional[str] = None  
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520  # 8 days (matches long-cycle industrial procurement)
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    OAUTH_REDIRECT_URI: Optional[str] = None
    COOKIE_DOMAIN: Optional[str] = "auraworks.co.za"

    
    # --- DATABASE ---
    # Set to Optional to prevent build-time crashes on platforms like Railway
    DATABASE_URL: Optional[str] = None 
    REDIS_URL: Optional[str] = None
    PAYGENIUS_WEBHOOK_SECRET: Optional[str] = None
    
    # --- IKHOKHA PAYMENT INTEGRATION ---
    IKHOKHA_API_URL: str = "https://api.ikhokha.com"
    IKHOKHA_CLIENT_ID: Optional[str] = None
    IKHOKHA_CLIENT_SECRET: Optional[str] = None
    IKHOKHA_WEBHOOK_SECRET: Optional[str] = None
    
    # --- ENRICHMENT TRIAD (National Scaling) ---
    IPINFO_TOKEN: Optional[str] = None 
    APOLLO_API_KEY: Optional[str] = None 
    
    # --- INTELLIGENCE BRAIN ---
    DEEPSEEK_API_KEY: Optional[str] = None 
    
    # --- THE VAULT (Airtable Sink) ---
    AIRTABLE_BASE_ID: Optional[str] = None 
    AIRTABLE_API_KEY: Optional[str] = None
    AIRTABLE_TABLE_NAME: str = "Forensic_Leads" 
    
    # --- PROJECT SPACE (Notion) ---
    NOTION_DATABASE_ID: Optional[str] = None 
    NOTION_TOKEN: Optional[str] = None

    # --- NOTIFICATIONS & DISPATCH ---
    SLACK_WEBHOOK_URL: Optional[str] = None        
    SLACK_VISIT_WEBHOOK_URL: Optional[str] = None  
    SLACK_COMPLIANCE_WEBHOOK_URL: Optional[str] = None
    SLACK_SUPPORT_WEBHOOK_URL: Optional[str] = None
    
    # --- EXCLUSIVE RESEND EMAIL DISPATCH ENGINE ---
    RESEND_API_KEY: Optional[str] = None
    RESEND_FROM_EMAIL: str = "AuraWorks <onboarding@auraworks.co.za>"
    CALENDLY_LINK: str = "https://calendly.com/auraworks/demo"
    CALENDLY_WEBHOOK_SECRET: Optional[str] = None
    RESEND_WEBHOOK_SECRET: Optional[str] = None

    # --- EXTERNAL INTEGRATIONS ---
    NEXT_PUBLIC_WAITLIST_API_KEY: Optional[str] = None
    NEXT_PUBLIC_WAITLIST_ID: Optional[str] = None

    # --- CORS SETTINGS (Industrial Perimeter) ---
    ALLOWED_ORIGINS: List[str] = [
        "https://industrial-intelligence-xi.vercel.app", 
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://auraworks.co.za",
        "https://www.auraworks.co.za",
        "https://cdn.auraworks.co.za",
        "https://dynamic-flow-production-a5d6.up.railway.app",
        "https://industrial-intelligence-git-main-allen-reileys-projects.vercel.app",
        "https://industrial-intelligence-lttxeot8z-allen-reileys-projects.vercel.app",
        "https://api.auraworks.co.za",
        "https://banner.auraworks.co.za",
        "https://api.auraworks.co.za/v1/track/event"
    ]
    ALLOWED_ORIGIN_REGEX: Optional[str] = r"^https?://([a-zA-Z0-9-]+\.)*(auraworks\.co\.za|vercel\.app)(:[0-9]+)?$"
    
    # --- IMAGEKIT INTEGRATION ---
    IMAGEKIT_PUBLIC_KEY: Optional[str] = "mock_public_key"
    IMAGEKIT_PRIVATE_KEY: Optional[str] = "mock_private_key"
    IMAGEKIT_URL_ENDPOINT: Optional[str] = "https://ik.imagekit.io/auraworks"

    # Modern Pydantic V2 Configuration
    model_config = SettingsConfigDict(
        env_file=None, # Prevents local .env from overriding production environment vars
        case_sensitive=True,
        extra="ignore"  # Prevents crash if extra metadata env vars are passed by Railway
    )

    def __init__(self, **data):
        super().__init__(**data)
        if self.ENVIRONMENT in ["development", "dev", "local"]:
            self.COOKIE_DOMAIN = None
        else:
            self.COOKIE_DOMAIN = ".auraworks.co.za"

settings = Settings()