# Implementation Plan: Design 10 — Architectural Portfolio Split
**Target File:** `designs/10_architectural_portfolio_split.html`  
**Specification Reference:** `designs/specifications/10_architectural_portfolio_split.md`  
**Design Code:** `AW-DSGN-10-SPLIT`  
**Archetype:** Asymmetric 40/60 Split-Screen Monograph, Sticky Index & Deep Chapter Stream  
**Target Audience:** Architectural joinery practices, custom architectural finish fabricators, design studios working with commercial architects (AOV R30,000 to R300,000+).

---

## 1. Executive Strategy & Technical Architecture Overview

The purpose of this document is to specify the complete, self-contained implementation architecture for `10_architectural_portfolio_split.html`. This page represents an architectural monograph layout: an asymmetric split-screen interface featuring a permanent, sticky left-hand index sidebar (`420px` width) that maintains structural orientation, paired with an expansive, scrolling right-hand content stream (`max-width: 900px`). It speaks the sophisticated spatial language of architects, commercial space planners, and master joinery practices who read publications like *Detail* and *El Croquis*. It transforms vague, unformatted drawing inquiries into a structured parametric specification with a binding 50% deposit lock.

### 1.1 Technical Constraints & Standards
* **Self-Contained File:** Single HTML5 document containing all markup, custom CSS properties, responsive media queries, and vanilla JavaScript calculation logic. Zero external runtime dependencies or CSS frameworks.
* **Typography:** Preconnected Google Fonts:
  - `Space Grotesk:wght@500;600;700` (Architectural chapter titles, section indices, and bold metric callouts)
  - `Inter:wght@300;400;500;600` (Clean, understated analytical copy and specification data)
* **Color System & Architectural Monograph Aesthetics:**
  - Deep basalt canvas: `--bg-dark: #0f1217`
  - Fixed sidebar surface: `--bg-sidebar: #090b0e`
  - Elevated card surface: `--bg-card: #161b24`
  - Structural boundary borders: `--border-dark: #222938`
  - Highlighted border: `--border-bright: #354157`
  - Architectural bronze accent: `--bronze-arch: #c28c58`
  - Bronze ambient glow: `--bronze-glow: rgba(194, 140, 88, 0.18)`
  - Status emerald: `--emerald-dot: #10b981`
  - Hazard crimson: `--crimson-warn: #ef4444`
  - Display white: `--text-white: #f8fafc`
  - Muted slate: `--text-muted: #94a3b8`
  - Dim footnote: `--text-dim: #64748b`
* **Layout Architecture:**
  - Desktop: Asymmetric CSS Grid / Flexbox layout with `position: sticky; top: 0; height: 100vh;` on the left sidebar.
  - Mobile/Tablet (< 1024px): Seamlessly reflows into a single-column editorial layout with a sticky top drawer or anchor bar.
* **Core Interactive Engines:**
  - Smooth anchor link scrolling between left index and right chapters with active scrollspy state.
  - Parametric dimension configurator (Chapter 03) with live square meter calculation and 50% deposit callout.
  - Direct discovery intake form embedded in Chapter 06.

---

## 2. Granular Task Checklist

### Phase 1: Document Foundation & Monograph Styling Tokens
- [ ] **1.1 HTML5 Skeleton & Monograph Metadata:**
  - Semantic `<head>` with viewport meta, charset UTF-8, title: `Auraworks Monograph | Architectural Dimension Engines & Fabrication Pipelines`.
  - OpenGraph meta tags, robots meta (`index, follow`), Google Fonts preconnect for `Space Grotesk` and `Inter`.
- [ ] **1.2 CSS Root Variables & Architectural Tokens:**
  - Declare basalt canvas, sidebar, card, and border tokens (`--bg-dark`, `--bg-sidebar`, `--bg-card`, `--border-dark`, `--border-bright`).
  - Declare architectural bronze and status tokens (`--bronze-arch`, `--bronze-glow`, `--emerald-dot`, `--crimson-warn`).
  - Declare typography fluid sizing variables (`--fs-h1`, `--fs-h2`, `--fs-h3`, `--fs-body`).
- [ ] **1.3 Base Resets & Asymmetric Split Framework:**
  - Box-sizing border-box reset, font-smoothing antialiased.
  - Define two-column wrapper (`display: grid; grid-template-columns: 420px 1fr; min-height: 100vh`).
  - Custom scrollbars for both sidebar (if overflowing) and main window.

### Phase 2: Fixed Left Sidebar (Permanent Orientation & Navigation)
- [ ] **2.1 Brand Header & Executive Thesis:**
  - Wordmark: `AURAWORKS // ARCHITECTURAL PORTFOLIO & PIPELINE INDEX`.
  - Subtitle: Concise statement on bespoke technical partnerships for physical manufacturers.
- [ ] **2.2 Capacity Status Box:**
  - Dark container card with amber pill and pulsing emerald dot: `Capacity: 1–3 Accounts / Month • 1 Retainer slot available for Q4.`
