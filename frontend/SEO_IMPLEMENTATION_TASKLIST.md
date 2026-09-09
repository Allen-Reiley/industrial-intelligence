# AuraWorks — SEO Implementation Master Tasklist

This document provides a step-by-step execution tracking sheet for all technical SEO repairs, new landing pages, metadata deduplication, and crawl optimizations.

---

## Phase 1: Documentation & Discovery
- [x] **1.1 Live Data Extraction via Google Search Console**
  - Queried query volume, CTR, impressions, and positions.
  - Confirmed brand concentration and 0 non-brand commercial impression footprint.
- [x] **1.2 Market & Keyword Research via OpenSEO**
  - Evaluated South Africa DataForSEO market `2710/en`.
  - Identified high-intent targets: `b2b lead generation south africa`, `sales intelligence`, `b2b lead generation company`, `website visitor tracking`.
  - Queried live SERP competitors in South Africa (`shiftone.co.za`, `growthpulsemedia.co.za`, `megaleads.co.za`).
- [x] **1.3 SEO Audit & Strategy Document**
  - Authored comprehensive audit in `frontend/SEO_AUDIT_AND_STRATEGY.md`.
- [x] **1.4 Step-by-Step Tasklist Documentation**
  - Created execution tracker in `frontend/SEO_IMPLEMENTATION_TASKLIST.md`.

---

## Phase 2: Missing Route Infrastructure & "Coming Soon" Pages
- [x] **2.1 Build `/blog` Coming Soon Page**
  - Path: `frontend/src/app/(pages)/blog/page.tsx`
  - High-converting industrial aesthetic with editorial roadmap topics (POPIA compliance in B2B, Spec-sheet intent modeling, Unmasking mining/manufacturing buyer journeys).
  - VIP intelligence briefing notification form via client component.
  - Full metadata, unique canonical (`/blog`), Open Graph, and Twitter cards.
- [x] **2.2 Build `/customers` Coming Soon Page**
  - Path: `frontend/src/app/(pages)/customers/page.tsx`
  - Industrial customer case studies preview (Mining equipment suppliers, industrial valves, bulk logistics).
  - Full metadata, unique canonical (`/customers`), Open Graph, and Twitter cards.
- [x] **2.3 Build `/contact` Alias Route**
  - Path: `frontend/src/app/(pages)/contact/page.tsx`
  - Eliminates 404s from external referrers or sitemaps, providing direct access to technical and commercial sales desks.
- [x] **2.4 Convert Orphaned `403.tsx` and `500.tsx` to Proper App Router Routes**
  - Paths: `frontend/src/app/(pages)/403/page.tsx` and `frontend/src/app/(pages)/500/page.tsx`
  - Configured `robots: { index: false, follow: false }` to protect crawl budget.
  - Removed orphaned root `403.tsx` and `500.tsx`.

---

## Phase 3: Core Technical SEO & Crawl Architecture
- [x] **3.1 Global Canonical Tag Cascade Repair**
  - File: `frontend/src/app/layout.jsx`
  - Removed hardcoded root `canonical: "https://auraworks.co.za"` so child routes don't mark themselves as duplicates of the homepage.
  - Preserved `metadataBase: new URL("https://auraworks.co.za")`.
- [x] **3.2 Subpage Canonical & Metadata Harmonization**
  - Set explicit canonical paths on all pages:
    - `/` (canonical: `'/'`)
    - `/about` (canonical: `'/about'`)
    - `/features` (canonical: `'/features'`)
    - `/solution` (canonical: `'/solution'`)
    - `/pricing` (canonical: `'/pricing'`)
    - `/book-demo` (canonical: `'/book-demo'`)
    - `/book-call` (canonical: `'/book-call'`)
    - `/customer-support` (canonical: `'/customer-support'`)
    - `/vsl` (canonical: `'/vsl'`)
    - `/blog` (canonical: `'/blog'`)
    - `/customers` (canonical: `'/customers'`)
    - `/contact` (canonical: `'/contact'`)
    - Legal pages: `/privacy-policy`, `/terms-of-service`, `/popia-manual`, `/cookies-policy`, `/security`, `/disclaimer`, `/license`.
    - Protected pages: `/thank-you`, `/aurahq/admin`, `/aurahq/dashboard`, `/403`, `/500` set to `noindex, nofollow`.
