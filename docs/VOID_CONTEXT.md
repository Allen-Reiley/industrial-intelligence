# VOID_CONTEXT.md | AuraWorks Coding Laws & Constraints

> [!WARNING]
> **Proprietary Software Notice:** This repository is private. Unauthorized copying, distribution, or use of any file within this repository is strictly prohibited. All rights reserved.

---

## 1. Project Mission: AuraWorks Industrial Engine

* **Domain:** B2B Sales Intelligence, Identity Resolution & Firmographic Auditing for heavy industry, mining, manufacturing, and engineering infrastructure operations in the SADC region.
* **Goal:** Map anonymous website traffic (IP, browser telemetry, network topologies) to registered juristic corporate identities without natural person consent gating, while enforcing strict consent boundaries for individual personal data extraction.
* **Core Aesthetic:** "Quiet Premium"—Minimalist, industrial, authoritative. Ample whitespace, high-contrast silver typography, muted slates, and rich dark backgrounds. Zero "screaming neon" or basic developer tropes.

---

## 2. Technical Stack (The "Holy Stack")

* **Backend:** FastAPI (Python 3.12+), SQLModel (Pydantic + SQLAlchemy), Uvicorn.
* **Frontend:** Next.js 14+ App Router, TypeScript, Tailwind CSS, Shadcn/UI.
* **Database:** PostgreSQL (Neon Serverless for Production with pgvector capabilities) + Redis Cache.
* **Storage & CDN:** Cloudflare R2 buckets with optimized caching directives (`Cache-Control: public, max-age=86400`).
* **Payment Processing:** PayGenius API checkouts & custom webhooks.
* **Mailing:** Resend API for transactional and report delivery.

---

## 3. Architecture, Security & Patterns

* **Two-Tier Identity Model:** Segregate data processing logic completely:
  * *Tier 1 (Juristic Layer):* Company Name, Domain, Industry, ASNs, etc. Legitimate business interest basis. Permanent retention. Async IPinfo + Apollo enrichment.
  * *Tier 2 (Personal Layer):* Individual PII. Opt-In gated. 48-Hour conditional window before automatic Janitor anonymization sweeps.
* **Multi-Tenancy (Row-Level Security):** Row-Level Security (RLS) is strictly enforced at the database engine level on the `visit` and related interaction tables. Isolation must be completely leak-proof:
  ```sql
  ALTER TABLE visit ENABLE ROW LEVEL SECURITY;
  ```
* **Encryption (AES-256):** Mandatory field-level encryption for all sensitive natural person PII fields (`visitor_email`, `phone_number`, `precise_location` GPS). Firmographic details remain raw for high-speed indexing.
* **Janitor Purge (Selective Anonymization):** Do NOT destroy rows. Instead, execute a column anonymization cascade on unconsented Tier 2 records exceeding 48 hours to preserve permanent juristic aggregates.
* **Asynchronous Telemetry:** Implement background tasks for telemetry ingestion, report generation (PDF contracts compiled using reportlab, signed cryptographically), and Slack notification routing.
* **Slack Notification Throttling:** Real-time Slack pushes for High-Intent markers must go through an hourly throttling loop utilizing the `NotificationThrottle` data model (max 1 instant push per hour per company).

---

## 4. Coding "Laws" (Strict Enforcement)

* **Law 1:** Always write clinical, self-documenting asynchronous code.
* **Law 2:** No external heavy dependencies unless explicitly authorized. Avoid adding packages.
* **Law 3:** All database migrations must be handled strictly via Alembic upgrade paths.
* **Law 4:** The client-side tracking script (`aura.js`) must maintain a size under `<1KB` (Minified & Gzipped) and utilize `AuraOfflineQueue` (IndexedDB) with exponential backoff retry logic. It must run asynchronously (`async` / `defer`) with zero impact on host site performance.

---

## 5. Technical Context Links
* Refer to [master_architecture_spec.md](file:///home/allenreiley7/projects/industrial-intelligence/docs/master_architecture_spec.md) for data model schemas, API contracts, and script architectures.
* Refer to [structure.md](file:///home/allenreiley7/projects/industrial-intelligence/docs/structure.md) for details on project directory layouts.