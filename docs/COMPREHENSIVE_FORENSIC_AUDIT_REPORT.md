# COMPREHENSIVE FORENSIC AUDIT & SYSTEM FAULT REPORT
**Target Repository:** `industrial-intelligence`  
**Target Environment:** Production (`auraworks.co.za` / `api.auraworks.co.za` on Vercel + Railway + Supabase/PostgreSQL)  
**Date:** October 2026  
**Status:** Audit Complete — Zero Repository Files Modified

---

## EXECUTIVE SUMMARY

A full-spectrum architectural, code-level, and operational audit was executed across the `industrial-intelligence` repository. This evaluation integrates the 10 initial security and tracking findings from `docs/AUDIT_FINDINGS.md`, the operational remediation roadmap in `PRODUCTION_REMEDIATION_PLAN.md`, real production error traces from `docs/Console logs_.md`, and a systematic manual code-level scan across all Python backend services, Next.js frontend pages/libraries, TypeScript/vanilla JavaScript edge trackers, and Alembic database migrations.

### Key Audit Findings Overview
1. **Critical Authentication Partitioning (Universal 401s in Production):** The Next.js frontend (Better Auth) and FastAPI backend maintain segregated, incompatible session mechanisms. SWR on the browser directly contacts `api.auraworks.co.za` cross-origin without domain-shared cookies or verified bearer tokens, while FastAPI queries `user_session` in a database that may not be synchronously shared or accessible to Vercel.
2. **Fatal Unhandled AttributeError in Tenant Origin Security:** In `backend/app/api/v1/clients.py:153`, origin validation references `settings.ALLOWED_ORIGIN_REGEX`, which does not exist in `backend/app/core/config.py`. Any non-whitelisted or preview origin inspection immediately crashes with an unhandled 500 error.
3. **Telemetry Black Hole (`target_aura_id = str(client_id)`):** In `backend/app/api/v1/track.py` (lines 355 & 418), if `payload.aura_id` is null or unassigned, the handler falls back to `target_aura_id = str(payload.client_id)`. Because `Visit.aura_id` is an anonymous UUID cookie and never equals an integer tenant ID, every single subsequent event or exit beacon query returns 404, silently dropping telemetry.
4. **Partial Multi-Step Lead Drop (PII Loss):** Step 1 of `banner.js` collects `first_name`, `last_name`, and `phone`, dispatching an `aura_warm_lead` event. In `track.py:293`, lead capture is strictly gated by `if payload.email:`. Visitors who drop off before Step 2 have their name and phone numbers discarded without persistence.
5. **Phase 4 Asset Gate Dead-End:** `aura.js` intercepts downloadable files (`.pdf`, `.zip`, `.cad`) and opens the gate modal. However, upon email submission in `banner.js`, `dismissBanner()` is invoked without ever releasing or triggering the download of the intercepted `assetUrl`. High-intent visitors provide emails but never receive their files.
6. **Multi-Tenant Data Leaks & Global Webhooks:** `intelligence.get_visitor_journey` and `leads.get_lead_intelligence` query pageviews across tenants without enforcing `client_id` boundaries. Furthermore, juristic, surge, VSL, and Calendly notification pipelines route to global environment webhooks rather than tenant-configured notification endpoints.
7. **Database Pool Starvation & Incomplete Cascade Constraints:** Alembic migration `d2e3f4a5b6c7` patched cascade deletes on primary entities (`Visit`, `Company`, `Prospect`, `PageView`), but left secondary tables (`Transaction`, `CheckoutSession`, `CRMDeadLetter`, `EnrichmentQueue`, `ApolloRateLimit`, `NotificationThrottle`) uncascaded, causing tenant deletion to fail with foreign key constraint errors. Synchronous reverse DNS PTR lookups in request handlers induce event loop starvation and HTTP 499 client aborts.

---

## SECTION 1: VERIFICATION & DEEP-DIVE OF ORIGINAL AUDIT FINDINGS (`docs/AUDIT_FINDINGS.md`)

