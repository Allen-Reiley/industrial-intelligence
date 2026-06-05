# Graph Report - industrial-intelligence  (2026-06-05)

## Corpus Check
- 147 files · ~122,066 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 138 nodes · 304 edges · 10 communities (9 shown, 1 thin omitted)
- Extraction: 62% EXTRACTED · 38% INFERRED · 0% AMBIGUOUS · INFERRED: 115 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `afadc5da`
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

## God Nodes (most connected - your core abstractions)
1. `Visit` - 20 edges
2. `EnrichmentError` - 20 edges
3. `Company` - 17 edges
4. `QueueType` - 17 edges
5. `EnrichmentQueue` - 17 edges
6. `VisitCreate` - 13 edges
7. `PageViewCreate` - 13 edges
8. `str` - 11 edges
9. `Department` - 10 edges
10. `ConsentPayload` - 9 edges

## Surprising Connections (you probably didn't know these)
- `process_entry_logic()` --calls--> `Company`  [INFERRED]
  backend/app/api/v1/track.py → backend/app/models/company.py
- `process_entry_logic()` --calls--> `PageView`  [INFERRED]
  backend/app/api/v1/track.py → backend/app/models/pageview.py
- `process_exit_logic()` --calls--> `get_visitor_journey()`  [INFERRED]
  backend/app/api/v1/track.py → backend/app/services/intelligence.py
- `process_exit_logic()` --calls--> `handle_juristic_only_alert()`  [INFERRED]
  backend/app/api/v1/track.py → backend/app/services/notifications.py
- `process_exit_logic()` --calls--> `post_to_slack()`  [INFERRED]
  backend/app/api/v1/track.py → backend/app/services/notifications.py

## Import Cycles
- None detected.

## Communities (10 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.25
Nodes (26): BackgroundTasks, bool, int, str, BaseModel, Exception, EnrichmentQueue, QueueType (+18 more)

### Community 1 - "Community 1"
Cohesion: 0.20
Nodes (19): Any, bool, int, str, Industrial Async Enrichment Task:     Maps corporate departments for captured Ju, run_enrichment_cycle(), Company, Department (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (8): Initializes the Asynchronous AuraWorks Background Engine Pipeline., start_scheduler(), NotificationThrottle, PageView, WaitlistLead, SQLModel, Upgrades anonymous forensic profiles using volunteered banner form data., track_identity()

### Community 3 - "Community 3"
Cohesion: 0.20
Nodes (14): Any, AsyncSession, bool, str, analyze_corporate_intent(), enrich_ip_intel(), enrich_visitor_data(), format_zar() (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (9): Enum, Client, ClientBase, ClientCategory, ClientCreate, ClientPublic, SubscriptionStatus, VerificationStatus (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (17): AsyncSession, BackgroundTasks, int, str, str, handle_juristic_only_alert(), post_to_slack(), post_to_visit_channel() (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.25
Nodes (7): get_async_session(), get_session(), init_db(), FastAPI Dependency: Yields a transaction-scoped Asynchronous session.     Automa, FastAPI Dependency: Yields a transaction-scoped Synchronous session.     Used fo, Schema Synchronization.     Verifies that the database ledger tables are correct, AsyncSession

### Community 7 - "Community 7"
Cohesion: 0.28
Nodes (7): get_test_client(), Mock external API network dependencies to simulate outage.     Send payload to /, Assert that modifications, updates, or expirations applied to key 1     leave ke, Send a mock transaction payload to POST /v1/track/exit passing a valid aura_id, test_composite_cache_key_isolation(), test_enrichment_queue_failover(), test_exit_endpoint_without_lead()

### Community 8 - "Community 8"
Cohesion: 0.32
Nodes (7): AsyncSession, int, str, get_lead_intelligence(), get_leads(), Industrial Ledger: Retrieves leads and prioritizes 'Warm Leads' (those with volu, Provides the forensic audit for a specific lead, including their      behavioral

## Knowledge Gaps
- **9 isolated node(s):** `AsyncSession`, `int`, `int`, `BackgroundTasks`, `AsyncSession` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `process_exit_logic()` connect `Community 0` to `Community 3`, `Community 5`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `Company` connect `Community 1` to `Community 0`, `Community 2`, `Community 4`, `Community 5`, `Community 7`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Why does `EnrichmentError` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Are the 18 inferred relationships involving `Visit` (e.g. with `BackgroundTasks` and `bool`) actually correct?**
  _`Visit` has 18 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `EnrichmentError` (e.g. with `BackgroundTasks` and `bool`) actually correct?**
  _`EnrichmentError` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `Company` (e.g. with `Any` and `bool`) actually correct?**
  _`Company` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `QueueType` (e.g. with `BackgroundTasks` and `bool`) actually correct?**
  _`QueueType` has 14 INFERRED edges - model-reasoned connections that need verification._