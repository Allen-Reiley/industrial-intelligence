# AuraWorks — Comprehensive SEO Audit, Search Intelligence & Optimization Strategy

**Target Domain:** `https://auraworks.co.za`  
**Market:** South Africa (DataForSEO Location Code: `2710` / `en`)  
**Audience:** B2B Heavy Industries (Mining, Mineral Processing, Heavy Manufacturing, Engineering, Bulk Logistics)  
**Document Location:** `frontend/SEO_AUDIT_AND_STRATEGY.md`  

---

## 1. Executive Summary & Current Health Score

AuraWorks provides B2B sales intelligence and identity resolution for South African industrial firms, converting anonymous website visitors into verified corporate leads while maintaining strict POPIA compliance.

While the brand messaging and visual aesthetics are enterprise-grade, an in-depth audit of the repository reveals **critical technical SEO bottlenecks** that severely restrict organic discoverability, indexation, and ranking potential.

| Assessment Pillar | Rating | Primary Root Cause |
| :--- | :---: | :--- |
| **Indexation & Canonicalization** | 🚨 Critical | Hardcoded root canonical tag inherited by all child pages; robots.txt misaligned with route paths. |
| **Sitemap Integrity** | 🚨 Critical | Sitemap submits 404 URLs (`/blog`, `/contact`, `/support`) and omits 80% of actual pages. |
| **Crawlability & Rendering** | ⚠️ Severe | `/pricing` hides all markup during SSR behind a client-mount gate; nested `<main>` tags. |
| **SERP Impression Footprint** | ⚠️ Low | 100% of current impressions are branded searches; zero non-branded industry queries rank. |
| **On-Page & Social Metadata** | ⚠️ Needs Fix | Title template produces duplicate branding (`... | AuraWorks | AuraWorks`); missing subpage OG cards. |
| **Structured Data (Schema.org)** | ❌ Missing | 0% JSON-LD structured data implemented across the application. |
| **Domain Authority & Backlinks** | ⚠️ Nascent | Clean slate domain with no toxic links, but zero external industrial citations. |

---

## 2. Google Search Console & OpenSEO Intelligence

### 2.1. Live Google Search Console Performance Data (Last 90 Days)
Data queried directly via Google Search Console API:

| Query | Impressions | Clicks | CTR | Average Position |
| :--- | :---: | :---: | :---: | :---: |
| `auraworks` | 39 | 6 | 15.38% | 2.79 |
| `aura works` | 6 | 0 | 0.00% | 40.33 |
| `aurawork` | 1 | 0 | 0.00% | 8.00 |

#### GSC Analysis:
* **Branded Monopoly:** The site receives impressions **only** for brand variations.
* **Non-Branded Invisibility:** The site currently has **zero impressions** for any non-branded commercial queries (such as *"b2b lead generation south africa"*, *"sales intelligence tools"*, or *"visitor identification south africa"*).
* **Click-Through Health:** When users search directly for `auraworks`, CTR is strong at 15.4% at rank ~2.8.

---

### 2.2. OpenSEO South African Market Keyword Research
Data queried via OpenSEO (DataForSEO Market: `2710/en` — South Africa):

| Keyword Target | Monthly Volume (ZA) | Search Intent | CPC (USD) | Competition Index | Priority |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `b2b lead generation south africa` | 40 | Commercial | $4.25 | 0.58 | 🔥 High |
| `b2b lead generation` | 50 | Commercial | $3.11 | 0.39 | 🔥 High |
| `b2b lead generation company` | 10 | Commercial | $4.11 | 0.19 | 🔥 High |
| `lead generation companies b2b` | 10 | Commercial | $4.11 | 0.19 | Medium |
| `sales intelligence` | 10 | Commercial | $3.67 | 0.24 | 🔥 High |
| `b2b sales intelligence platform` | 10 | Commercial | — | 0.86 | Medium |
| `website visitor tracking` | 10 | Informational/Comm. | — | 0.52 | 🔥 High |
| `website visitor tracking tools` | 10 | Commercial | — | 0.86 | Medium |
| `b2b lead generation software` | 10 | Commercial | — | 0.71 | Medium |
| `free website visitor tracking` | 10 | Commercial | $7.37 | 0.71 | Informational hook |