### Finding 1: SEC-01 — Unauthenticated Telemetry Endpoint Allows Arbitrary Domain Injection via Header Spoofing
- **Location:** `backend/app/api/v1/track.py` (`track_visit`, lines 180–235)
- **Status:** **CRITICAL FAULT (Partially Mitigated, Edge Cases Persist)**
- **Forensic Diagnosis:**
  - `track_visit` relies on the HTTP `Origin` or `Referer` header to determine the domain if `payload.domain` is not explicitly provided.
  - While tenant verification checks if `client.website` matches or `client.allowed_domains` contains the domain, the fallback logic allows attackers to craft HTTP requests with arbitrary `Origin` headers.
  - If a client has multiple subdomains (e.g., `app.client.com`, `shop.client.com`) or staging domains not registered in `client.allowed_domains`, telemetry is rejected. More dangerously, wildcard matching or regex matching is attempted in `backend/app/api/v1/clients.py:153`:
    ```python
    if settings.ALLOWED_ORIGIN_REGEX:
        if re.match(settings.ALLOWED_ORIGIN_REGEX, origin):
            return True
    ```
    `Settings` in `backend/app/core/config.py` does **NOT** have `ALLOWED_ORIGIN_REGEX` defined! Any invocation of this branch raises `AttributeError: 'Settings' object has no attribute 'ALLOWED_ORIGIN_REGEX'`, crashing the request with HTTP 500.
- **Architectural Remediation:**
  1. Add `ALLOWED_ORIGIN_REGEX: Optional[str] = None` to `Settings` in `backend/app/core/config.py`.
  2. Implement origin signature verification: Require `client_id` + public API key (`x-aura-client-key`) in the telemetry headers, validating against a cached Redis set of whitelisted domains per tenant.

---

### Finding 2: IDM-02 — Global Identity Fragmentation & Multi-Tenant Attribution Leakage
- **Location:** `backend/app/services/intelligence.py` (`get_visitor_journey`), `backend/app/api/v1/leads.py` (`get_lead_intelligence`), `backend/app/models/visit.py`
- **Status:** **CRITICAL VULNERABILITY (Active Data Leak)**
- **Forensic Diagnosis:**
  - In `backend/app/services/intelligence.py`:
    ```python
    def get_visitor_journey(db: Session, aura_id: str, ip_address: Optional[str] = None):
        query = db.query(Visit).filter(Visit.aura_id == aura_id)
        if ip_address:
            query = query.filter(or_(Visit.aura_id == aura_id, Visit.ip_address == ip_address))
        return query.order_by(Visit.created_at.asc()).all()
    ```
    This function **does not take or filter by `client_id`**. If a visitor with the same cookie or IP address browses Client A (e.g., an industrial pump manufacturer) and Client B (e.g., a competitor or unrelated client), Client A’s dashboard can view pageviews and paths recorded on Client B’s domain.
  - In `backend/app/api/v1/leads.py`:
    `get_lead_intelligence` joins `PageView` on `Visit.aura_id` without filtering `PageView.client_id == current_client.id`.
- **Architectural Remediation:**
  - Add mandatory tenant isolation (`Visit.client_id == client_id`) to all intelligence queries.
  - In multi-tenant environments, visitor cookies must either be scoped per-client (`aura_id_{client_id}`) or records joined strictly on `(aura_id, client_id)`.

---

### Finding 3: CT-01 — Client-Side Event Interception Fragility in `aura.js`
- **Location:** `tracker/src/public/aura.js` (lines 140–210)
- **Status:** **HIGH DEFECT (Telemetric Blindspots)**
- **Forensic Diagnosis:**
  - `aura.js` attaches listeners to form submit events:
    ```javascript
    document.addEventListener('submit', function(e) {
        var form = e.target;
        // Extracts inputs, searches for email/phone
    }, true);
    ```
  - Modern web apps (React, Next.js, Vue, Webflow, HubSpot, Marketo) frequently use `event.preventDefault()` or `event.stopPropagation()` on the submit event, or submit forms purely via synthetic button click handlers (`onClick`) rather than standard DOM submit events.
  - Single-page application (SPA) client-side routing (e.g., Next.js `next/link`, React Router) replaces browser history without firing `popstate` or `hashchange` consistently. `aura.js` overrides `history.pushState` and `history.replaceState`, but does not listen to Next.js route transitions or MutationObserverDOM changes, missing dynamic page loads and modal form displays.
