AuraWorks Industrial Intelligence Engine (v1.0)
Comprehensive Master Implementation Plan & Agentic Execution Roadmap
Document Version: 1.0 (Execution-Ready)
Target Platform: Antigravity IDE & CLI Autonomous Agent Environment
Scope Anchor: Production-Freeze Specification v2.0
This implementation plan maps out the sequence of technical tasks required to complete the platform. It is structured specifically as a sequence of highly modular prompt directives optimized for injection into the Antigravity multi-agent orchestration architecture. In alignment with project strategy, all personal data vault synchronization tasks involving third-party integrations (Notion, Airtable) are positioned at the absolute end of the engineering lifecycle.
Phase 1: Persistent Database Layer & Security Shield
Establish the shared models, schema indexes, database pooling properties, and data encryptions before creating any ingestion endpoints.
Task 1.1: Initialize SQLModel Database Entities
Antigravity Target Module: backend/app/models/
Prompt Instructions for Antigravity: Create the discrete SQLModel schema files inside the database models directory. Build individual files matching the technical spec precisely: client.py, company.py, department.py, visit.py, pageview.py, prospect.py, enrichment_queue.py, and notification_throttle.py. Ensure enums conform exactly to the design constraints (ClientCategory, SubscriptionStatus, VerificationStatus, QueueType). Every table property must map strictly to the specifications. Ensure all timestamp fields utilize explicit UTC timezone defaults.
Task 1.2: Establish Fields Encryption Layer
Antigravity Target Module: backend/app/core/security.py
Prompt Instructions for Antigravity: Implement a robust cryptographic encryption utility module leveraging the cryptography library. Build helper functions encrypt_field_value(raw_text: str) -> str and decrypt_field_value(encrypted_text: str) -> str using authenticated AES-256-GCM configurations. Link this utility layer directly to the phone_encrypted parameter inside the Prospect database model. Firmographic metadata fields (Company Name, Domain, Industry, City/Region) must remain raw and unencrypted to maintain uninhibited indexing speeds.
Task 1.3: Configure PostgreSQL Row-Level Security (RLS) Engine
Antigravity Target Module: backend/app/db.py and Alembic migrations
Prompt Instructions for Antigravity: Generate custom migration tracking files to force native Row-Level Security constraints within the PostgreSQL database environment. Enable RLS on the multi-tenant interaction data tables: visit, page_view, and prospect. Establish an operational policy matching rows strictly against a request-scoped session configuration variable: current_setting('app.current_client_id', true)::uuid. Update the async backend connection session initializer function inside db.py to automatically execute a raw SQL command string assigning this parameter on every incoming API thread execution hook.
Phase 2: Ingestion Engine & Traffic Analysis Pipeline
Refactor real-time metric tracking nodes to decouple firmographic aggregation from natural person input blocks.
Task 2.1: Refactor Exit Route & Discard Consent Gate
Antigravity Target Module: backend/app/api/v1/endpoints/track.py
Prompt Instructions for Antigravity: Locate the process_exit_logic() endpoint controller function. Completely excise the legacy conditional check if not lead: return that currently terminates exit tracking routines. Implement an upgraded dual-lookup configuration mapping both individual context and corporate metadata independently. If an active Company identification matches the cryptographic aura_id but no personal registration row exists, invoke get_visitor_journey() to compile historical page hits, check if duration criteria breach the 15-second baseline tracking floor, and trigger an automated asynchronous background pipeline call for juristic data routing.
Task 2.2: Implement Composite Multi-Tenant Cache Keys
Antigravity Target Module: backend/app/api/v1/endpoints/track.py
Prompt Instructions for Antigravity: Locate the memory tracking mechanisms inside the transaction loops. Modify the distributed Redis lookups to transition cache keys from a single aura_id context to a secure multi-tenant composite key configuration format matching client_id:aura_id. Ensure that interaction records, throttling states, and exit session notification trackers utilize this isolated spacing layout to systematically prevent any cross-tenant memory leakage or caching collating defects in production.
Task 2.3: Integrate Ingestion Fault Isolation & Reprocessing Queue
Antigravity Target Module: backend/app/services/enrichment.py and Ingestion Routers
Prompt Instructions for Antigravity: Implement a defensive transaction wrapper around external enrichment endpoints (IPinfo, Apollo). If lookups hit remote outages, connection latencies, or broadcast rate-limiting barriers (HTTP 429 / HTTP 504), the system must intercept the failure, bypass the blocking thread, and return a clean HTTP 200 to the client script. Construct a background service that writes raw data directly to the EnrichmentQueue database table. Build a background task runner executing on a 15-minute cron loop that processes queued items across a strict 3-stage exponential backoff pattern (15 minutes, 1 hour, 6 hours). If processing failures persist beyond 7 days, relocate records to a FailedEnrichment table and broadcast system telemetry directly to infrastructure logs.
Phase 3: Background Maintenance & Advanced Enrichment Cascades
Automate regulatory enforcement patterns and establish contextual data extraction routines.
Task 3.1: Remodel Automated Janitor Deletion Routines
Antigravity Target Module: backend/app/services/janitor.py
Prompt Instructions for Antigravity: Open the automated maintenance loop. Replace the broad database query executing destructive row-level removals with a precise column anonymization cascade matching POPIA parameters. The query must identify unverified interaction traces where tracking stamps exceed 48 hours and execute a selective column overwrite parameter map: set email = None, visitor_name = None, and replace raw fingerprint arrays with a non-reversible cryptographic hash SHA256(canvas + webgl + drift + rotating_daily_secret). Update the index configuration status marker to a permanent value tracking as anonymized_corporate, leaving the underlying company reference fields and page views fully intact.
Task 3.2: Accelerate & Prioritize Departmental Contact Mapping
Antigravity Target Module: backend/app/services/enrichment.py
Prompt Instructions for Antigravity: Move the get_departmental_intelligence() execution thread out of individual lead form queues. Configure the workflow to fire instantly inside an asynchronous background loop right after IPinfo validates a valid non-consumer domain profile. Extracted directory metrics must write rows straight to the decoupled Department table. Implement an integrated scanning function that automatically checks incoming role fields for primary industrial keywords (e.g., "procurement", "supply chain", "chief engineer", "director"). When conditions match, scale an integer-based priority_score modifier attribute from 1 to 5, providing automatic outreach highlighting for corporate dashboards.
Task 3.3: Stabilize Analytics Mismatches & Date Operations
Antigravity Target Module: backend/app/services/intelligence.py
Prompt Instructions for Antigravity: Audit all date operations inside get_visitor_journey(). Enforce absolute timezone synchronization across all analytical query loops. Replace all naive datetime assignments with explicit UTC timezone configurations using Python standard assignments: datetime.now(timezone.utc). This systematically prevents time delta computation drops and database indexing failures when running validation queries against timezone-aware PostgreSQL columns.
Phase 4: DeepSeek Synthesis & Web Content Extraction
Establish contextual data extraction routines to optimize analytical prompts while controlling third-party billing bounds.
Task 4.1: Build Automated Homepage Scraping Service
Antigravity Target Module: backend/app/services/intelligence.py
Prompt Instructions for Antigravity: Construct an asynchronous utility handler powered by httpx and BeautifulSoup to extract external company profile markers dynamically. The script must accept a domain path, execute a connection query enforcing a strict 5.0-second timeout drop boundary, parse retrieved HTML streams, extract text strings, and restrict final outputs strictly to the first 500 readable words. Integrate a local storage caching logic configuration backing data for 7 rolling days to protect the system from performing redundant web operations on frequent corporate visitors.
Task 4.2: Deploy Daily Analytical Batch Engine
Antigravity Target Module: backend/app/services/intelligence.py
Prompt Instructions for Antigravity: Build a consolidated daily batch processing execution background function to completely replace per-session analytical requests. The function must sweep verified interactions every 24 hours, aggregate tracking details by enterprise domain, and construct structured prompt strings compiling client descriptors, scraped prospect copy, and page navigation sequences. Enforce strict token parameters: prompts are capped at 2,000 tokens per evaluation, and an absolute 4,000-token restriction boundary drops historical page tracking arrays beyond the last 10 entries. Commit results to the persistent Company.intent_summary table field.
Phase 5: Financial Webhooks & Automated Contract Onboarding
Automate customer conversion steps, onboarding validations, and transactional checks.
Task 5.1: Build PayGenius Webhook Processing Endpoint
Antigravity Target Module: backend/app/api/v1/endpoints/webhook.py
Prompt Instructions for Antigravity: Create a public endpoint at POST /api/v1/webhook/paygenius. Build security verification check routines confirming incoming payment signature parameters match provider keys. The endpoint must parse verification payloads, update corporate billing details on success, modify the primary subscription state indicator token to active, set is_active = True, and initialize an asynchronous background worker task to compile contract documents.
Task 5.2: Automate PDF Contract Generation & Delivery
Antigravity Target Module: backend/app/services/reports.py
Prompt Instructions for Antigravity: Implement a digital contract builder service leveraging the reportlab library. The system must fetch customer form entries, map variables into standard legal layouts, and perform programmatic encryption signatures on completed assets. Integrate this generation task directly with the Resend transmission service to dispatch the signed PDF contract to the customer along with automated text requesting installation access credentials.
Task 5.3: Build Automated Client Classification Scan
Antigravity Target Module: backend/app/api/v1/endpoints/clients.py
Prompt Instructions for Antigravity: Build an automated semantic category evaluation worker to run during partner registration. The function must parse the meta properties and homepage content strings of the client's destination domain. Scan text fields for primary industrial keywords (e.g., "mining", "engineering", "logistics", "construction", "manufacturing"). If the classification matrix registers a matching keyword density score validation metric ≥ 0.6, configure the system to flag the record as ClientCategory.INDUSTRIAL; otherwise, set the profile state parameter to a default value tracking as COMMERCIAL.
Phase 6: Client Script Deployment & Frontend View Realignment
Deploy the client-side infrastructure and update user interfaces to display multi-tier analytical arrays.
Task 6.1: Harden Client Tracking Script & IndexedDB Queue
Antigravity Target Module: tracker/src/index.js
Prompt Instructions for Antigravity: Refactor the vanilla client tracking engine script. Ensure total tracking dependencies compile and scale cleanly under a strict size limit budget of <1KB (Minified and Gzipped) using Terser compression pipelines. Construct the AuraOfflineQueue engine layer powered natively by browser-level IndexedDB configurations. If network dropouts occur on target industrial installations, cache interaction matrices in-browser and execute programmatic data flushes via recursive exponential backoff loops upon validation of connection recovery.
Task 6.2: Implement Layered Consent Components
Antigravity Target Module: frontend/src/components/ConsentBanner.tsx
Prompt Instructions for Antigravity: Rewrite the frontend consent banner components to reflect a layered strategy matching your premium dark industrial aesthetic. Program Phase 01 to load a slide-in bottom notification block after a 2.5-second initialization delay. Configure Phase 02 to check scroll tracking boundaries; if a user passes 50% vertical navigation thresholds on specialized specification tables, expand the UI panel into a multi-column contact input grid (acquiring First/Last Name, Corporate Role, and Phone fields). Build Phase 03 exit-intent vector tracking, and implement Phase 04 modal lock covers gating schematic/CAD binary link downloads.
Task 6.3: Build Geolocation Consent Track Routers
Antigravity Target Module: tracker/src/index.js and Backend Ingestors
Prompt Instructions for Antigravity: Map dynamic compliance checks directly into the client tracking engine initialization sequences using country parameters from the IP lookup layer. For EU coordinates, force explicit GDPR compliance paths: completely block canvas profiling generation, GPU device unmasking, and tracking metrics scripts until a user selects explicit validation checkboxes. For South African and SADC regional traffic indicators, run the default POPIA tracking track, capturing Tier 1 firmographic metrics silently on load while reserving Tier 2 configurations for interaction milestones.
Phase 7: Intelligence Delivery, Operational Reporting, & Integration Finish Line
Construct programmatic output generators, channel alert handlers, outbound CRM relays, and final system integration pipelines.
Task 7.1: Create Programmatic Weekly PDF Reporting Service
Antigravity Target Module: backend/app/services/reports.py
Prompt Instructions for Antigravity: Build a programmatic compilation reporting worker engine scheduled via an APScheduler cron loop to execute every Monday at 06:00 SAST. The worker must aggregate historical interaction data parameters over the preceding 7 days, generate structured analytical summary HTML maps, and pass data assets through a headless rendering library engine (WeasyPrint or Playwright) to compile a multi-page PDF document. Program the file stream to upload straight into a dedicated Cloudflare R2 object store bucket. Finally, trigger a Resend transaction email passing a secure tokenized CDN download hyperlink restricted to a strict **24-hour expiration timeout** boundary.
Task 7.2: Deploy Throttled Slack Notification Routing
Antigravity Target Module: backend/app/services/notifications.py
Prompt Instructions for Antigravity: Build an automated notification pipeline formatting metadata payloads into compact, button-driven layouts for client Slack spaces inside a 60-second window. The message strings must append automated external lookup hyper-links (including explicit corporate website tracks, company LinkedIn directory searches, and customized Google News business parameter queries). To insulate channel communication logs from flooding, implement a throttling evaluation query checking the NotificationThrottle model, restricting real-time alerts to a maximum threshold boundary of **one instant alert per company entity per hour**.
Task 7.3: Implement CRM Synchronization Outbox
Antigravity Target Module: backend/app/services/crm.py
Prompt Instructions for Antigravity: Construct an outbound data synchronization service transmitting promoted lead matrices to endpoint hooks at POST /api/v1/webhook/crm/{client_id} (integrating directly with external platforms like HubSpot's Contacts API). The communication layer must process payloads asynchronously, enforce a 3-attempt connection retry strategy backed by exponential backoff parameters, and route persistent transaction failures straight into a database dead-letter queue schema for manual administrator auditing.
Final Project Move: Notion Personal Vault Synchronization
Antigravity Target Module: backend/app/services/vault.py
Prompt Instructions for Antigravity: As the absolute final addition to the codebase ecosystem, establish the third-party workspace synchronization layer. Build the service function sync_to_notion(client_id: UUID, lead_data: dict) using the official Notion SDK. When an individual lead crosses the consent threshold and completes enrichment parameters, compile their personal data parameters (decrypted email, name, priority level, and associated corporate company name) and map them directly into a designated client Notion database block. Wrap the entire connection loop with strict error isolation logic and backoff retry queues to guarantee that any external integration outages never bottleneck or impact the core ingestion tracking cluster.

Phase 8: Demo Onboarding & Scheduling Implementation
Deploy Calendly integration, Resend automated onboarding emails, Slack alerting updates, and rename the legacy Waitlist schemas to Prospects.
Task 8.1: Database Migration
Rename WaitlistLead to Prospect. Update all SQLModels, schemas, and endpoints from /waitlist/ to /prospects/. Generate Alembic migrations.
Task 8.2: Outbound Email Integration
Configure Resend for onboarding@auraworks.co.za. Construct the HTML email template with Calendly link.
Task 8.3: Calendly Webhook
Create the POST /api/v1/webhooks/calendly endpoint. Implement HMAC-SHA256 signature verification and event_uuid idempotency.
Task 8.4: Slack Intelligence
Update the Slack notification payload builders for "Form Submission" and "Meeting Booked" events for #prospects channel.
Task 8.5: Frontend UX
Update Next.js API client routing to point to /prospects/ and implement success toast UX.

Phase 9: Inbound Email Routing & Processing
Establish automated inbound email ingestion via Resend webhook, database ticketing layer, compliance/support Slack routing, and contextual auto-replies.
Task 9.1: Database Migration
Create the InboundMessage SQLModel and MessageStatus Enum (unread, in_progress, resolved). Generate the Alembic migration.
Task 9.2: Webhook Ingestion
Build POST /api/v1/webhooks/inbound-email. Implement payload parsing and secure endpoint validation.
Task 9.3: Slack Dispatcher
Implement the alias-to-channel routing logic (legal@/privacy@ to #compliance; customer@ to #support) and message snippet payload layout.
Task 9.4: Auto-Reply Engine
Build contextual outbound auto-responses via Resend based on the recipient alias.

Phase 10: VSL Conversion Funnel Implementation [COMPLETED]
Deploy a distraction-free Video Sales Letter (VSL) landing page with intent telemetry tracking and dynamic CTA reveal mechanics.
Task 10.1: Backend Intent Telemetry
Create POST /api/v1/track/intent. Update PostgreSQL schemas (Visit/Prospect) to store vsl_completion_percentage and vsl_completed_at.
Task 10.2: Slack Alert Routing
Implement the VSL completion Slack notification payload in the intelligence routing service to alert #prospects channel on 100% completion.
Task 10.3: VSL Page Layout
Build the isolated /vsl Next.js layout. Remove global nav/footer and implement a subtle "Go Back" button.
Task 10.4: Player & Dynamic CTA
Integrate ImageKit video player. Bind timeupdate to telemetry API. Bind ended event to Framer Motion state to reveal the CTA and micro-copy strictly after video ends.

Phase 11: Advanced Banner Data Flow & Entity Stitching Implementation
Upgrade the intelligence engine to support multi-tenancy, deterministic B2B entity stitching with AI fallbacks, and real-time organizational surge alerting.
Task 11.1: Multi-Tenant Migration
Add client_id column to Visit, Company, and Prospect tables. Update SQLAlchemy models and Alembic migrations.
Task 11.2: Immediate Workers
Refactor the banner ingestion endpoint to immediately trigger IPinfo and Apollo background enrichment tasks.
Task 11.3: DeepSeek Stitching Engine
Implement the Entity Resolution protocol (Substring matching -> DeepSeek ISP Verification -> Fallback).
Task 11.4: Surge Alert System
Implement SQL aggregation logic to monitor unique visitors per company. Trigger the instant Slack alert when thresholds are met.

Phase 12: Decoupled Edge Architecture Implementation [COMPLETED]
This phase extracts the core intelligence tracking and consent UI from the Next.js monolith, deploying them as pure, highly optimized JavaScript micro-assets on the edge (CDN).
Task 12.1: Directory & Build Configuration
Structure tracker/src/public/aura.js and tracker/src/banner/banner.js. Configure package.json build script to execute Terser local minification.
Task 12.2: aura.js Edge Refactoring
Implement client ID and timezone parsing from script tags and native browser, GET configuration handshake, and dynamic injection of banner.js only when require_consent_banner is active.
Task 12.3: Vanilla JS Banner & Shadow DOM Isolation
Convert Next.js banner component code into pure Vanilla JS inside banner.js. Encapsulate all elements, styles, and transitions within an isolated Shadow DOM container.
Task 12.4: Decoupled CustomEvent Communication
Implement CustomEvent windows: aura:ready and aura_warm_lead. Decouple variables between scripts.
Task 12.5: Edge Deployment Pipeline
Create deploy.sh script to sync minified scripts to CDN / storage buckets with proper Cache-Control directives.

Phase 13: Provisioning Dashboard & Admin Console Implementation
This phase establishes the internal command center for managing multi-tenant deployments, securing access via JWT, and optimizing configuration handshakes with a two-tier caching strategy.
Task 13.1: Client DB Model & Schema Migrations
Modify the database schema for the Client model, migrating domain to whitelisted_domains (string array) and updating SubscriptionStatus (trial, active, suspended). Create Alembic migrations.
Task 13.2: JWT Auth Engine
Build custom JWT generation, validation, and FastAPI dependencies for protected route security.
Task 13.3: Two-Tier Cache & Configuration Handshake
Implement Redis client caching with automatic failover to an in-memory cachetools.TTLCache fallback for GET /v1/clients/config resolver.
Task 13.4: Next.js Admin Auth & Middleware
Build the login page, secure /admin layout, and Next.js middleware for authentication redirects and state management.
Task 13.5: Client Provisioning UI & Telemetry Indicator
Create the register client forms, snippet generation modal with one-click copy, and live installation status verification using db visit polling.

Phase 14: Payment Gateway Integration Implementation
This phase establishes the foundational financial plumbing, integrating the Ikhokha API for ZAR transactions, tokenization for future recurring billing, and a secure internal transaction ledger.
Task 14.1: Database Schema & Alembic Migration
Create the Transaction SQLModel database ledger and add payment_method_token and custom_monthly_amount fields to the Client model. Generate Alembic migrations.
Task 14.2: Ikhokha Payment Service & API Client
Build the backend/app/services/payment.py service client to handle creating payment intents, checking transaction status, and storing card payment tokens from Ikhokha.
Task 14.3: Checkout Setup API Endpoint
Build the POST /api/v1/billing/setup checkout creation route that initiates the payment flow and provides redirect credentials or client secrets to the frontend.
Task 14.4: Ikhokha Webhook Processing & HMAC Verification
Build the POST /api/v1/webhooks/ikhokha public webhook endpoint, validating HMAC-SHA256 signatures, enforcing gateway reference idempotency, and updating client billing state in the database.
Task 14.5: Next.js Admin Billing UI & Test Trigger
Update the client detail view inside the administrative console to display billing status, monthly billing amount adjustments, transaction ledger history, and a manual payment simulation testing trigger.

Phase 15: Automated Checkout, Proration & 2-Week Trial Implementation
This phase finalizes the commercial pipeline by implementing automated trial conversions, dynamic prorated billing math, recurring cron jobs, and legally compliant T&C logging.
Task 15.1: DB Models & Migrations
Add billing_cycle, trial_ends_at, tc_accepted_at, tc_accepted_ip, and cancellation_requested fields to the Client model. Write DB tests.
Task 15.2: Checkout Flow & UI Updates
Update the Next.js UI to support Monthly/Annual selection and Terms & Conditions checkbox. Write UI tests.
Task 15.3: Proration Mathematics Engine
Build dynamic proration math logic on the backend for Early (Full), Mid (Half), and Late (Daily) month calculations. Write math unit tests.
Task 15.4: Trial Automation Worker
Implement trial expiration checks, warning email alerts dispatched via Resend 48 hours prior, and `/cancel-request` cancellation endpoints with #support Slack alerts. Write time-mocked tests.
Task 15.5: Recurring Billing & Grace Period Engine
Build recurring cron jobs for Monthly (1st of month + 3-day grace) and Annual (Anniversary + 7-day grace) billing triggers utilizing Ikhokha tokens. Write recurring cron tests.

Phase 16: Frontend Integration & UI Overhaul [COMPLETED]
This phase executes a major frontend integration and UI overhaul, bridging the decoupled edge tracking architecture with the top-of-funnel VSL strategy and enforcing strict theme partitioning.
Task 16.1: Edge Tracker Integration [COMPLETED]
Locate app/layout.jsx, remove old React-based AuraTracker and AuraConsentBanner, and inject the new edge tracker script src="https://cdn.auraworks.co.za/aura.js" with client ID c4a6c9b1-8355-4de2-985d-a04f4dcd63a0 into the head.
Task 16.2: Global VSL CTA Migration [COMPLETED]
Perform a global conversion of public page calls-to-action ("Book a Call", "Get Demo", "Join Waitlist") to "Watch Video" pointing directly to the /vsl route.
Task 16.3: Quiet Premium Theme Partitioning [COMPLETED]
Remove dark mode from public pages. Forcefully default public views to light mode and strip all dark: utility classes from public UI files. Ensure admin/dashboard layouts retain their custom dark styling.

Phase 16 Stabilization: Production Telemetry & Auth Stabilization [COMPLETED]
This sub-phase stabilizes tracking telemetry validation, implements secure cross-subdomain cookie session storage, and hardens the client-side edge tracker script.
Task 16.4: Event Payload Relaxation
Update Pydantic event schema validation on the backend `/v1/track/event` route to support dynamic custom attributes through a flexible `properties: Dict[str, Any]` field.
Task 16.5: Cross-Subdomain Cookies
Configure `FastAPI-Users` to use secure, Lax SameSite session cookies targeting the apex domain (`auraworks.co.za`) to resolve cross-subdomain authentication loops.
Task 16.6: `aura.js` Data Sync & Terminology
Refactor event payload compilation in the edge tracker, enforce `client_id` parameter injection, and purge all legacy "waitlist" terminology in favor of the active "prospect" engine.
Task 16.7: `aura.js` Resilience
Add a silent, capped offline/retry mechanism for failed tracking requests in the client script, preventing infinite loops or memory leaks.

Phase 17: Database State Recovery & Pipeline Synchronization [COMPLETED]
This phase resolves the Alembic deployment crash caused by wiped schema states and ensures the backend deployment pipeline is permanently stabilized.
Task 17.1: Ledger & Documentation Sync
Consolidate tasks and roadmap documentation to reflect the inclusion of Phase 17.
Task 17.2: Alembic History Reset
Clear corrupted migration files and generate a unified baseline migration matching the Phase 16 schema.
Task 17.3: Startup Sequence Hardening
Refactor the deployment startup script (`start.sh`) to gracefully handle Alembic sync errors without crashing the ASGI boot.
Task 17.4: Admin Seeder Execution
Finalize and execute `seed_admin.py` to securely insert the default superuser account.

Phase 18: Full-Stack Authentication & Security Overhaul [COMPLETED]
This phase resolves logical login failures, secures cookie transport, patches OAuth callbacks, and hardens the tenant authorization perimeter.
Task 18.1: Ledger & Documentation Sync
Consolidate tasks and roadmap documentation to reflect the inclusion of Phase 18.
Task 18.2: Backend Core Auth
Remove legacy JWT fallback. Refactor `RedirectCookieTransport` for dynamic URIs. Update `COOKIE_DOMAIN` config logic.
Task 18.3: Dual-Login Patch
Update `UserManager.authenticate` with case-insensitive `func.lower()` resolution. Remove double-hashing from `seed_admin.py`.
Task 18.4: Frontend Login & Callback Alignment
Fix URL parameter extraction in Next.js login form. Remove fetching from OAuth callback page.
Task 18.5: Tenant Authorization
Add explicit client permission check to routes accepting `client_id`.

Phase 19: Alembic Hard Reset & Database Initialization [COMPLETED]
This phase performs a clean autogenerated master migration baseline for a blank database schema state and seeds the database.
Task 19.1: Nuke Legacy Migrations
Remove all old migration history python scripts.
Task 19.2: Generate the Master Baseline
Generate a fresh baseline migration from the blank database state and restore Postgres RLS policies.
Task 19.3: Local Execution & Verification
Verify that applying the migration locally succeeds.
Task 19.4: Admin Seeder Execution
Register and seed the default superuser ReitumetseF account.
Task 19.5: Ledger Sync & Commit
Log migrations and provide Git push steps.

Phase 20: Cloud Gateway & Container Binding Stabilization [COMPLETED]
This phase resolves the 502 Bad Gateway errors by correcting the Uvicorn host binding and environment variable expansion inside the Railway container, and hardening the AsyncPG driver compatibility.
Task 20.1: Documentation Sync & Ledger Consolidation
Read the /docs directory to absorb project guidelines. Update relevant architectural documents to include Phase 20 specifications. Consolidate all tasks in the main task.md file.
Task 20.2: Host & Port Binding Correction
Audit and refactor Uvicorn startup script/commands to explicitly run `uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"` inside a shell context to ensure correct variable expansion. Write and pass shell execution tests.
Task 20.3: Driver Protocol Hardening
Update engine creation in `app/db.py` to auto-correct standard `postgresql://` URLs to `postgresql+asyncpg://` to prevent lifespan crashes under asynchronous drivers. Write and pass unit tests for the URL parser.
Task 20.4: TDD Verification Gate
Run the complete backend test suite to ensure 100% test coverage and validation of all changes.

Phase 21: Frontend Handoff & Client Initialization [COMPLETED]
This phase resolves Next.js Fetch failures during login, alignment of subdomain authentication cookies, and seeds required client configuration data.
Task 21.1: Documentation Sync & Ledger Consolidation
Update roadmaps, checklists, spec-sheets, and task ledgers with Phase 21 plans.
Task 21.2: Frontend Form Handoff Patch
Add `e.preventDefault()` to the login form submit handler to prevent browser reloads from interrupting fetch calls, and strictly trigger redirects only on successful status codes.
Task 21.3: Cookie Domain Verification
Audit and enforce `.auraworks.co.za` domain parameter for production auth cookies to support seamless subdomain handoffs.
Task 21.4: Telemetry Data Seeder
Modify/create seeder script to programmatically write client configuration record to resolve 404 tracker errors.
Task 21.5: TDD Verification Gate
Execute frontend and backend tests to verify all functionality is fully correct.

Phase 22: Frontend Authentication Handoff Resolution [COMPLETED]
This phase resolves a critical bug where the backend successfully authenticates a user and returns a `204 No Content` status, but the Next.js frontend fails to redirect to the dashboard, likely due to a `.json()` parsing crash on an empty body or a missing programmatic router.
Task 22.1: Documentation Sync
Consolidate roadmaps, checklists, and specs inside the /docs directory and root task.md to track Phase 22 progress.
Task 22.2: Route Destination Verification
Verify the Next.js route directory hierarchy to confirm the exact location and path of the authenticated dashboard (e.g. `/aurahq/dashboard`).
Task 22.3: Fetch Response Handling Patch
Refactor the credentials login submit handler to bypass `.json()` parsing on successful responses (which return a 204 No Content state) and route programmatically using the App Router.
Task 22.4: Frontend Test Coverage
Write unit tests for the login page component to verify that 204 successful auth calls execute proper router push calls.
Task 22.5: Full Suite Verification
Run the frontend and backend verification tests to achieve full coverage and correctness.

Phase 23: OAuth Client Exposure & Security Alignment [COMPLETED]
This phase resolves an issue where the Next.js frontend is failing to render or authorize the Google Login component because the Google Client ID environment variable is missing the required `NEXT_PUBLIC_` prefix, causing Next.js to silently strip it from the client bundle.
Task 23.1: Documentation Sync
Consolidate roadmaps, checklists, and specs inside the /docs directory and root task.md to track Phase 23 progress.
Task 23.2: Codebase Search & Replace
Search the `frontend/` directory for `process.env.GOOGLE_CLIENT_ID` and replace it with `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
Task 23.3: Local Environment Patch
Update `frontend/.env` or `frontend/.env.local` to rename `GOOGLE_CLIENT_ID` to `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
Task 23.4: Static Build & Test Verification
Verify the frontend test suite and execute `npm run build` to confirm compiling of the frontend build bundle.

Phase 24: Final Authentication & Proxy Resolution [IN PROGRESS]
This phase resolves three critical authentication handoff failures: Cookie drop due to missing credentials directive, Google OAuth redirect URI mismatch, and Uvicorn proxy header blindness.
Task 24.1: Documentation Sync & Consolidation
Update roadmaps, checklists, and spec documents in `/docs` and the root `task.md` to include Phase 24 details.
Task 24.2: Frontend Standard Login Patch
Open `frontend/src/app/login/page.tsx` and add `credentials: 'include'` to the credentials login fetch call. Write and verify tests.
Task 24.3: Frontend Google OAuth Patch
Update `handleGoogleLogin` to fetch from the Google authorize endpoint directly without appending `?redirect_uri=...`. Write and verify tests.
Task 24.4: Obsolete Route Cleanup
Delete the `frontend/src/app/login/callback` directory as callback routing is handled natively by backend 302 redirects.
Task 24.5: Backend Proxy Headers
Update `backend/start.sh` to execute Uvicorn with `--proxy-headers` and `--forwarded-allow-ips "*"`.
Task 24.6: Final Deployment Push
Commit all changes and push to trigger production builds.
