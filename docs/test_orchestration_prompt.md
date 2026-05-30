# Antigravity Orchestration Master Blueprint: Test-Driven Industrial Engine Build

## 1. System Role & Operational Paradigm
You are the Senior Autonomous Systems Engineer operating within this Antigravity workspace. Your objective is to build the AuraWorks Industrial Intelligence Engine (v1.0) according to the strict guidelines of the Two-Tier POPIA Compliance Architecture. You will maintain a clinical, logic-driven approach, utilizing clean, asynchronous Python 3.12, FastAPI, SQLModel, and Next.js 14+ components.

## 2. Rigid Execution Protocols
* **Modular Progression:** You must execute this development cycle phase-by-phase, task-by-task. You are strictly prohibited from writing ahead or creating code modules without verifying the preceding task via tests.
* **The Repository Packing Rule:** To ensure token efficiency and prevent context drift, you must never manually scan or open raw file subtrees to check project state. Before starting any task or evaluating codebase architecture, you must always run the local terminal command:
    ```bash
    repo-pack
    ```
    Wait for the command to compile the workspace, and then exclusively read the generated `repomix-output.xml` file to optimize input token density.
* **The Living Progress Tracker:** Maintain a root file named `task.md`. At the beginning of every single interaction turn, output the exact state of the project checklist. A task may only be marked with an `[x]` when its complete code implementation is committed and its explicit integration tests pass flawlessly.

## 3. The Test-Driven Cognitive Gate
Moving forward to a new task or phase **only counts when full test coverage is achieved**. You must write corresponding unit and integration test modules before or alongside code implementation. Every code check-in must match the concrete test specifications defined in Section 5.

## 4. Human-in-the-Loop (HITL) Validation Triggers
You must never guess or mock your way through architectural setup keys. If an engineering step requires any of the following parameters, you must instantly freeze execution, present a descriptive warning to the user, and wait for human input confirmation:
1. Modifying or adding environment variables to the root `.env` configuration file.
2. Generating, provisioning, or rotating active third-party platform credentials or API key pairs (PayGenius, Resend, IPinfo, Apollo, Notion).
3. Executing tasks requiring direct browser interaction (e.g., configuring Cloudflare proxy cache rules or building secure bucket paths on the Cloudflare R2 dashboard).

---

## 5. Explicit Test Specifications & Quality Metrics

### Phase 1: Persistent Database Layer & Security Shield
* **`test_aes_256_encryption_at_rest`:** Assert that writing data to `WaitlistLead.phone_encrypted` saves an opaque ciphertext string to the database pool. Validate that fetching the attribute automatically returns the correct decrypted plaintext string. Assert that a tampered or corrupt ciphertext block throws a specific cryptographic exception. Verify that firmographic attributes (Company Name, Domain, Industry) are saved as raw, unencrypted text fields for search index efficiency.
* **`test_row_level_security_isolation`:** Mock two separate asynchronous connection pools using distinct client tokens (`app.current_client_id`). Write sample visits to the `visit` table under Tenant A's session. Attempt to query those records using Tenant B's session and assert that an empty dataset or an access error is returned, validating complete row-level isolation at the engine tier.
* **`test_sqlmodel_enum_validation`:** Attempt to instantiate or write a `Client` or `Visit` record containing invalid string assignments for properties like `ClientCategory`, `SubscriptionStatus`, or `VerificationStatus`. Assert that standard Pydantic/SQLModel validation errors are raised.

### Phase 2: Ingestion Engine & Traffic Analysis Pipeline
* **`test_exit_endpoint_without_lead`:** Send a mock transaction payload to `POST /v1/track/exit` passing a valid `aura_id` and a `company_id` but completely lacking a matching `WaitlistLead` database entry. Assert an HTTP 200 response, verify that session duration math is updated on the `Visit` row, and confirm that the juristic data alerting service function (`handle_juristic_only_alert`) is successfully invoked.
* **`test_composite_cache_key_isolation`:** Initialize mock interaction cache pools in Redis using key parameters formatted as `client_id_1:aura_id` and `client_id_2:aura_id`. Assert that modifications, updates, or expirations applied to key 1 leave key 2 entirely unaffected, preventing multi-tenant cache pollution.
* **`test_enrichment_queue_failover`:** Mock external API network dependencies (IPinfo, Apollo) to simulate an operational timeout or an `HTTP 429` rate-limit error code. Send a payload to the `/track/entry` endpoint and assert that it handles the exception, logs a standard tracking success status code (HTTP 200) to the client script, and writes the raw tracking attributes to the `EnrichmentQueue` table with a `retry_count == 0`.

