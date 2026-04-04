# MEMORY.md | AuraWorks 2.2.0: Industrial Intelligence Engine

## 1. Commercial Logic & Strategy (The R120k/yr Framework)
* **The Offer:** Hybrid Flat-Rate model. **R10k/month (R120k/year)** base retainer.
* **Usage Cap:** Includes up to **10,000 resolved B2B identities** per month to protect margins while ensuring high-volume value.
* **The Guarantee:** **30% Minimum Identity Resolution Rate** for unique B2B visitors. Failure to meet this trigger results in a pro-rata credit for the following billing cycle.
* **Primary Value Prop:** "Foundational Authority"—moving from "Clicks" to "Boardroom-Ready Leads" for the South African industrial sector.
* **Delivery Mechanism:** "Push-First" architecture. Automated **Weekly Intelligence Reports (PDF)** delivered via Resend. The live dashboard is a secondary utility for real-time deep dives.

## 2. Technical Forensics & Identity Bridge (`aura.js`)
* **Persistence Pillar:** Triple-redundancy tracking using **Cookies, LocalStorage, and IndexedDB** to survive cache clears and "Identity Wipes."
* **Resolution Logic:** * **Deterministic Fingerprinting:** Prioritizes Canvas Rendering, WebGL GPU unmasking, and **Clock Drift** (performance.now vs Date.now) over generic network signals.
    * **ISP Filtering:** Hard blacklist for residential/mobile CIDR ranges (**Vodacom, MTN, Rain, Telkom**) to isolate fixed-line corporate infrastructure.
* **Behavioral Gating:**
    * **2-Second Threshold:** Forensic enrichment calls only fire after 2 seconds of verified "Human" interaction (monitored via scroll velocity and cursor erraticism).
    * **Bot Defense:** "Honey Pot" traps for `onMouseOver` or hidden link interactions commonly triggered by procurement scrapers.
* **Intent Capture:** Active "Blur" event monitoring on email input fields to harvest partial leads before form submission.

## 3. Infrastructure & High-Precision Security
* **Stack:** Next.js 15+ (Frontend), FastAPI (Backend), PostgreSQL (Vault), Strapi (CMS/Reporting).
* **Multi-Tenancy:** **Row-Level Security (RLS)** enforced at the PostgreSQL engine level. Direct `client_id` isolation ensures zero cross-pollination of industrial data.
* **Encryption (AES-256):** Mandatory field-level encryption for all PII:
    * `visitor_email`
    * `phone_number`
    * `precise_location` (GPS/Coordinates)
    * *Note: Firmography (Company Name/Industry) remains unencrypted for high-speed indexing and reporting.*
* **Kill Switch:** Server-side Token Validation. `aura.js` pings the API on initialization; a `403 Forbidden` response for inactive `client_id` tokens terminates all client-side forensic logic instantly.

## 4. Automation & Integration Workflows
* **Slack Intent Routing:**
    * `#hot-leads`: Real-time alerts for high-dwell time on "Pricing," "Contact," or "Audit" pages.
    * `#traffic-audit`: Daily summaries of general corporate footprints and network signals.
* **Resend Nurture Sequence:**
    * **T+0:** "Intelligence Engine Activated" – Immediate confirmation of Audit Phase 01.
    * **T+24h:** "First 5 Industrial Signals Identified" – Proof of value delivered within the first business day.
    * **T+7d:** "Weekly Intelligence Summary" – First automated PDF report detailing unmasked entities.

## 5. Compliance & Local Context (South Africa)
* **Legal Framework:** POPIA/PAIA compliant. All data handling is governed by the Dynamic Markdown files served at `/legal`, `/privacy-policy`, and `/security`.
* **Information Officer:** Reitumetse Sethabela (Founder/Agency Owner).
* **Target ICP:** Industrial, Engineering, Manufacturing, and Law firms specifically within the **Gauteng** economic hub.