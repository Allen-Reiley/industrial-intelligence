# **AuraWorks (auraworks.co.za) | Master SEO & GEO Engineering Implementation Blueprint**

---

**Repository Target:** Next.js on Vercel App Router Architecture | **Telemetry Source:** OpenSEO Audit, Google Search Console (API verified), DataForSEO Location 2710 (South Africa) | **Automation Execution Target:** Antigravity CLI

**ANTIGRAVITY CLI DIRECTIVE:** This document serves as the formal instruction and specification manual for refactoring the AuraWorks digital platform. Execute all file modifications, schema injections, routing configurations, and copy updates strictly in accordance with the specifications below.

## **1\. Executive Summary & Diagnostic Baseline**

---

The comprehensive audit of https://www.auraworks.co.za/ identified a world-class underlying technical stack (Next.js serverless edge rendering on Vercel, TTFB of \~297ms, edge cache HIT, and open AI crawler access for GPTBot, ClaudeBot, and PerplexityBot) undermined by severe canonical routing defects, metadata truncation, thin conversion content, and uncaptured non-branded search demand.

| Audit Dimension | Current Health Score | Diagnostic Finding | Strategic Impact &nbsp; |
| :---- | :---- | :---- | :---- |
| **Technical Engine & Routing** | 52% | 19 naked URLs in sitemap.xml emit 307 Temporary Redirects to www.auraworks.co.za. | Dilutes PageRank link equity, bloats bot crawl budgets, and delays Google indexation. |
| **On-Page & SERP Display** | 60% | 7 page titles exceed pixel width (65-74 chars); 6 meta descriptions exceed 160 chars. | Triggers SERP ellipsis truncation on mobile and desktop, depressing search CTR. |
| **Topical Depth & Commercial Intent** | 42% | /pricing has \~184 words; /blog has \~287 words; zero non-branded rankings. | Search algorithms classify core commercial conversion paths as thin content. |
| **Schema Graph & Knowledge Base** | 55% | Organization schema points to naked domain; missing Service and FAQPage schemas. | Generative engines (Perplexity, ChatGPT Search, Gemini) fail to extract entity citation nodes. |
| **AI / GEO Ingestion Readiness** | 88% | Robots.txt explicitly allows AI crawlers; lacks semantic Knowledge Graph linking. | Crawlers can parse the site, but lack structured semantic answers and definitive statistical benchmarks. |

## **2\. Complete Technical Remediation & Next.js Implementation Specs**

### ---

**2.1. Canonical URL & 301 Permanent Redirect Resolution**

**Problem:** Vercel edge routing currently issues HTTP 307 Temporary Redirects from naked domain URLs to www.auraworks.co.za. Furthermore, the XML sitemap crawler references naked domain URLs.

**Implementation Rule:** All canonical links, OpenGraph tags, sitemaps, and HTTP redirects must resolve permanently via 301 to https://www.auraworks.co.za.

**File to Modify:** vercel.json or next.config.mjs

// In next.config.mjs  
/\*\* @type {import('next').NextConfig} \*/  
const nextConfig \= {  
  async redirects() {  
    return \[  
      {  
        source: '/:path\*',  
        has: \[{ type: 'host', value: 'auraworks.co.za' }\],  
        destination: 'https://www.auraworks.co.za/:path\*',  
        permanent: true, // Emits HTTP 301 Permanent Redirect  
      },  
    \];  
  },  
};

export default nextConfig;

**File to Modify:** app/sitemap.ts

