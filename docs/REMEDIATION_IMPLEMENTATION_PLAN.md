AuraWorks Industrial Intelligence Engine (v1.0)
System Fault Remediation & Production Hardening Implementation Plan
Document Version: 2.0 (Forensic Remediation & Execution-Ready)
Target Platform: Antigravity IDE & CLI Autonomous Agent Environment
Scope Anchor: Comprehensive Forensic Audit Report (docs/COMPREHENSIVE_FORENSIC_AUDIT_REPORT.md)
This implementation plan maps out the complete sequence of technical tasks required to remediate all identified defects, production failures, multi-tenant data leaks, database concurrency bottlenecks, and silent tracker failures documented in the Comprehensive Forensic Audit Report. It is structured specifically as a sequence of highly modular prompt directives optimized for injection into the Antigravity multi-agent orchestration architecture, adhering strictly to the phase and task structure established in the master implementation roadmap.

Phase 29: Authentication Unification & Cross-Subdomain Session Persistence
Resolve the universal 401 Unauthorized errors across the administrative dashboard and endpoints by aligning Better Auth sessions with FastAPI SQLAlchemy storage, expanding cookie scopes to the apex domain, and eliminating frontend fetch race conditions.

Task 29.1: Synchronize Better Auth & FastAPI Session Storage
Antigravity Target Module: backend/app/core/security.py, backend/app/models/user.py, frontend/src/lib/auth.ts
Prompt Instructions for Antigravity: Open the backend authentication verification logic in get_current_user(). Inspect the UserSession model and database mapping against Next.js Better Auth session schema. Align the table name (session vs user_sessions) and column attributes (token, user_id, expires_at). Ensure that both Better Auth in Next.js and SQLAlchemy in FastAPI connect to the identical PostgreSQL instance (using public connection pooling for Vercel and Railway). Update get_current_user() to accept session tokens interchangeably from the Authorization Bearer header, the aura_session_token cookie, and the better-auth.session_token cookie. Return a clean HTTP 401 with standard WWW-Authenticate challenge headers if token validation fails.

Task 29.2: Subdomain Cookie Scope & SWR Race Resolution
Antigravity Target Module: frontend/src/lib/auth-fetch.ts, frontend/src/app/(authenticated)/aurahq/admin/page.tsx
Prompt Instructions for Antigravity: Open frontend/src/lib/auth-fetch.ts. Locate the cookie assignment logic in setSessionToken() and update it to explicitly append the root domain when running in production: domain=.auraworks.co.za. Open frontend/src/app/(authenticated)/aurahq/admin/page.tsx. Audit the SWR data-fetching calls. Wrap the SWR fetcher to guarantee that getSessionToken() resolves prior to dispatching requests to https://api.auraworks.co.za. Ensure every fetch request passes credentials: 'include' and attaches Authorization: Bearer ${token} as a redundant fallback. Implement an initial authentication readiness check preventing SWR from firing during hydration before the session state has initialized.

Task 29.3: Resolve Missing Social OAuth Provider Credentials
Antigravity Target Module: frontend/src/lib/auth.ts, frontend/.env.example
Prompt Instructions for Antigravity: Open frontend/src/lib/auth.ts. Locate the Better Auth social provider initialization block. Add an environment variable guard check around the GitHub and Google provider configurations: only register social providers if both their respective clientId and clientSecret environment variables are non-empty strings. If keys are missing, log an informative debug notice in development and bypass provider initialization to permanently suppress the production console warning WARN [Better Auth]: Social provider github is missing clientId or clientSecret. Update .env.example with the complete list of required client keys.

Phase 30: Core Ingestion & Telemetry Stabilization
Eliminate unhandled configuration crashes, eliminate the telemetry 404 black hole on missing aura_id, preserve partial multi-step lead data, and harden origin verification.

