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
Gated until prospect form submission or manual banner opt-in

3. Comprehensive Database Schema & Data Models
The following structural configurations define the persistent database schema layers implemented via SQLModel abstractions.
3.1 Core Client & Tenant Management Schema
from enum import Enum
from typing import Optional, List, Any
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, DateTime
from sqlalchemy import ARRAY, String, JSON

class ClientCategory(str, Enum):
    INDUSTRIAL = "industrial"
    COMMERCIAL = "commercial"

class SubscriptionStatus(str, Enum):
    TRIAL = "trial"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CANCELLATION_PENDING = "cancellation_pending"

class ClientBase(SQLModel):
    company_name: str = Field(index=True)
    domain: Optional[str] = Field(default=None, index=True, nullable=True)
    whitelisted_domains: List[str] = Field(
        default=[],
        sa_column=Column(ARRAY(String).with_variant(JSON, "sqlite"), nullable=False)
    )
    category: ClientCategory = Field(default=ClientCategory.COMMERCIAL)
    client_product_description: str = Field(default="")
    subscription_status: SubscriptionStatus = Field(default=SubscriptionStatus.SUSPENDED)
    payment_plan: str = Field(default="monthly")
    setup_fee_paid: bool = Field(default=False)
    contract_signed_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    payment_provider_id: Optional[str] = Field(default=None, nullable=True)
    is_active: bool = Field(default=False)
    collect_personal_data: bool = Field(default=False)
    require_consent_banner: bool = Field(default=False)
    payment_method_token: Optional[str] = Field(default=None, nullable=True)
    custom_monthly_amount: Optional[int] = Field(default=None, nullable=True)
    billing_cycle: str = Field(default="monthly", nullable=False)
    trial_ends_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    tc_accepted_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    tc_accepted_ip: Optional[str] = Field(default=None, nullable=True)
    cancellation_requested: bool = Field(default=False, nullable=False)
    trial_warning_sent: bool = Field(default=False, nullable=False)

    def __init__(self, **data: Any):
        domain = data.get("domain")
        whitelisted = data.get("whitelisted_domains")
        if domain and not whitelisted:
            data["whitelisted_domains"] = [domain]
        elif whitelisted and not domain:
            data["domain"] = whitelisted[0]
        super().__init__(**data)

class Client(ClientBase, table=True):
    __tablename__ = "client"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    auto_classified_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )


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


8. Phase 9: Inbound Email Routing & Processing Specifications
8.1 Inbound Processing Engine: Webhook ingest endpoint POST /api/v1/webhooks/inbound-email. Receives email payloads sent to legal@, privacy@, and customer@ via Resend Inbound Webhooks.
8.2 InboundMessage Schema:
  - id: UUID (primary key)
  - sender_email: str
  - recipient_alias: str
  - subject: str
  - text_body: Optional[str]
  - html_body: Optional[str]
  - status: MessageStatus Enum (unread, in_progress, resolved)
  - created_at: datetime
