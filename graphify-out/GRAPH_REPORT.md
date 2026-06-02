# Graph Report - industrial-intelligence  (2026-06-02)

## Corpus Check
- 139 files · ~116,458 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 91 nodes · 178 edges · 7 communities (6 shown, 1 thin omitted)
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `27aa8bab`
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

## God Nodes (most connected - your core abstractions)
1. `Company` - 12 edges
2. `AsyncSession` - 10 edges
3. `PageView` - 9 edges
4. `test_model_instantiation_defaults()` - 9 edges
5. `join_waitlist()` - 7 edges
6. `Visit` - 7 edges
7. `WaitlistLead` - 7 edges
8. `Department` - 6 edges
9. `VerificationStatus` - 6 edges
10. `get_visitor_journey()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `background_lead_analysis()` --calls--> `get_visitor_journey()`  [INFERRED]
  backend/app/api/v1/waitlist.py → backend/app/services/intelligence.py
- `join_waitlist()` --calls--> `Company`  [INFERRED]
  backend/app/api/v1/waitlist.py → backend/app/models/company.py
- `join_waitlist()` --calls--> `WaitlistLead`  [INFERRED]
  backend/app/api/v1/waitlist.py → backend/app/models/waitlist_lead.py
- `PageViewCreate` --uses--> `Company`  [INFERRED]
  backend/app/models/visit.py → backend/app/models/company.py
- `VerificationStatus` --uses--> `Company`  [INFERRED]
  backend/app/models/visit.py → backend/app/models/company.py

## Import Cycles
- 1-file cycle: `backend/app/main.py -> backend/app/main.py`

## Communities (7 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (18): get_async_session(), get_session(), init_db(), Schema Synchronization.     Note: Standardizes the ledger. Production uses Alemb, Dependency generator for Async FastAPI routes (Tracking/Identity)., Dependency generator for Synchronous routes (Admin/Dashboard)., get_admin_summary(), lifespan() (+10 more)

### Community 1 - "Community 1"
Cohesion: 0.29
Nodes (12): AsyncSession, Client, Company, Department, EnrichmentQueue, FailedEnrichment, NotificationThrottle, PageView (+4 more)

### Community 2 - "Community 2"
Cohesion: 0.20
Nodes (14): Any, AsyncSession, str, bool, analyze_corporate_intent(), enrich_ip_intel(), enrich_visitor_data(), format_zar() (+6 more)

### Community 3 - "Community 3"
Cohesion: 0.22
Nodes (10): AsyncSession, int, str, BackgroundTasks, background_lead_analysis(), format_zar(), join_waitlist(), The Promotion Engine:      Converts anonymous traffic into a POPIA-consented 'Wa (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.31
Nodes (9): BaseModel, Enum, ClientCategory, SubscriptionStatus, QueueType, PageViewCreate, VerificationStatus, VisitCreate (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.28
Nodes (8): AsyncSession, int, str, FastAPI, get_lead_intelligence(), get_leads(), Industrial Ledger: Retrieves leads and prioritizes 'Warm Leads' (those with volu, Provides the forensic audit for a specific lead, including their      behavioral

## Knowledge Gaps
- **9 isolated node(s):** `int`, `int`, `BackgroundTasks`, `AsyncSession`, `str` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `join_waitlist()` connect `Community 3` to `Community 1`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `Company` connect `Community 1` to `Community 3`, `Community 4`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `background_lead_analysis()` connect `Community 3` to `Community 2`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `Company` (e.g. with `AsyncSession` and `Department`) actually correct?**
  _`Company` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `AsyncSession` (e.g. with `Client` and `Company`) actually correct?**
  _`AsyncSession` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `PageView` (e.g. with `AsyncSession` and `Visit`) actually correct?**
  _`PageView` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `test_model_instantiation_defaults()` (e.g. with `Client` and `Company`) actually correct?**
  _`test_model_instantiation_defaults()` has 8 INFERRED edges - model-reasoned connections that need verification._