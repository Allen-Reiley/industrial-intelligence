# AuraWorks Executive Audit Design Standards
**Document Classification:** Internal Operating Standard (SOP)  
**Version:** 1.0  
**Effective Date:** September 2026  
**Author:** AuraWorks Digital & Growth Advisory Practice  
**Target Output:** Boardroom-Ready Print & PDF Reports (`.pdf`) via WeasyPrint

---

## 1. Executive Philosophy & Purpose

At **AuraWorks**, we believe intelligence should be simple, empirical, and commercially decisive. In executive advisory, appearance is not merely cosmetic—it conveys rigor, authority, and professionalism.

All digital, technical SEO, and Generative Engine Optimization (GEO) audits produced under the AuraWorks banner must strictly adhere to these design standards. 

### Non-Negotiable Core Rules:
1. **Zero Fluff, Maximum Density:** No filler text, generic stock advice, or empty white space. Every element must communicate a specific finding, metric, or action.
2. **Strict Page Budget & No Orphan Elements:** Reports must follow a structured **9-Page Chapter Flow**. Every page represents a complete, self-contained analytical chapter. No orphan cards, stranded table rows, or split callout boxes across page breaks.
3. **Dual-Channel Analysis Mandatory:** Every audit must evaluate both traditional search (SERP) and modern Generative Engine Optimization (GEO / AI Answer Engines).
4. **Print-Grade Typography & Precision CSS Paged Media:** All styling relies on CSS3 paged media standards compiled via `weasyprint` to guarantee identical rendering across all operating systems.

---

## 2. Global Document Geometry & Page Setup

Audits are formatted exclusively in standard **A4 Portrait** with strict header, footer, and margin dimensions.

```css
@page {
  size: A4 portrait; /* 210mm x 297mm */
  margin: 16mm 14mm 16mm 14mm;

  @top-left {
    content: "Client Name | Full Site Audit & Search / GEO Strategy";
    font-family: 'Inter', sans-serif;
    font-size: 7.5pt;
    font-weight: 500;
    color: #94a3b8;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
    width: 100%;
  }

  @top-right {
    content: "Prepared by AuraWorks";
    font-family: 'Inter', sans-serif;
    font-size: 7.5pt;
    font-weight: 700;
    color: #0d9488;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
  }

  @bottom-left {
    content: "CONFIDENTIAL & PROPRIETARY — [CLIENT NAME]";
    font-family: 'Inter', sans-serif;
    font-size: 7pt;
    font-weight: 500;
    color: #94a3b8;
  }

  @bottom-right {
    content: "Page " counter(page) " of " counter(pages);
    font-family: 'Inter', sans-serif;
    font-size: 7.5pt;
    font-weight: 600;
    color: #64748b;
  }
}

/* Suppress headers and footers on the cover page */
@page :first {
  margin: 0;
  @top-left { content: normal; }
  @top-right { content: normal; }
  @bottom-left { content: normal; }
  @bottom-right { content: normal; }
}
```

---

## 3. Brand Color Palette & Semantics

The AuraWorks visual identity blends executive dark navy with high-precision emerald green and functional status accents:

| Token Name | Hex Code | Usage Context |
| :--- | :--- | :--- |
| **Canvas Dark / Primary** | `#06101f` | Cover page base, primary headings, table headers, roadmap phase bars |
| **Canvas Secondary** | `#0c1c36` | Cover page gradient mid-stop, secondary dark backgrounds |
| **Accent Emerald** | `#10b981` | Brand accents, cover badge borders, list bullet ticks, success alerts |
| **Deep Teal** | `#0d9488` | H3 subheadings, top-right agency header, info callout borders |
| **Body Charcoal** | `#1e293b` | Primary text color (high contrast, readability) |
| **Slate Body / Secondary**| `#334155` | Table cell data, sub-bullet descriptions |
| **Muted Grey** | `#64748b` | Subtitles, metadata labels, footer page numbers |
| **Border Neutral** | `#e2e8f0` | Card borders, table grid lines, header divider lines |
| **Light Card Surface** | `#f8fafc` | Card backgrounds, alternating table rows, phase content background |

### Functional Status Tokens:
* **Good / Positive:** Text `#16a34a` | Background `#f0fdf4` | Border `#bbf7d0` | Badge `#dcfce7`
* **Caution / Warning:** Text `#ca8a04` | Background `#fefce8` | Border `#fef08a` | Badge `#fef9c3`
* **Critical / Danger:** Text `#dc2626` | Background `#fef2f2` | Border `#fecaca` | Badge `#fee2e2`
* **Local / Commercial:** Text `#075985` | Background `#e0f2fe` | Badge `#e0f2fe`
* **Diagnostic / High-Value:** Text `#6b21a8` | Background `#f3e8ff` | Badge `#f3e8ff`