- **Architectural Remediation:**
  - Supplement DOM submit listeners with input blur listeners (`input[type=email]`, `input[type=tel]`) with debounced capture.
  - Integrate a `MutationObserver` to attach listeners to dynamically mounted forms.

---

### Finding 4: CT-02 — Unsynchronized Asset Interception Dead-End & Modal Fallback Timer Race
- **Location:** `tracker/src/public/aura.js` (lines 266–295), `tracker/src/banner/banner.js` (lines 910–945)
- **Status:** **CRITICAL USER EXPERIENCE & CONVERSION BREAKDOWN**
- **Forensic Diagnosis:**
  - In `aura.js`:
    ```javascript
    if (isDownloadableAsset(href)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('aura:trigger_banner', { 
            detail: { type: 'asset_gate', assetUrl: href } 
        }));
        setTimeout(function() {
            if (!bannerMounted) window.location.href = href;
        }, 1200);
    }
    ```
  - **The Race Condition:** If `banner.js` is already loaded, `aura:banner_mounted` was already dispatched prior to this click. `aura.js` waits for an event that will never fire again. Therefore, the 1200ms `setTimeout` always executes, forcefully navigating the user away and interrupting the banner modal!
  - **The Dead-End:** If the banner *does* open and the visitor successfully submits their email in Phase 4 (`banner.js`), line 932 executes:
    ```javascript
    dismissBanner();
    ```
    The variable `assetUrl` passed in the initial event is **discarded**. The visitor’s email is saved, but the file download is **never initiated**. The visitor is left with a closed modal and no downloaded file.
- **Architectural Remediation:**
  - Persist `assetUrl` in `banner.js` state.
  - Upon successful Phase 4 submission, trigger `window.open(assetUrl, '_blank')` or dynamically create `<a href="${assetUrl}" download>` before invoking `dismissBanner()`.
  - Fix the `bannerMounted` check by querying the DOM element (`document.getElementById('aura-banner-root')`) instead of listening to a one-time past event.

---

### Finding 5: IDM-01 — Race Conditions and High Connection Load in Visit-ID Generation
- **Location:** `backend/app/api/v1/track.py` (`track_visit`), `backend/app/models/visit.py`
- **Status:** **HIGH PERFORMANCE & CONCURRENCY BOTTLENECK**
- **Forensic Diagnosis:**
  - Rapid parallel requests from the same user (e.g., initial page load firing `/track/visit` while background tracking fires `/track/event`) result in multiple concurrent inserts or updates on `Visit`.
  - `track.py` executes:
    ```python
    visit = db.query(Visit).filter(Visit.aura_id == payload.aura_id, Visit.client_id == client.id).first()
    if not visit:
        visit = Visit(...)
        db.add(visit)
        db.commit()
    ```
  - Without unique constraints on `(aura_id, client_id)` or row-level locking (`with_for_update()`), concurrent requests generate duplicate `Visit` rows or trigger PostgreSQL duplicate key violations.
- **Architectural Remediation:**
  - Implement an `INSERT ... ON CONFLICT (aura_id, client_id) DO UPDATE` (PostgreSQL `pg_upsert`) or use Redis as an atomic deduplication buffer prior to committing to PostgreSQL.

---

### Finding 6: IDM-03 — Incomplete PII Merging on Partial Multi-Step Submissions
- **Location:** `backend/app/api/v1/track.py` (lines 280–310), `tracker/src/banner/banner.js` (lines 825–855)
- **Status:** **HIGH REVENUE & ATTRIBUTION DEFECT**
- **Forensic Diagnosis:**
  - Multi-step lead banner flow:
    - Step 1 collects: `first_name`, `last_name`, `phone`. Banner dispatches event `aura_warm_lead`.
    - Step 2 collects: `email`. Banner dispatches event `aura_lead_captured`.
  - In `backend/app/api/v1/track.py`:
    ```python
    if payload.email:
        # Prospect creation and merging
        prospect = db.query(Prospect).filter(Prospect.email == payload.email, Prospect.client_id == client.id).first()
        ...
    ```
  - If a user completes Step 1 (phone + name) and exits before completing Step 2 (email), `payload.email` is `None`. The backend completely skips prospect creation or caching. The user's name and phone number are discarded forever.
