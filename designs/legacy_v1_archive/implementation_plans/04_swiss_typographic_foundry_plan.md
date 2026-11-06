# Implementation Plan: Design 04 — Swiss Typographic Foundry
**Target File:** `designs/04_swiss_typographic_foundry.html`  
**Specification Reference:** `designs/specifications/04_swiss_typographic_foundry.md`  
**Design Code:** `AW-DSGN-04-SWISS`  
**Archetype:** International Typographic Style, Asymmetric Grids & Stark Constructivism  
**Target Audience:** Modernist architectural furniture makers, high-end architectural finish fabricators, and industrial design studios (AOV R20,000 to R180,000+).

---

## 1. Executive Strategy & Technical Architecture Overview

The purpose of this document is to specify the complete, self-contained implementation architecture for `04_swiss_typographic_foundry.html`. This page represents the purest manifestation of the International Typographic Style: ruthless clarity, structural hierarchy, asymmetric column rhythms, and zero decorative fluff. It appeals directly to design purists and master physical creators who believe that form follows function and that technical systems should operate with clockwork precision.

### 1.1 Technical Constraints & Standards
* **Self-Contained File:** Single HTML5 document containing all markup, custom CSS properties, media queries, and vanilla JavaScript calculation logic. Zero runtime dependencies, external libraries, or CSS frameworks.
* **Typography:** Preconnected Google Fonts:
  - `Plus Jakarta Sans:wght@700;800` (Ultra-bold, tightly-tracked grotesque headings and numbers, `-0.03em` to `-0.04em` letter spacing)
  - `Inter:wght@400;500;600` (Clean, neutral functional body copy)
* **Color System & Modernist Contrast:**
  - Chalk paper canvas: `--bg-paper: #fbfbfa`
  - Crisp card surface: `--surface-white: #ffffff`
  - Subtle panel surface: `--surface-subtle: #f7f7f5`
  - Onyx black: `--black-onyx: #111215`
  - Primary text: `--grey-dark: #2b2d33`
  - Secondary text: `--grey-mid: #5c606b`
  - Subtle borders: `--border-hairline: #e6e6e2`
  - Heavy structural rules: `--border-thick: #111215` (2px solid)
  - International Signal Red: `--swiss-red: #e11d48`
  - Swiss Signal Orange: `--swiss-orange: #ea580c`
* **Core Interactive Modules:**
  - Asymmetric 12-column grid layout with heavy horizontal dividing rules.
  - Interactive typographic quoting engine with oversized numerals, snap-action material toggles, live square meter calculation, and 50% deposit callout.
  - Minimalist executive intake modal with real-time validation.

---

## 2. Granular Task Checklist

### Phase 1: Document Foundation & Swiss Modernist Styling Tokens
- [x] **1.1 HTML5 Skeleton & Modernist Metadata:**
  - Semantic `<head>` with viewport meta, charset UTF-8, title: `Auraworks Foundry | International Constructivist Architecture & Quoting Systems`.
  - OpenGraph meta tags, robots meta (`index, follow`), Google Fonts preconnect for `Plus Jakarta Sans` and `Inter`.
- [x] **1.2 CSS Root Variables & Constructivist Tokens:**
  - Declare root color variables (`--bg-paper`, `--surface-white`, `--surface-subtle`, `--black-onyx`, `--grey-dark`, `--border-thick`, `--swiss-red`, `--swiss-orange`).
  - Declare fluid typographic clamp formulas with negative letter tracking (`--fs-hero`, `--fs-h2`, `--fs-huge-stat`).
  - Define structural grid rules: `2px solid #111215` dividers and square geometric indicator pips (`7px x 7px`).
- [x] **1.3 Base Resets & Asymmetric Grid Framework:**
  - Standard box-sizing border-box reset, font-smoothing antialiased.
  - Background styling: Warm chalk paper canvas (`#fbfbfa`).
  - Custom minimalist scrollbar with flat black rectangular thumb and hairline grey track.

### Phase 2: Swiss Utility Strip & Asymmetric Header
- [x] **2.1 Monospaced Utility Strip (Top Rule):**
  - High-contrast bar: `AURAWORKS TECHNICAL ATELIER // STRATEGIC POSITIONING SPECIFICATION | STRICT CAPACITY: 1–3 RETAINED ACCOUNTS ONLY`.
  - Live red indicator pip (`background: #e11d48; width: 7px; height: 7px; display: inline-block`).
- [x] **2.2 Asymmetric Navigation Header:**
  - Left column: Bold grotesque wordmark `"AURAWORKS"` with small uppercase edition tag `[SWISS FOUNDRY ED.]`.
  - Center/Right column: Numbered chapter links: `01_SECTORS`, `02_QUOTING`, `03_PACKAGES`, `04_QUALIFICATION`.
  - Action button: Stark black button with white text and clean hover invert: `Book Briefing &rarr;`.

### Phase 3: Hero Chapter & Typographic Value Proposition
- [x] **3.1 Asymmetric Hero Grid Structure:**
  - 12-column grid split into a 7-column lead content area (`1.4fr`) and a 5-column vertical statistics column (`1.0fr`).