---

## 4. Typography Hierarchy & Rules

Always import Google Fonts `'Inter'` (body text) and `'Montserrat'` (headings and metrics):

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Montserrat:wght@600;700;800;900&display=swap');
```

| Element | Font Family | Size | Weight | Line Height | Letter Spacing | Styling Rules |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Body Text** | Inter | 8.5pt | 400 | 1.48 | normal | Justified alignment (`text-align: justify`) |
| **Cover Title** | Montserrat | 29pt | 900 | 1.15 | -0.5px | Pure white (`#ffffff`), tight leading |
| **Cover Subtitle** | Inter | 12pt | 400 | 1.45 | normal | Muted silver (`#94a3b8`), max-width 650px |
| **H1 (Chapter Title)** | Montserrat | 17pt | 700 | 1.20 | normal | Navy (`#06101f`), bottom margin 8px |
| **H2 (Section Title)** | Montserrat | 11.5pt | 700 | 1.25 | normal | Underline border `1.5px solid #f1f5f9` |
| **H3 (Sub-Topic)** | Montserrat | 9.5pt | 700 | 1.25 | normal | Teal (`#0f766e`), bottom margin 4px |
| **Table Headers** | Montserrat | 7pt | 700 | 1.00 | +0.4px | Uppercase, white text on `#06101f` |
| **Table Data** | Inter | 7.5pt | 400/600 | 1.30 | normal | Slate text (`#334155`), padded 4.5px 8px |
| **Badges / Tags** | Inter | 6pt | 700 | 1.00 | +0.3px | Uppercase, rounded pill (`border-radius: 10px`) |
| **Metric Numbers** | Montserrat | 16pt | 800 | 1.00 | normal | Bold color-coded callouts (`.good`, `.bad`) |

---

## 5. The Standard 9-Page Chapter Structure

To ensure consistency across clients, every audit must be structured into exactly 9 self-contained pages using the `.chapter-page` wrapper (`page-break-before: always; height: 100%;`):

```
┌────────────────────────────────────────────────────────────────────────┐
│ Page 1: Executive Cover Page (Full bleed dark gradient)               │
├────────────────────────────────────────────────────────────────────────┤
│ Page 2: Executive Summary & Health Scorecard (4 metrics, SW analysis)  │
├────────────────────────────────────────────────────────────────────────┤
│ Page 3: Company Deep Dive & Service Architecture (7 pillars & process) │
├────────────────────────────────────────────────────────────────────────┤
│ Page 4: Technical Site Audit (OpenSEO crawl inventory & issues 1-5)    │
├────────────────────────────────────────────────────────────────────────┤
│ Page 5: Search Console & Analytics Integration (GSC, GA4, protocol)   │
├────────────────────────────────────────────────────────────────────────┤
│ Page 6: Market Keyword Research (3 structured commercial data tables)  │
├────────────────────────────────────────────────────────────────────────┤
│ Page 7: Competitor Landscape & Traffic Capture Model (SERP & pipeline) │
├────────────────────────────────────────────────────────────────────────┤
│ Page 8: Dual-Channel Strategy: Search & GEO (SERP restructuring & AI) │
├────────────────────────────────────────────────────────────────────────┤
│ Page 9: Actionable 90-Day Implementation Roadmap (Phases 1-3 & close) │
└────────────────────────────────────────────────────────────────────────┘
```

### Detailed Breakdown of Each Chapter:

### Page 1: Cover Page
* **Background:** `linear-gradient(145deg, #06101f 0%, #0c1c36 55%, #062b2b 100%)`.
* **Header:** Company Logo / Wordmark with Emerald Dot (`ELVARON.`) left, `AuraWorks Advisory & Digital Growth` right.
* **Badges & Hero:** Pill badge (`EXECUTIVE SEO & GEO AUDIT REPORT`), large 29pt H1 title, concise 12pt subtitle.
* **Metadata Grid:** 2-column semi-transparent box (`background: rgba(255, 255, 255, 0.05)`) tracking: Target Website, Company Profile, Audit Engine & Telemetry, Target Market, Auditing Organization, and Publication Date.
* **Footer:** Formal confidentiality disclaimer.

### Page 2: Executive Summary & Overall Health Scorecard
* **Context Intro:** Concise 2-paragraph engagement mandate.
* **The 4-Box Metric Scorecard:**
  * Technical Base (e.g. 84% — Green)
  * Content & On-Page (e.g. 35% — Amber)
  * Schema & Entities (e.g. 0% — Red)
  * GEO / AI Readiness (e.g. 18% — Red)