- **Architectural Remediation:**
  - Create or update `Prospect` records keyed by `phone` or `aura_id` when `email` is absent:
    ```python
    if payload.email or payload.phone:
        # Match by email if present, else match by phone or aura_id
    ```

---

### Finding 7: SCH-01 — Missing Database Indexes on High-Frequency Lookups / Foreign Keys
- **Location:** `backend/app/models/` (`event.py`, `visit.py`, `page_view.py`, `company.py`, `prospect.py`)
- **Status:** **HIGH (Partially Addressed in Alembic `d2e3f4a5b6c7`, Gaps Remain)**
- **Forensic Diagnosis:**
  - Alembic migration `d2e3f4a5b6c7` added indexes for:
    - `ix_visits_client_id_created_at`
    - `ix_page_views_visit_id_client_id`
    - `ix_companies_client_id_domain`
    - `ix_prospects_client_id_email`
  - **Remaining Unindexed Hotpaths:**
    1. `events.client_id` and `events.event_type`: Filtered on every telemetry event query and dashboard activity feed.
    2. `visits.ip_address`: Filtered during identity resolution and juristic intelligence lookup.
    3. `transactions.client_id` & `checkout_sessions.client_id`: Checked on billing/quota webhooks.
    4. `crm_dead_letters.client_id`: Polled during sync retry loops.

---

### Finding 8: SCH-02 — Missing Database Cascade Deletions across Client Associations
- **Location:** `backend/app/models/` and Alembic DAG
- **Status:** **HIGH INTEGRITY DEFECT**
- **Forensic Diagnosis:**
  - Migration `d2e3f4a5b6c7` updated foreign keys to `ON DELETE CASCADE` on `visits`, `companies`, `prospects`, and `page_views`.
  - However, the following tables still reference `clients.id` without `ondelete="CASCADE"`:
    - `transactions.client_id` (`backend/app/models/client.py`)
    - `checkout_sessions.client_id` (`backend/app/models/client.py`)
    - `crm_dead_letters.client_id` (`backend/app/models/client.py`)
    - `enrichment_queue.client_id` (`backend/app/models/company.py`)
    - `apollo_rate_limits.client_id` (`backend/app/models/company.py`)
    - `notification_throttles.client_id` (`backend/app/models/client.py`)
  - Any administrative invocation of `DELETE /api/v1/clients/{client_id}` will fail with a fatal PostgreSQL `ForeignKeyViolationError` whenever any transaction, billing session, or rate-limit record exists.

---

### Finding 9: CDN-01 — Stale Minified Builds in Tracker Distribution Directory
- **Location:** `tracker/dist/aura.min.js`, `tracker/dist/banner.min.js` vs `tracker/src/`
- **Status:** **CRITICAL DEPLOYMENT DEFECT**
- **Forensic Diagnosis:**
  - File timestamp inspection:
    - `tracker/src/public/aura.js` — Modified Sept 20, 2026
    - `tracker/src/banner/banner.js` — Modified Sept 20, 2026
    - `tracker/dist/aura.min.js` — Timestamp Sept 19, 2026
    - `tracker/dist/banner.min.js` — Timestamp Sept 19, 2026
  - Any CDN deployment or static file server serving from `tracker/dist/` is serving stale JavaScript that lacks recent bug fixes and enhancements made in `tracker/src/`.

---

### Finding 10: SCH-03 — Schema Drift and Column Redundancy
- **Location:** `backend/app/models/visit.py`, `backend/app/models/client.py`
- **Status:** **MEDIUM TECHNICAL DEBT**
- **Forensic Diagnosis:**
  - `Visit` model contains both `user_agent` (String 500) and `client_user_agent` (String 500). Some migration scripts mapped to one, while endpoints populate the other, leading to `None` values in dashboard device analytics.
  - `Client` model contains unindexed `api_key` and deprecated tracking flags that duplicate settings stored in client JSON configurations.

---

