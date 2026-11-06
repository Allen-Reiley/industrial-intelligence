# Implementation Plan: Design 05 — Tactile Materiality (Timber & Steel)
**Target File:** `designs/05_tactile_materiality_timber_steel.html`  
**Specification Reference:** `designs/specifications/05_tactile_materiality_timber_steel.md`  
**Design Code:** `AW-DSGN-05-TACTILE`  
**Archetype:** Physical Material Honesty, Tactile Swatches & Studio Workbench  
**Target Audience:** Solid timber artisans, master joinery workshops, architectural metal & patina fabricators, stone & glass studios (AOV R18,000 to R180,000+).

---

## 1. Executive Strategy & Technical Architecture Overview

The purpose of this document is to specify the complete, self-contained implementation architecture for `05_tactile_materiality_timber_steel.html`. This page bridges the digital-physical divide for master artisans and fabrication studios who believe their work can only be understood through physical touch. It translates hand-planed French oak, cold-rolled steel, and patinated brass into high-converting digital assets, demonstrating to skeptical workshop founders that custom web software does not sanitize physical craft—it protects their time, captures 50% deposits, and expands their geographic client reach.

### 1.1 Technical Constraints & Standards
* **Self-Contained File:** Single HTML5 document containing all markup, custom CSS properties, responsive media queries, and vanilla JavaScript calculation logic. Zero external runtime dependencies or CSS frameworks.
* **Typography:** Preconnected Google Fonts:
  - `Outfit:wght@500;600;700;800` (Warm, geometric, tactile headings and metric values)
  - `Inter:wght@400;500;600` (Clean, functional dimensional text and body copy)
* **Color System & Sensory Workbench Aesthetics:**
  - Dark studio charcoal: `--bg-charcoal: #121418`
  - Workbench surface: `--bg-workbench: #181c24`
  - Elevated card surface: `--bg-card: #1e232e`
  - Chiseled metal divider borders: `--border-steel: #2e3646`
  - Highlighted border: `--border-hover: #475569`
  - Warm walnut hazel: `--timber-walnut: #c69255`
  - Illuminated timber gold: `--timber-light: #dfb27e`
  - Brushed stainless slate: `--steel-brushed: #94a3b8`
  - Patina brass: `--brass-patina: #d4af37`
  - Status indicators: Emerald `#10b981` (50% Deposit Lock), Crimson `#f43f5e` (Bottleneck Alert)
* **Core Interactive Engines:**
  - Interactive Spec Workbench with parametric millimeter sliders, physical material swatch blocks, live square meter calculation, and 50% deposit lock.
  - Workshop lumber stock reservation and cut-list telemetry preview.
  - Interactive qualification discovery application modal.

---

## 2. Granular Task Checklist

### Phase 1: Document Foundation & Tactile Styling Tokens
- [x] **1.1 HTML5 Skeleton & Artisan Metadata:**
  - Semantic `<head>` with viewport meta, charset UTF-8, title: `Auraworks Tactile Workbench | Physical Material Infrastructure & Quoting Engines`.
  - OpenGraph meta tags, robots meta (`index, follow`), Google Fonts preconnect for `Outfit` and `Inter`.
- [x] **1.2 CSS Root Variables & Workbench Tokens:**
  - Declare dark charcoal canvas and workbench surfaces (`--bg-charcoal`, `--bg-workbench`, `--bg-card`, `--border-steel`).
  - Declare warm timber and metal accent tokens (`--timber-walnut`, `--timber-light`, `--steel-brushed`, `--brass-patina`, `--emerald-craft`, `--crimson-warn`).
  - Declare typography clamp variables (`--fs-h1`, `--fs-h2`, `--fs-h3`, `--fs-stat`).
- [x] **1.3 Ambient Illumination & Craft Resets:**
  - Box-sizing border-box reset, smooth scrolling behavior.
  - Ambient radial illumination at top of page (`radial-gradient(ellipse 70% 40% at 50% -10%, rgba(198, 146, 85, 0.12), transparent 70%)`).
  - Custom scrollbar styled with brushed steel track and warm walnut thumb.