* **Core Strategic Findings:** High-visibility critical callout box emphasizing the commercial reality.
* **Strengths vs. Vulnerabilities Grid:** 2-column card comparison (`grid-2`) with color-coded status badges.
* **Commercial Opportunity Box:** Summary of market search demand and upside.

### Page 3: Company Deep Dive & Service Architecture
* **Entity Profile:** Location, founder details, target demographic, ICP.
* **Core Service Pillars Table:** 3-column table:
  1. *Service Offering*
  2. *Scope & Transformation Deliverable*
  3. *Target Search Query Intent (with colored badge)*
* **Proprietary Methodology:** 3-column grid (`grid-3`) detailing the firm's engagement framework.

### Page 4: Technical Site Audit (OpenSEO Analysis)
* **Crawl Inventory Table:** Table listing all discovered URLs, HTTP status codes (`200 OK`, `301`, `noindex`), canonicalization target, and word count.
* **Top 5 Prioritized Issues:** Five discrete cards highlighting exact issue type, affected URLs, root cause, and concrete technical remediation:
  1. *Heading Order Hierarchy Skips (`heading-order-skip`)*
  2. *Title Tag Character/Pixel Length (`title-too-long`)*
  3. *Meta Description Truncation (`meta-description-too-long`)*
  4. *Internal Canonical Hygiene (`canonicalized-page`)*
  5. *Absence of Schema.org Structured Data (`schema-missing`)*

### Page 5: Google Search Console & Analytics Integration
* **First-Party Telemetry Diagnostic:** Verbatim display of API response (e.g., HTTP 403 Forbidden or active query metrics).
* **GA4 Integration Audit:** Code inspection showing Measurement ID and implementation status.
* **Why GSC is Mandatory:** Concrete bulleted business justification.
* **Step-by-Step Onboarding Roadmap:** 4-step action box detailing DNS TXT verification, sitemap submission, GA4 product linking, and user permission delegation.

### Page 6: Market Keyword Research & Demand
* Must include local search volume, Keyword Difficulty (KD), Cost-Per-Click (CPC in USD and local currency e.g. ZAR), and Search Intent.
* **3 Structured Tables:**
  1. *General Consulting & Advisory Cluster*
  2. *Business Scaling & Strategy Cluster*
  3. *Funding Readiness & Diagnostics Cluster*

### Page 7: Competitor Landscape & Commercial Traffic Model
* **SERP Competitor Matrix Table:** Competitor Domain, Keywords Ranked, Average Position, Visibility Score, and Positioning Vulnerabilities.
* **Strategic Moat / Whitespace Callout:** Analysis of competitor gaps and how the client captures unserved market share.
* **12-Month Traffic & Commercial Projection Table:** Milestone phase, ranked keywords, monthly visitors, qualified leads, closed retainers, and pipeline value.

### Page 8: Dual-Channel Strategy: Traditional SERP & GEO
* **Channel 1: Traditional Search (SERP):**
  * Architecture de-clustering (converting clustered services into standalone pillar URLs).
  * Local SEO & Google Business Profile (GBP) optimization.
* **Channel 2: Generative Engine Optimization (GEO):**
  * The paradigm shift from keyword matching to Knowledge Graph entities.
  * *Pillar 1: Semantic Entity Establishment* (`sameAs` schemas, Crunchbase, LinkedIn, Wikidata).
  * *Pillar 2: Information Gain & Framework Synthesis* (Proprietary data, benchmark surveys, named methodologies).
  * *Pillar 3: Conversational Q&A & `FAQPage` Schema* (Direct answers to high-intent executive questions).

### Page 9: Actionable 90-Day Implementation Roadmap
* **3 Structured Sprint Blocks:**
  * *Phase 1 (Days 1–30):* Technical Remediation & Search Foundations (Quick Wins).
  * *Phase 2 (Days 31–60):* Architectural De-Clustering & Content Engine (Growth Acceleration).
  * *Phase 3 (Days 61–90+):* Authority Building, Link Equity & GEO Dominance (Market Leadership).
* **Engagement Conclusion Callout:** Final sign-off summarizing expected ROI and engagement next steps.

---

## 6. Reusable Component Code Library

