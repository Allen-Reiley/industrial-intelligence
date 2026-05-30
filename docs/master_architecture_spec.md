AuraWorks Industrial Intelligence Engine (v1.0)
Comprehensive Master Project Specification & Scope Documentation
Document Version: 2.0 (Production-Freeze)
Date: May 30, 2026
Classification: Proprietary Operational Blueprint — AuraWorks (Pty) Ltd
Target Technical Stack: Python 3.12, FastAPI, SQLModel, PostgreSQL (Neon Serverless + RLS), Redis, Next.js 14+ (App Router), Cloudflare R2, PayGenius API
1. Executive Summary & Strategic Core
The AuraWorks Industrial Intelligence Engine is a high-performance B2B traffic de-anonymization and sales intelligence platform. It is engineered specifically for long-sales-cycle heavy industry, mining, manufacturing, construction, and engineering infrastructure operations within the Southern African Development Community (SADC) region.
The primary business mechanism is the Identity Bridge Protocol: converting anonymous web telemetry, network routing topologies, and device attributes into authenticated juristic persons (registered companies) actively inspecting high-intent digital assets (e.g., technical specification sheets, blueprint files, CAD models, and tender parameters) before they explicitly enter a formal procurement workflow. Natural person context gathering (consented email and phone details) acts as a high-friction premium conversion layer but does not gate or interrupt the continuous background tracking and de-anonymization of enterprise network footprints.
2. Legal Architecture & POPIA Compliance Topography
The engine operates strictly under the legal frameworks of the South African Protection of Personal Information Act (POPIA), No. 4 of 2013, by physically and logically segregating data processing boundaries into a Two-Tier Identity Model based on Section 1 data subject criteria:
Feature / Metric
Tier 1: The Juristic Layer
Tier 2: The Personal Layer
 
Data Subject Class
Juristic Persons (Companies, Mines, Corporations)
Natural Persons (Individual human visitors)
Core Elements
Company Name, Domain, Industry, City/Region, ASNs
First/Last Name, Personal Email, Direct Phone, Clear Fingerprints
POPIA Status
Legitimate Business Interest (No upfront consent required)
Explicit Opt-In Gated (Consent mandatory)
Retention Window
Permanent, immutable ledger tracking
48-Hour conditional window (Scrubbed if unverified)
Janitor Execution
Protected from scrubbing cascades
Automatically anonymized/zeroed out if unverified
Enrichment Triggers
Immediate asynchronous IPinfo + Apollo extraction
Gated until waitlist form submission or manual banner opt-in

3. Comprehensive Database Schema & Data Models
The following structural configurations define the persistent database schema layers implemented via SQLModel abstractions.
3.1 Core Client & Tenant Management Schema
from enum import Enum
from typing import Optional, List
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

class ClientCategory(str, Enum):
    INDUSTRIAL = "industrial"
    COMMERCIAL = "commercial"

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    SUSPENDED = "suspended"

class Client(SQLModel, table=True):
    __tablename__ = "client"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    company_name: str = Field(index=True)
    domain: str = Field(unique=True, index=True)
    category: ClientCategory = Field(default=ClientCategory.COMMERCIAL)
    client_product_description: str = Field(default="")
    subscription_status: SubscriptionStatus = Field(default=SubscriptionStatus.SUSPENDED)
    payment_plan: str = Field(default="monthly")
    setup_fee_paid: bool = Field(default=False)
    contract_signed_at: Optional[datetime] = Field(default=None, nullable=True)
    payment_provider_id: Optional[str] = Field(default=None, nullable=True)
    is_active: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    auto_classified_at: Optional[datetime] = Field(default=None, nullable=True)


