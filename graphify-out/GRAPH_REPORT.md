# Graph Report - industrial-intelligence  (2026-06-08)

## Corpus Check
- 176 files · ~145,978 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 192 nodes · 357 edges · 13 communities (11 shown, 2 thin omitted)
- Extraction: 75% EXTRACTED · 25% INFERRED · 0% AMBIGUOUS · INFERRED: 88 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c9a55dbe`
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
1. `Company` - 29 edges
2. `UUID` - 19 edges
3. `EnrichmentError` - 17 edges
4. `str` - 11 edges
5. `Prospect` - 11 edges
6. `Visit` - 11 edges
7. `background_prospect_analysis()` - 10 edges
8. `🏗️ Technical Specification: Industrial Intelligence Engine (v2.0)` - 10 edges
9. `ConsentPayload` - 9 edges
10. `IdentityPayload` - 9 edges

## Surprising Connections (you probably didn't know these)
- `bool` --uses--> `Company`  [INFERRED]
  backend/app/services/enrichment.py → backend/app/models/company.py
- `int` --uses--> `Company`  [INFERRED]
  backend/app/services/enrichment.py → backend/app/models/company.py
- `AsyncSession` --uses--> `Company`  [INFERRED]
  backend/app/services/notifications.py → backend/app/models/company.py
- `bool` --uses--> `Company`  [INFERRED]
  backend/app/services/notifications.py → backend/app/models/company.py
- `int` --uses--> `Company`  [INFERRED]
  backend/app/services/notifications.py → backend/app/models/company.py

## Import Cycles
- 1-file cycle: `backend/app/services/notifications.py -> backend/app/services/notifications.py`

## Communities (13 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (24): AsyncSession, bool, int, str, check_and_trigger_company_surge(), handle_juristic_only_alert(), is_slack_notification_throttled(), post_inbound_email_to_slack() (+16 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (20): 1.1 The Three Pillars, 1. System Architecture Overview, 2. Legal Topography (Two-Tier POPIA Identity Model), 3.1 Client & Subscription Management, 3.2 Enterprise Directory Core, 3.3 Multi-Tenant Interaction Telemetry (RLS Gated), 3. Persistent Database Schema (SQLModel Models), 4.1 Script Delivery & Caching (+12 more)

### Community 2 - "Community 2"
Cohesion: 0.24
Nodes (6): getEndpoint(), submitToProspects(), trackIntent(), metadata, mockBack, mockPush

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (8): SQLModel, get_test_client(), test_intent_telemetry_updates_models(), test_vsl_slack_alert(), Verifies that Row-Level Security constraints strictly isolate      client intera, Verifies that Row-Level Security constraints strictly isolate      company recor, test_company_row_level_security_isolation(), test_row_level_security_isolation()

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (32): AsyncSession, BackgroundTasks, bool, int, Request, str, BaseModel, Exception (+24 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (27): Any, AsyncSession, bool, int, str, analyze_corporate_intent(), enrich_ip_intel(), enrich_visitor_data() (+19 more)

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (16): Any, bool, int, str, enrich_company_departments(), enrich_visitor_data(), get_departmental_intelligence(), is_consumer_traffic() (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.20
Nodes (11): Any, AsyncSession, BackgroundTasks, Request, str, background_prospect_analysis(), format_zar(), join_prospects() (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (3): Enum, VerificationStatus, str

### Community 9 - "Community 9"
Cohesion: 0.31
Nodes (7): Stitches volunteered company name with enriched name:     1. Substring Match (ca, resolve_entity_stitching(), get_test_client(), test_entity_stitching_deepseek_match(), test_entity_stitching_isp_fallback(), test_entity_stitching_substring_match(), test_immediate_enrichment_workers_triggered()

## Knowledge Gaps
- **25 isolated node(s):** `Any`, `BackgroundTasks`, `Request`, `AsyncSession`, `bool` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Company` connect `Community 4` to `Community 0`, `Community 3`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.212) - this node is a cross-community bridge._
- **Why does `UUID` connect `Community 0` to `Community 8`, `Community 9`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `background_prospect_analysis()` connect `Community 7` to `Community 0`, `Community 4`, `Community 5`, `Community 6`, `Community 9`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Are the 27 inferred relationships involving `Company` (e.g. with `AsyncSession` and `BackgroundTasks`) actually correct?**
  _`Company` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `UUID` (e.g. with `Company` and `process_exit_logic()`) actually correct?**
  _`UUID` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `EnrichmentError` (e.g. with `AsyncSession` and `BackgroundTasks`) actually correct?**
  _`EnrichmentError` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Any`, `BackgroundTasks`, `Request` to the rest of the system?**
  _62 weakly-connected nodes found - possible documentation gaps or missing edges._