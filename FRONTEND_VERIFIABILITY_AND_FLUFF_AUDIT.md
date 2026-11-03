# AuraWorks Frontend Verifiability, Evidence & Marketing Fluff Audit

**Audit Date:** October 2026  
**Auditor:** AntiGravity Automated Systems & Codebase Intelligence  
**Scope:** Frontend Application (`frontend/src/app`, `frontend/src/components`, `frontend/src/public`)  
**Status:** Complete Forensic Scan  

---

## Executive Summary

A comprehensive scan was conducted across all public marketing pages, client portals, legal documents, blog publications, and dashboard views within the AuraWorks frontend codebase.

The scan evaluated frontend copy, metadata, and user-facing claims against the codebase's underlying backend implementation, verifiable empirical records, and legal standards. The audit identified **eight major categories** of unverifiable claims, unsubstantiated quantitative assertions, artificial scarcity mechanics, dead/dummy lead capture forms, and leftover open-source template placeholders.

### Key Statistics
* **Pages Scanned:** 26 application routes and 45+ UI/marketing components
* **Critical Issues Identified:** 38 specific claims lacking evidence or backend backing
* **Dummy / Discarding Forms:** 3 forms (Customer Support, Blog Newsletter, Footer Newsletter)
* **Hardcoded / Simulated Metrics:** 9 instances (including hardcoded cohort counters, simulated ROI calculators, and dummy TailAdmin metrics)
* **Unrendered Placeholder Components:** 5 visual placeholders left in production views

---

## 1. High-Severity: Fabricated & Unsubstantiated Quantitative Claims

These statements cite exact numerical metrics, percentage lifts, ROI multiples, or empirical research without citing verifiable sources, methodology, or independent evidence.