3.2 Enterprise & Departmental Directory Core Pool
class Company(SQLModel, table=True):
    __tablename__ = "company"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    domain: str = Field(index=True)
    company_name: str = Field(index=True)
    industry: Optional[str] = Field(default=None, index=True)
    parent_company_id: Optional[UUID] = Field(default=None, foreign_key="company.id", nullable=True)
    is_headquarters: bool = Field(default=False)
    intent_summary: Optional[str] = Field(default=None, nullable=True)
    last_enrichment_attempt: Optional[datetime] = Field(default=None, nullable=True)
    cipc_verified: bool = Field(default=False)
    cipc_registration_number: Optional[str] = Field(default=None, nullable=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Department(SQLModel, table=True):
    __tablename__ = "department"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    company_id: UUID = Field(foreign_key="company.id", index=True)
    contact_name: str
    role_title: str = Field(index=True)
    email: str
    phone: Optional[str] = Field(default=None)
    linkedin_url: Optional[str] = Field(default=None)
    priority_score: int = Field(default=1, ge=1, le=5, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


3.3 Multi-Tenant Telemetry & Interaction Schemas (RLS Gated)
class VerificationStatus(str, Enum):
    VERIFYING = "verifying"
    VERIFIED = "verified"
    ANONYMIZED_CORPORATE = "anonymized_corporate"

class Visit(SQLModel, table=True):
    __tablename__ = "visit"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    client_id: UUID = Field(index=True)
    company_id: Optional[UUID] = Field(default=None, foreign_key="company.id", index=True, nullable=True)
    aura_id: str = Field(index=True)
    ip_address: str = Field(index=True)
    connection_type: str = Field(default="corporate")
    is_b2b: bool = Field(default=True, index=True)
    high_intent: bool = Field(default=False, index=True)
    verification_status: VerificationStatus = Field(default=VerificationStatus.VERIFYING, index=True)
    is_consented: bool = Field(default=False, index=True)
    fingerprint_hash: Optional[str] = Field(default=None, index=True, nullable=True)
    duration: int = Field(default=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PageView(SQLModel, table=True):
    __tablename__ = "page_view"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    client_id: UUID = Field(index=True)
    visit_id: UUID = Field(foreign_key="visit.id", index=True)
    url_path: str = Field(index=True)
    referrer: Optional[str] = Field(default=None)
    duration: int = Field(default=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


4. Ingestion Pipeline & Client-Side Telemetry Loop
4.1 Script Infrastructure (`aura.js`): Distributed globally via Cloudflare R2 object storage buckets with optimized caching directives (`Cache-Control: public, max-age=86400`). To protect tracking integrity on remote, connectivity-sparse South African mining and heavy industry operations, the client script integrates an internal AuraOfflineQueue engine built atop browser-native IndexedDB configurations. Payloads are cached locally when connections fail and are flushed recursively using an exponential backoff loop upon recovery.
4.2 Interactive Layout Capture Layers: Tracking metrics capture telemetry non-intrusively based on user activity milestones:
Phase 01: 2.5-second initial delay triggers a subtle bottom-right slide-in framework prompting an enterprise email link.
Phase 02: Crossing a 50% scrolling ceiling on technical data tables or machinery specifications transforms the banner interface into a multi-column contact slide, acquiring corporate role descriptions and optional direct-line telephone metadata.
Phase 03: Upward mouse acceleration mapping triggers exit-intent technical pop-ups offering personalized calculation parameters.
Phase 04: Binary access paths targeting high-value schematics, blueprints, or CAD files introduce a strict overlay gate forcing enterprise work email validation before releasing downloads.
5. System Processing Core & Code Patch Specifications
5.1 Disabling the Exit Consent Gate (`track.py`)
Refactor process_exit_logic() within app/api/v1/endpoints/track.py to completely discard the lead validation lock, allowing unconsented juristic page metrics to propagate to analytical background loops:
# Remediated Logic Structure
lead = await get_lead_by_aura_id(payload.aura_id, session)
company = await get_company_by_aura_id(payload.aura_id, session)

if not lead and company:
    journey = await get_visitor_journey(payload.aura_id, session)
    if payload.total_duration >= 15 or payload.has_downloaded_asset:
        await handle_juristic_only_alert(company, journey, payload.client_id)
    return {"status": "processed_juristic"}


5.2 Restructuring the Janitor Purge Engine (`janitor.py`)
Convert the destructive SQL row erasure sequence into a selective column anonymization cascade, preserving permanent corporate aggregation fields:
async def execute_janitor_scrub_cascade(session: AsyncSession):
    time_threshold = datetime.now(timezone.utc) - timedelta(hours=48)
    stmt = (
        update(Visit)
        .where(Visit.is_consented == False)
        .where(Visit.verification_status == VerificationStatus.VERIFYING)
        .where(Visit.created_at < time_threshold)
        .values(
            email=None,
            visitor_name=None,
            fingerprint_hash=None,
            verification_status=VerificationStatus.ANONYMIZED_CORPORATE,
            updated_at=datetime.now(timezone.utc)
        )
    )
    await session.execute(stmt)
    await session.commit()


6. Financial Onboarding & Multi-Tenant Isolation Rules
6.1 Onboarding Pipeline: Platform checkout pathways tie securely to the PayGenius API. Successful webhooks received via /api/v1/webhook/paygenius launch asynchronous background tasks compiling formal digital service agreements via reportlab, signs them cryptographically, and dispatches them via Resend alongside onboarding requirement scripts.
6.2 Row-Level Security Rules: While company entity tracking nodes occupy shared data pools to prevent double-spending on enrichment credits, interaction matrices apply absolute multi-tenant restrictions via native PostgreSQL configurations:
ALTER TABLE visit ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON visit
FOR ALL
USING (client_id == current_setting('app.current_client_id', True)::uuid);


7. Intelligence Delivery & Deployment Specifications
7.1 Notification Management: Actionable corporate leads meeting High-Intent markers broadcast compact, button-driven payloads directly to client Slack instances inside a 60-second window. Alerts utilize an automated hourly throttle filter via a NotificationThrottle model, restricting matching entities to a single instant push per hour to insulate channels from tracking flood events.
7.2 Production Hosting Strategy: Core FastAPI routers operate inside a dedicated Docker container utilizing a python:3.12-slim image layer deployed to an active Railway Starter Plane instance to circumvent telemetry cold-start delays. Analytical data clusters communicate exclusively with the serverless production Neon PostgreSQL architecture.
