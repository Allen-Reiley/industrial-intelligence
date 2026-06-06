# Graph Report - industrial-intelligence  (2026-06-06)

## Corpus Check
- 165 files · ~137,875 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 361 nodes · 507 edges · 30 communities (24 shown, 6 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.69)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6726be65`
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
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]

## God Nodes (most connected - your core abstractions)
1. `Company` - 18 edges
2. `Prospect` - 17 edges
3. `process_exit_logic()` - 10 edges
4. `str` - 9 edges
5. `background_prospect_analysis()` - 8 edges
6. `send_resend_email()` - 8 edges
7. `send_prospect_success_email()` - 8 edges
8. `get_visitor_journey()` - 8 edges
9. `is_slack_notification_throttled()` - 8 edges
10. `🏗️ Technical Specification: Industrial Intelligence Engine (v2.0)` - 8 edges

## Surprising Connections (you probably didn't know these)
- `background_prospect_analysis()` --calls--> `get_visitor_journey()`  [INFERRED]
  backend/app/api/v1/prospects.py → backend/app/services/intelligence.py
- `background_prospect_analysis()` --calls--> `post_to_slack()`  [INFERRED]
  backend/app/api/v1/prospects.py → backend/app/services/notifications.py
- `join_prospects()` --calls--> `Company`  [INFERRED]
  backend/app/api/v1/prospects.py → backend/app/models/company.py
- `join_prospects()` --calls--> `Prospect`  [INFERRED]
  backend/app/api/v1/prospects.py → backend/app/models/prospect.py
- `process_entry_logic()` --calls--> `Company`  [INFERRED]
  backend/app/api/v1/track.py → backend/app/models/company.py

## Import Cycles
- 1-file cycle: `backend/app/main.py -> backend/app/main.py`
- 1-file cycle: `backend/app/services/crm.py -> backend/app/services/crm.py`
- 1-file cycle: `backend/app/services/notifications.py -> backend/app/services/notifications.py`
- 1-file cycle: `backend/app/services/reports.py -> backend/app/services/reports.py`
- 2-file cycle: `backend/app/db.py -> backend/app/main.py -> backend/app/db.py`

## Communities (30 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (33): get_session(), init_db(), FastAPI Dependency: Yields a transaction-scoped Synchronous session.     Used fo, Schema Synchronization.     Verifies that the database ledger tables are correct, get_admin_summary(), lifespan(), Provides a high-level overview of the Industrial OS performance.     Combines Le, Hardens debug and admin routes.      Rejects any request missing the correct ADM (+25 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (32): get_async_session(), FastAPI Dependency: Yields a transaction-scoped Asynchronous session.     Automa, AsyncSession, Request, AsyncSession, bool, bytes, str (+24 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (27): dependencies, class-variance-authority, clsx, framer-motion, lucide-react, motion, next, @next/third-parties (+19 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (25): Any, AsyncSession, bool, int, str, analyze_corporate_intent(), enrich_ip_intel(), enrich_visitor_data() (+17 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (22): AsyncSession, BackgroundTasks, int, str, bool, int, Any, str (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (18): BackgroundTasks, Request, str, BaseModel, PageViewCreate, ConsentPayload, IdentityPayload, process_entry_logic() (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (18): 1.1 The Three Pillars, 1. System Architecture Overview, 2. Legal Topography (Two-Tier POPIA Identity Model), 3.1 Client & Subscription Management, 3.2 Enterprise Directory Core, 3.3 Multi-Tenant Interaction Telemetry (RLS Gated), 3. Persistent Database Schema (SQLModel Models), 4.1 Script Delivery & Caching (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (16): bool, str, UUID, handle_juristic_only_alert(), is_slack_notification_throttled(), post_meeting_booked_to_slack(), post_to_slack(), post_to_visit_channel() (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (15): 1. System Role & Operational Paradigm, 2. Rigid Execution Protocols, 3. The Test-Driven Cognitive Gate, 4. Human-in-the-Loop (HITL) Validation Triggers, 5. Explicit Test Specifications & Quality Metrics, 6. Project Checklist Configuration (`task.md`), 7. Immediate Directive, Antigravity Orchestration Master Blueprint: Test-Driven Industrial Engine Build (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (16): devDependencies, autoprefixer, eslint, eslint-config-next, jest, jest-environment-jsdom, postcss, tailwindcss (+8 more)

### Community 10 - "Community 10"
Cohesion: 0.24
Nodes (10): bool, bytes, str, Dispatches outbound email notifications using Resend's REST API.     Asynchronou, Sends a premium demo onboarding confirmation email to prospects.     Introduces, send_prospect_success_email(), send_resend_email(), test_send_prospect_success_email_custom_calendly() (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (8): Any, bool, str, The Industrial Sink: Responsible for pushing enriched forensic leads      into t, Synchronizes forensic data and behavioral intent with the Airtable schema., Entry point for BackgroundTasks to ensure the API response is not blocked      b, sync_lead_to_external_vault(), VaultBridge

### Community 12 - "Community 12"
Cohesion: 0.25
Nodes (8): bool, str, UUID, float, Asynchronously synchronizes a promoted lead matrix to an outbound CRM webhook en, sync_lead_to_crm(), Force a continuous connection timeout on the CRM outbound webhook endpoint., test_crm_synchronization_dead_letter_queue()

### Community 13 - "Community 13"
Cohesion: 0.28
Nodes (7): get_test_client(), Mock external API network dependencies to simulate outage.     Send payload to /, Assert that modifications, updates, or expirations applied to key 1     leave ke, Send a mock transaction payload to POST /v1/track/exit passing a valid aura_id, test_composite_cache_key_isolation(), test_enrichment_queue_failover(), test_exit_endpoint_without_lead()

### Community 14 - "Community 14"
Cohesion: 0.36
Nodes (8): AsyncSession, BackgroundTasks, Request, str, calendly_webhook(), paygenius_webhook(), Receives billing/checkout webhooks from PayGenius API.     Verifies payload sign, Ingests booking events from Calendly.     Verifies payload signature using HMAC-

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (7): AsyncSession, int, str, get_lead_intelligence(), get_leads(), Industrial Ledger: Retrieves leads and prioritizes 'Warm Leads' (those with volu, Provides the forensic audit for a specific lead, including their      behavioral

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (6): 1. Commercial Logic & Strategy (The R120k/yr Framework), 2. Technical Forensics & Identity Bridge (`aura.js`), 3. Infrastructure & High-Precision Security, 4. Automation & Integration Workflows, 5. Compliance & Two-Tier Identity Model (POPIA), MEMORY.md | AuraWorks 2.2.0: Industrial Intelligence Engine

### Community 17 - "Community 17"
Cohesion: 0.43
Nodes (5): column_exists(), get_column_type(), Upgrade schema to resolve legacy drift., table_exists(), upgrade()

### Community 19 - "Community 19"
Cohesion: 0.40
Nodes (4): Run migrations in 'offline' mode.      This configures the context with just a U, Run migrations in 'online' mode.      In this scenario we need to create an Engi, run_migrations_offline(), run_migrations_online()

### Community 20 - "Community 20"
Cohesion: 0.40
Nodes (4): downgrade(), Upgrade schema to enable RLS and set isolation policies., Downgrade schema to disable RLS and drop isolation policies., upgrade()

### Community 21 - "Community 21"
Cohesion: 0.50
Nodes (3): createJestConfig, customJestConfig, nextJest

## Knowledge Gaps
- **94 isolated node(s):** `int`, `int`, `BackgroundTasks`, `AsyncSession`, `int` (+89 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `send_resend_email()` connect `Community 10` to `Community 1`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `Company` connect `Community 1` to `Community 0`, `Community 4`, `Community 5`, `Community 7`, `Community 13`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `process_exit_logic()` connect `Community 4` to `Community 3`, `Community 5`, `Community 7`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `Company` (e.g. with `AsyncSession` and `Request`) actually correct?**
  _`Company` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `Prospect` (e.g. with `AsyncSession` and `Request`) actually correct?**
  _`Prospect` has 14 INFERRED edges - model-reasoned connections that need verification._
- **What connects `int`, `Industrial Ledger: Retrieves leads and prioritizes 'Warm Leads' (those with volu`, `Provides the forensic audit for a specific lead, including their      behavioral` to the rest of the system?**
  _160 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05731523378582202 - nodes in this community are weakly interconnected._