Task 30.1: Add Missing ALLOWED_ORIGIN_REGEX to Core Config
Antigravity Target Module: backend/app/core/config.py, backend/app/api/v1/clients.py
Prompt Instructions for Antigravity: Open backend/app/core/config.py. Add the missing configuration attribute ALLOWED_ORIGIN_REGEX: Optional[str] = Field(default=r"^https?://([a-zA-Z0-9-]+\.)*auraworks\.co\.za(:[0-9]+)?$", env="ALLOWED_ORIGIN_REGEX") to the Settings class. Open backend/app/api/v1/clients.py and locate line 153. Refactor the origin inspection check: if settings.ALLOWED_ORIGIN_REGEX is defined and non-empty, execute re.match(settings.ALLOWED_ORIGIN_REGEX, origin); if no match occurs, evaluate against the client's explicit allowed_domains list. If the origin fails both checks, return a clean HTTP 403 Forbidden with detail "Origin not permitted by tenant policy" rather than raising an unhandled AttributeError 500 error.

Task 30.2: Eliminate Telemetry 404 Fallback
Antigravity Target Module: backend/app/api/v1/track.py
Prompt Instructions for Antigravity: Open backend/app/api/v1/track.py. Locate lines 355 (in track_event) and 418 (in track_exit) where target_aura_id = payload.aura_id if payload.aura_id else str(payload.client_id). Completely delete this invalid fallback. Implement an intelligent session resolution fallback: if payload.aura_id is None, query Visit by (client_id == payload.client_id, ip_address == client_ip, created_at >= datetime.now(timezone.utc) - timedelta(minutes=30)) ordered by created_at.desc().first(). If no active visit exists, generate a new cryptographic aura_id (prefixed with aura_), insert a new Visit record immediately, and bind the incoming event or exit telemetry to this newly instantiated visit. Never raise a 404 "Visit not found" for legitimate incoming telemetry streams.

Task 30.3: Multi-Step Lead Persistence (Phone & Name Capture without Email)
Antigravity Target Module: backend/app/api/v1/track.py
Prompt Instructions for Antigravity: Locate the lead capture and prospect persistence block starting at line 280 in backend/app/api/v1/track.py. Replace the conditional gating if payload.email: with if payload.email or payload.phone:. If payload.email is present, lookup Prospect by (client_id, email). If payload.email is absent but payload.phone is present, lookup Prospect by (client_id, phone). If no existing prospect is found, instantiate a new Prospect storing first_name, last_name, phone_encrypted (via AES-256-GCM), and aura_id. Link the prospect record to the current Visit. Ensure that when Step 1 of the banner fires an aura_warm_lead event, the visitor's name and phone number are immediately committed to the database even if the visitor abandons prior to entering their email in Step 2.

Task 30.4: Telemetry Origin Security & Header Spoofing Hardening
Antigravity Target Module: backend/app/api/v1/track.py, backend/app/api/v1/clients.py
Prompt Instructions for Antigravity: Refactor the tenant validation routine in track_visit and track_event. Extract the client identifier from both the payload client_id and the optional custom header X-Aura-Client-Key. Query the Client record and verify that the request's Origin or Referer header hostname matches the client's registered website domain or exists within client.allowed_domains. Add an in-memory TTL cache (cachetools.TTLCache) caching approved client domains for 10 minutes to eliminate repetitive database queries during high-velocity traffic bursts. If validation fails, return an HTTP 403 Forbidden with structured JSON error details.

Phase 31: Edge Tracker & Banner Experience Realignment
Fix the broken asset gate download flow, eliminate the banner modal fallback timer race, harden event interception against SPA routing, and recompile production distribution bundles.

Task 31.1: Fix Phase 4 Asset Gate Dead-End & Automatic Download
Antigravity Target Module: tracker/src/banner/banner.js, tracker/src/public/aura.js
Prompt Instructions for Antigravity: Open tracker/src/banner/banner.js. Locate the event listener for aura:trigger_banner. Extract detail.assetUrl from the incoming custom event payload and persist it in the banner's internal state: this.state.assetUrl = e.detail.assetUrl || null. Locate the lead submission completion handler (submitLead / Phase 4 completion) around line 930. Before or immediately upon calling dismissBanner(), check if this.state.assetUrl is present. If present, programmatically initiate the file download: create an invisible HTML anchor element (const a = document.createElement('a')), assign a.href = this.state.assetUrl, a.target = '_blank', a.download = '', append it to document.body, trigger a.click(), and immediately remove the element from the DOM. Ensure the visitor receives their requested file asset seamlessly.