### Phase 3: Background Maintenance & Advanced Enrichment Cascades
* **`test_janitor_anonymization_cascade`:** Seed the database with a test fixture containing an unconsented `Visit` marked as `verifying` where the `created_at` timestamp is set to 49 hours in the past. Execute the `execute_janitor_scrub_cascade()` background task. Assert that `email` and `visitor_name` parameters are set to `None`, `verification_status` shifts to `anonymized_corporate`, and the underlying `company_id`, `duration`, and page-view tracks are preserved without deletion.
* **`test_apollo_decoupled_enrichment_priority`:** Mock an asynchronous Apollo extraction response containing multiple structural job titles. Trigger the service and assert that corporate metadata writes rows into the `Department` table linked by `company_id`. Verify that target strings matching keywords like "Procurement Director" automatically calculate and map an integer-based `priority_score == 5`.
* **`test_timezone_aware_journey_delta`:** Pass a mix of timezone-naive and explicit timezone-aware datetimes to `get_visitor_journey()`. Assert that the function automatically normalizes tracking comparisons to aware UTC targets (`timezone.utc`), calculating duration gaps accurately without throwing exceptions.

### Phase 4: DeepSeek Synthesis & Web Content Extraction
* **`test_homepage_html_scraper_and_truncation`:** Mock an external webpage containing heavy script blocks, styling data, and 1,200 words of content text. Execute the scraper utility. Assert that all scripting tags are stripped, that the resulting output string is precisely truncated at the first 500 words, and that data sets cache correctly inside Redis with a 7-day TTL parameter.
* **`test_daily_deepseek_batch_aggregation`:** Populate the database with 5 distinct tracking sessions from the same company domain over a 24-hour cycle. Execute the daily batch processing task. Assert that exactly 1 structured completion request is dispatched to the LLM model pool, and verify that the history array truncates accurately at 10 pages or 4,000 tokens if the data limits are exceeded.

### Phase 5: Financial Webhooks & Automated Contract Onboarding
* **`test_paygenius_webhook_signature_security`:** Dispatch an unauthenticated or invalid payload signature token to `POST /api/v1/webhook/paygenius` and assert an immediate HTTP 401/403 authorization denial. Re-transmit using a valid signature token payload and assert an HTTP 200 code, verifying that the client's `subscription_status` token changes to `active` and `is_active == True`.
* **`test_automated_contract_pdf_generation`:** Trigger the PayGenius success hook. Assert that a valid byte stream is compiled via `reportlab` matching your premium styling constraints, applies the digital signature script properties, and calls the `Resend` asynchronous service.
* **`test_client_semantic_classification`:** Pass a mock customer domain homepage containing text indicators like "Chrome Ore Mineral Processing Plant" to the signup classifier. Assert that the resulting database entry sets the category column directly to `ClientCategory.INDUSTRIAL`.

### Phase 6: Client Script Deployment & Frontend View Realignment
* **`test_tracker_indexeddb_offline_queue`:** In your tracking sandbox, mock the network layer to return `navigator.onLine = false`. Fire telemetry interaction states. Assert that tracking parameters are queued inside an `AuraOfflineQueue` layout in the browser's IndexedDB. Toggle the state back to online, re-trigger script initialization, and assert that backlogged payloads flush asynchronously to backend ingestion endpoints.
* **`test_layered_consent_phases`:** Trigger scroll milestone updates on the frontend interface layer. Assert that moving past a 50% scrolling ceiling updates UI component state variables cleanly, shifting the display layout from Phase 01 into the Phase 02 expanded multi-column capture grid.
* **`test_geolocation_consent_routing`:** Mock the network location request to return an EU-based IP profile (`country = "DE"`). Assert that the client script blocks all canvas tracking and device fingerprint initialization until consent is explicitly toggled. Mock a South African IP profile (`country = "ZA"`) and assert that Tier 1 juristic tracking begins silently on page load.

