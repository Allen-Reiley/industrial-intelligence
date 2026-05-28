# backend/app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List

class Settings(BaseSettings):
    # --- APP SETTINGS ---
    PROJECT_NAME: str = "AuraWorks Industrial Intelligence OS"
    VERSION: str = "3.2.1"  # Forensic v3.2.1 Async Support
    API_V1_STR: str = "/api/v1"

    # --- SECURITY & AUTH ---
    # Formal authentication for the industrial dashboard
    ADMIN_API_KEY: str = "change-me-in-production" 
    SECRET_KEY: Optional[str] = None  
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520  # 8 days (matches long-cycle industrial procurement)
    
    # --- DATABASE ---
    # Set to Optional to prevent build-time crashes on platforms like Railway
    DATABASE_URL: Optional[str] = None 
    
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
    MAILGUN_API_KEY: Optional[str] = None
    MAILGUN_DOMAIN: str = "mg.auraworks.co.za"
    
    # RESEND CORE DISPATCH
    RESEND_API_KEY: Optional[str] = None
    RESEND_FROM_EMAIL: str = "AuraWorks <waitlist@auraworks.co.za>"

    # --- EXTERNAL INTEGRATIONS ---
    NEXT_PUBLIC_WAITLIST_API_KEY: Optional[str] = None
    NEXT_PUBLIC_WAITLIST_ID: Optional[str] = None

    # --- CORS SETTINGS (Industrial Perimeter) ---
    ALLOWED_ORIGINS: List[str] = [
        "https://industrial-intelligence-xi.vercel.app", 
        "http://localhost:3000",
        "https://auraworks.co.za",
        "https://www.auraworks.co.za",
        "https://cdn.auraworks.co.za",
        "https://dynamic-flow-production-a5d6.up.railway.app",
        "https://industrial-intelligence-git-main-allen-reileys-projects.vercel.app",
        "https://industrial-intelligence-lttxeot8z-allen-reileys-projects.vercel.app"
    ]

    # Modern Pydantic V2 Configuration
    model_config = SettingsConfigDict(
        env_file=None, # Prevents local .env from overriding production environment vars
        case_sensitive=True,
        extra="ignore"  # Prevents crash if extra metadata env vars are passed by Railway
    )

settings = Settings()