### Phase 2: Material Notice Strip & Workbench Header
- [x] **2.1 Material Notice Strip (Top Bar):**
  - High-density dark header bar with physical finish swatches: `[Oak Pip] [Steel Pip] [Brass Pip] AURAWORKS // DIGITAL INFRASTRUCTURE FOR PHYSICAL FABRICATORS | CAPACITY: 1–3 RETAINED ACCOUNTS / MONTH (1 Retainer Slot Left for Q4)`.
  - Live pulsing status pip in patina brass.
- [x] **2.2 Workbench Navigation Header:**
  - Logo: Auraworks Tactile Cube monogram (`A` framed in walnut and steel) + wordmark `"AURAWORKS TACTILE"`.
  - Navigation anchors: `#spec-workbench`, `#sectors`, `#pipeline-shift`, `#commercials`, `#qualification`.
  - CTA Button: Warm walnut button: `Apply for Intake &rarr;`.

### Phase 3: Hero Chapter & Sensory Craft Value Proposition
- [x] **3.1 Craft Eyebrow & Main Headline:**
  - Eyebrow badge: `BESPOKE TECHNICAL PARTNERSHIPS FOR HIGH-TICKET MAKERS`.
  - H1 Display: `"Custom quoting engines & pipelines for master physical fabricators."`
  - Subtitle: Articulate how Auraworks replaces unstructured WhatsApp voice notes, lost PDF attachments, and manual estimating bottlenecks with mathematical dimension quoting and 50% web deposit capture.
- [x] **3.2 Primary Action Cluster:**
  - Primary button: `[ Open Material Workbench ]` (smooth scrolls to `#spec-workbench`).
  - Secondary button: `[ View 2-Phase Commercials ]` (smooth scrolls to `#commercials`).
- [x] **3.3 Four-Card Tactile Metric Scorecard Grid:**
  - Card 1: `R15,000+` — Minimum Average Order Value for viable client payback.
  - Card 2: `50% Deposit` — Upfront funds collected on-web before timber cut or steel prep.
  - Card 3: `1–3 Accounts / Mo` — Dedicated master-level technical attention.
  - Card 4: `1 Closed Deal` — Exactly 1 bespoke order covers the entire monthly retainer.

### Phase 4: The Material & Spec Dimension Workbench
- [x] **4.1 Interactive Workbench Layout:**
  - Two-column workbench interface encased in dark steel borders (`#2e3646`).
- [x] **4.2 Left Column: Dimensional Sliders & Material Swatches:**
  - Length Slider: 1,800 mm to 4,000 mm (100 mm steps) with live numerical readout.
  - Width Slider: 800 mm to 1,500 mm (50 mm steps) with live numerical readout.
  - Physical Material Swatch Cards (Interactive radio cards with realistic color chips):
    * *French Oak (Monocoat Pure Oil Finish)*: Golden honey tone, open grain ($1.00\times$).
    * *American Black Walnut (Satin Hand-Rubbed Oil)*: Deep chocolate, tight grain ($1.35\times$).
    * *Brushed 304 Stainless Steel & Glass*: Directional hairline metal ($1.25\times$).
    * *African Kiaat Exotic Hardwood*: Dense exotic grain, golden hues ($1.18\times$).
  - Architectural Base Selection (Spider Steel Base, Patina Brass Trestles, Solid Timber Leg).
- [x] **4.3 Right Column: Spec Summary & 50% Deposit Lock:**
  - Calculated surface area in $m^2$: $\text{Area} = \frac{\text{Length}}{1000} \times \frac{\text{Width}}{1000}$.
  - Estimated timber board-foot / mass yield.
  - Base Rate: R13,000 per $m^2$.
  - Price Formula: $\text{Total} = (\text{Area} \times \text{Base Rate}) \times \text{Material Multiplier} + \text{Base Modifier}$.
  - 50% Deposit Callout:
    `50% WEB PRODUCTION DEPOSIT: R XX,XXX`.
    *Notice: "Locks timber slab allocation, reserves kiln-dried lumber stock, and schedules 4–6 week workshop bench assembly upon clearance."*
  - Action Button: `[ Reserve Allocation & Lock Spec ]` which transfers current parameters into the intake modal.

