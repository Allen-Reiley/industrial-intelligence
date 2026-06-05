# Graph Report - industrial-intelligence  (2026-06-05)

## Corpus Check
- 154 files · ~129,900 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 288 nodes · 574 edges · 17 communities (12 shown, 5 thin omitted)
- Extraction: 70% EXTRACTED · 30% INFERRED · 0% AMBIGUOUS · INFERRED: 172 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a57f7948`
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
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `Visit` - 23 edges
2. `EnrichmentError` - 21 edges
3. `Client` - 19 edges
4. `Company` - 19 edges
5. `QueueType` - 18 edges
6. `EnrichmentQueue` - 18 edges
7. `VisitCreate` - 14 edges
8. `PageViewCreate` - 14 edges
9. `Request` - 13 edges
10. `str` - 12 edges

## Surprising Connections (you probably didn't know these)
- `create_client()` --calls--> `scrape_homepage()`  [INFERRED]
  backend/app/api/v1/clients.py → backend/app/services/intelligence.py
- `Request` --uses--> `Client`  [INFERRED]
  backend/app/api/v1/clients.py → backend/app/models/client.py
- `Request` --uses--> `ClientCategory`  [INFERRED]
  backend/app/api/v1/clients.py → backend/app/models/client.py
- `Request` --uses--> `ClientCreate`  [INFERRED]
  backend/app/api/v1/clients.py → backend/app/models/client.py
- `Request` --uses--> `ClientPublic`  [INFERRED]
  backend/app/api/v1/clients.py → backend/app/models/client.py

## Import Cycles
- 1-file cycle: `backend/app/api/v1/clients.py -> backend/app/api/v1/clients.py`
- 1-file cycle: `backend/app/main.py -> backend/app/main.py`
- 2-file cycle: `backend/app/db.py -> backend/app/main.py -> backend/app/db.py`

## Communities (17 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.20
Nodes (31): BackgroundTasks, bool, int, Request, str, int, BaseModel, Exception (+23 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (25): Any, bool, str, Industrial Async Enrichment Task:     Maps corporate departments for captured Ju, Initializes the Asynchronous AuraWorks Background Engine Pipeline., run_enrichment_cycle(), start_scheduler(), Company (+17 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (31): get_async_session(), get_session(), init_db(), FastAPI Dependency: Yields a transaction-scoped Asynchronous session.     Automa, FastAPI Dependency: Yields a transaction-scoped Synchronous session.     Used fo, Schema Synchronization.     Verifies that the database ledger tables are correct, get_admin_summary(), lifespan() (+23 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (29): Any, AsyncSession, bool, int, str, analyze_corporate_intent(), enrich_ip_intel(), enrich_visitor_data() (+21 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (24): AsyncSession, str, AsyncSession, BackgroundTasks, Request, str, ClientCreate, Enum (+16 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (17): AsyncSession, BackgroundTasks, int, str, str, handle_juristic_only_alert(), post_to_slack(), post_to_visit_channel() (+9 more)

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
Cohesion: 0.17
Nodes (22): captureUTMs(), dispatch(), enqueue(), flush(), generateUUID(), getCanvas(), getFullSignature(), getNetworkInfo() (+14 more)

### Community 13 - "Community 13"
Cohesion: 0.20
Nodes (9): 🏗️ Architecture & Remote Lifecycle, 🛰️ AuraWorks Industrial Tracker — Client Implementation Guide, 🛠️ Build & Minification Pipeline, 🚀 Client Integration Script, 🎨 Encapsulated Consent Banner & Shadow DOM, 💾 Offline Robustness (`AuraOfflineQueue`), 🔒 Security & Strict Domain Verification, The 4 Interactive Capture Phases (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.29
Nodes (6): devDependencies, terser, name, scripts, build, version

## Knowledge Gaps
- **24 isolated node(s):** `🏗️ Architecture & Remote Lifecycle`, `🚀 Client Integration Script`, `🔒 Security & Strict Domain Verification`, `⚖️ Timezone-Based Compliance Routing`, `The 4 Interactive Capture Phases` (+19 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `test_automated_contract_pdf_generation()` connect `Community 6` to `Community 2`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `Client` connect `Community 4` to `Community 0`, `Community 2`, `Community 3`, `Community 7`, `Community 16`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Are the 21 inferred relationships involving `Visit` (e.g. with `BackgroundTasks` and `bool`) actually correct?**
  _`Visit` has 21 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `EnrichmentError` (e.g. with `BackgroundTasks` and `bool`) actually correct?**
  _`EnrichmentError` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `Client` (e.g. with `AsyncSession` and `str`) actually correct?**
  _`Client` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `Company` (e.g. with `Any` and `bool`) actually correct?**
  _`Company` has 17 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Registers a new client and automatically evaluates its category (INDUSTRIAL vs C`, `Returns remote configuration parameters for the embedded tracking tag.     Perfo`, `Creates a clinical audit page in the Notion Vault.` to the rest of the system?**
  _81 weakly-connected nodes found - possible documentation gaps or missing edges._