8.3 Routing & Notifications: Route messages based on alias to compliance (#compliance) or support (#support) Slack channels with sender details, subject, a 150-char snippet, and an admin thread CTA.
8.4 Auto-Responder: Contextual outbound email template sent via Resend immediately on successful DB commit to confirm receipt.


9. Phase 10: VSL Conversion Funnel Specifications
9.1 Video Player Integration: Next.js landing page at /vsl containing custom HTML5 video component streaming from ImageKit.io.
9.2 Delayed CTA Reveal: Omit global navigation and footer elements on the layout. Hide CTA buttons and micro-copy until the ended event is dispatched, utilizing Framer Motion for exit/entry animations.
9.3 Inbound Intent Telemetry API: POST /api/v1/track/intent payload structure:
  - aura_id: str
  - email: Optional[str]
  - completion_percentage: int
  - is_completed: bool
  - client_id: UUID
Updates the matching Prospect or Visit record's vsl_completion_percentage and vsl_completed_at values.
9.4 Slack Intelligence Routing: Triggers alert to #prospects channel when a known company reaches 100% VSL completion.


10. Phase 11: Advanced Banner Data Flow & Entity Stitching Specifications
10.1 Multi-Tenant DB: Ensure `client_id` (UUID) is present and scoped across Visit, Company, and Prospect tables to enforce data isolation.
10.2 Immediate Enrichment Background Workers: Instantly trigger IPinfo and Apollo API enrichment tasks in background on banner form submission.
10.3 Stitching Engine: Implement deterministic and AI-powered entity stitching protocol:
  - Substring matching checks if user-provided banner name is inside enriched name.
  - Fast DeepSeek verification handles matching evaluation and ISP check fallback.
  - Discard ISP name and fallback to banner name if LLM marks enriched record as ISP.
10.4 Surge Alerting: Trigger real-time alert to client when visitor count threshold for a single company is crossed (e.g., 3 unique forensic IDs).

11. Phase 12: Decoupled Edge Architecture Specifications
11.1 Client Installation: Clients integrate a single tag: `<script src="https://cdn.auraworks.co.za/aura.js" data-client-id="[UUID]" defer></script>`.
11.2 Handshake: `aura.js` parses the `data-client-id` and checks remote configuration: `GET https://api.auraworks.co.za/v1/clients/config?client_id=[UUID]&tz=[TZ]`.
11.3 Dynamic Script Injection: If the backend configuration signals `require_consent_banner === true`, the client script dynamically appends a new script tag loading `banner.js` from `https://banner.auraworks.co.za/banner.js`.
11.4 Shadow DOM UI Isolation: `banner.js` builds the 4-phase consent banner entirely in Vanilla JavaScript inside an isolated Shadow DOM Root container to prevent client CSS styling bleeding or script collision.
11.5 Decoupled CustomEvent Architecture:
  - Communication is strictly event-driven:
  - `aura.js` dispatches `aura:ready` containing `auraId`, `clientId`, and `config`.
  - `banner.js` listens to `aura:ready` to bootstrap the banner, and dispatches `aura_warm_lead` event on form submissions.
  - `aura.js` captures `aura_warm_lead`, stamps UTMs, session ID, and telemetry, then dispatches the payload to the backend ingestion endpoint.
11.6 Edge Deployment: All files inside the tracking bundle (`aura.js`, `banner.js`) are minified via Terser locally and synced to edge buckets with `Cache-Control: public, max-age=86400`.

12. Phase 13: Provisioning Dashboard & Admin Console Specifications

12.1 Multi-Tenant Client Ledger Schema:
* Extends the `Client` table with list-based `whitelisted_domains` arrays (PostgreSQL `ARRAY` datatype with a fallback to `JSON` for SQLite tests).
* Adds a constructor override on instantiation to preserve backward compatibility, translating the legacy singular `domain` string to `whitelisted_domains` arrays, and vice versa.
* Includes flags `require_consent_banner` and `collect_personal_data` to govern edge tracker configurations.

12.2 Admin Authentication (JWT Engine):
* **Login Gateway**: `/api/v1/auth/login` accepts admin credentials, validates against system secrets, and returns short-lived access and refresh tokens.
* **Token Protection**: FastAPI endpoints are protected via `get_current_admin` dependencies checking the JWT signature, validity, and expiration.
* **Fallback Verification**: Backend telemetry proxies accept authentication from either legacy `X-Aura-Token` header key strings or modern `Authorization: Bearer [JWT]` headers to secure administrative API routes.
* **Routing Middleware**: Next.js custom middleware guards all `/admin/*` routes, checking the presence of a secure `admin_access_token` cookie and redirecting unauthenticated visitors to `/login`.

12.3 Two-Tier High-Speed Config Cache:
* **Tier 1 (Redis)**: Tries to read/write JSON-serialized client configurations from a Redis instance for sub-millisecond edge resolution.
* **Tier 2 (In-Memory Fallback)**: Automatically falls back to a Python LRU cache (`cachetools.TTLCache`) with a 5-minute TTL if Redis is offline or unreachable. Connection failures degrade silently without raising HTTP 500 errors.
* **Config Resolution Route**: `GET /v1/clients/config` resolves matching client whitelisted domains against request origins to authorize tracking handshakes.

12.4 Snippet Generation & Verification Console:
* **Administration Panel**: High-fidelity dark mode dashboard with active tenant switcher, client registration modal, and live leads feed.
* **Copy Deployment Snippet**: Modal dynamically interpolates the registered client UUID into a production HTML script tag, with a copy-to-clipboard mechanism.
* **Telemetry Verification Indicator**: Active status component polls `GET /api/v1/clients/{client_id}/verify` to trace visits linked to the tenant UUID. Once a visit is detected, the status transitions to "Installed & Active" and triggers a leads table refresh.

12.5 Cross-Subdomain Session & Telemetry Validation (Phase 16):
* **Cross-Subdomain Cookies**: FastAPI-Users authentication utilizes `CookieTransport` configured with `cookie_domain = "auraworks.co.za"`, `cookie_secure = True`, and `cookie_samesite = "lax"`. This ensures authentication credentials flow seamlessly between `api.auraworks.co.za` and `www.auraworks.co.za`.
* **Flexible Telemetry Payload**: The `/v1/track/event` endpoint accepts a flexible Pydantic schema with `properties: Dict[str, Any] = Field(default_factory=dict)` to ingest dynamic client-side tracking parameters without raising 422 errors.
* **Unified Terminology & Robustness**: Legacy waitlist references are completely replaced by the prospect engine across client-side scripts. The client-side tracker utilizes a capped retry queue to handle failed dispatches silently.

13. Phase 17: Database State Recovery & Pipeline Synchronization Specifications
13.1 Alembic Schema Consolidation & RLS Baseline:
* Migration history is consolidated into a single unified schema baseline (`ed255488d937_phase_17_baseline.py`) registering all SQLModel models (Client, Transaction, User, Visit, PageView, Prospect, etc.) and explicitly establishing Row-Level Security (RLS) tenant isolation policies on the `visit`, `page_view`, `prospect`, and `company` tables.
13.2 Resilient Container Startup Sequence:
* The production deployment boot script (`start.sh`) runs database migrations programmatically via `alembic upgrade head` wrapped in a defensive shell trap that intercepts errors, preventing startup crash cascades and ensuring ASGI server boot even in out-of-sync db states.
13.3 Programmatic Admin Seeder:
* Seed script (`seed_admin.py`) programmatically registers and hashes the default administrator superuser (`ReitumetseF`) using the configured `UserManager` password hashing helper, injecting users into both standard `user` and legacy `admin_user` tables safely.

14. Phase 18: Full-Stack Authentication & Security Overhaul Specifications
14.1 Backend Session Cookie Security:
* The insecure legacy JWT token fallback decoder in `get_current_admin` is deprecated and deleted. The system enforces strict cookie-only authentication via FastAPI-Users session cookies (`FastAPIUsers.current_user`).
* The `RedirectCookieTransport` is dynamically adjusted to avoid hardcoding production domains, resolving redirect loops across localized test settings.
* `COOKIE_DOMAIN` resolves to `None` under local environment contexts and strictly `.auraworks.co.za` in production.
14.2 Dual-Login Case Insensitivity:
* Email lookup in `UserManager.authenticate` queries the user record using SQLAlchemy `func.lower()` matching against the username/email input, ensuring case-insensitive authentication handles login payloads correctly.
* The administrative database seeder `seed_admin.py` registers the default admin superuser using the raw plaintext password, delegating the hashing process to the `UserManager` context to avoid double-hashing states.
14.3 Frontend Login Form & Callback Routing:
* Next.js manual credentials login page parses fields to prevent compiling empty/null attributes.
* Next.js Google OAuth callback component removes duplicate authorization requests and acts as a lightweight pass-through forwarding users directly to the secure command dashboard.
14.4 Tenant Authorization Perimeter Gates:
* Client-specific query endpoints (e.g. `/api/v1/leads`) explicitly check permission rules, validating that the authenticated admin user possesses direct query mapping permissions for the requested `client_id` parameter to deny cross-tenant context leaks.
15. Phase 19: Alembic Hard Reset & Database Initialization Specifications
15.1 Baseline Migration Consolidation:
* Clears all old, tangled, and legacy migrations from the versions history and establishes a single autogenerated baseline migration capturing the complete SQLModel schema.
* Integrates PostgreSQL Row-Level Security (RLS) policies and forces them on multitenant tables (visit, page_view, prospect, company) within the baseline migration script.
15.2 Programmatic DB Initialization:
* Ensures clean setup of tables and schema elements, with automated seeder injection of the default superuser ReitumetseF account via UserManager.

16. Phase 20: Cloud Gateway & Container Binding Stabilization Specifications
16.1 Container Host Binding & Dynamic Port:
* Enforces explicit Uvicorn binding to `0.0.0.0` instead of the local loopback `127.0.0.1` to enable proper routing through the Railway edge proxy.
* Runs Uvicorn inside a shell execution context (`sh -c`) in order to resolve the dynamic environment variable `$PORT` (defaulting to 8000 if absent) as an integer.
16.2 Database Driver Auto-Correction:
* Upgrades the database session engine setup to check incoming `DATABASE_URL` strings and replace `postgresql://` protocol prefixes with `postgresql+asyncpg://` to prevent runtime crashes caused by incompatible synchronous drivers.

17. Phase 21: Frontend Handoff & Client Initialization Specifications
17.1 Frontend Login Form integrity:
* Employs explicit `e.preventDefault()` at the beginning of the submit handler inside Next.js login to block browser refresh and fetch cancellation.
* Enforces router redirection sequence only when the async login fetch successfully resolves.
17.2 Cookie Subdomain Alignments:
* Configures `COOKIE_DOMAIN` to support wildcard subdomains (`.auraworks.co.za`) in production, enabling seamless cross-domain session access.
17.3 Client Configuration Seeding:
* Implements database seed scripts to insert baseline telemetry configuration metadata for target telemetry IDs to prevent client tracking 404 responses.