#### Key Market Insights:
1. **High CPC values ($3.11 – $4.25)** confirm high willingness-to-pay and strong buyer intent in the South African corporate market.
2. Low search volume (10–50/mo) in South Africa represents **high-ticket enterprise search behavior**. Each lead in heavy industry is worth hundreds of thousands of Rands; ranking in the top 3 for these exact keywords is transformative.
3. Competition index for `b2b lead generation company` is low (0.19), presenting an immediate ranking opportunity with optimized on-page targeting.

---

### 2.3. Top Organic SERP Competitors in South Africa
Live Google SERP crawl for query: `b2b lead generation south africa`:

1. `shiftone.co.za` — Award-Winning Lead Generation Agency (`/lead-generation/`)
2. `growthpulsemedia.co.za` — Best B2B Lead Generation Agency South Africa (`/b2b-lead-generation-south-africa/`)
3. `outsourceaccelerator.com` — Top 15 Lead Gen Companies in South Africa Guide
4. `megaleads.co.za` — B2B Lead Generation Services in South Africa
5. `capterra.co.za` — Lead Generation Software Directory
6. `database360.co.za` — Corporate Data Lists South Africa | B2B Data
7. `welcome.hangar49.com` — South Africa - B2B Lead Generation Agency
8. `blds.co.za` — Blue Label Data Solutions

#### Competitive Advantage for AuraWorks:
All current top-ranking competitors are either **generic marketing agencies** (Shift One, Growth Pulse), **directory scrapers** (MegaLeads, Database360), or **call center outsourcers**.  
**None** offer autonomous **IP-level Juristic Identity Resolution + Spec-Sheet Telemetry for Heavy Industry**. AuraWorks has a unique, defensible positioning that will capture high-intent buyers looking for modern software rather than outsourced cold callers.

---

## 3. Deep-Dive Audit of Technical SEO Issues

### 3.1. Canonical URL Cascade Bug (High Severity)
* **File:** `frontend/src/app/layout.jsx`
* **Issue:** Root metadata contains:
  ```javascript
  alternates: {
    canonical: "https://auraworks.co.za",
  }
  ```
* **Consequence:** In Next.js App Router, child routes inherit parent metadata properties that are not overridden. Because child pages (`/about`, `/features`, `/solution`, `/pricing`, etc.) do not specify `alternates`, Next.js injects `<link rel="canonical" href="https://auraworks.co.za" />` onto every page.
* **Fix:** Remove root-level static canonical string. Specify relative or dynamic canonicals per page (e.g. `alternates: { canonical: '/solution' }`).

---

### 3.2. Sitemap Errors & Omissions (High Severity)
* **File:** `frontend/src/app/sitemap.ts`
* **Issues:**
  1. **Submitting 404 errors:**
     * `https://auraworks.co.za/blog` (Returns 404)
     * `https://auraworks.co.za/contact` (Returns 404; route is `/customer-support`)
     * `https://auraworks.co.za/support` (Returns 404; route is `/customer-support`)
  2. **Omitting core commercial pages:**
     * `/features`
     * `/solution`
     * `/pricing`
     * `/book-demo`
     * `/book-call`
     * `/vsl`
  3. **Omitting legal & trust pages:**
     * `/privacy-policy`, `/terms-of-service`, `/popia-manual`, `/cookies-policy`, `/security`, `/disclaimer`, `/license`
* **Fix:** Complete rewrite of `sitemap.ts` with all legitimate routes, correct priorities, and dynamic timestamps.

---

### 3.3. `robots.ts` Configuration Bug (Medium Severity)
* **File:** `frontend/src/app/robots.ts`
* **Issue:** Disallows `/admin/` and `/dashboard/`. In Next.js App Router, these routes do not exist as top-level paths; they are located under `/aurahq/admin` and `/aurahq/dashboard`.
* **Consequence:** Private management routes under `/aurahq/*` are not blocked in robots.txt.
* **Fix:** Update `disallow` array to include `['/aurahq/', '/api/', '/checkout', '/thank-you', '/403', '/500']`.

---

### 3.4. SSR Blocking on `/pricing` (High Severity)
* **File:** `frontend/src/components/pricing/pricing.tsx`
* **Issue:**
  ```tsx
  if (!hasMounted) {
      return <div className="sr-only">AuraWorks Pricing - R120k/yr Annual Engine</div>;
  }
  ```
* **Consequence:** Googlebot receives an empty container during initial HTML download. The pricing table, tier descriptions, FAQ, and feature comparisons are never parsed or indexed on standard crawls.
* **Fix:** Remove the client mount blocker; allow static server rendering of the pricing grid. Add an `<h1>` heading to establish semantic hierarchy.

---

