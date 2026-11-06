# Implementation Plan: Design 06 — Nordic Humanist Atelier
**Target File:** `designs/06_nordic_humanist_atelier.html`  
**Specification Reference:** `designs/specifications/06_nordic_humanist_atelier.md`  
**Design Code:** `AW-DSGN-06-NORDIC`  
**Archetype:** Nordic Modernism, Organic Pill Geometry & Calming Operational Order  
**Target Audience:** Boutique architectural joinery studios, Scandinavian timber workshops, custom cabinetry ateliers, handcrafted acoustic wall makers (AOV R15,000 to R140,000+).

---

## 1. Executive Strategy & Technical Architecture Overview

The purpose of this document is to specify the complete, self-contained implementation architecture for `06_nordic_humanist_atelier.html`. This page represents the calming, restorative principles of Nordic Modernism: gentle pill geometry, organic circular curves, warm porcelain surfaces, and serene operational order. It addresses the overwhelming administrative anxiety and chaotic communication that robs master craftsmen of their peace of mind, demonstrating how an automated quoting and milestone tracking system restores sanity to the workshop while capturing 50% deposits upfront.

### 1.1 Technical Constraints & Standards
* **Self-Contained File:** Single HTML5 document containing all semantic markup, custom CSS properties, responsive media queries, and vanilla JavaScript calculation logic. Zero external runtime dependencies or CSS frameworks.
* **Typography:** Preconnected Google Fonts:
  - `Urbanist:wght@600;700;800` (Humanist geometric headlines with open counters and soft curves, `-0.02em` to `-0.03em` tracking)
  - `Inter:wght@400;500;600` (Neutral, highly readable explanatory copy)
* **Color System & Nordic Aesthetics:**
  - Warm porcelain root: `--bg-porcelain: #fbfaf8`
  - Crisp card surface: `--bg-card: #ffffff`
  - Soft oat panel background: `--bg-subtle: #f3f1ec`
  - Soft neutral border: `--border-soft: #e7e4dc`
  - Focus border: `--border-focus: #c5bfb2`
  - Deep graphite text: `--graphite: #1c2127`
  - Explanatory slate: `--graphite-light: #4b535d`
  - Deep sage green: `--sage-dark: #2d6a4f`
  - Mid sage green: `--sage-mid: #40916c`
  - Soft sage green: `--sage-light: #d8f3dc`
  - Warm clay accent: `--clay-warm: #bc6c25`
  - Soft rose alert: `--alert-rose: #e63946`
  - Rose alert surface: `--alert-bg: #ffebee`
* **Core Interactive Engines:**
  - Soft pill-based parametric dimension configurator with fluid sage slider controls.
  - Transparent specification receipt with live square meter calculation and 50% upfront deposit pill.
  - Automated client milestone reassurance timeline preview.
  - Accessible, frictionless consultation intake modal.

---

## 2. Granular Task Checklist

### Phase 1: Document Foundation & Nordic Styling Tokens
- [x] **1.1 HTML5 Skeleton & Humanist Metadata:**
  - Semantic `<head>` with viewport meta, charset UTF-8, title: `Auraworks Nordic Atelier | Humane Dimension Quoting & Workshop Operational Order`.
  - OpenGraph meta tags, robots meta (`index, follow`), Google Fonts preconnect for `Urbanist` and `Inter`.
- [x] **1.2 CSS Root Variables & Organic Pill Geometry:**
  - Declare root color variables (`--bg-porcelain`, `--bg-card`, `--bg-subtle`, `--border-soft`, `--graphite`, `--sage-dark`, `--sage-light`, `--clay-warm`).
  - Declare curvature variables: `--radius-card: 20px` to `24px`, `--radius-pill: 999px`.
  - Declare fluid typographic clamp formulas (`--fs-hero`, `--fs-h2`, `--fs-h3`, `--fs-pill`).
- [x] **1.3 Base Resets & Soft Box Shadows:**
  - Box-sizing border-box reset, font-smoothing antialiased.
  - Soft diffused shadows: `box-shadow: 0 4px 20px rgba(28, 33, 39, 0.04)`.
  - Custom scrollbar styled with soft oat track and deep sage thumb with rounded ends.

