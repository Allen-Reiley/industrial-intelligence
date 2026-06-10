# Graph Report - industrial-intelligence  (2026-06-10)

## Corpus Check
- 212 files · ~169,322 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 59 nodes · 74 edges · 9 communities (8 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e3472a26`
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

## God Nodes (most connected - your core abstractions)
1. `AuraWorks Next.js Frontend Integration & UI Overhaul Log (Phase 16)` - 9 edges
2. `process_exit_logic()` - 5 edges
3. `AsyncSession` - 5 edges
4. `track_exit()` - 5 edges
5. `track_intent()` - 5 edges
6. `process_entry_logic()` - 4 edges
7. `track_entry()` - 4 edges
8. `track_identity()` - 4 edges
9. `verify_admin_token()` - 4 edges
10. `lifespan()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `track_entry()` --references--> `VisitCreate`  [EXTRACTED]
  backend/app/api/v1/track.py → backend/app/api/v1/track.py  _Bridges community 2 → community 5_
- `track_exit()` --references--> `BackgroundTasks`  [EXTRACTED]
  backend/app/api/v1/track.py → backend/app/api/v1/track.py  _Bridges community 5 → community 4_
- `track_identity()` --references--> `AsyncSession`  [EXTRACTED]
  backend/app/api/v1/track.py → backend/app/api/v1/track.py  _Bridges community 3 → community 4_
- `track_intent()` --references--> `IntentPayload`  [EXTRACTED]
  backend/app/api/v1/track.py → backend/app/api/v1/track.py  _Bridges community 3 → community 5_

## Import Cycles
- 1-file cycle: `backend/app/main.py -> backend/app/main.py`

## Communities (9 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.21
Nodes (11): db_exception_handler(), global_exception_handler(), lifespan(), override_proxy_headers(), Background worker that executes the 48-hour sweep every 6 hours.     Protects th, The AuraWorks OS Lifecycle Manager., run_janitor_loop(), Request (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.20
Nodes (9): 1. Edge Tracker Integration (Public Layout), 2. Global VSL CTA Migration, 3. VSL Page Aesthetic Overhaul, 4. Theme Partitioning & Public UI Dark Class Stripping, 5. Google OAuth Callback Routing Audit & Host Remediation, 6. Edge Tracker Event Telemetry 500 & CORS Remediation, 7. ASGI Proxy Headers & Scheme Override Middleware, 8. Hardened Global Exception Handling & Endpoint Safety Guard (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.25
Nodes (8): str, bool, int, process_entry_logic(), process_exit_logic(), THE BATCH PROCESSOR:     Fires exclusively upon departure. Evaluates identity da, SILENT INGESTION ENGINE:     Records raw traffic trails and resolves firmographi, VisitCreate

### Community 3 - "Community 3"
Cohesion: 0.39
Nodes (7): BaseModel, ConsentPayload, IdentityPayload, IntentPayload, Upgrades anonymous forensic profiles using volunteered banner form data., track_consent(), track_identity()

### Community 4 - "Community 4"
Cohesion: 0.50
Nodes (5): AsyncSession, PageViewCreate, Records session metrics upon departure and coordinates the batch analytical thre, track_event(), track_exit()

### Community 5 - "Community 5"
Cohesion: 0.40
Nodes (5): Request, BackgroundTasks, Tracks real-time prospect intent telemetry (e.g. VSL completion percentage)., track_entry(), track_intent()

### Community 6 - "Community 6"
Cohesion: 0.50
Nodes (4): Hardens debug and admin routes.      Rejects any request missing the correct ADM, verify_admin_token(), str, User

### Community 7 - "Community 7"
Cohesion: 0.67
Nodes (3): get_admin_summary(), Provides a high-level overview of the Industrial OS performance.     Combines Le, AsyncSession

## Knowledge Gaps
- **16 isolated node(s):** `int`, `bool`, `Request`, `str`, `User` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FastAPI` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.299) - this node is a cross-community bridge._
- **Why does `process_exit_logic()` connect `Community 2` to `Community 3`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `verify_admin_token()` connect `Community 6` to `Community 0`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **What connects `int`, `bool`, `Request` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._