- [x] **3.2 Left Column Content:**
  - Section Tag: `00 // ARCHITECTURAL REPOSITIONING BRIEF`.
  - H1 Display: `"Digital architecture for master fabricators."` (Uppercase, tight letter-spacing `-0.04em`, line-height `0.98`).
  - Body narrative: Replacing unstructured WhatsApp friction and manual PDF calculations with rigorous parametric dimension engines and automated 50% deposit capture.
  - Action Cluster: Stark black button `[ Launch Prototype ]` and outlined hairline button `[ View Packages ]`.
- [x] **3.3 Right Column Vertical Metric Stack:**
  - Card 1: `R15,000+` — Minimum AOV threshold for mathematical commercial return.
  - Card 2: `50%` — Mandatory upfront web deposit locking raw material allocations.
  - Card 3: `1–3 Accounts / Mo` — Capacity ceiling ensuring dedicated technical focus.
  - Card 4: `1 Closed Deal` — Exactly 1 monthly commission offsets the entire Phase 2 retainer (highlighted in Swiss Signal Red).

### Phase 4: Section 01 // Target Client Profile (ICP Sectors)
- [x] **4.1 Three-Column Structural Grid:**
  - Heavy 2px black top border with numbered section header: `01 // TARGET PHYSICAL SUB-SECTORS`.
  - Three equal columns separated by vertical border rules.
- [x] **4.2 Column 01: Bespoke Architectural Furniture:**
  - *Title:* Solid Timber & Architectural Joinery.
  - *Offerings:* Minimalist monolithic dining tables, modular boardroom systems, custom executive credenzas.
  - *Bottleneck Box (Red Border):* Founders wasting unpaid evenings calculating board feet for uncommitted WhatsApp leads.
  - *Auraworks System (Black Box):* Parametric millimeter dimension sliders with instant yield math and 50% web deposit.
- [x] **4.3 Column 02: High-End Architectural Finishes:**
  - *Title:* Structural Steel & Glass Finishes.
  - *Offerings:* Crittall-style pivot doors, acoustic partition systems, architectural hardware.
  - *Bottleneck Box (Red Border):* Architects stalled on unformatted PDF quotes and untracked revision cycles.
  - *Auraworks System (Black Box):* Digital specifier hub with downloadable drawing packages and instant finish multipliers.
- [x] **4.4 Column 03: Specialized Fabrication & Outfitting:**
  - *Title:* Heavy Expedition & Metal Fabrication.
  - *Offerings:* Overland expedition campers, commercial braai modules, luxury pergolas.
  - *Bottleneck Box (Red Border):* Scope creep during multi-week welding runs causing working capital stress.
  - *Auraworks System (Black Box):* Phased milestone deposit gating with shop floor cut-list dispatch.

### Phase 5: Section 02 // Typographic Dimension Quoting Engine
- [x] **5.1 Split-Box Quoting Layout:**
  - Numbered header: `02 // INTERACTIVE DIMENSIONAL QUOTING ENGINE`.
  - Two-column card container encased in `2px solid #111215`.
- [x] **5.2 Left Pane: Dimensional Inputs & Material Toggles:**
  - Length Slider: 1,800 mm to 4,200 mm with massive active readout: `3,200 MM`.
  - Width Slider: 800 mm to 1,500 mm with massive active readout: `1,100 MM`.
  - Snap-Action Material Matrix (Minimalist buttons with instant inversion):
    * *French Oak Prime Slab* (Multiplier $1.00\times$)
    * *American Black Walnut* (Multiplier $1.35\times$)
    * *African Kiaat Exotic* (Multiplier $1.18\times$)
    * *Shou Sugi Ban Charred* (Multiplier $1.25\times$)
  - Base Frame Selector (Minimalist radio list: Spider Steel, Patina Brass, Timber Leg).
- [x] **5.3 Right Pane: Calculated Yield & 50% Deposit Callout:**
  - Dynamic surface footprint readout: `SURFACE AREA: 3.52 m²`.
  - Massive quote price odometer: `R 51,200`.
  - Stark bordered 50% deposit callout:
    `50% UPFRONT WEB DEPOSIT: R 25,600`.
    *Explanatory note: "Locks raw lumber allocation, generates binding job ticket, and reserves 4-week production slot."*
  - Action Button: `[ Reserve Production Slot &rarr; ]` opening the intake modal with locked parameters.

### Phase 6: Section 03 // Two-Phase Commercial Framework
- [x] **6.1 Side-by-Side Commercial Package Cards:**
  - Section header: `03 // TWO-PHASE COMMERCIAL ARCHITECTURE`.
  - Dual-card layout with contrasting visual weights.
- [x] **6.2 Phase 1: Custom Storefront & Quoting Pipeline Build:**
  - Pure white card with 2px black border.
  - Investment: `R45,000 – R75,000` (Once-off milestone).
  - Scope: Bespoke high-converting storefront, interactive parametric dimension quoting engine, 50% web deposit gateway, automated shop-floor cut-list generation, and legacy asset migration.
  - Value Proposition: Eliminates manual quotation overhead and captures cash deposits immediately.
