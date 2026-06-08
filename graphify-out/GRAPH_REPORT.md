# Graph Report - industrial-intelligence  (2026-06-06)

## Corpus Check
- 174 files · ~143,620 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 103 nodes · 186 edges · 13 communities (10 shown, 3 thin omitted)
- Extraction: 72% EXTRACTED · 28% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8bac5377`
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
1. `Prospect` - 15 edges
2. `Visit` - 15 edges
3. `VisitCreate` - 13 edges
4. `PageViewCreate` - 13 edges
5. `UUID` - 13 edges
6. `🏗️ Technical Specification: Industrial Intelligence Engine (v2.0)` - 10 edges
7. `process_exit_logic()` - 8 edges
8. `ConsentPayload` - 7 edges
9. `IdentityPayload` - 7 edges
10. `BackgroundTasks` - 7 edges

## Surprising Connections (you probably didn't know these)
- `ConsentPayload` --uses--> `Prospect`  [INFERRED]
  backend/app/api/v1/track.py → backend/app/models/prospect.py
- `ConsentPayload` --uses--> `PageViewCreate`  [INFERRED]
  backend/app/api/v1/track.py → backend/app/models/visit.py
- `ConsentPayload` --uses--> `Visit`  [INFERRED]
  backend/app/api/v1/track.py → backend/app/models/visit.py
- `ConsentPayload` --uses--> `VisitCreate`  [INFERRED]
  backend/app/api/v1/track.py → backend/app/models/visit.py
- `IdentityPayload` --uses--> `PageViewCreate`  [INFERRED]
  backend/app/api/v1/track.py → backend/app/models/visit.py

## Import Cycles
- 1-file cycle: `backend/app/services/notifications.py -> backend/app/services/notifications.py`

## Communities (13 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.16
Nodes (20): bool, str, handle_juristic_only_alert(), is_slack_notification_throttled(), post_inbound_email_to_slack(), post_meeting_booked_to_slack(), post_to_slack(), post_to_visit_channel() (+12 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (20): 1.1 The Three Pillars, 1. System Architecture Overview, 2. Legal Topography (Two-Tier POPIA Identity Model), 3.1 Client & Subscription Management, 3.2 Enterprise Directory Core, 3.3 Multi-Tenant Interaction Telemetry (RLS Gated), 3. Persistent Database Schema (SQLModel Models), 4.1 Script Delivery & Caching (+12 more)

### Community 2 - "Community 2"
Cohesion: 0.24
Nodes (6): getEndpoint(), submitToProspects(), trackIntent(), metadata, mockBack, mockPush

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (3): SQLModel, get_test_client(), test_intent_telemetry_updates_models()

### Community 4 - "Community 4"
Cohesion: 0.39
Nodes (9): str, int, Visit, VisitCreate, Request, process_entry_logic(), SILENT INGESTION ENGINE:     Records raw traffic trails and resolves firmographi, track_entry() (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.47
Nodes (6): AsyncSession, BaseModel, PageViewCreate, IntentPayload, Tracks real-time prospect intent telemetry (e.g. VSL completion percentage)., track_intent()

### Community 6 - "Community 6"
Cohesion: 0.50
Nodes (5): bool, Prospect, IdentityPayload, Upgrades anonymous forensic profiles using volunteered banner form data., track_identity()

### Community 7 - "Community 7"
Cohesion: 0.40
Nodes (5): BackgroundTasks, PageViewCreate, Records session metrics upon departure and coordinates the batch analytical thre, track_event(), track_exit()

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (3): Enum, VerificationStatus, str

## Knowledge Gaps
- **20 isolated node(s):** `bool`, `Remediated Logic Structure`, `1.1 The Three Pillars`, `2. Legal Topography (Two-Tier POPIA Identity Model)`, `3.1 Client & Subscription Management` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UUID` connect `Community 0` to `Community 8`, `Community 9`, `Community 3`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **Why does `Visit` connect `Community 4` to `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `process_exit_logic()` connect `Community 0` to `Community 9`, `Community 4`, `Community 6`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `Prospect` (e.g. with `AsyncSession` and `bool`) actually correct?**
  _`Prospect` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `Visit` (e.g. with `AsyncSession` and `bool`) actually correct?**
  _`Visit` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `VisitCreate` (e.g. with `AsyncSession` and `bool`) actually correct?**
  _`VisitCreate` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `PageViewCreate` (e.g. with `AsyncSession` and `bool`) actually correct?**
  _`PageViewCreate` has 11 INFERRED edges - model-reasoned connections that need verification._