### Phase 2: Top Notice Strip & Serene Studio Header
- [x] **2.1 Serene Notice Strip (Top Bar):**
  - Soft oat strip with rounded green pill: `Capacity: 1–3 Retained Accounts / Month | Preserving high-craft technical partnerships. 1 Retainer slot available for this quarter.`
  - Gentle pulsing status beacon in sage green (`#2d6a4f`).
- [x] **2.2 Studio Navigation Header:**
  - Logo: Auraworks circular monogram (`A` framed in a soft sage ring) + wordmark `"AURAWORKS NORDIC"`.
  - Navigation anchors: `#sectors`, `#studio-quoting`, `#operational-shift`, `#commercials`, `#qualification`.
  - CTA Button: Soft rounded green pill button (`border-radius: 999px`): `Apply for Intake &rarr;`.

### Phase 3: Hero Chapter & Serene Value Proposition
- [x] **3.1 Humanist Hero Typography & Narrative:**
  - Eyebrow badge: `STRATEGIC TECHNICAL PARTNERSHIPS FOR PHYSICAL PRODUCT MAKERS`.
  - H1 Display: `"Custom dimension quoting & pipelines for high-ticket bespoke workshops."`
  - Subtitle: Articulate how Auraworks replaces unstructured WhatsApp voice notes, lost PDF quote attachments, and delayed scheduling with calming, precision-engineered dimension quoting and 50% deposit capture.
- [x] **3.2 Primary Action Buttons:**
  - Primary button: `[ Open Studio Configurator ]` (soft pill with sage green background).
  - Secondary button: `[ Explore 2-Phase Model ]` (soft pill with porcelain background and thin border).
- [x] **3.3 Four-Card Soft Metric Scorecard Grid:**
  - Card 1: `R15,000+` — Minimum Average Order Value for sustainable client payback.
  - Card 2: `50% Deposit` — Upfront funds collected on-web before timber cut or bench joinery.
  - Card 3: `1–3 Accounts / Mo` — Dedicated master-level technical attention.
  - Card 4: `1 Closed Deal` — Exactly 1 bespoke order covers the entire monthly retainer.

### Phase 4: Section 01 // Target Client Profile (ICP Sectors)
- [x] **4.1 Three-Column Rounded Card Grid:**
  - Soft porcelain cards with generous inner padding and `border-radius: 20px`.
- [x] **4.2 Sector 01: Bespoke Architectural Furniture:**
  - *Offerings:* Minimalist Scandinavian timber dining tables, modular boardroom desks, custom architectural cabinetry.
  - *The Anxiety (Soft Rose Box):* Late-night WhatsApp messages from anxious clients asking for minor dimensional revisions.
  - *The Nordic Solution (Soft Sage Box):* Self-serve parametric dimension sliders with instant wood rate calculations and 50% web deposit.
- [x] **4.3 Sector 02: High-End Architectural Finishes:**
  - *Offerings:* Minimalist steel & glass partitions, handcrafted tiles, slatted acoustic timber wall panels.
  - *The Anxiety (Soft Rose Box):* Architects stalled on unformatted PDF quotes and untracked revision cycles.
  - *The Nordic Solution (Soft Sage Box):* Digital specifier hub with downloadable drawing packages and instant finish multipliers.
- [x] **4.4 Sector 03: Specialized Fabrication & Outfitting:**
  - *Offerings:* Modular camper conversions, luxury pergola systems, commercial braai islands.
  - *The Anxiety (Soft Rose Box):* Scope creep during multi-week fabrication runs causing working capital stress.
  - *The Nordic Solution (Soft Sage Box):* Phased milestone deposit gating with shop floor cut-list dispatch.

### Phase 5: Section 02 // Studio Quoting Prototype
- [x] **5.1 Dual-Column Studio Configurator Layout:**
  - Left Column: Interactive dimensional sliders and soft pill material selectors.
  - Right Column: Serene specification receipt with live square meter calculation and 50% deposit pill.
