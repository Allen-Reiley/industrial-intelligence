# MEMORY.md | AuraWorks 2.2.0: Industrial Intelligence Engine

> [!WARNING]
> **Proprietary Software Notice:** This repository is private. Unauthorized copying, distribution, or use of any file within this repository is strictly prohibited. All rights reserved.

---

## 1. Commercial Logic & Strategy (The R120k/yr Framework)

* **The Offer:** Hybrid Flat-Rate model. **R10k/month (R120k/year)** base retainer.
* **Usage Cap:** Includes up to **10,000 resolved B2B identities** per month to protect margins while ensuring high-volume value.
* **The Guarantee:** **30% Minimum Identity Resolution Rate** for unique B2B visitors. Failure to meet this trigger results in a pro-rata credit for the following billing cycle.
* **Primary Value Prop:** "Foundational Authority"—moving from "Clicks" to "Boardroom-Ready Leads" for the SADC industrial sector.
* **Delivery Mechanism:** "Push-First" architecture. Automated **Weekly Intelligence Reports (PDF)** generated via reportlab, cryptographically signed, and delivered via Resend. The live dashboard is a secondary utility for real-time deep-dives.
* **Onboarding & Billing:** Checkout pathways securely integrate with the **PayGenius API** webhook (`/api/v1/webhook/paygenius`), which fires background tasks to compile service agreements and dispatch onboarding requirements.

---

## 2. Technical Forensics & Identity Bridge (`aura.js`)

* **Persistence Pillar:** Triple-redundancy tracking using **Cookies, LocalStorage, and IndexedDB** to survive cache clears and browser identity wipes.
* **Offline Reliability:** Incorporates the `AuraOfflineQueue` engine built on IndexedDB. Telemetry payloads are cached locally when connections fail and are flushed recursively using an exponential backoff loop upon recovery.
* **Resolution Logic:** 
  * *Deterministic Fingerprinting:* Prioritizes Canvas Rendering, WebGL GPU unmasking, and Clock Drift (`performance.now` vs `Date.now`) over generic network signals.
  * *ISP Filtering:* Hard blacklist for residential/mobile CIDR ranges (**Vodacom, MTN, Rain, Telkom, Afrihost**) to isolate fixed-line corporate infrastructure.
* **Behavioral Gating (4-Phase Layout Capture):**
  * *Phase 01:* A **2.5-second initial delay** triggers a subtle bottom-right slide-in framework prompting an enterprise email link.
  * *Phase 02:* Crossing a **50% scrolling ceiling** on technical tables or machinery specifications converts the banner into a multi-column contact slide, acquiring corporate role descriptions and optional telephone metadata.
  * *Phase 03:* Upward mouse acceleration mapping triggers **exit-intent technical pop-ups** offering customized calculation sheets.
  * *Phase 04:* Accessing high-value binary files (schematics, CAD, blueprints) triggers a strict **overlay download gate**, requiring enterprise email verification.
* **Bot Defense:** Honey Pot traps for hidden links and offscreen elements to instantly filter out procurement scrapers.

---

## 3. Infrastructure & High-Precision Security

* **Stack:** Next.js 14+ App Router (Frontend), FastAPI running Python 3.12 (Backend), PostgreSQL database (Storage), and Redis (Caching).
* **Isolation Layer (Row-Level Security):** Row-Level Security (RLS) is enforced at the database engine level. Direct client-isolation rules restrict cross-pollination of client data:
  ```sql
  ALTER TABLE visit ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY tenant_isolation_policy ON visit
  FOR ALL
  USING (client_id = current_setting('app.current_client_id', True)::uuid);
  ```
* **Encryption (AES-256):** Mandatory field-level encryption for all Natural Person PII:
  * `visitor_email`
  * `phone_number`
  * `precise_location` (GPS coordinates)
  * *Note: Firmographic fields (Company Name, Domain, Industry, City/Region) remain raw/unencrypted for high-speed indexing, search aggregation, and PDF reporting.*
* **Kill Switch:** Server-side Token Validation. `aura.js` pings the API on initialization; a `403 Forbidden` response for inactive client API tokens terminates all client-side forensic logic instantly.

---

## 4. Automation & Integration Workflows

* **Slack Intent Routing:**
  * Real-time notifications for High-Intent markers (dwell times $\ge 15$ seconds or binary downloads) broadcast payloads to client Slack instances inside a **60-second window**.
  * Restricts alert floods via an automated hourly throttle filter utilizing the `NotificationThrottle` model, allowing only **one instant push per hour per company**.
* **Janitor Purge Engine (`janitor.py`):**
  * Executes a selective column anonymization cascade (preserving the juristic company aggregation fields while scrubbing unconsented natural person fields after **48 hours**):
  ```python
  async def execute_janitor_scrub_cascade(session: AsyncSession):
      time_threshold = datetime.now(timezone.utc) - timedelta(hours=48)
      stmt = (
          update(Visit)
          .where(Visit.is_consented == False)
          .where(Visit.verification_status == VerificationStatus.VERIFYING)
          .where(Visit.created_at < time_threshold)
          .values(
              email=None,
              visitor_name=None,
              fingerprint_hash=None,
              verification_status=VerificationStatus.ANONYMIZED_CORPORATE,
              updated_at=datetime.now(timezone.utc)
          )
      )
      await session.execute(stmt)
      await session.commit()
  ```

---

## 5. Compliance & Two-Tier Identity Model (POPIA)

The system enforces the **South African POPIA (No. 4 of 2013)** via a decoupled **Two-Tier Identity Model**:

1. **Tier 1: The Juristic Layer**
   * *Data Subject:* Juristic Persons (Companies, Mines, Corporations).
   * *Metrics:* Company Name, Domain, Industry, City/Region, ASNs.
   * *Legal Basis:* Legitimate Business Interest (No upfront consent required).
   * *Retention:* Permanent, immutable ledger tracking (Protected from scrubbing cascades).
   * *Enrichment:* Immediate asynchronous IPinfo + Apollo extraction.

2. **Tier 2: The Personal Layer**
   * *Data Subject:* Natural Persons (Individual human visitors).
   * *Metrics:* First/Last Name, Personal Email, Direct Phone, Clear Fingerprints.
   * *Legal Basis:* Explicit Opt-In Gated (Consent mandatory).
   * *Retention:* 48-Hour conditional window (Scrubbed and anonymized if unverified by the Janitor cascade).
   * *Enrichment:* Gated until waitlist form submission or manual banner opt-in.