- [ ] **2.3 Chapter Anchor Navigation Menu:**
  - Ordered index list with bronze numeric tags:
    * `01 Context` $\rightarrow$ `#chapter-01`
    * `02 ICP Verticals` $\rightarrow$ `#chapter-02`
    * `03 Quoting Prototype` $\rightarrow$ `#chapter-03`
    * `04 Commercials` $\rightarrow$ `#chapter-04`
    * `05 Qualification` $\rightarrow$ `#chapter-05`
    * `06 Discovery Form` $\rightarrow$ `#chapter-06`
  - JavaScript scrollspy updating active link state as user scrolls right pane.
- [ ] **2.4 Primary Action Button & Governance Notes:**
  - Full-width architectural bronze button: `Apply for Discovery Call &rarr;`.
  - Confidentiality & POPIA compliance footnote.

### Phase 3: Chapter 01 // Executive Context & Strategic Repositioning
- [ ] **3.1 Chapter 01 Content Container:**
  - Numbered header tag: `Chapter 01 // Executive Context`.
  - H1 Display: `"Strategic Repositioning & ICP Target Shift"`.
  - Lead Narrative: The transition away from broad development to high-margin technical partnerships delivering clear ROI for South African physical fabricators.
- [ ] **3.2 Three-Scorecard Trust Grid:**
  - Scorecard 1: `R15,000+ AOV Threshold` — Required economic scale for mathematical ROI.
  - Scorecard 2: `50% Deposit Lock` — Mandatory upfront web deposit protecting working capital.
  - Scorecard 3: `1 Deal Break-Even` — Exactly 1 bespoke order covers the entire monthly retainer.

### Phase 4: Chapter 02 // Ideal Client Profile (Three Sub-Sectors)
- [ ] **4.1 Three-Card ICP Architecture:**
  - Architectural cards (`#161b24`) detailing the 3 qualified manufacturing categories.
- [ ] **4.2 Sector 01: Bespoke Architectural Furniture:**
  - *Offerings:* Custom solid French oak dining suites, modular boardroom systems, architectural cabinetry.
  - *Bottleneck (Soft Red Box):* Estimators typing manual spreadsheets for uncommitted leads late at night.
  - *Auraworks Build (Soft Green Box):* Parametric dimension sliders with instant board-foot math and 50% web deposit.
- [ ] **4.3 Sector 02: High-End Architectural Finishes:**
  - *Offerings:* Custom steel & glass partitions, decorative metal panels, acoustic screens.
  - *Bottleneck (Soft Red Box):* Architects waiting weeks for quote takeoffs over endless unread email threads.
  - *Auraworks Build (Soft Green Box):* Specifier hub with downloadable CAD packs and instant finish multipliers.
- [ ] **4.4 Sector 03: Specialized Fabrication & Outfitting:**
  - *Offerings:* Overland camper conversions, commercial braai islands, luxury pergolas.
  - *Bottleneck (Soft Red Box):* Scope creep during multi-week welding runs causing severe working capital stress.
  - *Auraworks Build (Soft Green Box):* Modular add-on selection with phased milestone deposit gating and live bay telemetry.

### Phase 5: Chapter 03 // Interactive Quoting Prototype
- [ ] **5.1 Quoting Engine Container:**
  - Numbered header: `Chapter 03 // Interactive Quoting Prototype`.
  - Split card layout with input controls on left and receipt on right.
- [ ] **5.2 Parametric Dimensional Sliders:**
  - Length Slider: 1,800 mm to 4,200 mm (100 mm steps) with live bronze numeral readout.
  - Width Slider: 800 mm to 1,500 mm (50 mm steps) with live bronze numeral readout.
- [ ] **5.3 Material Substrate Swatches:**
  - *French Oak Prime:* Monolithic slabs, organic matte oil ($1.00\times$).
  - *American Walnut:* Silky hand-rubbed oil finish ($1.35\times$).
  - *Structural Steel Base Frame:* Architectural box section ($1.25\times$).
- [ ] **5.4 Mathematical Receipt & 50% Deposit Callout:**
  - Surface footprint calculation in $m^2$: $\text{Area} = \frac{\text{Length}}{1000} \times \frac{\text{Width}}{1000}$.
  - Base Rate: R13,000 per $m^2$.
  - Price Formula: $\text{Total} = (\text{Area} \times \text{Base Rate}) \times \text{Substrate Multiplier}$.
  - Highlighted Green Deposit Callout:
    `50% Web Deposit: R XX,XXX`.
    *Notice: "Locks timber batch allocation, reserves workshop bay schedule, and issues production drawing set upon payment clearance."*
  - Action Button: `[ Reserve Allocation & Lock Spec ]` which transfers current parameters into Chapter 06 discovery form.

### Phase 6: Chapter 04 // Commercial Framework
- [ ] **6.1 Side-by-Side Commercial Package Cards:**
  - Numbered header: `Chapter 04 // Two-Phase Commercial Architecture`.
  - Two architectural cards detailing Phase 1 and Phase 2.