Task 31.2: Eliminate Banner Modal Mount Race Condition & Fallback Timer
Antigravity Target Module: tracker/src/public/aura.js, tracker/src/banner/banner.js
Prompt Instructions for Antigravity: Open tracker/src/public/aura.js. Locate lines 266–295 where downloadable asset clicks are intercepted. Remove the fragile 1200ms fallbackTimer that listens to aura:banner_mounted. Replace it with an immediate DOM check: if (document.getElementById('aura-banner-root') || window.__AURA_BANNER_MOUNTED__) { dispatchEvent('aura:trigger_banner'); } else { injectBannerScript(function() { dispatchEvent('aura:trigger_banner'); }); }. Provide a safe fallback timeout of 2500ms that only triggers window.location.href = href if the modal container fails to mount into the DOM, preventing premature page navigation while the modal is opening.

Task 31.3: Harden Client-Side Form Interception & Dynamic SPA Observer
Antigravity Target Module: tracker/src/public/aura.js
Prompt Instructions for Antigravity: Open tracker/src/public/aura.js. In addition to the existing document.addEventListener('submit', ...) handler, implement an input blur listener capturing input[type=email] and input[type=tel] values with debouncing. Implement a MutationObserver on document.body that scans for newly inserted form elements, modal dialogs, or iframe containers (such as HubSpot, Marketo, or Typeform embeds) and binds submission and change listeners dynamically. Intercept History API state updates (pushState, replaceState) and dispatch custom synthetic pageview beacons to capture client-side single-page application navigation (Next.js App Router, React Router).

Task 31.4: Rebuild & Synchronize Minified Distribution Assets
Antigravity Target Module: tracker/package.json, tracker/dist/aura.min.js, tracker/dist/banner.min.js
Prompt Instructions for Antigravity: Inspect tracker/package.json. Configure the build script to run Terser compression with options --compress --mangle --comments false on tracker/src/public/aura.js -> tracker/dist/aura.min.js and tracker/src/banner/banner.js -> tracker/dist/banner.min.js. Execute npm run build. Verify that the output files in tracker/dist/ reflect the latest modifications, have updated timestamps, and maintain a total compressed payload size below 1.5KB for aura.min.js and below 4KB for banner.min.js.

Phase 32: Multi-Tenancy Perimeter & Notification Isolation
Eliminate cross-tenant data leaks in visitor journey intelligence, isolate CRM pageview joins by client ID, and direct all alert notifications to tenant-specific Slack webhooks and personal vaults.

Task 32.1: Enforce Tenant Scoping on Visitor Journey Intelligence
Antigravity Target Module: backend/app/services/intelligence.py
Prompt Instructions for Antigravity: Open backend/app/services/intelligence.py. Locate get_visitor_journey(db: Session, aura_id: str, ip_address: Optional[str] = None). Modify the function signature to require client_id: int: get_visitor_journey(db: Session, client_id: int, aura_id: str, ip_address: Optional[str] = None). Update the database query filter to strictly mandate Visit.client_id == client_id: query = db.query(Visit).filter(Visit.client_id == client_id). If ip_address is provided, scope the OR condition within the tenant boundary: query.filter(or_(Visit.aura_id == aura_id, and_(Visit.ip_address == ip_address, Visit.client_id == client_id))). Update all caller functions across the API to pass the authenticated client ID.

Task 32.2: Enforce Tenant Scoping on Lead Intelligence PageViews
Antigravity Target Module: backend/app/api/v1/leads.py
Prompt Instructions for Antigravity: Open backend/app/api/v1/leads.py. Locate the get_lead_intelligence endpoint and associated query helpers. Audit all joins between Prospect, Visit, and PageView. Explicitly add PageView.client_id == current_client.id and Visit.client_id == current_client.id to every query filter. Ensure that when a lead's behavioral journey is compiled, pageviews recorded on other tenant websites sharing the same anonymous device cookie or IP address are completely excluded from the response payload.

Task 32.3: Tenant-Isolated Slack Alert Routing
Antigravity Target Module: backend/app/services/notifications.py
Prompt Instructions for Antigravity: Open backend/app/services/notifications.py. Audit send_juristic_alert(), send_surge_alert(), send_vsl_completion_alert(), and send_calendly_alert(). Locate where settings.SLACK_WEBHOOK_URL is referenced. Refactor these notification dispatchers to accept client: Client as a parameter. Inspect client.notification_config or client.slack_webhook_url: if a client-specific webhook is configured, dispatch the Slack alert payload to that tenant webhook. Only fall back to settings.SLACK_WEBHOOK_URL if the event represents an internal platform administrative event or if no tenant webhook exists and internal monitoring is explicitly enabled.