### Phase 5: Three High-Value Physical Goods Verticals
- [x] **5.1 Three-Column Physical Sectors Grid:**
  - Detailed cards for the 3 target manufacturing categories with sensory descriptions.
- [x] **5.2 Sector 01: Bespoke Architectural Furniture:**
  - *Offerings:* Custom solid French oak dining tables, executive office suites, bespoke joinery cabinetry.
  - *Operational Bottleneck:* Founders spending unpaid evenings calculating timber board footage for uncommitted WhatsApp leads.
  - *Auraworks Technical Solution:* Parametric dimension sliders with instant board-foot math and 50% web deposit.
- [x] **5.3 Sector 02: High-End Architectural Finishes:**
  - *Offerings:* Custom steel-and-glass partitions, patina brass door hardware, acoustic timber paneling.
  - *Operational Bottleneck:* Architects requesting custom dimensional revisions over endless unread email threads.
  - *Auraworks Technical Solution:* Specifier CAD/BIM portal with downloadable drawing packs and instant finish multipliers.
- [x] **5.4 Sector 03: Specialized Fabrication & Outfitting:**
  - *Offerings:* Overland camper builds, custom commercial braai islands, luxury pergolas.
  - *Operational Bottleneck:* Scope creep and verbal change requests during 6-week welding runs causing working capital stress.
  - *Auraworks Technical Solution:* Modular add-on selection with phased milestone deposit gating and live shop-floor telemetry.

### Phase 6: The Workflow Shift (Showroom Bottleneck vs. Digital Material Intake)
- [x] **6.1 Comparative Split Matrix:**
  - Side-by-side contrast: `"The Physical Showroom Trap"` vs. `"The Auraworks Digital Material Pipeline"`.
- [x] **6.2 Left Column: Showroom & WhatsApp Bottlenecks:**
  - Geographically trapped by local physical showroom visitors.
  - Unpaid hours spent showing wood samples to unvetted tire-kickers.
  - Vague verbal quotes and unread PDF attachments.
  - Raw slabs cut before deposits clear; severe capital exposure.
- [x] **6.3 Right Column: Auraworks Digital Intake Engine:**
  - National reach allowing remote architects to configure exact specs online.
  - Automated 50% deposit capture via instant web rails.
  - Automated generation of internal workshop cut-lists and timber reserve tags.
  - Clear milestone tracking that eliminates anxious client phone calls.

### Phase 7: Two-Phase Commercial Framework & Retainer ROI Model
- [x] **7.1 Commercial Presentation Cards:**
  - Side-by-side transparent pricing cards for Phase 1 and Phase 2.
- [x] **7.2 Phase 1: Custom Storefront & Quoting Pipeline Build:**
  - Investment: `R45,000 – R75,000` (Once-off milestone payment).
  - Scope: Bespoke responsive showcase, interactive parametric dimension quoting engine, 50% web deposit gateway, automated shop-floor cut-list generation, and legacy asset migration.
  - Timeline: 4–6 weeks execution.
- [x] **7.3 Phase 2: Growth & Infrastructure Retainer:**
  - Investment: `R10,000 – R18,000` / month.
  - Scope: Technical SEO & Generative Engine Optimization (GEO) ensuring top AI citations in ChatGPT, Perplexity, and Google AI Overviews; cloud infrastructure maintenance, security monitoring, and continuous quoting engine speed tuning.
- [x] **7.4 Boardroom Payback Guarantee:**
  - Explicit proof showing that with an AOV of R35,000 and 45% gross margin, exactly **1 single closed order per month** produces R15,750 gross profit—fully covering the retainer while all subsequent orders are pure net profit.