- [x] **5.2 Soft Pill Material Selectors:**
  - *French Oak Solid Slab:* Pale honey grain, organic matte oil ($1.00\times$ base).
  - *American Walnut Core:* Rich espresso tone, silky tactile finish ($1.35\times$ base).
  - *Scandinavian Ash:* Natural blonde, dense grain ($1.12\times$ base).
  - *Brushed Steel & Glass Base:* Clean architectural lines ($1.20\times$ base).
- [x] **5.3 Calibrated Dimensional Sliders:**
  - Length Slider: 1,800 mm to 4,200 mm (100 mm steps) with active millimeter readout.
  - Width Slider: 800 mm to 1,500 mm (50 mm steps) with active millimeter readout.
  - Custom fluid slider styling with rounded sage green thumb (`#2d6a4f`).
- [x] **5.4 Mathematical Receipt & 50% Deposit Pill:**
  - Surface footprint calculation in $m^2$: $\text{Area} = \frac{\text{Length}}{1000} \times \frac{\text{Width}}{1000}$.
  - Base Rate: R12,800 per $m^2$.
  - Price Formula: $\text{Total} = (\text{Area} \times \text{Base Rate}) \times \text{Material Multiplier} + \text{Base Modifier}$.
  - 50% Deposit Pill Callout:
    `50% Upfront Web Deposit: R XX,XXX`.
    *Reassurance micro-copy: "Secures timber slab reservation, confirms workshop bench scheduling, and locks your 4–6 week production window upon payment."*
  - Action Button: `[ Reserve Allocation & Lock Spec ]` opening the intake modal with locked parameters.

### Phase 6: The Operational Shift (From Inbox Anxiety to Humane Order)
- [x] **6.1 Comparative Split Architecture:**
  - Side-by-side contrast between `"Fragmented Administrative Chaos"` and `"The Automated Milestone Reassurance Engine"`.
- [x] **6.2 Left Column: Current Inbox Friction:**
  - Frantic WhatsApp voice notes at all hours demanding price revisions.
  - Unpaid evenings spent preparing manual Excel and PDF quotes.
  - Delayed client deposit payments stalling shop floor schedules.
  - Repetitive status phone calls asking *"Is my table ready yet?"*
- [x] **6.3 Right Column: The Automated Reassurance Machine:**
  - Structured web intake validating exact millimeter dimensions.
  - Cleared 50% web deposit before shop floor scheduling.
  - Automated photo-verified milestone updates dispatched to the client:
    * *Milestone 1:* Timber selected, acclimated, and tagged.
    * *Milestone 2:* Precision CNC cut and dry-fit joinery complete.
    * *Milestone 3:* Hand-sanded and natural organic oil applied.
    * *Milestone 4:* White-glove delivery dispatched.
  - Reduces inbound status calls by over 80%.

### Phase 7: Section 03 // Two-Phase Commercial Framework
- [x] **7.1 Commercial Presentation Cards:**
  - Two rounded package cards (`border-radius: 20px`) with gentle borders and clear deliverables.
- [x] **7.2 Phase 1: Custom Storefront & Quoting Pipeline Build:**
  - Investment: `R45,000 – R75,000` (Once-off milestone payment).
  - Scope: Bespoke high-converting visual showcase, interactive parametric dimension quoting engine, 50% web deposit gateway, automated shop-floor cut-list generation, and legacy asset migration.
  - Timeline: 4–6 weeks execution.
- [x] **7.3 Phase 2: Growth & Infrastructure Retainer:**
  - Investment: `R10,000 – R18,000` / month.
  - Scope: Technical SEO & Generative Engine Optimization (GEO) ensuring top AI citations in ChatGPT, Perplexity, and Google AI Overviews; cloud infrastructure maintenance, security monitoring, and continuous quoting engine speed tuning.
- [x] **7.4 Boardroom Payback Guarantee:**
  - Explicit proof showing that with an AOV of R35,000 and 45% gross margin, exactly **1 single closed order per month** produces R15,750 gross profit—fully covering the retainer while all subsequent orders are pure net profit.