## SECTION 2: PRODUCTION INCIDENT FORENSICS (`docs/Console logs_.md`)

The production console log contains continuous critical failures during user navigation on `www.auraworks.co.za` and calls to `https://api.auraworks.co.za`.

```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
/api/v1/admin/overview-metrics:1
/api/v1/admin/users:1
/api/v1/scripts/:1
/api/v1/sales/overview:1
/api/v1/sales/reps:1
/api/v1/sales/attribution:1
/api/v1/clients/:1
```

### 1. The Universal 401 Unauthorized Breakdown
- **Root Cause 1: Cross-Origin Subdomain Cookie Partitioning**
  - Frontend runs on `https://www.auraworks.co.za` (hosted on Vercel).
  - Backend API runs on `https://api.auraworks.co.za` (hosted on Railway).
  - In `frontend/src/lib/auth-fetch.ts`:
    ```typescript
    document.cookie = `aura_session_token=${token}; path=/; SameSite=Lax; secure`;
    ```
    **The defect:** The cookie does not specify `Domain=.auraworks.co.za`. Consequently, the browser stores `aura_session_token` strictly for `www.auraworks.co.za`. When SWR or `fetch` calls `https://api.auraworks.co.za`, the browser **refuses to attach the cookie** to the cross-origin request.
- **Root Cause 2: SWR Client-Side Fetch Race Condition**
  - In `frontend/src/app/(authenticated)/aurahq/admin/page.tsx`:
    SWR hooks invoke `fetcher('https://api.auraworks.co.za/api/v1/admin/overview-metrics')` immediately upon component mount.
  - `getSessionToken()` attempts to fetch `/api/auth/get-session` from `window.location.origin`. During the initial millisecond render window, `authFetch` falls back to reading cookies before the async token resolution finishes. If the cookie is missing or unshared, the header `Authorization: Bearer undefined` or no header is sent, resulting in immediate 401 errors across all widgets.
- **Root Cause 3: Database Session Model Incompatibility**
  - In `backend/app/core/security.py`:
    ```python
    user_session = db.query(UserSession).filter(UserSession.token == token).first()
    ```
  - Better Auth in Next.js generates and stores sessions in a table typically named `session` with column `token`. FastAPI SQLAlchemy model `UserSession` maps to `user_sessions`. If the table or schema names differ, or if Vercel and Railway connect to separate database instances, FastAPI can never find the session record created by Better Auth.
- **Root Cause 4: Better Auth GitHub OAuth Misconfiguration**
  - Production log:
    ```
    WARN [Better Auth]: Social provider github is missing clientId or clientSecret
    ```
    In `frontend/src/lib/auth.ts`, GitHub provider is enabled without validating `process.env.GITHUB_CLIENT_ID` and `process.env.GITHUB_CLIENT_SECRET`, generating startup warnings and failing OAuth callbacks.

---

### 2. Network Worker Starvation & Blocking Reverse DNS PTR Lookups
- **Log Observation:** `499 Client Closed Request` on `/v1/track/exit` and `/v1/track/event`.
- **Root Cause:**
  - In `backend/app/services/intelligence.py` and tracking middleware:
    Synchronous reverse DNS lookups (`socket.gethostbyaddr(ip)`) are performed on incoming IP addresses.
  - When visitors connect via mobile LTE networks, cloud proxies, or residential CGNAT, DNS PTR lookups fail with `NXDOMAIN` after a 2-to-5 second timeout.
  - Because FastAPI/Uvicorn worker threads block synchronously during this call, the client browser (navigating away or closing the tab) reaches its `unload` deadline and terminates the connection, resulting in NGINX/Railway HTTP 499 errors and thread pool exhaustion.

---

### 3. Database SSL Drops & Broken Connection Pooling
- **Log Observation:** `unexpected eof while reading` on PostgreSQL connection pool.
- **Root Cause:**
  - In `backend/app/core/database.py`, `create_engine` lacks connection health checks:
    ```python
    engine = create_engine(
        settings.DATABASE_URL,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        # MISSING: pool_pre_ping=True
        # MISSING: pool_recycle=300
    )
    ```
  - Railway and Supabase kill idle TCP connections after 60–300 seconds. Without `pool_pre_ping=True`, SQLAlchemy attempts to reuse stale, closed socket descriptors, raising `OperationalError: unexpected eof while reading` and dropping live requests.

