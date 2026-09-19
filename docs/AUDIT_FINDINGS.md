# Forensic System Audit & Latent Defect Register

## Executive Summary
This audit evaluated the codebase across frontend-to-backend contracts, database schemas, concurrency/idempotency, CDN routing, and cache synchronization. A total of **10** latent defects were discovered, including **2 Critical** security and tenant-isolation vulnerabilities, **4 High** severity data-loss issues, and several Medium/Low risks impacting performance and consistency.

**Severity Breakdown:**
- 🔴 **Critical:** 2
- 🟠 **High:** 4
- 🟡 **Medium:** 3
- 🟢 **Low:** 1

---

## Matrix of Findings
| ID | Category | Severity | File & Line | Symptom / Failure Mode |
|---|---|---|---|---|
| SEC-01 | CDN & Routing | Critical | `backend/app/api/v1/clients.py:150` | Vercel domain bypass allows unauthorized config access |
| IDM-02 | Concurrency | Critical | `backend/app/api/v1/track.py:337` | `track_event`/`track_exit` lacks tenant isolation (`client_id`) on updates |
| CT-01 | API Contracts | High | `backend/app/api/v1/track.py:32` | PII (`name`, `phone`) dropped by `IdentityPayload` schema |
| CT-02 | API Contracts | High | `tracker/src/public/aura.js:552` | Signature data sent under wrong key (`fingerprint`), causing data loss |
| IDM-01 | Concurrency | High | `backend/app/api/v1/track.py:81` | Race condition on `Company.total_visits` and duplicate company creation |
| IDM-03 | Concurrency | High | `backend/app/api/v1/track.py:327` | `track_event` completely drops all behavioral event payloads |
| SCH-01 | DB Schemas | Medium | `backend/app/api/v1/track.py:372` | `PageView` table exists but is completely unused by `track_exit` |
| SCH-02 | DB Schemas | Medium | `async_migrations/...` | Missing `ON DELETE CASCADE` foreign key behaviors |
| CDN-01 | CDN & Routing | Medium | `tracker/src/public/aura.js:284` | Hardcoded `setTimeout(50ms)` race condition misses banner events |
| SCH-03 | DB Schemas | Low | `app/models/visit.py` | Missing `created_at` index degrades sort performance at scale |

---

## Detailed Breakdown of Issues

### [SEC-01] Vercel Whitelist Configuration Bypass
- **Affected Components:** `backend/app/api/v1/clients.py` (around line 150)
- **Root Cause Analysis:** The domain validation logic explicitly bypasses the client's `whitelisted_domains` if the request originates from any domain ending in `.vercel.app` (`req_domain_lower.endswith(".vercel.app")`).
- **Trigger Scenario:** A malicious actor deploys a proxy to a Vercel URL and issues `GET /v1/clients/config?client_id=<target>`. 
- **Architectural Risk / Blast Radius:** Critical. Allows spoofing tracking endpoints, exfiltrating client configurations, and injecting corrupted telemetry under false origins.
- **Recommended Remediation Vector:** Remove the wildcard `.vercel.app` bypass entirely. Rely on the client explicitly whitelisting their Vercel preview branch domains or using exact regex matching if required.

### [IDM-02] Cross-Tenant Session Hijacking via Orphaned Lookups
- **Affected Components:** `backend/app/api/v1/track.py:track_event` and `track_exit` (around lines 337 and 377)
- **Root Cause Analysis:** The queries to fetch the active visit rely solely on `Visit.aura_id == target_aura_id` without qualifying the lookup with `Visit.client_id == payload.client_id`.
- **Trigger Scenario:** An `aura_id` collision occurs (or is maliciously forced by setting a fake UID cookie), causing an event dispatched to Client A to modify or hijack a Visit belonging to Client B.
- **Architectural Risk / Blast Radius:** Critical. Tenant data isolation is broken. Metrics, durations, and intent clusters will cross-pollinate between agencies.
- **Recommended Remediation Vector:** Always include `Visit.client_id == payload.client_id` in `.where()` filters across all tracking endpoints.

### [CT-01] Dropped Personal Identifiable Information (PII)
- **Affected Components:** `tracker/src/banner/banner.js` (line 780, 816) & `backend/app/api/v1/track.py:IdentityPayload`
- **Root Cause Analysis:** The edge banner dispatches highly qualified PII (e.g., `first_name`, `last_name`, `phone`, `name`) via the `aura_warm_lead` custom event. However, `IdentityPayload` does not include these fields, meaning Pydantic strictly filters and discards them before they hit the database.
- **Trigger Scenario:** A visitor submits a fully populated lead form inside the consent banner.
- **Architectural Risk / Blast Radius:** High. Significant business value (phone numbers and names) is permanently lost at the API boundary, severely degrading the CRM integration value proposition.
- **Recommended Remediation Vector:** Update `IdentityPayload` to accept `first_name`, `last_name`, `name`, and `phone`, and map them to the `Prospect` ORM model.

