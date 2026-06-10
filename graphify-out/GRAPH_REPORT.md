# Graph Report - industrial-intelligence  (2026-06-10)

## Corpus Check
- 210 files · ~167,868 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 99 nodes · 133 edges · 15 communities (9 shown, 6 thin omitted)
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `75c2d728`
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
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]

## God Nodes (most connected - your core abstractions)
1. `User` - 18 edges
2. `OAuthAccount` - 12 edges
3. `UserManager` - 8 edges
4. `get_async_session()` - 7 edges
5. `FastAPI` - 6 edges
6. `User` - 5 edges
7. `Request` - 5 edges
8. `lifespan()` - 5 edges
9. `get_test_client()` - 5 edges
10. `get_current_admin()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `str` --uses--> `User`  [INFERRED]
  backend/app/api/v1/auth.py → backend/app/models/user.py
- `User` --uses--> `User`  [INFERRED]
  backend/app/api/v1/auth.py → backend/app/models/user.py
- `str` --uses--> `User`  [INFERRED]
  backend/app/main.py → backend/app/models/user.py
- `User` --uses--> `User`  [INFERRED]
  backend/app/main.py → backend/app/models/user.py
- `AsyncSession` --uses--> `User`  [INFERRED]
  backend/app/main.py → backend/app/models/user.py

## Import Cycles
- 1-file cycle: `backend/app/main.py -> backend/app/main.py`
- 2-file cycle: `backend/app/db.py -> backend/app/main.py -> backend/app/db.py`

## Communities (15 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.16
Nodes (17): get_async_session(), FastAPI Dependency: Yields a transaction-scoped Asynchronous session.     Automa, AsyncSession, AsyncSession, Request, get_jwt_strategy(), get_user_db(), DeclarativeBase (+9 more)

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (12): get_session(), init_db(), FastAPI Dependency: Yields a transaction-scoped Synchronous session.     Used fo, Schema Synchronization.     Verifies that the database ledger tables are correct, get_admin_summary(), lifespan(), Provides a high-level overview of the Industrial OS performance.     Combines Le, Background worker that executes the 48-hour sweep every 6 hours.     Protects th (+4 more)

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (6): Request, str, User, get_user_manager(), UserManager, UUIDIDMixin

### Community 3 - "Community 3"
Cohesion: 0.29
Nodes (9): get_test_client(), Tests standard email/password login and logout using FastAPI-Users., Asserts that the admin summary route is protected and permits access with legacy, Verifies that the Google OAuth authorization redirection URL generation works., Verifies that the Google OAuth callback endpoint processes the code and state,, test_admin_summary_route_protection(), test_google_oauth_authorize(), test_google_oauth_callback_success() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (6): mockCreateObjectURL, mockPush, mockRevokeObjectURL, mockWriteText, Client, Lead

### Community 6 - "Community 6"
Cohesion: 0.40
Nodes (4): str, User, get_current_admin(), Dependency to get the current authenticated active user.     Supports both FastA

### Community 7 - "Community 7"
Cohesion: 0.50
Nodes (4): Hardens debug and admin routes.      Rejects any request missing the correct ADM, verify_admin_token(), str, User

## Knowledge Gaps
- **16 isolated node(s):** `UserRead`, `UserCreate`, `UserUpdate`, `mockPush`, `mockCreateObjectURL` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `Community 0` to `Community 1`, `Community 2`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **Why does `FastAPI` connect `Community 1` to `Community 0`, `Community 2`, `Community 6`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `get_async_session()` connect `Community 0` to `Community 1`, `Community 3`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `User` (e.g. with `str` and `User`) actually correct?**
  _`User` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `OAuthAccount` (e.g. with `AsyncSession` and `Request`) actually correct?**
  _`OAuthAccount` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `UserManager` (e.g. with `OAuthAccount` and `User`) actually correct?**
  _`UserManager` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Dependency to get the current authenticated active user.     Supports both FastA`, `Schema Synchronization.     Verifies that the database ledger tables are correct`, `FastAPI Dependency: Yields a transaction-scoped Asynchronous session.     Automa` to the rest of the system?**
  _28 weakly-connected nodes found - possible documentation gaps or missing edges._