Task 32.4: Tenant-Specific Personal Vault Integration (Notion / Airtable)
Antigravity Target Module: backend/app/services/vault.py
Prompt Instructions for Antigravity: Open backend/app/services/vault.py. Audit sync_to_notion() and sync_to_airtable(). Remove references to global environment variables (NOTION_API_KEY, NOTION_DATABASE_ID, AIRTABLE_API_KEY). Update the function signatures to accept client_id: int. Query the database for the tenant's integration credentials stored in Client.integrations or a dedicated ClientVaultCredential table. Decrypt API tokens using the encryption utility layer before instantiating the Notion or Airtable client. If credentials for the target client are unconfigured or invalid, log a structured warning and safely bypass execution without impacting core telemetry pipelines.

Phase 33: Database Concurrency, Cascade Integrity & Performance
Harden PostgreSQL connection pooling with health checks and keepalives, apply cascade deletion across all secondary client relationships, establish missing high-frequency indexes, and eliminate schema drift.

Task 33.1: PostgreSQL Connection Pooling & Keepalive Hardening
Antigravity Target Module: backend/app/core/database.py
Prompt Instructions for Antigravity: Open backend/app/core/database.py. Locate the create_engine() call. Add pool_pre_ping=True to automatically test and recycle stale connections before issuing SQL statements. Add pool_recycle=300 to recycle connections every 5 minutes, preventing firewall or proxy timeouts from dropping idle connections. In connect_args, configure TCP keepalives for PostgreSQL: {"keepalives": 1, "keepalives_idle": 30, "keepalives_interval": 10, "keepalives_count": 5}. Ensure these pooling parameters apply to both synchronous and asynchronous database engines.

Task 33.2: Complete Database Cascade Deletions across Secondary Entities
Antigravity Target Module: backend/app/models/client.py, backend/app/models/company.py, backend/async_migrations/versions/
Prompt Instructions for Antigravity: Inspect all SQLModel and SQLAlchemy models referencing clients.id. Locate Transaction, CheckoutSession, CRMDeadLetter, EnrichmentQueue, ApolloRateLimit, and NotificationThrottle. Update the ForeignKey definition on each model to include ondelete="CASCADE". Generate a new Alembic migration revision (e.g. e3f4a5b6c7d8_cascade_delete_secondary_tables.py). In the migration upgrade() function, drop existing foreign key constraints on these tables and re-create them with ondelete="CASCADE". In downgrade(), restore the original foreign key constraints without cascade.

Task 33.3: High-Frequency Database Indexing Migration
Antigravity Target Module: backend/async_migrations/versions/
Prompt Instructions for Antigravity: Generate a new Alembic migration to create composite indexes for high-frequency analytical and look-up queries. Add the following indexes:
1. ix_events_client_id_event_type_created_at on table events (client_id, event_type, created_at DESC)
2. ix_visits_ip_address_created_at on table visits (ip_address, created_at DESC)
3. ix_prospects_client_id_phone on table prospects (client_id, phone)
4. ix_companies_client_id_status on table companies (client_id, status)
5. ix_transactions_client_id_created_at on table transactions (client_id, created_at DESC)
Ensure all index creation statements in the migration script specify if_not_exists=True or use safe concurrent index creation syntax where applicable.

Task 33.4: Resolve Schema Drift & Column Redundancy (user_agent vs client_user_agent)
Antigravity Target Module: backend/app/models/visit.py, backend/app/api/v1/track.py
Prompt Instructions for Antigravity: Open backend/app/models/visit.py. Audit the columns user_agent and client_user_agent. Standardize on user_agent as the single authoritative column. Mark client_user_agent as a deprecated property or synonym that maps directly to user_agent. Open backend/app/api/v1/track.py and ensure all write and read operations consistently populate and query user_agent. Generate an Alembic migration that copies any existing data from client_user_agent to user_agent if null, and drops the redundant client_user_agent column.

Phase 34: Network Performance & Background Worker Offloading
Offload blocking reverse DNS lookups to background queues, eliminate request thread blocking, and optimize unload exit beacons to prevent HTTP 499 client disconnects.