### [CT-02] Dropped Forensic Hardware Signatures
- **Affected Components:** `tracker/src/public/aura.js` (line 552)
- **Root Cause Analysis:** The frontend constructs the hardware signature correctly but packs it into the payload under the key `fingerprint` instead of `signature`, which is what `IdentityPayload` expects. It also passes `session_id` instead of natively appending it as `aura_id`.
- **Trigger Scenario:** `aura_warm_lead` fires after form capture.
- **Architectural Risk / Blast Radius:** High. High-fidelity hardware fingerprints (WebGL renderer, clock drift, canvas hashes) are dropped, neutering forensic identification.
- **Recommended Remediation Vector:** Rename the key from `fingerprint` to `signature` in the `aura_warm_lead` payload dispatch, and align `session_id` logic.

### [IDM-01] Concurrent Increments & Duplicate Entity Creation
- **Affected Components:** `backend/app/api/v1/track.py:process_entry_logic` (around line 81)
- **Root Cause Analysis:** Updating visit counts relies on an application-side read-modify-write pattern (`company.total_visits += 1`) instead of an atomic DB update (`total_visits = total_visits + 1`). Additionally, `Company.domain` lacks a unique constraint per `client_id`.
- **Trigger Scenario:** Two independent page views from the same corporate network arrive at the exact same millisecond.
- **Architectural Risk / Blast Radius:** High. Visit counters will lose updates due to race conditions. The database will become polluted with duplicate `Company` records for the same domain.
- **Recommended Remediation Vector:** Use `Company.total_visits = Company.total_visits + 1` (SQLAlchemy atomic updates). Apply a `UNIQUE (client_id, domain)` constraint and use a PostgreSQL `ON CONFLICT DO NOTHING`/`UPDATE` pattern.

### [IDM-03] Phantom Behavioral Events
- **Affected Components:** `backend/app/api/v1/track.py:track_event` (line 327)
- **Root Cause Analysis:** The `/track/event` endpoint receives a fully populated `EventCreate` schema (with custom `properties` and `timestamp`), but it exclusively updates `intent_cluster` on the `Visit` record. It never writes the event to a database table.
- **Trigger Scenario:** Users click tracked buttons, triggering `intent_click` events with context.
- **Architectural Risk / Blast Radius:** High. Micro-interaction analytics are a black hole.
- **Recommended Remediation Vector:** Create an `Event` SQLModel table and insert incoming `EventCreate` records permanently.

### [SCH-01] Abandoned PageView Topology
- **Affected Components:** `backend/app/api/v1/track.py:track_exit` & `app/models/pageview.py`
- **Root Cause Analysis:** While the schema (`PageView`) and payload models (`PageViewCreate`) exist, the logic in `track_exit` completely bypasses instantiation. It only manipulates `visit.duration`.
- **Trigger Scenario:** A user navigates through 5 different pages before exiting.
- **Architectural Risk / Blast Radius:** Medium. The system is incapable of plotting user journey maps or tracking which specific URLs were visited, severely limiting intelligence capabilities.
- **Recommended Remediation Vector:** Instantiate and `session.add(PageView(...))` for every `/track/exit` call.

### [SCH-02] Missing Cascade Deletion Policies
- **Affected Components:** Database Migrations / SQLModels
- **Root Cause Analysis:** Foreign keys mapping `Visit`, `Company`, and `Prospect` back to `Client` do not specify `ondelete="CASCADE"`.
- **Trigger Scenario:** Attempting to delete a churned Client via the backend.
- **Architectural Risk / Blast Radius:** Medium. Database will throw `IntegrityError` referencing constraint violations, creating un-deleteable zombie data.
- **Recommended Remediation Vector:** Update Alembic and SQLModel declarations to include `ondelete="CASCADE"`.

### [CDN-01] Time-to-Mount Race Condition
- **Affected Components:** `tracker/src/public/aura.js` (line 284)
- **Root Cause Analysis:** When triggering a Phase 04 asset gate dynamically, `aura.js` injects `banner.js`, sets a flat `setTimeout(..., 50)` delay, and then fires `aura:trigger_banner`. 
- **Trigger Scenario:** The network or browser main-thread takes longer than 50ms to evaluate `banner.js` and bind its custom event listeners.
- **Architectural Risk / Blast Radius:** Medium. Asset downloads will be interrupted, but the banner will fail to appear, causing user friction and missed conversion opportunities.
- **Recommended Remediation Vector:** Replace the naive timeout with a callback mechanism, or wait for `banner.js` to dispatch an `aura_banner_mounted` signal before firing the trigger.

### [SCH-03] Missing Timeline Index
- **Affected Components:** `app/models/visit.py` & Database
- **Root Cause Analysis:** Tracking endpoints sort incoming telemetry by `Visit.created_at.desc()` to fetch the active session, but `created_at` is unindexed.
- **Trigger Scenario:** High traffic volumes executing `/v1/track/exit` or `/v1/track/event`.
- **Architectural Risk / Blast Radius:** Low (escalating to High at scale). Sorting relies on sequential scans, which will dramatically bottleneck the PostgreSQL instance as the `visit` table grows to millions of rows.
- **Recommended Remediation Vector:** Apply a compound index on `(client_id, aura_id, created_at)` or a simple index on `created_at`.
