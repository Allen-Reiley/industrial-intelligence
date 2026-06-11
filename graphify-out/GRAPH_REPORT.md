# Graph Report - industrial-intelligence  (2026-06-10)

## Corpus Check
- 212 files · ~172,140 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 155 nodes · 260 edges · 16 communities (9 shown, 7 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `00469232`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]

## God Nodes (most connected - your core abstractions)
1. `Visit` - 19 edges
2. `EventCreate` - 15 edges
3. `VisitCreate` - 14 edges
4. `PageViewCreate` - 14 edges
5. `AuraWorks Next.js Frontend Integration & UI Overhaul Log (Phase 16)` - 11 edges
6. `AsyncSession` - 9 edges
7. `init()` - 8 edges
8. `ConsentPayload` - 7 edges
9. `IdentityPayload` - 7 edges
10. `BackgroundTasks` - 7 edges

## Surprising Connections (you probably didn't know these)
- `test_resolve_identity()` --calls--> `Visit`  [INFERRED]
  backend/tests/test_track_identity.py → backend/app/models/visit.py
- `test_track_event_validation_relaxation()` --calls--> `Visit`  [INFERRED]
  backend/tests/test_track_identity.py → backend/app/models/visit.py
- `test_track_event_without_url_and_null_aura_id()` --calls--> `Visit`  [INFERRED]
  backend/tests/test_track_identity.py → backend/app/models/visit.py
- `test_track_identity_endpoint()` --calls--> `Visit`  [INFERRED]
  backend/tests/test_track_identity.py → backend/app/models/visit.py
- `ConsentPayload` --uses--> `EventCreate`  [INFERRED]
  backend/app/api/v1/track.py → backend/app/models/visit.py

## Import Cycles
- 1-file cycle: `backend/app/main.py -> backend/app/main.py`

## Communities (16 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.20
Nodes (30): AsyncSession, Request, str, BackgroundTasks, BaseModel, bool, EventCreate, int (+22 more)

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (23): captureUTMs(), dispatch(), enqueue(), flush(), generateUUID(), getCanvas(), getFullSignature(), getNetworkInfo() (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (20): db_exception_handler(), get_admin_summary(), global_exception_handler(), lifespan(), override_proxy_headers(), Provides a high-level overview of the Industrial OS performance.     Combines Le, Hardens debug and admin routes.      Rejects any request missing the correct ADM, Background worker that executes the 48-hour sweep every 6 hours.     Protects th (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.16
Nodes (13): AsyncSession, Request, str, User, CookieTransport, get_jwt_strategy(), get_user_db(), get_user_manager() (+5 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (12): 10. Audit and Repair of `/v1/track/event` Endpoint, 1. Edge Tracker Integration (Public Layout), 2. Global VSL CTA Migration, 3. VSL Page Aesthetic Overhaul, 4. Theme Partitioning & Public UI Dark Class Stripping, 5. Google OAuth Callback Routing Audit & Host Remediation, 6. Edge Tracker Event Telemetry 500 & CORS Remediation, 7. ASGI Proxy Headers & Scheme Override Middleware (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.24
Nodes (11): get_test_client(), Tests standard email/password login and logout using FastAPI-Users., Asserts that the admin summary route is protected and permits access with legacy, Verifies that under production scheme / proxy headers, the callback endpoint, Verifies that the Google OAuth authorization redirection URL generation works., Verifies that the Google OAuth callback endpoint processes the code and state,, test_admin_summary_route_protection(), test_google_oauth_authorize() (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (4): Enum, VerificationStatus, SQLModel, str

### Community 7 - "Community 7"
Cohesion: 0.60
Nodes (5): get_test_client(), test_resolve_identity(), test_track_event_validation_relaxation(), test_track_event_without_url_and_null_aura_id(), test_track_identity_endpoint()

## Knowledge Gaps
- **28 isolated node(s):** `AsyncSession`, `Response`, `JWTStrategy`, `str`, `User` (+23 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FastAPI` connect `Community 2` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Why does `Visit` connect `Community 0` to `Community 6`, `Community 7`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `Visit` (e.g. with `AsyncSession` and `Request`) actually correct?**
  _`Visit` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `EventCreate` (e.g. with `AsyncSession` and `Request`) actually correct?**
  _`EventCreate` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `VisitCreate` (e.g. with `AsyncSession` and `Request`) actually correct?**
  _`VisitCreate` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `PageViewCreate` (e.g. with `AsyncSession` and `Request`) actually correct?**
  _`PageViewCreate` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SILENT INGESTION ENGINE:     Records raw traffic trails and resolves firmographi`, `THE BATCH PROCESSOR:     Fires exclusively upon departure. Evaluates identity da`, `Upgrades anonymous forensic profiles using volunteered banner form data.` to the rest of the system?**
  _43 weakly-connected nodes found - possible documentation gaps or missing edges._