from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, Union

class Settings(BaseSettings):
    # --- APP SETTINGS ---
    PROJECT_NAME: str = "AuraWorks Industrial Intelligence OS"
    VERSION: str = "3.2.0"
    API_V1_STR: str = "/api/v1"

    # --- SECURITY & AUTH ---
    ADMIN_API_KEY: str = "change-me-in-production" 
    # Change: Made Optional to prevent boot crash if Railway hasn't synced yet
    SECRET_KEY: Optional[str] = None  
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520  # 8 days
    
    # --- DATABASE ---
    # Change: This was the direct cause of the ValidationError. 
    # Making it Optional allows the app to start and show health/logs.
    DATABASE_URL: Optional[str] = None 
    
    # --- INDUSTRIAL TRIAD (ENRICHMENT) ---
    # Change: Set to Optional
    IPINFO_TOKEN: Optional[str] = None 
    APOLLO_API_KEY: Optional[str] = None 
    
    # --- INTELLIGENCE BRAIN ---
    DEEPSEEK_API_KEY: Optional[str] = None 
    
    # --- VAULT & ENGINE (SINK) ---
    AIRTABLE_BASE_ID: Optional[str] = None 
    AIRTABLE_API_KEY: Optional[str] = None
    AIRTABLE_TABLE_NAME: str = "Forensic_Leads" 
    NOTION_DATABASE_ID: Optional[str] = None 
    NOTION_TOKEN: Optional[str] = None

    # --- NOTIFICATIONS & DISPATCH ---
    SLACK_WEBHOOK_URL: Optional[str] = None        
    SLACK_VISIT_WEBHOOK_URL: Optional[str] = None  
    MAILGUN_API_KEY: Optional[str] = None
    MAILGUN_DOMAIN: str = "mg.auraworks.co.za"
    
    # --- LEGACY / OTHER ---
    NEXT_PUBLIC_WAITLIST_API_KEY: Optional[str] = None
    NEXT_PUBLIC_WAITLIST_ID: Optional[str] = None
    RESEND_API_KEY: Optional[str] = None

    # --- CORS SETTINGS ---
    ALLOWED_ORIGINS: list[str] = [
        "https://industrial-intelligence-xi.vercel.app", 
        "http://localhost:3000",
        "https://auraworks.co.za",
        "https://www.auraworks.co.za",
        "https://cdn.auraworks.co.za",
        "https://dynamic-flow-production-a5d6.up.railway.app",
        "https://industrial-intelligence-xi.vercel.app",
        "industrial-intelligence-git-main-allen-reileys-projects.vercel.app",
        "industrial-intelligence-lttxeot8z-allen-reileys-projects.vercel.app",
        "industrial-intelligence-9fzf2pbta-allen-reileys-projects.vercel.app",
        "industrial-intelligence-rm7hxzqx8-allen-reileys-projects.vercel.app"
    ]

    # Modern Pydantic V2 Configuration
    model_config = SettingsConfigDict(
        env_file=None, 
        case_sensitive=True,
        extra="ignore" 
    )

settings = Settings()