### 1.1. Case Studies & ROI Claims
| Page / File | Line(s) | Statement / Claim | Why It Cannot Be Verified / Evidence Gap |
| :--- | :--- | :--- | :--- |
| **Customers Page**<br>[`customers/page.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/customers/page.tsx#L13) | L13 | *"See how South African engineering, mining, and industrial suppliers unlock 4.8x enterprise pipeline with AuraWorks discoverability."* | **No source or dataset.** The "4.8x" figure is recycled in metadata and blog posts without client attribution or audited proof. |
| **Customers Page**<br>[`customers/page.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/customers/page.tsx#L91-L93) | L91–93 | *"Average Pipeline Lift: R2.4M+ Per enterprise client in 90 days"* | **No verifiable cohort data.** Displayed as an average across clients, but the page banner itself admits: *"Cohort Benchmark Reports — Coming Soon"*. |
| **Customers Page**<br>[`customers/page.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/customers/page.tsx#L96-L98) | L96–98 | *"AI Citability & Search: 3.4x Lift in organic & generative citations"* | **No measurement standard.** "3.4x lift" lacks baseline date, methodology, or sample size. |
| **Customers Page**<br>[`customers/page.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/customers/page.tsx#L27-L34) | L27–34 | *Mineral Processing Equipment (East Rand): "R3.8M Pipeline Unmasked... 5.2x ROI in First Quarter... identified 4 major mining houses reviewing CAD drawings before tenders were issued."* | **Anonymous Case Study.** Attributed only to *"Anonymized NDA Audit"*. No verification mechanism exists. |
| **Customers Page**<br>[`customers/page.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/customers/page.tsx#L36-L42) | L36–42 | *Heavy Industrial Pumps & Hydraulics (Middelburg): "38% Shorter Deal Cycles... 42 Qualified Lead Alerts / Month."* | **Unverified.** Tagged with status: *"Verification Pending"*. |
| **Customers Page**<br>[`customers/page.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/customers/page.tsx#L44-L50) | L44–50 | *Bulk Logistics & Heavy Freight (Durban): "19 Corporate Accounts Re-engaged... R1.2M Contract Value."* | **Unverified.** Tagged with status: *"Cohort Benchmark"*. |

---

### 1.2. The Universal "98% Abandonment" Trope
| Page / File | Line(s) | Statement / Claim | Why It Cannot Be Verified / Evidence Gap |
| :--- | :--- | :--- | :--- |
| **Home Page**<br>[`content-1.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/content/content-1.tsx#L27) | L27 | *"When these decision-makers do land on your site, 98% leave without filling out a contact form."* | **Uncited B2B Marketing Trope.** Repeated as an empirical fact across 6 separate pages without a cited source. |
| **Solutions Page**<br>[`vertical-stacks.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/sections/solutions/vertical-stacks.tsx#L7) | L7 | *"...and leak 98% of visiting industrial buyers because there is no built-in conversion technology."* | Repeated identically as an empirical statistic. |
| **Pricing Page**<br>[`pricing.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/pricing/pricing.tsx#L500) | L500 | *"In heavy industry and B2B procurement, 98% of visiting corporate engineers, procurement specialists, and plant managers abandon websites without filling out contact forms."* | Repeated identically without attribution. |
| **About Page**<br>[`about-hero.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/sections/about/about-hero.tsx#L25) | L25 | *"...blind to the 98% of corporate buyers who inspect their websites anonymously."* | Repeated identically. |
| **Blog 01**<br>[`playbook-2026`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/blog/industrial-discoverability-playbook-2026/page.tsx#L162) | L162 | *"...98% leave without submitting a contact form."* | Repeated identically. |
| **Blog 02**<br>[`popia-guide`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/blog/de-anonymizing-b2b-website-traffic-popia/page.tsx#L146) | L146 | *"between 96% and 98% of corporate visitors remain entirely anonymous."* | Range modified slightly without citation. |

---

### 1.3. Interactive ROI Simulator Assumptions
| File | Line(s) | Code / Claim | Fluff / Evidence Gap |
| :--- | :--- | :--- | :--- |
| [`pricing.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/pricing/pricing.tsx#L315-L330) | L315–330 | `// ROI Calculations based on empirical B2B industrial telemetry`<br>`const unmaskedAccountsPerMonth = Math.round(monthlyVisitors * 0.12)`<br>`const projectedAnnualNewRevenue = Math.round(annualPipelineUnlocked * 0.15)` | **Hardcoded Math Presented as Empirical Fact.** The 12% juristic identification rate is a hardcoded constant (`* 0.12`), and the 15% closed deal rate is assumed, multiplying deal sizes into multi-million Rand projections with up to 50x ROI multiples. |
| [`pricing.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/pricing/pricing.tsx#L643-L644) | L643–644 | `* Based on empirical telemetry across South African manufacturing, logistics, and mining equipment websites.` | **No published or auditable telemetry dataset exists** to substantiate this claim. |

---

### 1.4. Hardcoded "Empirical" Scorecard on Audit Request Page
| File | Line(s) | Displayed Scorecard Value | Issue |
| :--- | :--- | :--- | :--- |
| [`book-audit-view.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/audit/book-audit-view.tsx#L478) | L478 | **Vector 01: 84% Technical Base** | Hardcoded demo score presented under *"The 4-Box Executive Scorecard - Empirical Health Matrix"*. |
| [`book-audit-view.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/audit/book-audit-view.tsx#L487) | L487 | **Vector 02: 35% Content & On-Page** | Hardcoded score. |
| [`book-audit-view.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/audit/book-audit-view.tsx#L496) | L496 | **Vector 03: 0% Schema & Entities** | Hardcoded score. |
| [`book-audit-view.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/audit/book-audit-view.tsx#L505) | L505 | **Vector 04: 18% GEO / AI Readiness** | Hardcoded score. Not dynamic, not measured. |

---

### 1.5. Blog Research Papers: Fabricated Empirical Studies & Audits
| File | Line(s) | Statement / Claim | Evidence Gap |
| :--- | :--- | :--- | :--- |
| [`industrial-discoverability-playbook-2026`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/blog/industrial-discoverability-playbook-2026/page.tsx#L154) | L154 | *"Over 84% of JSE-listed and privately owned industrial websites are technically invisible on Google SERPs..."* | No reference, dataset, or research report provided. |
| [`industrial-discoverability-playbook-2026`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/blog/industrial-discoverability-playbook-2026/page.tsx#L266-L312) | L266–312 | *"...our engineering team conducted an empirical benchmark of 150 B2B engineering, manufacturing, and industrial supply websites operating in Gauteng and the East Rand. The findings were stark:"*<br>• LCP: 5.8s vs AuraWorks <= 1.2s<br>• TTFB: 1,940ms vs AuraWorks <= 180ms<br>• CLS: 0.28 vs AuraWorks 0.00<br>• INP: 410ms vs AuraWorks <= 65ms<br>• Mobile Score: 42/100 vs AuraWorks 100/100 | **Fabricated benchmark.** No dataset, audit methodology, list of audited domains, or publication link exists anywhere in the repository or public domain. |
| [`generative-engine-optimization-geo-vs-seo`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/blog/generative-engine-optimization-geo-vs-seo/page.tsx#L223-L258) | L223–258 | *"In late 2025, AuraWorks conducted an exhaustive empirical benchmark testing 500 industrial procurement prompts across ChatGPT Search, Perplexity AI Pro, and Google AI Overviews... exhibited a 4.8x higher citation rate... cited in 78% of technical queries vs less than 6% for PDFs."* | **Fabricated benchmark study.** No prompt repository, statistical evaluation log, or test results are documented. |
| [`de-anonymizing-b2b-website-traffic-popia`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/blog/de-anonymizing-b2b-website-traffic-popia/page.tsx#L252-L253) | L252–253 | *"...the system achieves an average resolution accuracy of over 92% for South African enterprise traffic."* | **Unsubstantiated accuracy claim.** No test set or validation data exists. |
| [`blog/page.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/blog/page.tsx#L149) | L149 | *"Peer-reviewed technical blueprints and empirical benchmarks for industrial commercial directors"* | **Misleading claim.** The blog articles are self-published marketing articles by the founder, not peer-reviewed academic or technical publications. |

---

## 2. Phantom Technical Capabilities & Unbacked Integrations

Several frontend pages promise enterprise integrations, data pipelines, and automated intelligence engines that do not exist in the codebase.

### 2.1. CRM, Data Lake & Trade Media Claims vs Reality
| Feature / Claim | Where Claimed | What the Frontend Promises | What the Code Actually Does |
| :--- | :--- | :--- | :--- |
| **Trade Media Syndication** | [`pricing.tsx` L95, L202–206](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/pricing/pricing.tsx#L95) | *"High-authority SA trade media syndication via Creamer Media, Bizcommunity & MechChem Africa (Semi-Annual Placement / Quarterly Sponsored Features)"* | **Zero contractual agreements or syndication infrastructure.** No code, API, or documentation indicates an existing partnership or sponsored placement pipeline. |
| **Enterprise CRM Sync** | [`pricing.tsx` L76, L237–241, L304](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/pricing/pricing.tsx#L76), [`popia-guide` L280–286](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/blog/de-anonymizing-b2b-website-traffic-popia/page.tsx#L280) | *"Direct CRM Pipeline Sync (HubSpot / Salesforce)", "bidirectional webhooks compatible with HubSpot, Salesforce, Zoho CRM, and Microsoft Dynamics 365", "automated SFTP/CSV pipeline exports"* | **Generic HTTP POST only.** In `backend/app/services/crm.py`, the only implementation is a plain HTTP POST to a generic webhook URL. No HubSpot OAuth/API, Salesforce SDK, Zoho API, Dynamics 365, or SFTP connectors exist. |
| **Enterprise Data Lakes** | [`pricing.tsx` L97, L249–253](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/pricing/pricing.tsx#L97) | *"Dedicated real-time streaming into custom data lakes (Snowflake, BigQuery, AWS S3)"* | **Non-existent.** No Snowflake driver, BigQuery client, or S3 streaming buffer is implemented in the repository. |
| **Multi-Agent MCP Audit Pipeline** | [`book-audit-view.tsx` L158, L403, L424–458](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/audit/book-audit-view.tsx#L158) | *"We execute a multi-agent Model Context Protocol (MCP) crawl across Google Search Console, Google Trends, OpenSEO, and Google Gemini... Deploying MCP Telemetry..."* | **Placebo submit action.** Submitting the audit request simply sends form fields to `POST /api/v1/prospects/join` to save a lead record. No automated multi-agent MCP crawl is initiated upon form submission. |
| **Core Web Vitals SLA Guarantee** | [`pricing.tsx` L50, L137–141](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/pricing/pricing.tsx#L50), [`features/page.tsx` L50](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/features/page.tsx#L50) | *"100/100 Core Web Vitals guarantee"*, *"Google Core Web Vitals SLA: 100% Passing Score"* | **Unrealistic / Unenforceable guarantee.** No agency or software can legally guarantee 100/100 across arbitrary client environments and third-party scripts. |

---

### 2.2. Dead / Dummy Forms That Discard User Data
Three user-facing forms in the frontend simulate submissions without sending user data anywhere:

1. **Customer Support Form** ([`customer-support.tsx` L18–25](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/sections/support/customer-support.tsx#L18-L25)):
   ```tsx
   const handleSupportSubmit = async (e: React.FormEvent) => {
       e.preventDefault()
       setIsSubmitting(true)
       setTimeout(() => {
           setIsSubmitting(false)
           alert("Uplink established. A technical lead will respond shortly.")
       }, 1500)
   }
   ```
   * **Issue:** Displays "End-to-End Encrypted Tunnel" and claims "Current average response under 120 minutes", but executes a mock `setTimeout(1500)` and fires a browser alert. **The user's ticket and message are completely lost.**

2. **Blog Newsletter Signup** ([`newsletter-signup.tsx` L9–12](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/blog/newsletter-signup.tsx#L9-L12)):
   ```tsx
   const handleSubmit = (e: React.FormEvent) => {
       e.preventDefault();
       setSubmitted(true);
   };
   ```
   * **Issue:** Displays *"✓ You have been added to the Priority Dispatch list."* but never posts the email address to any API or database.

3. **Footer Newsletter Subscription** ([`footer.tsx` L198–201](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/footer/footer.tsx#L198-L201)):
   ```tsx
   onSubmit={(e) => {
       e.preventDefault();
       alert("Thank you for subscribing to AuraWorks Industrial Briefings.");
   }}
   ```
   * **Issue:** Fires a client alert and discards the subscriber's email.

---

## 3. Artificial Scarcity & False Urgency Mechanics

The frontend employs hardcoded numbers to simulate scarce client cohorts and artificial deadlines:

| File | Line(s) | Hardcoded Copy | Reality |
| :--- | :--- | :--- | :--- |
| **Book Call Page**<br>[`call-page.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/book-call/call-page.tsx#L79) | L79 | `<span>Current Cohort Status: 12/100 Seats Filled</span>` | **Completely hardcoded static text.** Does not reflect live database registrations. |
| **Book Demo Page**<br>[`book-demo.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/sections/form/book-demo.tsx#L135) | L135 | `<p>Basic credentials for the 100-partner cohort.</p>` | Hardcoded artificial cohort size. |
| **About Page CTA**<br>[`about-cta.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/sections/about/about-cta.tsx#L13) | L13 | *"We restrict our client cohort to ensure dedicated engineering attention..."* | Artificial scarcity framing. |
| **Thank You Page**<br>[`thank-you.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/sections/thanks/thank-you.tsx#L31-L49) | L31–49 | *"We are currently vetting applications to ensure every partner in our initial 100-client cohort receives maximum ROI... Jump the Queue: Sharing interest accelerates sector prioritization."* | Standard viral waitlist tactic. Vetting status and queue jumping are simulated. |
| **Checkout Session**<br>[`checkout/[session_id]/page.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/checkout/[session_id]/page.tsx#L187,L206) | L187, L206 | *"Decrypting 24h Checkout Session..."*, *"This secure checkout session expired after 24 hours to protect pricing terms and attribution integrity."* | Artificial urgency countdown timer. |

---

## 4. Privacy & Regulatory Claims vs. Actual Data Capture

A major marketing pillar of AuraWorks is that it is strictly **"Juristic-First"** and does not harvest natural personal data or PII. However, code in the consent components directly contradicts this.

### 4.1. The Marketing Claim
* **Solution Page (`/solution`):** *"We identify registered corporate entities, not individual natural persons, ensuring your outbound sales team remains fully compliant with South African data protection laws..."*
* **Features Page (`/features`):** *"aura.js operates on juristic-first entity resolution... It resolves corporate and juristic entities rather than individual natural personal data, adhering strictly to Chapter 3 of the Protection of Personal Information Act (POPIA)..."*
* **Security Page (`/security`):** *"Our script is 'Read-Only.' It cannot access passwords, credit card fields, or sensitive PII..."*
* **Blog Post (`/blog/de-anonymizing-b2b-website-traffic-popia`):** *"aura.js is architected specifically around a juristic-first resolution model... It never attempts to determine the domestic residential identity of individuals, never scrapes private Gmail or Yahoo accounts, and never drops third-party tracking cookies across foreign websites."*

### 4.2. The Reality in the Code
* **Consent Banner (`consent-banner.tsx` L76–90, L140–162, L390–425):**
  1. **Document Download Interception:** Phase 4 intercepts clicks on any file ending in `.pdf`, `.dwg`, `.cad`, `.zip`, `.step` and blocks access until a personal email is provided.
  2. **Premature Data Transmission:** When a user enters their personal **First Name**, **Last Name**, and **Direct Phone Number** in Step 1, clicking "Next Step" immediately writes those details to `localStorage` and dispatches an event (`aura_warm_lead`) that transmits natural personal data before the user even reaches or completes Step 2.
  3. **Personal PII Collection:** The system explicitly collects natural personal names, direct cellular phone numbers, and job titles—the exact definition of personal data under POPIA Section 1.

---

## 5. Unattributed Testimonials & Unauthorized Corporate References

| File | Line(s) | Entity / Quote Referenced | Issue |
| :--- | :--- | :--- | :--- |
| [`playbook-2026`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/blog/industrial-discoverability-playbook-2026/page.tsx#L408-L417) | L408–417 | `Entity: Impala Platinum Operations (Rustenburg Concentrator)`<br>`Network Block: AS37153 • Commercial Mining Telemetry`<br>`Pages Evaluated: /pumps/slurry-series-400`<br>`Dwell Time: 6 min 42s` | Uses the exact registered name and ASN of a real JSE-listed mining house (**Impala Platinum**) in a simulated real-time alert without disclosing that it is a mock example. |
| [`customers/page.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/customers/page.tsx#L31,L39,L47) | L31, L39, L47 | Three detailed quotes from "sales engineers", "account executives", and "managing directors" | All three quotes are unattributed to any individual, company, or verifiable entity. |

---

## 6. Leftover Template Artifacts & Unrendered Placeholders

Multiple pages contain unfinished developer placeholder text or unedited dummy components from the TailAdmin template.

### 6.1. Visual Placeholders Left in Production Pages
| Page | File | Line(s) | Placeholder Code / Text |
| :--- | :--- | :--- | :--- |
| **Features** | [`identity-bridge.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/sections/features/identity-bridge.tsx#L31-L34) | L31–34 | `{/* Placeholder for the "Bridge" Architecture Diagram */}`<br>`<span className="text-xs text-muted-foreground uppercase tracking-widest">[ Discoverability & Conversion Schema ]</span>` |
| **Solution** | [`vertical-stacks.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/sections/solutions/vertical-stacks.tsx#L44-L46) | L44–46 | `{/* Placeholder for vertical-specific UI/Screenshot */}`<br>`<span className="text-[10px] text-muted-foreground uppercase tracking-widest">[ Vertical Intent Dashboard ]</span>`<br>*(Rendered three times in production across all vertical cards)* |
| **About** | [`founder-profile.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/sections/about/founder-profile.tsx#L10) | L10 | `{/* Placeholder for your "Quiet Premium" AI-generated headshot */}` |
| **Home** | [`content-1.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/content/content-1.tsx#L40) | L40 | `src="/logo.svg" // Replace with your client's light SVG` |

---

### 6.2. Dummy TailAdmin Components in AuraHQ Overview (`/aurahq`)
The overview page for AuraHQ ([`aurahq/page.tsx`](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(authenticated)/aurahq/page.tsx)) imports unmodified template e-commerce widgets containing dummy data in USD:

| Component | File | Dummy Template Content |
| :--- | :--- | :--- |
| **EcommerceMetrics** | [`EcommerceMetrics.tsx` L23–52](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/ecommerce/EcommerceMetrics.tsx#L23-L52) | Hardcoded numbers: **3,782 Customers (+11.01%)**, **5,359 Orders (-9.05%)**. |
| **RecentOrders** | [`RecentOrders.tsx` L26–63](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/ecommerce/RecentOrders.tsx#L26-L63) | Mock data with USD pricing: *"Technical SEO Audit: $2,500.00"*, *"GEO: $5,000.00"*, *"Visitor Identity Resolution: $8,000.00"*, with broken images pointing to `/images/product/product-01.jpg`. |
| **MonthlyTarget** | [`MonthlyTarget.tsx` L126–203](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/ecommerce/MonthlyTarget.tsx#L126-L203) | Hardcoded RadialBar at **75.55%**, with **$3,287 Earned**, **$20K Target**, **$20K Revenue**, **$20K Today**. |
| **DemographicCard** | [`DemographicCard.tsx` L82–126](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/ecommerce/DemographicCard.tsx#L82-L126) | Shows **USA: 2,379 Customers (79%)** and **France: 589 Customers (23%)** (79% + 23% = 102%). In a platform built specifically for South African & SADC heavy industry. |

---

### 6.3. Template Metadata Left in Sub-Pages
The following 10 routes contain unmodified TailAdmin template metadata in production:
* `aurahq/(ui-elements)/images/page.tsx:10`: *"Next.js Images | TailAdmin - Next.js Dashboard Template"*
* `aurahq/(ui-elements)/avatars/page.tsx:7`: *"Next.js Avatars | TailAdmin - Next.js Dashboard Template"*
* `aurahq/(ui-elements)/alerts/page.tsx:8`: *"Next.js Alerts | TailAdmin - Next.js Dashboard Template"*
* `aurahq/(ui-elements)/badge/page.tsx:7`: *"Next.js Badge | TailAdmin - Next.js Dashboard Template"*
* `aurahq/(ui-elements)/videos/page.tsx:7`: *"Next.js Videos | TailAdmin - Next.js Dashboard Template"*
* `aurahq/(ui-elements)/modals/page.tsx:10`: *"Next.js Modals | TailAdmin - Next.js Dashboard Template"*
* `aurahq/(ui-elements)/buttons/page.tsx:8`: *"Next.js Buttons | TailAdmin - Next.js Dashboard Template"*
* `aurahq/(others-pages)/(tables)/basic-tables/page.tsx:8`: *"Next.js Basic Table | TailAdmin - Next.js Dashboard Template"*
* `aurahq/(others-pages)/(chart)/bar-chart/page.tsx:8`: *"Next.js Bar Chart | TailAdmin - Next.js Dashboard Template"*
* `aurahq/(others-pages)/(chart)/line-chart/page.tsx:8`: *"Next.js Line Chart | TailAdmin - Next.js Dashboard Template"*
* `aurahq/(others-pages)/(forms)/form-elements/page.tsx:15`: *"Next.js Form Elements | TailAdmin - Next.js Dashboard Template"*
* `aurahq/(others-pages)/blank/page.tsx:5`: *"Next.js Blank Page | TailAdmin - Next.js Dashboard Template"*

---

## 7. Commercial Contradictions & Legal Inconsistencies

### 7.1. Pricing Tiers vs. Legal & Technical Specifications
* **Pricing Page (`/pricing`):**
  * Growth Foundation: **R10,000 / month** (R100,000 / year)
  * Industrial Category Leader: **R18,500 / month** (R185,000 / year)
  * Enterprise SADC Corridor: **R32,000 / month** (R320,000 / year)
* **Terms of Service (`/terms-of-service` L68):**
  * *"The Founding Member rate (R120,000/yr) is a full annual commitment."*
* **Root Layout Schema.org JSON-LD (`layout.jsx` L175):**
  * `"price": "120000", "priceCurrency": "ZAR"`
* **Checkout Page (`/checkout/[session_id]` L279, L282):**
  * *"14-Day Zero-Risk Free Trial included"*, *"Cancel online anytime during the 14-day trial"*
* **Terms of Service Refund Policy (`/terms-of-service` L71, L131):**
  * *"all fees are non-refundable once the bridge is integrated... cancelation requires standard 60-day written notice after the initial 90-day technical sprint."*
  * **Conflict:** The Terms of Service state that no refunds are possible and lock clients into 90-day sprints with 60-day notice, whereas the checkout page claims users can "cancel online anytime" during a "14-day zero-risk trial".

---

### 7.2. Marketing Guarantees vs. Disclaimer Disclaimers
* **Marketing Claims (`/features`, `/pricing`, `/solution`):**
  * *"100/100 Core Web Vitals guarantee"*
  * *"POPIA Juristic Indemnity Guarantee: 100% Passing Score"*
  * *"Sub-300ms Time-to-First-Byte (TTFB) SLA"*
* **Disclaimer Page (`/disclaimer` L49–67):**
  * *"AuraWorks provides lead intelligence and identity resolution services. We do not guarantee specific sales outcomes, revenue increases, or the successful closing of contracts."*
  * *"all data is provided on an 'as-is' and 'as-available' basis. AuraWorks does not warrant that every visitor identity will be resolved with 100% accuracy."*
  * *"AuraWorks is a technical service provider, not a legal consultancy... not liable for inaccuracies, data deletions, or service interruptions originating from third-party providers..."*

---

## 8. Buzzwords & Pseudotechnical Fluff

Across several pages, overly dramatic technical jargon is substituted for clear product explanations:

1. **"Military-Grade Security"** ([`security/page.tsx` L5, L11](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/app/(pages)/security/page.tsx#L5)):
   * Classic marketing buzzword for standard AES-256 encryption.
2. **"Enterprise Carrier-Grade Resolution"** ([`pricing.tsx` L222](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/pricing/pricing.tsx#L222)):
   * Vague buzzword used in the pricing comparison matrix without technical definition.
3. **"Support Uplink" & "Open Technical Transmission"** ([`customer-support.tsx` L54, L85](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/sections/support/customer-support.tsx#L54)):
   * Sci-fi/military phrasing used for a simple contact form (which does not even transmit data).
4. **"Deterministic GPU / Clock-Drift Fingerprinting"** ([`README.md` L32](file:///home/allenreiley7/projects/industrial-intelligence/README.md#L32)):
   * Hardware fingerprinting buzzwords used to describe IP lookup and ASN filtering.
5. **"Consent-Led Digital Receptionist"** ([`security.tsx` L109](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/sections/security/security.tsx#L109), [`cookies-policy` L87](file:///home/allenreiley7/projects/industrial-intelligence/frontend/src/components/sections/cookies/cookie-policy.tsx#L87)):
   * High-tech framing for a standard popup banner form.

---

## 9. Comprehensive Route-by-Route Scan Matrix

| Route | Page Name | Primary Issues Found | Severity |
| :--- | :--- | :--- | :--- |
| `/` | Landing / Home | • Unsubstantiated "98% abandon" trope<br>• Developer comment left in code (`// Replace with your client's light SVG`) | Low |
| `/features` | Features | • Unrendered placeholder block `[ Discoverability & Conversion Schema ]`<br>• "100/100 Core Web Vitals guarantee"<br>• "Sub-300ms Next.js Edge latency guarantee" | Medium |
| `/solution` | Strategic Solutions | • 3 unrendered placeholder cards `[ Vertical Intent Dashboard ]`<br>• "POPIA Juristic-only" claim contradicts consent banner PII capture | Medium |
| `/customers` | Client Proof | • "4.8x enterprise pipeline" metadata claim<br>• R2.4M+ average pipeline lift (no dataset)<br>• 3.4x AI citability lift (no dataset)<br>• Three anonymous case studies under NDA with unverified quotes<br>• Admission: "Cohort Benchmark Reports — Coming Soon" | **Critical** |
| `/pricing` | Pricing Plans | • Unsubstantiated "12% juristic identification rate" and "15% win rate" in ROI calculator<br>• Phantom integrations: Creamer Media / Bizcommunity syndication, Salesforce / HubSpot bidirectional sync, Snowflake / BigQuery data lakes<br>• Unrealistic "100/100 Core Web Vitals SLA guarantee" | **Critical** |
| `/book-audit` | Executive SEO Audit | • Hardcoded mock scores (84%, 35%, 0%, 18%) presented as live "Empirical Health Matrix"<br>• Claims multi-agent MCP crawl is deployed on submit, but only calls `prospects/join` | High |
| `/book-demo` | Book Strategy Demo | • Artificial scarcity: "Basic credentials for the 100-partner cohort" | Medium |
| `/book-call` | Book Technical Call | • Static hardcoded seat counter: "Current Cohort Status: 12/100 Seats Filled" | High |
| `/customer-support` | Support Desk | • Dummy form: `setTimeout(1500)` + `alert()`, discarding user messages<br>• "120-minute response SLA" unverified<br>• Fluff jargon: "Support Uplink", "Technical Transmission" | **Critical** |
| `/about` | About & Mission | • Artificial scarcity: "We restrict our client cohort..."<br>• Developer comment: "AI-generated headshot" placeholder | Low |
| `/contact` | Corporate Office | • Phrasing claims "Johannesburg engineering desk" with multiple departmental routing buttons leading to dummy forms | Low |
| `/security` | Security Architecture | • "Military-Grade Security" buzzword<br>• "99.9% Uptime Target" without status page or proof<br>• Mentions "Consent-Led Digital Receptionist" | Medium |
| `/privacy-policy` | Privacy Policy | • Distinguishes between juristic vs natural data, but does not disclose that document download clicks immediately store personal names and phone numbers | High |
| `/terms-of-service` | Terms of Service | • References outdated "Founding Member rate (R120,000/yr)" contradicting `/pricing`<br>• Strict no-refund / 90-day sprint lock-in contradicts "14-day free trial" | High |
| `/cookies-policy` | Cookies Policy | • Classifies aura.js tracker cookie with "1 Year" lifespan while marketing claims no tracking cookies are dropped | Medium |
| `/popia-manual` | PAIA & POPIA Manual | • Standard statutory disclosure, generally compliant | Clean |
| `/disclaimer` | Professional Disclaimer | • Explicitly disclaims all outcome guarantees, resolution accuracy, and legal compliance, undermining marketing claims on `/pricing` and `/customers` | High |
| `/license` | Software License | • References "365-day cycle" contradicting monthly retainer options on `/pricing` | Medium |
| `/thank-you` | Thank You Page | • Artificial cohort vetting and simulated "Jump the Queue" sharing mechanic | Medium |
| `/checkout/[session_id]` | Dynamic Checkout | • Artificial 24h countdown timer<br>• "Cancel online anytime" contradicts Terms of Service | High |
| `/blog` | Blog Index | • Claims publications are "peer-reviewed technical blueprints"<br>• Dummy newsletter form that never submits | Medium |
| `/blog/industrial-...` | Playbook 2026 | • Fabricated benchmark of 150 B2B websites with exact unverifiable metrics<br>• Uses real mining company name (Impala Platinum) in fake alert | High |
| `/blog/generative-...` | GEO vs SEO | • Fabricated benchmark of 500 prompts with unverified "4.8x" and "78% vs 6%" statistics | High |
| `/blog/de-anonymizing-...` | POPIA De-Anonymization | • Unverified "92% resolution accuracy" claim<br>• Promises HubSpot/Salesforce sync that does not exist in backend | High |
| `/aurahq` | Authenticated Dashboard | • Overview displays TailAdmin dummy e-commerce data ($20K revenue, 3,782 customers, USA/France demographics)<br>• Prices displayed in USD instead of ZAR | High |
| `/aurahq/(ui-elements)` | UI Component Pages | • 10+ pages with leftover "TailAdmin - Next.js Dashboard Template" metadata in production | Medium |

---

## 10. Prioritized Remediation Recommendations

### Priority 1: Fix High-Risk Deceptive Claims & Dead Forms (Immediate)
1. **Wire up or replace the dummy forms:**
   * Connect `/customer-support` form to `POST /api/v1/support/ticket` or route directly to `mailto:support@auraworks.co.za` so customer messages are not lost.
   * Wire the Blog Newsletter and Footer Newsletter forms to an active newsletter endpoint (e.g., Resend audience) or replace with a direct contact link.
2. **Remove or caveat fabricated benchmark studies:**
   * Either publish the underlying dataset/methodology for the "150 B2B websites audit" and "500 generative prompts benchmark", or rephrase them clearly as illustrative industry models rather than empirical scientific studies.
3. **Disclose simulated alerts:**
   * Add a clear note (*"Simulated example for demonstration purposes"*) to the Impala Platinum alert in the blog post to avoid trademark or misrepresentation disputes.

### Priority 2: Commercial Alignment & Contract Consistency (Within 48h)
1. **Synchronize pricing terms:**
   * Update `/terms-of-service` and root `layout.jsx` to reflect the active pricing tiers (R10,000 / R18,500 / R32,000) instead of the legacy R120,000 founding member rate.
   * Align cancellation policies: clarify whether the 14-day trial applies to retainers or if retainers require the 90-day sprint and 60-day notice.
2. **Remove non-existent integrations from `/pricing`:**
   * Remove references to Snowflake, BigQuery, AWS S3 data lake streaming, and direct Salesforce/HubSpot bidirectional sync until dedicated API adapters are implemented. Label them as *"Custom Webhook Push (CRM / ERP Compatible)"*.
   * Remove Creamer Media / Bizcommunity trade media syndication deliverables unless contractual agreements are actively in place.

### Priority 3: Remove Placeholders & TailAdmin Artifacts (Within 1 Week)
1. **Replace UI placeholders:**
   * Design and render actual architecture SVGs for `[ Discoverability & Conversion Schema ]` on `/features` and the 3 `[ Vertical Intent Dashboard ]` placeholders on `/solution`.
2. **Clean up AuraHQ overview:**
   * Replace the TailAdmin e-commerce widgets (`EcommerceMetrics`, `MonthlyTarget`, `RecentOrders`, `DemographicCard`) with real industrial telemetry cards connected to the `/api/v1/leads` and `/api/v1/sales/metrics` APIs.
3. **Fix page metadata:**
   * Remove all references to "TailAdmin" from titles and descriptions across the 10+ dashboard component pages.

### Priority 4: Soften Fluff & Artificial Scarcity (Polishing)
1. **Remove hardcoded scarcity text:**
   * Remove `"12/100 Seats Filled"` on `/book-call` or bind it to a live query counting registered clients.
   * Replace sci-fi jargon like `"Support Uplink"` and `"Open Technical Transmission"` with professional executive advisory terminology.