Task 34.1: Asynchronous Non-Blocking Reverse DNS Lookups
Antigravity Target Module: backend/app/services/intelligence.py, backend/app/api/v1/track.py
Prompt Instructions for Antigravity: Open backend/app/services/intelligence.py. Locate any calls executing socket.gethostbyaddr(ip). Remove all synchronous socket calls from the immediate request-response cycle of track_visit and track_event. Implement an asynchronous Celery or ARQ background task resolve_reverse_dns(visit_id: int, ip_address: str) that runs out-of-band. In the background task, execute the PTR lookup with a strict 1.5-second socket timeout, cache the resolved hostname in Redis keyed by ip_dns:{ip_address} with a 7-day TTL, and update Visit.hostname asynchronously.

Task 34.2: Resolve HTTP 499 Telemetry Disconnects with Unload Keepalive Handshake
Antigravity Target Module: backend/app/api/v1/track.py, tracker/src/public/aura.js
Prompt Instructions for Antigravity: Open tracker/src/public/aura.js. Locate the page exit telemetry handler. Ensure exit calls utilize navigator.sendBeacon(url, blob) where supported, falling back to fetch(url, { method: 'POST', body: data, keepalive: true, headers: { 'Content-Type': 'application/json' } }). Open backend/app/api/v1/track.py and inspect track_exit. Streamline the endpoint logic to complete within <50ms: parse payload, execute a minimal UPDATE on Visit.duration_seconds and Visit.exited_at, and return an immediate HTTP 200/204 response. Offload all secondary analytics calculations, journey aggregations, and webhook broadcasts to BackgroundTasks or the async task queue.

Phase 35: End-to-End Verification & Regression Testing
Execute a comprehensive testing battery verifying authentication flows, telemetry ingestion, multi-tenant isolation, cascade deletions, and build artifact synchronization.

Task 35.1: Backend Integration & Multi-Tenant Isolation Test Suite
Antigravity Target Module: backend/tests/
Prompt Instructions for Antigravity: Construct automated test modules in backend/tests/ to verify the remediations:
1. test_auth_unification.py: Test cross-subdomain cookie parsing, session token validation against PostgreSQL, and 401 handling.
2. test_telemetry_resilience.py: Test track_event and track_exit when payload.aura_id is None; verify no 404 is raised.
3. test_multistep_lead_capture.py: Test submitting Step 1 (phone + name only); verify Prospect is created in the database.
4. test_tenant_isolation.py: Create two distinct clients; verify that get_visitor_journey for Client A returns zero visits or pageviews from Client B even when IP and cookie match.
5. test_cascade_deletes.py: Create a client with associated visits, prospects, transactions, and enrichment queue items; delete the client and verify all related rows are cascade-deleted cleanly.

Task 35.2: Edge Tracker & Banner Lead Flow Integration Tests
Antigravity Target Module: tracker/tests/
Prompt Instructions for Antigravity: Create headless browser or mocked DOM tests using Jest / Playwright in tracker/tests/:
1. Test asset gate click interception: verify that clicking a .pdf link prevents default navigation, opens the banner modal, and preserves assetUrl.
2. Test modal lead submission: verify that submitting an email triggers lead telemetry and initiates programmatic download of the target assetUrl.
3. Test banner mount fallback: verify that if banner.js is already mounted, the fallback timer does not prematurely navigate away.
4. Verify Terser build outputs: assert that tracker/dist/aura.min.js and tracker/dist/banner.min.js are valid syntax and conform to size constraints.

Task 35.3: Production Deployment & Health Monitoring Verification
Antigravity Target Module: scripts/verify_production.py
Prompt Instructions for Antigravity: Create a standalone diagnostic verification script scripts/verify_production.py that can be run against staging and production environments. The script must:
1. Ping https://api.auraworks.co.za/health and verify database connectivity and pool responsiveness.
2. Perform an authenticated handshake using a test admin token and verify 200 OK across /api/v1/admin/overview-metrics.
3. Send a simulated telemetry event with null aura_id and confirm 200 OK.
4. Verify that response headers include Access-Control-Allow-Credentials: true and Access-Control-Allow-Origin matching the calling subdomain.
Log all results in structured JSON format for deployment verification.
