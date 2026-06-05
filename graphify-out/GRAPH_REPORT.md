# Graph Report - industrial-intelligence  (2026-06-05)

## Corpus Check
- 152 files · ~127,488 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 228 nodes · 476 edges · 13 communities (10 shown, 3 thin omitted)
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 160 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `318258ae`
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

## God Nodes (most connected - your core abstractions)
1. `Visit` - 23 edges
2. `EnrichmentError` - 21 edges
3. `Company` - 19 edges
4. `QueueType` - 18 edges
5. `EnrichmentQueue` - 18 edges
6. `Client` - 15 edges
7. `VisitCreate` - 14 edges
8. `PageViewCreate` - 14 edges
9. `str` - 12 edges
10. `Department` - 11 edges

## Surprising Connections (you probably didn't know these)
- `create_client()` --calls--> `scrape_homepage()`  [INFERRED]
  backend/app/api/v1/clients.py → backend/app/services/intelligence.py
- `test_immediate_departmental_contact_mapping()` --calls--> `process_entry_logic()`  [INFERRED]
  backend/tests/test_phase3.py → backend/app/api/v1/track.py
- `process_entry_logic()` --calls--> `enrich_company_departments()`  [INFERRED]
  backend/app/api/v1/track.py → backend/app/services/enrichment.py
- `process_exit_logic()` --calls--> `get_visitor_journey()`  [INFERRED]
  backend/app/api/v1/track.py → backend/app/services/intelligence.py
- `test_enrichment_queue_failover()` --calls--> `Client`  [INFERRED]
  backend/tests/test_phase2.py → backend/app/models/client.py

## Import Cycles
- 1-file cycle: `backend/app/main.py -> backend/app/main.py`
- 2-file cycle: `backend/app/db.py -> backend/app/main.py -> backend/app/db.py`

## Communities (13 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (30): BackgroundTasks, bool, int, Request, str, int, BaseModel, Exception (+22 more)

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (21): Any, bool, str, Industrial Async Enrichment Task:     Maps corporate departments for captured Ju, Initializes the Asynchronous AuraWorks Background Engine Pipeline., run_enrichment_cycle(), start_scheduler(), Department (+13 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (30): get_async_session(), get_session(), init_db(), FastAPI Dependency: Yields a transaction-scoped Asynchronous session.     Automa, FastAPI Dependency: Yields a transaction-scoped Synchronous session.     Used fo, Schema Synchronization.     Verifies that the database ledger tables are correct, get_admin_summary(), lifespan() (+22 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (27): Any, AsyncSession, bool, int, str, analyze_corporate_intent(), enrich_ip_intel(), enrich_visitor_data() (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (22): AsyncSession, AsyncSession, BackgroundTasks, Request, str, ClientCreate, Enum, Client (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (19): AsyncSession, BackgroundTasks, int, str, str, handle_juristic_only_alert(), post_to_slack(), post_to_visit_channel() (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (16): bool, bytes, str, bool, bytes, str, Dispatches outbound email notifications using Resend's REST API.     Asynchronou, Sends a premium confirmation message to users who join the waitlist. (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.28
Nodes (7): get_test_client(), Mock external API network dependencies to simulate outage.     Send payload to /, Assert that modifications, updates, or expirations applied to key 1     leave ke, Send a mock transaction payload to POST /v1/track/exit passing a valid aura_id, test_composite_cache_key_isolation(), test_enrichment_queue_failover(), test_exit_endpoint_without_lead()

### Community 8 - "Community 8"
Cohesion: 0.32
Nodes (7): AsyncSession, int, str, get_lead_intelligence(), get_leads(), Industrial Ledger: Retrieves leads and prioritizes 'Warm Leads' (those with volu, Provides the forensic audit for a specific lead, including their      behavioral

### Community 10 - "Community 10"
Cohesion: 0.38
Nodes (5): get_test_client(), Pass a mock customer domain homepage containing text indicators like "Chrome Ore, Dispatch an unauthenticated or invalid payload signature token to POST /api/v1/w, test_client_semantic_classification(), test_paygenius_webhook_signature_security()

## Knowledge Gaps
- **14 isolated node(s):** `AsyncSession`, `str`, `AsyncSession`, `bytes`, `bool` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `test_automated_contract_pdf_generation()` connect `Community 6` to `Community 10`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Why does `Company` connect `Community 0` to `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 7`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Are the 21 inferred relationships involving `Visit` (e.g. with `BackgroundTasks` and `bool`) actually correct?**
  _`Visit` has 21 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `EnrichmentError` (e.g. with `BackgroundTasks` and `bool`) actually correct?**
  _`EnrichmentError` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `Company` (e.g. with `Any` and `bool`) actually correct?**
  _`Company` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `QueueType` (e.g. with `BackgroundTasks` and `bool`) actually correct?**
  _`QueueType` has 15 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AsyncSession`, `Schema Synchronization.     Verifies that the database ledger tables are correct`, `FastAPI Dependency: Yields a transaction-scoped Asynchronous session.     Automa` to the rest of the system?**
  _69 weakly-connected nodes found - possible documentation gaps or missing edges._