### Phase 8: Qualification Matrix for Booking
- [x] **8.1 Two-Column Workshop Qualification Filter:**
  - Clearly defines partner fit and maintains exclusivity.
- [x] **8.2 Target Qualifiers (Book Strategic Consultation):**
  - Physical manufacturing workshop, machinery bays, or showroom in South Africa.
  - Average Order Value strictly R15,000 to R180,000+.
  - Managing Director / Founder directly involved in operational scaling.
  - Experiencing significant quotation turnaround bottlenecks and lost manual proposals.
- [x] **8.3 Immediate Disqualifiers (Do Not Book):**
  - Pure dropshippers, ecommerce resellers, and third-party importers.
  - Mass low-margin retail products with AOV below R5,000.
  - Solo hobbyists operating from domestic premises without commercial tooling.
  - Unpaid contingency or equity-only proposals.

### Phase 9: Workshop Discovery Application Modal
- [x] **9.1 Workbench Modal Dialog Container:**
  - Clean modal with dark workbench surface, walnut hairline borders, and backdrop filter.
  - Close button `[ × ]`.
- [x] **9.2 Qualification Intake Input Fields:**
  - Executive / Master Maker Name & Title.
  - Workshop / Brand Name & Location.
  - Business Email Address & Direct Phone / WhatsApp.
  - Average Order Value (AOV) Bracket (Dropdown).
  - Primary Operational Bottleneck (Checkboxes).
  - Pre-populated material and dimension parameters from Section 04.
- [x] **9.3 Client-Side Validation & Confirmation Screen:**
  - Enforces mandatory fields and validates business email format.
  - Displays confirmation card: `APPLICATION RECEIVED // Auraworks evaluates workshop capacity and will confirm consultation within 24 business hours.`

### Phase 10: Tactile Craftsmanship Footer
- [x] **10.1 Structured Workshop Footer:**
  - Auraworks Tactile branding and mission statement.
  - Legal & Governance: POPIA Compliance Notice, Mutual NDA Guarantee.
  - Copyright: `© 2026 Auraworks. Built for South African Solid Timber & Physical Fabricators.`

---

## 3. Responsive Breakpoint Specification

| Breakpoint | Target Display | Layout Adjustments |
|---|---|---|
| **> 1200px** | High-Res Monitors | Max 1200px container, full 2-column workbench (sliders left, quote right), 4-column metric cards. |
| **992px – 1199px** | Small Laptops | Stacked workbench with sticky quote panel, 2-column metric cards, full-width commercial cards. |
| **768px – 991px** | Workshop Tablets | Single-column sector layout, touch-friendly material swatch cards (min height 52px), full-width sliders. |
| **< 768px** | Mobile Devices (375px – 480px) | Single column throughout, condensed material notice bar, vertical commercial cards, full-screen intake modal. |

---

## 4. Verification & Quality Assurance Protocol

Before marking the implementation of Design 05 as complete, the following tests will be performed:
- [x] **Sensory Color & Illumination Harmony:** Verify rich contrast between `#121418` dark charcoal and `#c69255` warm walnut.
- [x] **Mathematical Engine Validation:**
  * Verify `2400 mm × 1000 mm` ($2.4 m^2$) in French Oak base = R31,200. 50% deposit = R15,600.
  * Verify `3200 mm × 1100 mm` ($3.52 m^2$) in American Walnut ($1.35\times$) = $(3.52 \times 13,000) \times 1.35 = \text{R}61,776$. 50% deposit = R30,888.
- [x] **Interactive Swatch States:** Ensure clicking material swatches updates selection border and live quote summary instantly.
- [x] **Modal State Integrity:** Ensure modal opens with pre-selected timber species and dimensions from the workbench.
- [x] **Cross-Device Performance:** Ensure smooth slider tracking without scroll interference on mobile touch devices.