### Phase 8: Section 04 // Qualification Matrix for Booking
- [x] **8.1 Two-Column Humanist Qualification Filter:**
  - Clean comparison with soft green and soft rose containers.
- [x] **8.2 Target Qualifiers (Book Strategic Consultation):**
  - Physical manufacturing workshop or showroom in South Africa.
  - Average Order Value strictly R15,000 to R140,000+.
  - Managing Director / Founder directly involved in operational scaling.
  - Frustrated by intake bottlenecks and manual quotation delays.
- [x] **8.3 Immediate Disqualifiers (Do Not Book):**
  - Pure dropshippers, ecommerce resellers, and third-party importers.
  - Mass low-margin retail products with AOV below R5,000.
  - Solo hobbyists operating from domestic premises without commercial tooling.
  - Unpaid contingency or equity-only proposals.

### Phase 9: Consultation Scheduler Modal
- [x] **9.1 Humanist Modal Dialog Container:**
  - Clean white dialog with gentle rounded corners (`border-radius: 24px`), soft shadow, and round close button `[ × ]`.
  - Backdrop overlay with soft blur (`backdrop-filter: blur(8px)`).
- [x] **9.2 Qualification Intake Input Fields:**
  - Executive / Studio Principal Name & Title.
  - Studio / Workshop Brand Name & City.
  - Business Email Address & Direct Telephone / WhatsApp.
  - Average Order Value Bracket (Dropdown).
  - Primary Operational Bottleneck (Checkboxes).
  - Pre-populated dimension parameters from Section 02.
- [x] **9.3 Client-Side Validation & Confirmation Screen:**
  - Instant validation of business email format and required fields.
  - Confirmation screen: `CONSULTATION REQUEST CONFIRMED // Auraworks evaluates workshop capacity and will confirm scheduling within 24 business hours.`

### Phase 10: Nordic Studio Footer
- [x] **10.1 Structured Studio Footer:**
  - Auraworks Nordic brand statement.
  - Studio contact channels, capacity allocation indicators.
  - Legal & Data Governance: POPIA Compliance Notice, Mutual Non-Disclosure Guarantee.
  - Copyright: `© 2026 Auraworks Nordic Atelier. Built for South African Design Studios & Master Joiners.`

---

## 3. Responsive Breakpoint Specification

| Breakpoint | Target Display | Layout Adjustments |
|---|---|---|
| **> 1200px** | High-Res Displays | Full 1200px container, 4-column metric grid, side-by-side studio configurator (controls left, receipt right). |
| **992px – 1199px** | Laptops & Landscape Tablets | Stacked studio configurator with sticky receipt summary, 2-column metric cards, relaxed padding. |
| **768px – 991px** | Portrait Tablets | Single-column sector layout, simplified navigation with touch-friendly pill buttons (min height 48px). |
| **< 768px** | Mobile Handhelds (375px – 480px) | Single column throughout, condensed notice bar, full-screen rounded intake modal, full-width touch sliders. |

---

## 4. Verification & Quality Assurance Protocol

Before marking the implementation of Design 06 as complete, the following tests will be performed:
- [x] **Porcelain & Graphite Contrast:** Ensure WCAG AAA compliance between `#1c2127` text and `#fbfaf8` background.
- [x] **Pill Curvature Consistency:** Universal application of `border-radius: 20px` to `24px` on cards and `999px` on buttons.
- [x] **Mathematical Engine Validation:**
  * Verify `2400 mm × 1000 mm` ($2.4 m^2$) in French Oak base = R30,720. 50% deposit = R15,360.
  * Verify `3000 mm × 1200 mm` ($3.6 m^2$) in American Walnut ($1.35\times$) = $(3.6 \times 12,800) \times 1.35 = \text{R}62,208$. 50% deposit = R31,104.
- [x] **Milestone Timeline Animation:** Ensure milestone preview renders smoothly with clear visual checkmarks.
- [x] **Modal State Integrity:** Ensure modal opens with pre-set dimensions and enforces AOV qualification logic.