- [x] **6.3 Phase 2: Growth & Infrastructure Retainer:**
  - High-impact black onyx card (`#111215`) with stark white typography and Swiss Signal Orange accents (`#ea580c`).
  - Investment: `R10,000 – R18,000` / month.
  - Scope: Technical SEO & Generative Engine Optimization (GEO) ensuring top AI citations in ChatGPT, Perplexity, and Google AI Overviews; cloud infrastructure maintenance, conversion optimization, and database security.
  - Payback Guarantee: Single closed deal per month covers the entire retainer fee.

### Phase 7: Section 04 // Booking Qualification Standards
- [x] **7.1 Dichotomy Qualification Columns:**
  - Section header: `04 // QUALIFICATION STANDARDS FOR PARTNERSHIP`.
  - Two high-contrast columns comparing target partners against disqualifications.
- [x] **7.2 Column 1: Target Qualifiers (Book Strategic Briefing):**
  - Physical manufacturing footprint (workshop, machinery bays, showroom) in South Africa.
  - Average Order Value strictly R15,000 to R180,000+.
  - Direct founder / engineering director involvement in technical deployment.
  - Frustrated by intake bottlenecks and manual quotation delays.
- [x] **7.3 Column 2: Immediate Disqualifiers (Do Not Book):**
  - Dropshippers, ecommerce resellers, and third-party importers.
  - Mass low-margin retail products with AOV below R5,000.
  - Solo hobbyists operating from domestic premises without commercial tooling.
  - Unpaid contingency or equity-only proposals.

### Phase 8: Section 05 // Executive Briefing Application Modal
- [x] **8.1 Modernist Dialog Container:**
  - Clean white dialog with stark 2px black border and square close button `[ × ]`.
  - Backdrop overlay with subtle dark tint.
- [x] **8.2 Structured Input Fields:**
  - Executive Name & Corporate Role.
  - Workshop / Studio Brand Name & City.
  - Business Email Address & Direct Telephone.
  - Average Order Value Bracket (Dropdown: < R15,000 [Disqualified], R15,000–R35,000, R35,000–R75,000, R75,000+).
  - Primary Operational Bottleneck (Checkboxes: Manual Quoting Delays, Delayed Deposits, WhatsApp Scope Creep).
  - Pre-populated dimension parameters from Section 02.
- [x] **8.3 Client-Side Validation & Confirmation Screen:**
  - Instant validation of corporate email format and required fields.
  - Confirmation screen: `BRIEFING INTAKE LOGGED // Auraworks reviews workshop capacity within 24 hours.`

### Phase 9: Modernist Swiss Footer
- [x] **9.1 Multi-Column Typographic Footer:**
  - Auraworks Foundry brand manifesto.
  - Structural columns: Core Capabilities, Operational Standards, Legal & Data Governance.
  - POPIA compliance notice, mutual NDA guarantee, and copyright: `© 2026 Auraworks Foundry. Built for South African Design Fabricators.`

---

## 3. Responsive Breakpoint Specification

| Breakpoint | Target Display | Layout Adjustments |
|---|---|---|
| **> 1200px** | Widescreen Desktops & Displays | Asymmetric 12-column grid (7:5 split in hero), 3-column sector cards, side-by-side quoting engine. |
| **992px – 1199px** | Small Laptops & Tablets (Landscape) | 2-column sector cards, stacked quoting engine with sticky total display, relaxed padding. |
| **768px – 991px** | Tablets (Portrait) | Single-column sector layout, simplified header navigation, touch-friendly material buttons (min height 48px). |
| **< 768px** | Mobile Devices (375px – 480px) | Single column throughout, condensed utility strip, stacked package cards, full-screen minimalist modal. |

---

## 4. Verification & Quality Assurance Protocol

Before marking the implementation of Design 04 as complete, the following tests will be performed:
- [x] **Typographic Scale & Tracking:** Verify tight negative tracking on all `Plus Jakarta Sans` headings (`-0.03em` to `-0.04em`) and proper font weighting.
- [x] **Mathematical Engine Validation:**
  * Verify `2800 mm × 1000 mm` ($2.8 m^2$) in French Oak base = R37,800. 50% deposit = R18,900.
  * Verify `3600 mm × 1200 mm` ($4.32 m^2$) in Walnut ($1.35\times$) = $(4.32 \times 13,500) \times 1.35 = \text{R}78,732$. 50% deposit = R39,366.
- [x] **Snap-Action Toggle Fidelity:** Ensure swatch buttons invert instantly on click with zero delay or transition lag.
- [x] **Modal Usability & Focus:** Verify modal opens cleanly, traps focus, and closes on backdrop click or `Escape` key.
- [x] **High-Contrast Legibility:** Confirm stark black (`#111215`) on warm chalk paper (`#fbfbfa`) passes WCAG AAA contrast standards.