---

## SECTION 3: SILENT CODE-LEVEL CRITICAL DEFECTS

### 1. The `target_aura_id = str(client_id)` Telemetry Bug
- **Location:** `backend/app/api/v1/track.py`
  - Line 355 (`track_event`):
    ```python
    target_aura_id = payload.aura_id if payload.aura_id else str(payload.client_id)
    visit = db.query(Visit).filter(
        Visit.aura_id == target_aura_id,
        Visit.client_id == payload.client_id
    ).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found or mismatched client_id.")
    ```
  - Line 418 (`track_exit`):
    ```python
    target_aura_id = payload.aura_id if payload.aura_id else str(payload.client_id)
    visit = db.query(Visit).filter(
        Visit.aura_id == target_aura_id,
        Visit.client_id == payload.client_id
    ).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found or mismatched client_id.")
    ```
- **The Catastrophic Failure:**
  - `payload.aura_id` can be `None` or omitted if local storage is blocked, if a script loads late, or during beacon transmission.
  - When `payload.aura_id` is None, `target_aura_id` is set to `str(payload.client_id)` (e.g. `"42"`).
  - The query checks for `Visit.aura_id == "42"`. But `Visit.aura_id` is generated as a UUID like `"aura_a1b2c3d4e5..."`.
  - It will **never** match `"42"`.
  - Result: Every single tracking call without an explicit `aura_id` throws an HTTP 404, aborting telemetry ingestion and throwing console errors.
- **Required Fix:** If `payload.aura_id` is missing, look up the active visit by `(ip_address, client_id, user_agent)` within the last 30 minutes, or create a new visit row rather than querying `str(client_id)`.

---

### 2. Missing `ALLOWED_ORIGIN_REGEX` Attribute Crash
- **Location:** `backend/app/api/v1/clients.py:153`
  ```python
  if settings.ALLOWED_ORIGIN_REGEX:
      if re.match(settings.ALLOWED_ORIGIN_REGEX, origin):
          return True
  ```
- **The Crash:**
  - In `backend/app/core/config.py`, the `Settings` class defines CORS origins as `BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []`.
  - `ALLOWED_ORIGIN_REGEX` is **completely absent** from `Settings`.
  - Whenever an origin validation reaches this fallback, Python throws:
    `AttributeError: 'Settings' object has no attribute 'ALLOWED_ORIGIN_REGEX'`
  - This turns what should be a 403 Forbidden or graceful rejection into an unhandled 500 Internal Server Error.

---

### 3. Discarded Lead PII in Step 1 of Banner Flow
- **Location:** `backend/app/api/v1/track.py:293` & `tracker/src/banner/banner.js:831`
- **The Defect:**
  - `banner.js` Step 1:
    ```javascript
    sendEvent('aura_warm_lead', {
        first_name: firstName,
        last_name: lastName,
        phone: phone
    });
    ```
  - `track.py`:
    ```python
    if payload.email:
        # Prospect creation block
        prospect = db.query(Prospect)...
    ```
  - There is **no logic** to store a `Prospect` if `payload.email` is absent but `payload.phone` or `payload.first_name` is present.
  - Result: When a visitor inputs their name and cell phone number in Step 1 and drops off at Step 2 (email input), the business loses the lead completely.

---

### 4. Intercepted Asset Download Discarded
- **Location:** `tracker/src/banner/banner.js:932`
- **The Defect:**
  - When `aura.js` triggers an asset gate, it attaches `detail: { assetUrl: href }`.
  - In `banner.js`, after the visitor successfully enters their contact information and clicks "Submit", the handler calls `dismissBanner()`.
  - The handler never invokes `window.location.href = state.assetUrl` or triggers a hidden `<a>` download element.
  - The visitor submitted their contact information specifically to download a whitepaper, CAD file, or brochure, but nothing downloads.

---

## SECTION 4: TENANT ISOLATION & DATA PRIVACY BREACHES