### A. Executive Scorecard Component
```html
<div class="scorecard-grid">
  <div class="score-card highlight">
    <div class="score-num good">84%</div>
    <div class="score-title">Technical Base</div>
    <div class="score-desc">Fast TTFB (~161ms), LiteSpeed, HTTP/3</div>
  </div>
  <div class="score-card warning">
    <div class="score-num mid">35%</div>
    <div class="score-title">Content & On-Page</div>
    <div class="score-desc">Thin copy (&lt;500w), clustered services</div>
  </div>
  <div class="score-card danger">
    <div class="score-num bad">0%</div>
    <div class="score-title">Schema & Entities</div>
    <div class="score-desc">Zero structured data across site</div>
  </div>
  <div class="score-card danger">
    <div class="score-num bad">18%</div>
    <div class="score-title">GEO / AI Readiness</div>
    <div class="score-desc">Uncited brand, missing entity</div>
  </div>
</div>
```

### B. Standard Callout Boxes
```html
<!-- Critical Callout -->
<div class="callout critical">
  <div class="callout-title">Critical Finding Title</div>
  <p>Detailed analysis of severe blockers impacting organic performance.</p>
</div>

<!-- Success Callout -->
<div class="callout success">
  <div class="callout-title">Strategic Opportunity Title</div>
  <p>Explanation of upside, white space, or competitive advantage.</p>
</div>

<!-- Informational Callout -->
<div class="callout info">
  <div class="callout-title">Contextual Note</div>
  <p>Helpful architectural or operational context.</p>
</div>

<!-- Warning Callout -->
<div class="callout warning">
  <div class="callout-title">Action Required</div>
  <p>Cautionary note regarding compliance, truncation, or indexing risks.</p>
</div>
```

### C. Data Table Specification
```html
<table>
  <thead>
    <tr>
      <th style="width: 30%;">Target Keyword</th>
      <th style="width: 15%;">Monthly Vol</th>
      <th style="width: 15%;">Difficulty</th>
      <th style="width: 20%;">CPC (ZAR)</th>
      <th style="width: 20%;">Search Intent</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>business consulting south africa</strong></td>
      <td>320</td>
      <td>17</td>
      <td>~R51.50</td>
      <td><span class="badge badge-purple">High Commercial</span></td>
    </tr>
  </tbody>
</table>
```

### D. Roadmap Sprint Block
```html
<div class="roadmap-phase">
  <div class="roadmap-header">
    <span>Phase 1: Technical Remediation & Search Foundations (Days 1 – 30)</span>
    <span class="badge badge-yellow">Quick Wins</span>
  </div>
  <div class="roadmap-body">
    <ul class="task-list">
      <li class="task-item">
        <strong>Task Title:</strong> Specific, measurable implementation description.
      </li>
    </ul>
  </div>
</div>
```

---

## 7. Compilation & Quality Verification Protocol

All audits must be compiled using `weasyprint` and strictly verified for page count and visual integrity.

### Compilation Command:
```bash
uv run --with weasyprint python3 generate_audit_pdf.py
```

### Quality Assurance Verification Script:
```python
import pypdf

# 1. Strict Page Count Verification (Must equal 9)
reader = pypdf.PdfReader("Audit_Output.pdf")
page_count = len(reader.pages)
assert page_count == 9, f"ERROR: Audit generated {page_count} pages. Must be strictly 9 pages!"

# 2. Text Density Verification (Each page must contain 2,000 - 3,500 chars)
for idx, page in enumerate(reader.pages):
    text_len = len(page.extract_text().strip())
    print(f"Page {idx+1}: {text_len} characters")
    if idx > 0:  # Exclude cover page
        assert text_len >= 1800, f"WARNING: Page {idx+1} is under-dense ({text_len} chars)!"
        assert text_len <= 3800, f"WARNING: Page {idx+1} is overflowing ({text_len} chars)!"

print("✓ Quality Assurance Passed: Document conforms to AuraWorks 9-Page Standard.")
```

### Visual Inspection Check:
Convert the compiled PDF pages into PNG images to confirm rendering quality before client delivery:
```bash
pdftoppm -png -r 150 Audit_Output.pdf /tmp/audit_page_preview
```

---

## 8. Summary Checklist for Future Audits

Before finalizing and shipping any audit under the AuraWorks name, verify:

- [ ] File named according to standard: `[Client Name] site audit by AuraWorks.pdf`
- [ ] Stored in `/home/allenreiley7/Documents/` (or designated client directory)
- [ ] Strict 9-page count confirmed with zero orphan boxes
- [ ] Cover page includes valid client domain, target country location code, and date
- [ ] 4-box scorecard accurately reflects the live crawl metrics
- [ ] Local search & Google Business Profile (GBP) status checked
- [ ] Schema.org coverage verified (or flagged if missing)
- [ ] Target country keyword data includes Monthly Volume, KD, and CPC
- [ ] GEO (Generative Engine Optimization) strategy included for AI Search
- [ ] 90-day roadmap separated into distinct 30-day phased sprints
- [ ] Headers, footers, and page numbers dynamically generated (`Page X of 9`)