### Phase 7: Intelligence Delivery, Operational Reporting, & Integration Finish Line
* **`test_weekly_pdf_report_r2_upload`:** Trigger the programmatic report compiler on a test data pool. Assert that a multi-page PDF document aggregates metrics accurately, uploads securely to a designated Cloudflare R2 bucket infrastructure path, and that the emailed CDN link appends a tokenized URL matching the 24-hour signature expiration rule.
* **`test_slack_notification_throttling`:** Fire 5 consecutive high-intent exit signals for the same company entity inside a 15-minute window. Reference the `NotificationThrottle` table and assert that exactly 1 instant notification alert passes to the Slack webhook channel, while the subsequent 4 payloads are suppressed or deferred.
* **`test_crm_synchronization_dead_letter_queue`:** Force a continuous connection timeout on the CRM outbound webhook endpoint. Trigger a lead promotion task. Assert that the sync worker fails gracefully after exactly 3 retry iterations, captures the error, and logs the tracking attributes into the database dead-letter queue.
* **`test_notion_vault_synchronization_isolation`:** Execute the `sync_to_notion()` workflow. Verify that decrypted data fields map perfectly to your structured Notion property columns. Assert that an intentional third-party connection exception is fully isolated, allowing the primary API server thread to close successfully without blocking the core application loop.

---

## 6. Project Checklist Configuration (`task.md`)

[ ] **PHASE 1: PERSISTENT DATABASE LAYER & SECURITY SHIELD**
    * [ ] Task 1.1: Initialize SQLModel Database Entities
    * [ ] Task 1.2: Establish Fields Encryption Layer
    * [ ] Task 1.3: Configure PostgreSQL Row-Level Security (RLS) Engine

[ ] **PHASE 2: INGESTION ENGINE & TRAFFIC ANALYSIS PIPELINE**
    * [ ] Task 2.1: Refactor Exit Route & Discard Consent Gate
    * [ ] Task 2.2: Implement Composite Multi-Tenant Cache Keys
    * [ ] Task 2.3: Integrate Ingestion Fault Isolation & Reprocessing Queue

[ ] **PHASE 3: BACKGROUND MAINTENANCE & ADVANCED ENRICHMENT CASCADES**
    * [ ] Task 3.1: Remodel Automated Janitor Deletion Routines
    * [ ] Task 3.2: Accelerate & Prioritize Departmental Contact Mapping
    * [ ] Task 3.3: Stabilize Analytics Mismatches & Date Operations

[ ] **PHASE 4: DEEPSEEK SYNTHESIS & WEB CONTENT EXTRACTION**
    * [ ] Task 4.1: Build Automated Homepage Scraping Service
    * [ ] Task 4.2: Deploy Daily Analytical Batch Engine

[ ] **PHASE 5: FINANCIAL WEBHOOKS & AUTOMATED CONTRACT ONBOARDING**
    * [ ] Task 5.1: Build PayGenius Webhook Processing Endpoint
    * [ ] Task 5.2: Automate PDF Contract Generation & Delivery
    * [ ] Task 5.3: Build Automated Client Classification Scan

[ ] **PHASE 6: CLIENT SCRIPT DEPLOYMENT & FRONTEND VIEW REALIGNMENT**
    * [ ] Task 6.1: Harden Client Tracking Script & IndexedDB Queue
    * [ ] Task 6.2: Implement Layered Consent Components
    * [ ] Task 6.3: Build Geolocation Consent Track Routers

[ ] **PHASE 7: INTELLIGENCE DELIVERY, OPERATIONAL REPORTING, & INTEGRATION FINISH LINE**
    * [ ] Task 7.1: Create Programmatic Weekly PDF Reporting Service
    * [ ] Task 7.2: Deploy Throttled Slack Notification Routing
    * [ ] Task 7.3: Implement CRM Synchronization Outbox
    * [ ] **Task 7.4 [FINAL MOVE]: Notion Personal Vault Synchronization**

---

## 7. Immediate Directive
Initialize the local working space. Execute the `repo-pack` terminal command to establish structural alignment. Create the `task.md` file at the repository root, output the blank progress checklist into our logging stream, implement the explicit `pytest` mock suites for Phase 1, and proceed straight to code implementation for **Task 1.1: Initialize SQLModel Database Entities**. Stop execution and query for human verification the moment a cryptographic credential or environment key parameter trigger is hit.