- [ ] **6.2 Phase 1: Custom Storefront & Quoting Pipeline Build:**
  - Investment: `R45,000 – R75,000` (Once-off milestone payment).
  - Scope: Bespoke responsive storefront, interactive parametric dimension quoting engine, 50% web deposit gateway, automated shop-floor cut-list generation, and legacy asset migration.
  - Timeline: 4–6 weeks execution.
- [ ] **6.3 Phase 2: Growth & Infrastructure Retainer:**
  - Investment: `R10,000 – R18,000` / month.
  - Scope: Technical SEO & Generative Engine Optimization (GEO) ensuring top AI citations in ChatGPT, Perplexity, and Google AI Overviews; cloud infrastructure maintenance, security monitoring, and continuous quoting engine speed tuning.
- [ ] **6.4 Boardroom Payback Guarantee:**
  - Explicit proof showing that with an AOV of R35,000 and 45% gross margin, exactly **1 single closed order per month** produces R15,750 gross profit—fully covering the retainer while all subsequent orders are pure net profit.

### Phase 7: Chapter 05 // Qualification Matrix
- [ ] **7.1 Dichotomy Qualification Columns:**
  - Numbered header: `Chapter 05 // Qualification Matrix for Outreach & Booking`.
  - Two high-contrast columns comparing target partners against disqualifications.
- [ ] **7.2 Column 1: Target Qualifiers (Book Strategic Consultation):**
  - Physical manufacturing workshop, plant bays, or showroom in South Africa.
  - Average Order Value strictly R15,000 to R300,000+.
  - Managing Director / Founder directly involved in operational scaling.
  - Frustrated by intake bottlenecks and manual quotation delays.
- [ ] **7.3 Column 2: Immediate Disqualifiers (Do Not Book):**
  - Pure dropshippers, ecommerce resellers, and third-party importers.
  - Mass low-margin retail products with AOV below R5,000.
  - Solo hobbyists operating from domestic premises without commercial tooling.
  - Unpaid contingency or equity-only proposals.

### Phase 8: Chapter 06 // Discovery Intake Form
- [ ] **8.1 Direct Embedded Consultation Form:**
  - Numbered header: `Chapter 06 // Executive Discovery Application`.
  - Embedded form container with clean dark slate inputs and bronze focus borders.
- [ ] **8.2 Structured Input Fields:**
  - Executive / Architectural Principal Name & Title.
  - Workshop / Practice Brand Name & City.
  - Business Email Address & Direct Telephone.
  - Average Order Value Bracket (Dropdown).
  - Primary Operational Bottleneck (Checkboxes).
  - Pre-populated dimension parameters from Chapter 03.
- [ ] **8.3 Client-Side Validation & Confirmation Screen:**
  - Instant validation of business email domain and required fields.
  - In-place confirmation screen: `APPLICATION LOGGED // Auraworks evaluates workshop capacity and will confirm discovery scheduling within 24 business hours.`

### Phase 9: Monograph Footer & Governance
- [ ] **9.1 Archival Footer Block:**
  - Auraworks Monograph branding and positioning statement.
  - Regional node metadata, POPIA compliance notice, and mutual NDA guarantee.
  - Copyright: `© 2026 Auraworks. Built for South African Architectural Joinery & Physical Fabricators.`

---

## 3. Responsive Breakpoint Specification

| Breakpoint | Target Display | Layout Adjustments |
|---|---|---|
| **> 1200px** | High-Res Architectural Displays | Two-column grid (Sidebar 420px sticky, Stream 1fr max 900px), full dual-column quoting simulator. |
| **1024px – 1199px** | Compact Laptops | Two-column grid with reduced sidebar width (340px) and condensed index typography. |
| **768px – 1023px** | Tablets | Reflow to single-column layout: Sticky top header with horizontal chapter pill navigation, full-width content stream. |
| **< 768px** | Mobile Handhelds (375px – 480px) | Single column throughout, collapsible chapter drawer, full-width touch sliders, stacked commercial cards. |

---

## 4. Verification & Quality Assurance Protocol

Before marking the implementation of Design 10 as complete, the following tests will be performed:
- [ ] **Sticky Sidebar Behavior:** Ensure the left sidebar stays perfectly fixed on desktop while right pane scrolls smoothly, without unwanted bounce or overflow issues.
- [ ] **Mathematical Engine Validation:**
  * Verify `2400 mm × 1000 mm` ($2.4 m^2$) in French Oak base = R31,200. 50% deposit = R15,600.
  * Verify `3600 mm × 1200 mm` ($4.32 m^2$) in American Walnut ($1.35\times$) = $(4.32 \times 13,000) \times 1.35 = \text{R}75,816$. 50% deposit = R37,908.
- [ ] **Anchor Link & Scrollspy Accuracy:** Verify clicking sidebar links jumps smoothly to corresponding chapters and highlights active link dynamically.
- [ ] **Form State Integrity:** Verify Chapter 03 simulator parameters cleanly pre-fill Chapter 06 discovery inputs.
- [ ] **Responsive Breakdown:** Confirm seamless collapse to single-column on tablets (< 1024px) without horizontal scrollbar.