import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {  
  const baseUrl \= 'https://www.auraworks.co.za';  
  const routes \= \[  
    '',  
    '/solution',  
    '/features',  
    '/pricing',  
    '/about',  
    '/customers',  
    '/blog',  
    '/popia',  
    '/privacy',  
    '/terms',  
  \];

  return routes.map((route) \=\> ({  
    url: \`${baseUrl}${route}\`,  
    lastModified: new Date(),  
    changeFrequency: route \=== '' || route \=== '/blog' ? 'weekly' : 'monthly',  
    priority: route \=== '' ? 1.0 : route \=== '/solution' || route \=== '/pricing' ? 0.9 : 0.7,  
  }));  
}

### **2.2. Standardized Robots Policy for Search & Generative AI**

**File to Modify:** app/robots.ts

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {  
  return {  
    rules: \[  
      {  
        userAgent: '\*',  
        allow: '/',  
        disallow: \['/api/', '/admin/'\],  
      },  
      {  
        userAgent: \['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Amazonbot'\],  
        allow: '/',  
      },  
    \],  
    sitemap: 'https://www.auraworks.co.za/sitemap.xml',  
    host: 'https://www.auraworks.co.za',  
  };  
}

## **3\. On-Page Metadata & SERP Display Overhaul**

---

All title tags must remain between 45 and 58 characters (max 580px limit). Meta descriptions must stay strictly between 135 and 150 characters, front-loading high-intent commercial keywords and an active hero statement.

| Route | Target Primary Keyword | Optimized Title Tag (\<60 chars) | Optimized Meta Description (135–150 chars) &nbsp; |
| :---- | :---- | :---- | :---- |
| / (Home) | B2B SEO & Lead Intelligence | B2B SEO, GEO & Lead Intelligence | AuraWorks | Rank \#1 on Google and get cited in AI search. AuraWorks de-anonymizes anonymous B2B website visitors for South African industry. |
| /solution | B2B Lead Generation South Africa | B2B Search & Lead Intelligence Solution | AuraWorks | Convert anonymous corporate website visitors into qualified pipeline with POPIA-compliant forensic sales intelligence. Request a demo. |
| /features | B2B Visitor Identification | B2B Industrial Features & Visitor Tracking | AuraWorks | Explore aura.js de-anonymization, sub-second Next.js edge performance, and dual-channel Google and LLM search optimization. |
| /pricing | SEO Packages South Africa | B2B SEO & Lead Intelligence Pricing | AuraWorks | Predictable flat-rate B2B discoverability packages. Turnkey Next.js web platforms, technical SEO, and real-time visitor intelligence. |
| /about | Industrial Marketing Johannesburg | About AuraWorks | Industrial Sales Intelligence | Headquartered in Gauteng, AuraWorks engineers high-performance web systems and Generative Engine Optimization for SADC enterprises. |
| /customers | B2B Marketing Case Studies | Client Case Studies & Pipeline Results | AuraWorks | See how South African engineering, mining, and industrial suppliers unlock 4.8x enterprise pipeline with AuraWorks discoverability. |
| /blog | Industrial SEO & GEO Insights | Industrial Discoverability & GEO Insights | AuraWorks | Actionable guides on Generative Engine Optimization, POPIA-compliant IP tracking, and heavy industry technical search dominance. |

## **4\. Semantic Architecture, Schema Graphs & GEO Optimization**

### ---

**4.1. Master Knowledge Graph Organization Schema**

Inject the following unified schema into app/layout.tsx or dedicated JSON-LD script component:

{  
  "@context": "https://schema.org",  
  "@graph": \[  
    {  
      "@type": "Organization",  
      "@id": "https://www.auraworks.co.za/\#organization",  
      "name": "AuraWorks (Pty) Ltd",  
      "alternateName": "AuraWorks",  
      "url": "https://www.auraworks.co.za",  
      "logo": "https://www.auraworks.co.za/images/logo.png",  
      "founder": {  
        "@type": "Person",  
        "@id": "https://www.auraworks.co.za/\#founder",  
        "name": "Reitumetse Sethabela",  
        "jobTitle": "Founder & Managing Director"  
      },  
      "areaServed": \[  
        {  
          "@type": "Country",  
          "name": "South Africa"  
        },  
        {  
          "@type": "AdministrativeArea",  
          "name": "SADC Region"  
        }  
      \],  
      "address": {  
        "@type": "PostalAddress",  
        "addressLocality": "Johannesburg",  
        "addressRegion": "Gauteng",  
        "addressCountry": "ZA"  
      },  
      "knowsAbout": \[  
        "B2B SEO",  
        "Generative Engine Optimization (GEO)",  
        "Visitor De-anonymization",  
        "POPIA Compliance",  
        "Industrial Sales Intelligence",  
        "Next.js Web Architecture"  
      \],  
      "sameAs": \[  
        "https://www.linkedin.com/company/auraworks",  
        "https://github.com/auraworks"  
      \]  
    },  
    {  
      "@type": "WebSite",  
      "@id": "https://www.auraworks.co.za/\#website",  
      "url": "https://www.auraworks.co.za",  
      "name": "AuraWorks",  
      "publisher": {  
        "@id": "https://www.auraworks.co.za/\#organization"  
      }  
    }  
  \]  
}

### **4.2. Conversational FAQPage Schema for AI Overviews & Perplexity**

Add to app/solution/page.tsx and app/features/page.tsx:

{  
  "@context": "https://schema.org",  
  "@type": "FAQPage",  
  "mainEntity": \[  
    {  
      "@type": "Question",  
      "name": "How does aura.js identify website visitors without violating POPIA?",  
      "acceptedAnswer": {  
        "@type": "Answer",  
        "text": "aura.js operates on juristic-first entity resolution, mapping IP telemetry and deterministic canvas parameters against South African commercial network registries. It resolves corporate and juristic entities rather than individual natural personal data, adhering strictly to Chapter 3 of the Protection of Personal Information Act (POPIA) with server-side AES-256 encryption."  
      }  
    },  
    {  
      "@type": "Question",  
      "name": "What is Generative Engine Optimization (GEO) and why is it essential for heavy industry?",  
      "acceptedAnswer": {  
        "@type": "Answer",  
        "text": "Generative Engine Optimization (GEO) structures digital architecture, schema graphs, and empirical industry benchmarks so AI engines such as ChatGPT Search, Perplexity, and Google AI Overviews cite your company as the authoritative solution when enterprise procurement teams prompt for industrial suppliers."  
      }  
    },  
    {  
      "@type": "Question",  
      "name": "How fast does AuraWorks upgrade legacy industrial websites to Next.js?",  
      "acceptedAnswer": {  
        "@type": "Answer",  
        "text": "AuraWorks refactors legacy WordPress, PHP, or static corporate websites into high-performance Next.js edge-rendered platforms within 14 to 21 business days, ensuring 100% Core Web Vitals compliance, sub-300ms latency, and pre-integrated visitor intelligence."  
      }  
    }  
  \]  
}

## **5\. Content Depth & Thin Page Remediation**

### ---

**5.1. /pricing Expansion Specification (Target: 950+ Words)**

> * **Structure:** Replace the 184-word brief tier table with a complete Three-Tier Enterprise Retainer Architecture:  
  * **Growth Foundation:** R10,000 / month (Next.js Platform \+ Technical SEO Baseline \+ Basic aura.js Lead Capture).  
  * **Industrial Category Leader:** R18,500 / month (Full SERP Dominance \+ Active Generative Engine Optimization \+ Uncapped Forensic Lead Resolution \+ CRM Webhooks).  
  * **Enterprise SADC Corridor:** R32,000 / month (Multi-region SADC targeting \+ Dedicated PR Syndication \+ Custom Data Lake integration).  
> * **Feature Comparison Matrix:** Detailed HTML table covering SLA, Core Web Vitals guarantees, number of tracked high-intent keywords, and real-time push alerting (Slack/Email/SMS).  
> * **Interactive ROI Calculator:** Input monthly site visitors, average B2B deal size (e.g., R120,000), and calculate pipeline unlocked via 12% corporate de-anonymization.  
> * **Embedded FAQ:** Six commercial questions addressing contract terms, POPIA indemnity, and onboarding SLAs.

### **5.2. /blog Cornerstone Content Production (Target: 3 Pillar Guides)**

| Pillar Guide Title | Target Primary Keyword | Length | Key Structural Requirements &nbsp; |
| :---- | :---- | :---- | :---- |
| The 2026 Industrial Discoverability Playbook: Dominating Search, AI & Procurement in SADC | industrial marketing south africa (Vol 20, KD 12\) | 2,400 words | Includes original diagrams of the SADC procurement funnel, Core Web Vitals benchmarks for JSE industrial firms, and Next.js performance data. |
| De-Anonymizing B2B Website Traffic: The Technical & POPIA Compliance Architecture | b2b lead generation south africa (Vol 30, KD 20\) | 1,850 words | Detailed explanation of juristic vs. personal data, deterministic ISP filtering, and real-time sales alert routing. |
| Generative Engine Optimization (GEO) vs SEO: How AI Overviews Are Changing B2B Sales | b2b marketing agency south africa (Vol 10, KD 15\) | 2,100 words | Defines citation probability, knowledge graph entity linking, and empirical testing across ChatGPT Search, Perplexity, and Gemini. |

## **6\. Local Gauteng & SADC Authority Acquisition Blueprint**

> * ---

>   **Google Business Profile (GBP) Creation:**  
  * Claim listing for AuraWorks in Johannesburg / East Rand, Gauteng.  
  * Primary Category: *Marketing Agency*; Secondary Category: *Website Designer* & *Software Company*.  
  * Target local high-volume queries: seo agency johannesburg (720 Vol, KD 2, R90 CPC) and seo company johannesburg (720 Vol, KD 5).  
> * **High-Authority SA Trade Media Syndication:**  
  * **Creamer Media (Engineering News & Mining Weekly):** Sponsor technical thought-leadership features on industrial discoverability (\~R6,000 \- R12,500/placement).  
  * **Bizcommunity (Marketing & Tech):** Deploy corporate press releases for instant trusted news citations and do-follow backlinks (R1,815/release).  
  * **Crown Publications (MechChem Africa):** Publish technical editorial on digital procurement transformation for engineering suppliers.  
> * **Local Citations & Entity Anchors:** Register verified business profiles on Brabys, Hotfrog South Africa, Yalwa, Yellow Pages SA, and the Johannesburg Chamber of Commerce and Industry (JCCI).

## **7\. 90-Day Step-by-Step Antigravity CLI Execution Roadmap**

---

| Phase & Timeline | Target Action Items | Deliverables & Validation Metric &nbsp; |
| :---- | :---- | :---- |
| **Phase 1: Days 1–30 Technical & Routing Remediation** | 1\. Configure 301 permanent redirects in next.config.mjs / vercel.json. 2\. Refactor app/sitemap.ts to output canonical https://www.auraworks.co.za. 3\. Shorten all 7 title tags (\<58 chars) and 6 meta descriptions (\<150 chars). 4\. Inject Master Organization and FAQPage schemas. 5\. Verify Google Search Console sitemap submission. | Zero 307 temporary redirects; GSC URL inspection confirms clean 200 OK canonicals; Google Rich Results Test passes 100%. |
| **Phase 2: Days 31–60 Content Authority & Pricing Expansion** | 1\. Overhaul /pricing into an 800+ word interactive enterprise matrix. 2\. Publish the 3 cornerstone technical guides on /blog. 3\. Launch interactive ROI pipeline simulator component on /solution. 4\. Claim and optimize Google Business Profile in Johannesburg. | Unbranded search impressions appear in GSC; average word count across conversion routes exceeds 750 words. |
| **Phase 3: Days 61–90+ Authority Building & GEO Dominance** | 1\. Execute press releases on Bizcommunity and Engineering News. 2\. Build foundational South African directory citations. 3\. Benchmark generative citations weekly across ChatGPT Search, Perplexity, and Gemini. 4\. Integrate Search Console API insights with GA4 and aura.js telemetry. | Top 3 rankings for seo agency johannesburg and seo packages south africa; persistent citations in AI search overviews. |

&nbsp;