| Component | Code Location | Nature of Breach / Fault | Remediation |
| :--- | :--- | :--- | :--- |
| **Visitor Journey** | `backend/app/services/intelligence.py` (`get_visitor_journey`) | Queries `Visit` by `aura_id` and `ip_address` across all clients. Client A can inspect Client B's visitor activity. | Add `Visit.client_id == client_id` to query filter. |
| **Lead Intelligence** | `backend/app/api/v1/leads.py` (`get_lead_intelligence`) | Joins `PageView` on `Visit.aura_id` without filtering by `PageView.client_id`. | Explicitly filter `PageView.client_id == current_client.id`. |
| **Juristic Slack Alerts** | `backend/app/services/notifications.py` | Dispatches enterprise identification alerts to global `settings.SLACK_WEBHOOK_URL`. | Lookup `ClientNotificationConfig.slack_webhook_url` for the specific client. |
| **Surge Slack Alerts** | `backend/app/services/notifications.py` | Dispatches high-intent traffic alerts to global `settings.SLACK_WEBHOOK_URL`. | Route to tenant-specific webhook; fallback to global only for internal system monitoring. |
| **CRM Vault Sync** | `backend/app/services/vault.py` | Hardcodes global Notion / Airtable API tokens from environment variables. | Read client-specific integration keys from `ClientIntegrations` table. |

---

## SECTION 5: DATABASE CONCURRENCY, INDEXES & SCHEMA DRIFT

### 1. Incomplete Cascade Constraints
In `backend/async_migrations/versions/d2e3f4a5b6c7_cascade_delete_and_indexes.py`, cascade options were added for primary models, but omitted for:
- `transactions` -> `client_id`
- `checkout_sessions` -> `client_id`
- `crm_dead_letters` -> `client_id`
- `enrichment_queue` -> `client_id`
- `apollo_rate_limits` -> `client_id`
- `notification_throttles` -> `client_id`

**Impact:** Attempting to offboard or delete a client fails with a 500 error due to PostgreSQL `ForeignKeyViolationError`.

### 2. Missing High-Frequency Indexes
| Table | Column(s) | Impact |
| :--- | :--- | :--- |
| `events` | `(client_id, event_type, created_at)` | Activity feed queries execute sequential table scans over millions of event rows. |
| `visits` | `(ip_address, created_at)` | Reverse IP / company resolution scans entire `visits` table. |
| `prospects` | `(client_id, phone)` | Partial lead lookup by phone number performs unindexed full scan. |
| `companies` | `(client_id, status)` | Filtered company status queries in CRM view cause high DB CPU. |

---

## SECTION 6: MASTER REMEDIATION MATRIX

```
+---------+----------+----------------------------+-------------------------------------------------------------+
| ID      | Severity | Component                  | Fault / Defect                                              |
+---------+----------+----------------------------+-------------------------------------------------------------+
| AUTH-01 | CRITICAL | Next.js / FastAPI Security | Universal 401s: Cross-origin cookie & session partitioning  |
| CFG-01  | CRITICAL | Backend Config / Clients   | AttributeError: settings.ALLOWED_ORIGIN_REGEX missing       |
| TRK-01  | CRITICAL | Telemetry Ingestion        | target_aura_id = str(client_id) causes 404 on event/exit    |
| CT-02   | CRITICAL | Tracker (aura.js/banner.js)| Asset download dropped after email submit; timer race       |
| LEAD-01 | HIGH     | Telemetry / Leads          | Multi-step Step 1 PII dropped when email is missing         |
| TEN-01  | HIGH     | Intelligence Service       | Cross-tenant visitor journey data leak                      |
| TEN-02  | HIGH     | Notification Service       | Client-specific leads broadcasted to global Slack webhook   |
| DB-01   | HIGH     | Database / Migrations      | Missing CASCADE delete on secondary client tables           |
| DB-02   | HIGH     | Database Pool              | Missing pool_pre_ping & pool_recycle causing SSL drops      |
| NET-01  | HIGH     | Intelligence / Ingestion   | Synchronous socket.gethostbyaddr blocks workers (499 drops) |
| CDN-01  | MEDIUM   | Build Pipeline             | tracker/dist/ is out of date with tracker/src/              |
| SCH-03  | MEDIUM   | Database Schema            | Column redundancy: user_agent vs client_user_agent          |
+---------+----------+----------------------------+-------------------------------------------------------------+
```