### 3.5. Title Tag Duplication Bug (Medium Severity)
* **File:** `frontend/src/app/layout.jsx` and individual pages
* **Issue:** Layout sets `template: "%s | AuraWorks"`. Subpages define titles like `AuraWorks | Our Mission & Engineering DNA`.
* **Rendered Output:** `AuraWorks | Our Mission & Engineering DNA | AuraWorks` (double brand suffix).
* **Fix:** Strip `AuraWorks | ` or ` — AuraWorks` from subpage titles so the template cleanly appends the brand name once. On `app/page.tsx`, use `title: { absolute: "..." }`.

---

### 3.6. Missing Structured Data (JSON-LD)
* **Status:** 0% implementation across the repository.
* **Fix:** Inject rich JSON-LD into root layout:
  * `Organization` with South African locality, official URL, founder, and contact.
  * `WebSite` schema with description and audience.
  * `SoftwareApplication` schema for the identity resolution software.

---

### 3.7. Semantic HTML & Image Alt Accessibility
* **Nested Landmark Bug:** `app/page.tsx` wraps `<HeroSection>` in `<main>`, but `HeroSection` also renders `<main className="overflow-hidden">`. Having multiple active `<main>` tags violates HTML5 standards.
* **Placeholder Alt Tags:** Images in `content-1.tsx` and `content-2.tsx` use `alt="payments illustration light"`, which is irrelevant to industrial sales intelligence.
* **Fix:** Convert `HeroSection` container to a `<section>`, and update image alt tags with descriptive keywords.

---

### 3.8. Core Web Vitals & Font Optimization
* **Font CSS Variables:** `Geist` and `Geist_Mono` define `--font-geist-sans` and `--font-geist-mono` in `layout.jsx`, but the variables are never attached to `<html>` or `<body>`. This causes fallback to system fonts and risks Cumulative Layout Shift (CLS).
* **Script Loading:** Script tag `<script src="https://cdn.auraworks.co.za/aura.js" ...>` should use Next.js `<Script strategy="afterInteractive" />`.

---

## 4. Strategic Content & Keyword Architecture Plan

### 4.1. Core Page Focus Matrix

| Route | Primary Keyword Focus | Secondary / LSI Keywords | Search Intent |
| :--- | :--- | :--- | :--- |
| `/` | Industrial Sales Intelligence | B2B Lead Generation South Africa, Identity Resolution | Commercial |
| `/solution` | Industrial Sales Intelligence & B2B Solutions | Mining Sector Leads, Manufacturing Sales Automation, Bulk Logistics | Commercial / Solution |
| `/features` | B2B Identity Resolution & Spec-Sheet Tracking | Anonymous Visitor Identification, Spec-Sheet Intent, Corporate Filtering | Commercial / Feature |
| `/pricing` | Industrial Lead Generation Pricing | B2B Sales Intelligence Cost, Enterprise SLA, ROI | Transactional |
| `/about` | Industrial Sales Systems Architecture | South African Tech Founders, Engineering DNA, Reitumetse Sethabela | Informational / Nav |
| `/blog` | B2B Lead Generation Insights & Industry Trends | Industrial Marketing Strategy, POPIA B2B Compliance Guides | Informational |
| `/customers` | Industrial Intelligence Case Studies | Manufacturing Lead Conversion, Mining Spec Downloads | Social Proof |
| `/customer-support` | AuraWorks Support & Integration Desk | Tracking Script Setup, CRM Webhook Integration | Support |

---

## 5. Summary of Deliverables & Action Items

1. **Step-by-step Tasklist File:** Documented in `frontend/SEO_IMPLEMENTATION_TASKLIST.md`.
2. **Technical SEO Fixes:**
   * Canonical URL per-page repair.
   * Sitemap regeneration with 100% valid URLs and correct priorities.
   * `robots.ts` security and crawl restriction update.
   * Server-side rendering restoration for `/pricing`.
   * Removal of double-branding titles.
   * Nested `<main>` fix on homepage.
   * Descriptive image alt tags.
   * Font variable injection on `<body>`.
3. **Coming Soon Pages Added:**
   * `/blog` (Editorial pipeline and newsletter registration).
   * `/customers` (Industrial case studies coming soon).
   * `/contact` (Seamless routing to support desk).
   * Proper 403 and 500 error pages.
4. **Structured Data Added:**
   * Valid JSON-LD for Organization, WebSite, and SoftwareApplication.
5. **Git Commit & Push:**
   * Fully verified build pushed to repository.
