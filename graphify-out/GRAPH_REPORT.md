# Graph Report - industrial-intelligence  (2026-06-11)

## Corpus Check
- 213 files · ~172,710 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 66 nodes · 93 edges · 10 communities (9 shown, 1 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3cf37db7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 9|Community 9]]

## God Nodes (most connected - your core abstractions)
1. `OAuthAccount` - 12 edges
2. `User` - 12 edges
3. `AuraWorks Next.js Frontend Integration & UI Overhaul Log (Phase 16)` - 12 edges
4. `UserManager` - 9 edges
5. `get_test_client()` - 7 edges
6. `User` - 6 edges
7. `Request` - 5 edges
8. `str` - 5 edges
9. `RedirectCookieTransport` - 5 edges
10. `Base` - 4 edges

## Surprising Connections (you probably didn't know these)
- `AsyncSession` --uses--> `OAuthAccount`  [INFERRED]
  backend/app/core/users.py → backend/app/models/user.py
- `UserManager` --uses--> `OAuthAccount`  [INFERRED]
  backend/app/core/users.py → backend/app/models/user.py
- `UserManager` --uses--> `User`  [INFERRED]
  backend/app/core/users.py → backend/app/models/user.py
- `OAuth2PasswordRequestForm` --uses--> `OAuthAccount`  [INFERRED]
  backend/app/core/users.py → backend/app/models/user.py
- `OAuth2PasswordRequestForm` --uses--> `User`  [INFERRED]
  backend/app/core/users.py → backend/app/models/user.py

## Import Cycles
- None detected.

## Communities (10 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (13): 10. Audit and Repair of `/v1/track/event` Endpoint, 11. Dual-Column Auth & Form-Encoding Refactor, 1. Edge Tracker Integration (Public Layout), 2. Global VSL CTA Migration, 3. VSL Page Aesthetic Overhaul, 4. Theme Partitioning & Public UI Dark Class Stripping, 5. Google OAuth Callback Routing Audit & Host Remediation, 6. Edge Tracker Event Telemetry 500 & CORS Remediation (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.21
Nodes (13): get_test_client(), Tests standard email/password login and logout using FastAPI-Users., Asserts that the admin summary route is protected and permits access with legacy, Verifies that under production scheme / proxy headers, the callback endpoint, Verifies that the Google OAuth authorization redirection URL generation works., Tests logging in with a custom username rather than email using FastAPI-Users., Verifies that the Google OAuth callback endpoint processes the code and state,, test_admin_summary_route_protection() (+5 more)

### Community 2 - "Community 2"
Cohesion: 0.20
Nodes (10): CookieTransport, RedirectCookieTransport, DeclarativeBase, Base, OAuthAccount, UserCreate, UserRead, UserUpdate (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.33
Nodes (6): AsyncSession, get_jwt_strategy(), get_user_db(), JWTStrategy, User, SQLAlchemyBaseUserTableUUID

### Community 4 - "Community 4"
Cohesion: 0.53
Nodes (3): Request, str, User

### Community 5 - "Community 5"
Cohesion: 0.67
Nodes (3): get_user_manager(), UserManager, UUIDIDMixin

## Knowledge Gaps
- **15 isolated node(s):** `UserRead`, `UserCreate`, `UserUpdate`, `AuraWorks Industrial Intelligence Engine Progress Checklist`, `1. Edge Tracker Integration (Public Layout)` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `OAuthAccount` connect `Community 2` to `Community 9`, `Community 3`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `User` connect `Community 3` to `Community 9`, `Community 2`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `UserManager` connect `Community 5` to `Community 9`, `Community 2`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `OAuthAccount` (e.g. with `AsyncSession` and `RedirectCookieTransport`) actually correct?**
  _`OAuthAccount` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `User` (e.g. with `AsyncSession` and `RedirectCookieTransport`) actually correct?**
  _`User` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `UserManager` (e.g. with `OAuthAccount` and `User`) actually correct?**
  _`UserManager` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `UserRead`, `UserCreate`, `UserUpdate` to the rest of the system?**
  _21 weakly-connected nodes found - possible documentation gaps or missing edges._