---

## SECTION 7: STEP-BY-STEP REMEDIATION ARCHITECTURE

*(For subsequent execution once approved — zero code was modified during this audit)*

### Phase 1: Authentication & Configuration Fixes
1. **Define Missing Setting:** In `backend/app/core/config.py`, declare:
   ```python
   ALLOWED_ORIGIN_REGEX: Optional[str] = Field(default=None, env="ALLOWED_ORIGIN_REGEX")
   ```
2. **Unified Cross-Origin Authentication:**
   - In `frontend/src/lib/auth-fetch.ts`, ensure cookies are set on the root domain:
     ```typescript
     const rootDomain = window.location.hostname.includes('auraworks.co.za') ? '; domain=.auraworks.co.za' : '';
     document.cookie = `aura_session_token=${token}; path=/; SameSite=Lax; secure${rootDomain}`;
     ```
   - In `frontend/src/app/(authenticated)/aurahq/admin/page.tsx`, ensure SWR fetcher awaits `getSessionToken()` before firing API calls to avoid unauthenticated requests.
   - Synchronize Better Auth database connection with FastAPI's `DATABASE_URL` and ensure session table name mapping aligns (`user_sessions` vs `session`).

### Phase 2: Telemetry Ingestion & Lead Integrity
1. **Repair Visit Lookup Fallback in `track.py`:**
   - Replace `target_aura_id = str(payload.client_id)` with:
     ```python
     if not payload.aura_id:
         # Query by IP + Client within past 30 minutes, or generate new aura_id
         visit = db.query(Visit).filter(
             Visit.client_id == payload.client_id,
             Visit.ip_address == client_ip,
             Visit.created_at >= datetime.utcnow() - timedelta(minutes=30)
         ).order_by(Visit.created_at.desc()).first()
     ```
2. **Support Phone-Only Prospect Persistence:**
   - In `track.py:293`, change `if payload.email:` to:
     ```python
     if payload.email or payload.phone:
         prospect = None
         if payload.email:
             prospect = db.query(Prospect).filter(Prospect.email == payload.email, Prospect.client_id == client.id).first()
         elif payload.phone:
             prospect = db.query(Prospect).filter(Prospect.phone == payload.phone, Prospect.client_id == client.id).first()
     ```
3. **Fulfill Asset Gate Download in `banner.js`:**
   - In `banner.js`, capture `assetUrl` in state upon modal trigger.
   - In `submitLead()`, after dispatching lead event and before `dismissBanner()`:
     ```javascript
     if (this.state.assetUrl) {
         var link = document.createElement('a');
         link.href = this.state.assetUrl;
         link.target = '_blank';
         link.download = '';
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
     }
     ```

### Phase 3: Multi-Tenancy & Worker Performance
1. **Isolate Visitor Intelligence:**
   - Pass `client_id: int` to `intelligence.get_visitor_journey` and enforce `Visit.client_id == client_id`.
2. **Asynchronous Non-Blocking Reverse DNS:**
   - Offload `socket.gethostbyaddr` to a Celery/ARQ background worker or Redis cache to prevent blocking FastAPI request threads.
3. **Database Engine Resilience:**
   - In `backend/app/core/database.py`, configure:
     ```python
     create_engine(
         settings.DATABASE_URL,
         pool_pre_ping=True,
         pool_recycle=300,
         connect_args={"keepalives": 1, "keepalives_idle": 30, "keepalives_interval": 10, "keepalives_count": 5}
     )
     ```
4. **Complete Cascade Migration:**
   - Create Alembic revision `e3f4a5b6c7d8` adding `ondelete="CASCADE"` to `transactions`, `checkout_sessions`, `crm_dead_letters`, `enrichment_queue`, `apollo_rate_limits`, and `notification_throttles`.
5. **Rebuild Tracker Minified Bundles:**
   - Run `npm run build` in `tracker/` to update `tracker/dist/aura.min.js` and `tracker/dist/banner.min.js`.
