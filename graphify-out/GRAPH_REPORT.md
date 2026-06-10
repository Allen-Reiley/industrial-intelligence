# Graph Report - industrial-intelligence  (2026-06-10)

## Corpus Check
- 212 files · ~168,420 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 109 nodes · 160 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c97f1bd3`
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

## God Nodes (most connected - your core abstractions)
1. `Visit` - 18 edges
2. `VisitCreate` - 13 edges
3. `PageViewCreate` - 13 edges
4. `🏗️ Technical Specification: Industrial Intelligence Engine (v2.0)` - 11 edges
5. `AsyncSession` - 8 edges
6. `📂 Project Directory Structure & Blueprint (v2.0)` - 7 edges
7. `ConsentPayload` - 6 edges
8. `IdentityPayload` - 6 edges
9. `BackgroundTasks` - 6 edges
10. `IntentPayload` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Visit` --uses--> `Visit`  [INFERRED]
  backend/app/api/v1/identity.py → backend/app/models/visit.py
- `float` --uses--> `Visit`  [INFERRED]
  backend/app/api/v1/identity.py → backend/app/models/visit.py
- `str` --uses--> `Visit`  [INFERRED]
  backend/app/api/v1/identity.py → backend/app/models/visit.py
- `BackgroundTasks` --uses--> `Visit`  [INFERRED]
  backend/app/api/v1/identity.py → backend/app/models/visit.py
- `AsyncSession` --uses--> `Visit`  [INFERRED]
  backend/app/api/v1/identity.py → backend/app/models/visit.py

## Import Cycles
- None detected.

## Communities (16 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (25): 10.1 Multi-Tenant Client Ledger (Client Model), 10.2 Admin Authentication (FastAPI-Users & Google OAuth), 10.3 Two-Tier High-Speed Config Cache, 10.4 Snippet Generation & Verification Console, 10. Provisioning Dashboard & Admin Console (Phase 13), 1.1 The Three Pillars, 1. System Architecture Overview, 2. Legal Topography (Two-Tier POPIA Identity Model) (+17 more)

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (11): AsyncSession, BackgroundTasks, str, float, SQLModel, calculate_identity_match(), merge_sessions_async(), Weighted probability algorithm for forensic identity resolution.     Calibrated (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.24
Nodes (10): AsyncSession, BackgroundTasks, PageViewCreate, Upgrades anonymous forensic profiles using volunteered banner form data., Records session metrics upon departure and coordinates the batch analytical thre, Tracks real-time prospect intent telemetry (e.g. VSL completion percentage)., track_event(), track_exit() (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.28
Nodes (4): HeroHeader(), menuItems, transitionVariants, transitionVariants

### Community 4 - "Community 4"
Cohesion: 0.25
Nodes (7): 🏛️ 1. Core API Engine (`/backend`), 🎨 2. Analytics Portal (`/frontend`), 🛰️ 3. Forensic Edge Script (`/tracker`), 🛠️ 4. Local & Production Infrastructure (`/infra`), ⚖️ License, 📂 Project Directory Structure & Blueprint (v2.0), 📁 Repository Map

### Community 5 - "Community 5"
Cohesion: 0.47
Nodes (6): str, bool, int, Visit, process_exit_logic(), THE BATCH PROCESSOR:     Fires exclusively upon departure. Evaluates identity da

### Community 7 - "Community 7"
Cohesion: 0.80
Nodes (5): BaseModel, PageViewCreate, VisitCreate, IdentityPayload, IntentPayload

### Community 8 - "Community 8"
Cohesion: 0.40
Nodes (5): Request, process_entry_logic(), SILENT INGESTION ENGINE:     Records raw traffic trails and resolves firmographi, track_entry(), VisitCreate

### Community 9 - "Community 9"
Cohesion: 0.67
Nodes (3): Enum, VerificationStatus, str

### Community 10 - "Community 10"
Cohesion: 0.83
Nodes (3): get_test_client(), test_resolve_identity(), test_track_identity_endpoint()

## Knowledge Gaps
- **29 isolated node(s):** `1.1 The Three Pillars`, `2. Legal Topography (Two-Tier POPIA Identity Model)`, `3.1 Client & Subscription Management`, `3.2 Enterprise Directory Core`, `3.3 Multi-Tenant Interaction Telemetry (RLS Gated)` (+24 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Visit` connect `Community 5` to `Community 1`, `Community 2`, `Community 7`, `Community 8`, `Community 9`, `Community 11`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Are the 16 inferred relationships involving `Visit` (e.g. with `AsyncSession` and `BackgroundTasks`) actually correct?**
  _`Visit` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `VisitCreate` (e.g. with `AsyncSession` and `BackgroundTasks`) actually correct?**
  _`VisitCreate` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `PageViewCreate` (e.g. with `AsyncSession` and `BackgroundTasks`) actually correct?**
  _`PageViewCreate` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `AsyncSession` (e.g. with `PageViewCreate` and `Visit`) actually correct?**
  _`AsyncSession` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Weighted probability algorithm for forensic identity resolution.     Calibrated`, `Background Task: Unifies fragmented forensic IDs across the ledger.     Using a`, `SILENT INGESTION ENGINE:     Records raw traffic trails and resolves firmographi` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._