- [x] **3.3 Deduplicate Title Tags**
  - Stripped redundant `| AuraWorks` and `— AuraWorks` from child page titles to eliminate double branding emitted by `template: "%s | AuraWorks"`.
  - Enforced absolute title on homepage `app/page.tsx`.
- [x] **3.4 Comprehensive Sitemap Regeneration**
  - File: `frontend/src/app/sitemap.ts`
  - Removed all broken 404 routes (`/blog` previously missing, `/contact`, `/support`).
  - Added all 19 live static routes with accurate priorities (1.0 for home, 0.9 for solution/features/pricing, 0.8 for about/demo/blog/customers, 0.7 for contact/support/vsl, 0.5 for legal).
- [x] **3.5 Robots.txt Rule Realignment**
  - File: `frontend/src/app/robots.ts`
  - Disallowed `/aurahq/` (the true route for admin & dashboard), `/api/`, `/checkout`, `/thank-you`, `/403`, `/500`, `/admin/`, `/dashboard/`, `/private/`.

---

## Phase 4: Server-Side Rendering, Accessibility & Semantic Content
- [x] **4.1 Remove SSR-Hiding Gate on Pricing Component**
  - File: `frontend/src/components/pricing/pricing.tsx`
  - Removed `if (!hasMounted) return <div className="sr-only">...</div>;` so Googlebot receives full pricing tables during raw HTML fetch.
  - Inserted semantic `<h1>` tag: "Deploy Your Industrial Sales Engine".
- [x] **4.2 Eliminate Nested `<main>` Landmark on Homepage**
  - File: `frontend/src/components/hero-sec/hero-section.tsx`
  - Converted inner `<main className="overflow-hidden">` to a semantic `<div className="overflow-hidden">`.
- [x] **4.3 Upgrade Image Alt Tags with Target Keywords**
  - File: `frontend/src/components/content/content-1.tsx` (updated alt text to describe B2B industrial visitor telemetry).
  - File: `frontend/src/components/content/content-2.tsx` (updated alt text to describe sales intelligence pipeline analytics).
- [x] **4.4 Inject Schema.org JSON-LD Structured Data**
  - File: `frontend/src/app/layout.jsx`
  - Added rich `Organization`, `WebSite`, and `SoftwareApplication` structured data graphs.
- [x] **4.5 Fix Core Web Vitals Font Variables & Script Strategy**
  - File: `frontend/src/app/layout.jsx`
  - Injected `${geistSans.variable} ${geistMono.variable}` into `<html>` and set `font-sans` on `<body>`.
  - Migrated edge tracking script to Next.js `<Script strategy="afterInteractive" />`.

---

## Phase 5: Navigation & Internal Linking Cleanup
- [x] **5.1 Clean Footer Boilerplate Links**
  - File: `frontend/src/components/footer/footer.tsx`
  - Replaced generic template links ("Students", "Freelancers", empty `#` anchors) with high-value vertical industry anchors (Mining, Manufacturing, Logistics, Spec-Sheet Tracking).
  - Connected "Blog" to `/blog`, "Customer Proof" to `/customers`, "Contact Office" to `/contact`, and "Customer Support" to `/customer-support`.
  - Added valid company social links and company geographic metadata.

---

## Phase 6: Build Verification, Testing & Git Deployment
- [x] **6.1 Verify Frontend Build & TypeScript Checks**
  - Executed `npm run build` in `frontend/src`: 31/31 routes successfully prerendered as static content.
- [x] **6.2 Execute Test Suite**
  - Executed `npm test` in `frontend/src`: 6/6 test suites passed (28/28 tests).
- [x] **6.3 Git Commit & Push to Origin**
  - Staged, committed, and pushed changes to `main`.
