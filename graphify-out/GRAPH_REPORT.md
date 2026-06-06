# Graph Report - industrial-intelligence  (2026-06-06)

## Corpus Check
- 159 files · ~134,533 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 355 nodes · 692 edges · 22 communities (17 shown, 5 thin omitted)
- Extraction: 73% EXTRACTED · 27% INFERRED · 0% AMBIGUOUS · INFERRED: 186 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f822c3d0`
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
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]

## God Nodes (most connected - your core abstractions)
1. `Visit` - 23 edges
2. `EnrichmentError` - 21 edges
3. `Client` - 19 edges
4. `Company` - 19 edges
5. `QueueType` - 18 edges
6. `EnrichmentQueue` - 18 edges
7. `Request` - 14 edges
8. `VisitCreate` - 14 edges
9. `PageViewCreate` - 14 edges
10. `str` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Request` --uses--> `CrmDeadLetter`  [INFERRED]
  backend/app/db.py → backend/app/models/crm_dead_letter.py
- `Request` --uses--> `EnrichmentQueue`  [INFERRED]
  backend/app/db.py → backend/app/models/enrichment_queue.py
- `Request` --uses--> `QueueType`  [INFERRED]
  backend/app/db.py → backend/app/models/enrichment_queue.py
- `Request` --uses--> `PageViewCreate`  [INFERRED]
  backend/app/db.py → backend/app/models/visit.py
- `Request` --uses--> `Visit`  [INFERRED]
  backend/app/db.py → backend/app/models/visit.py

## Import Cycles
- 1-file cycle: `backend/app/main.py -> backend/app/main.py`
- 1-file cycle: `backend/app/services/crm.py -> backend/app/services/crm.py`
- 1-file cycle: `backend/app/services/notifications.py -> backend/app/services/notifications.py`
- 1-file cycle: `backend/app/api/v1/clients.py -> backend/app/api/v1/clients.py`
- 1-file cycle: `backend/app/services/reports.py -> backend/app/services/reports.py`
- 2-file cycle: `backend/app/db.py -> backend/app/main.py -> backend/app/db.py`

## Communities (22 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (55): BackgroundTasks, bool, int, Request, str, Any, bool, int (+47 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (9): NotificationThrottle, WaitlistLead, SQLModel, Spins up an in-memory SQLite database to verify all tables, UUIDs,      and fore, test_database_schema_initialization(), Configure Apollo mapping to fire instantly right after IPinfo validates a B2B pr, test_immediate_departmental_contact_mapping(), Upgrade schema to support timezone-aware columns and add new Visit columns. (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (41): get_session(), init_db(), FastAPI Dependency: Yields a transaction-scoped Synchronous session.     Used fo, Schema Synchronization.     Verifies that the database ledger tables are correct, get_admin_summary(), lifespan(), Provides a high-level overview of the Industrial OS performance.     Combines Le, Hardens debug and admin routes.      Rejects any request missing the correct ADM (+33 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (27): Any, AsyncSession, bool, int, str, analyze_corporate_intent(), enrich_ip_intel(), enrich_visitor_data() (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (26): get_async_session(), FastAPI Dependency: Yields a transaction-scoped Asynchronous session.     Automa, AsyncSession, str, AsyncSession, BackgroundTasks, Request, str (+18 more)

### Community 5 - "Community 5"
Cohesion: 0.22
Nodes (13): bool, str, UUID, handle_juristic_only_alert(), is_slack_notification_throttled(), post_to_slack(), post_to_visit_channel(), Checks if a Slack alert was already sent for the given client_id and company_id (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.36
Nodes (7): bool, bytes, str, Dispatches outbound email notifications using Resend's REST API.     Asynchronou, Sends a premium confirmation message to users who join the waitlist., send_resend_email(), send_waitlist_success_email()

### Community 7 - "Community 7"
Cohesion: 0.28
Nodes (7): get_test_client(), Mock external API network dependencies to simulate outage.     Send payload to /, Assert that modifications, updates, or expirations applied to key 1     leave ke, Send a mock transaction payload to POST /v1/track/exit passing a valid aura_id, test_composite_cache_key_isolation(), test_enrichment_queue_failover(), test_exit_endpoint_without_lead()

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (27): AsyncSession, bool, str, UUID, bytes, Weekly Reporting cron task: compiles the report for each active client,     uplo, Industrial Async Enrichment Task:     Maps corporate departments for captured Ju, Initializes the Asynchronous AuraWorks Background Engine Pipeline. (+19 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (22): captureUTMs(), dispatch(), enqueue(), flush(), generateUUID(), getCanvas(), getFullSignature(), getNetworkInfo() (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.26
Nodes (9): bool, str, UUID, float, CrmDeadLetter, Asynchronously synchronizes a promoted lead matrix to an outbound CRM webhook en, sync_lead_to_crm(), Force a continuous connection timeout on the CRM outbound webhook endpoint. (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.20
Nodes (9): 🏗️ Architecture & Remote Lifecycle, 🛰️ AuraWorks Industrial Tracker — Client Implementation Guide, 🛠️ Build & Minification Pipeline, 🚀 Client Integration Script, 🎨 Encapsulated Consent Banner & Shadow DOM, 💾 Offline Robustness (`AuraOfflineQueue`), 🔒 Security & Strict Domain Verification, The 4 Interactive Capture Phases (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.29
Nodes (6): devDependencies, terser, name, scripts, build, version

### Community 16 - "Community 16"
Cohesion: 0.43
Nodes (5): column_exists(), get_column_type(), Upgrade schema to resolve legacy drift., table_exists(), upgrade()

### Community 19 - "Community 19"
Cohesion: 0.47
Nodes (5): AsyncSession, cleanup_unverified_visits(), execute_janitor_scrub_cascade(), Executes a precise column anonymization cascade matching POPIA parameters.     I, FastAPI background task entry point for the periodic Janitor Sweep.

### Community 20 - "Community 20"
Cohesion: 0.32
Nodes (7): AsyncSession, int, str, get_lead_intelligence(), get_leads(), Industrial Ledger: Retrieves leads and prioritizes 'Warm Leads' (those with volu, Provides the forensic audit for a specific lead, including their      behavioral

## Knowledge Gaps
- **27 isolated node(s):** `Lead`, `Lead`, `GroupedEntity`, `int`, `BackgroundTasks` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Client` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 7`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `compile_and_send_contract()` connect `Community 8` to `Community 6`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `Company` connect `Community 0` to `Community 1`, `Community 2`, `Community 7`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Are the 21 inferred relationships involving `Visit` (e.g. with `BackgroundTasks` and `bool`) actually correct?**
  _`Visit` has 21 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `EnrichmentError` (e.g. with `BackgroundTasks` and `bool`) actually correct?**
  _`EnrichmentError` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `Client` (e.g. with `AsyncSession` and `str`) actually correct?**
  _`Client` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `Company` (e.g. with `Any` and `bool`) actually correct?**
  _`Company` has 17 INFERRED edges - model-reasoned connections that need verification._