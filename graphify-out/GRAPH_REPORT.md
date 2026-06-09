# Graph Report - industrial-intelligence  (2026-06-09)

## Corpus Check
- 204 files · ~166,103 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 32 nodes · 48 edges · 6 communities
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `be71f038`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]

## God Nodes (most connected - your core abstractions)
1. `AdminUser` - 12 edges
2. `RefreshRequest` - 4 edges
3. `verify_admin_token()` - 4 edges
4. `lifespan()` - 4 edges
5. `FastAPI` - 4 edges
6. `TokenResponse` - 3 edges
7. `get_current_admin()` - 3 edges
8. `AsyncSession` - 3 edges
9. `login()` - 3 edges
10. `AsyncSession` - 3 edges

## Surprising Connections (you probably didn't know these)
- `str` --uses--> `AdminUser`  [INFERRED]
  backend/app/api/v1/auth.py → backend/app/models/admin_user.py
- `Request` --uses--> `AdminUser`  [INFERRED]
  backend/app/api/v1/auth.py → backend/app/models/admin_user.py
- `str` --uses--> `AdminUser`  [INFERRED]
  backend/app/main.py → backend/app/models/admin_user.py
- `TokenResponse` --uses--> `AdminUser`  [INFERRED]
  backend/app/api/v1/auth.py → backend/app/models/admin_user.py
- `RefreshRequest` --uses--> `AdminUser`  [INFERRED]
  backend/app/api/v1/auth.py → backend/app/models/admin_user.py

## Import Cycles
- 1-file cycle: `backend/app/main.py -> backend/app/main.py`

## Communities (6 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.38
Nodes (5): lifespan(), Background worker that executes the 48-hour sweep every 6 hours.     Protects th, The AuraWorks OS Lifecycle Manager., run_janitor_loop(), FastAPI

### Community 1 - "Community 1"
Cohesion: 0.33
Nodes (6): get_admin_summary(), Provides a high-level overview of the Industrial OS performance.     Combines Le, Hardens debug and admin routes.      Rejects any request missing the correct ADM, verify_admin_token(), AsyncSession, str

### Community 2 - "Community 2"
Cohesion: 0.53
Nodes (3): seed_admin(), AdminUser, SQLModel

### Community 3 - "Community 3"
Cohesion: 0.40
Nodes (5): AsyncSession, str, Request, get_current_admin(), login()

### Community 4 - "Community 4"
Cohesion: 0.60
Nodes (4): BaseModel, refresh_token(), RefreshRequest, TokenResponse

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AdminUser` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.499) - this node is a cross-community bridge._
- **Why does `FastAPI` connect `Community 0` to `Community 2`, `Community 4`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `AdminUser` (e.g. with `AsyncSession` and `str`) actually correct?**
  _`AdminUser` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Hardens debug and admin routes.      Rejects any request missing the correct ADM`, `Background worker that executes the 48-hour sweep every 6 hours.     Protects th`, `The AuraWorks OS Lifecycle Manager.` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._