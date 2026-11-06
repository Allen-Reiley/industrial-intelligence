# Implementation Plan: Design 07 — Cyber-Physical Machinery
**Target File:** `designs/07_cyber_physical_machinery.html`  
**Specification Reference:** `designs/specifications/07_cyber_physical_machinery.md`  
**Design Code:** `AW-DSGN-07-FORGE`  
**Archetype:** Heavy Industrial Machinery, Chamfered Geometry & Shop Floor Telemetry  
**Target Audience:** Specialized physical fabricators, heavy structural metal workshops, commercial kitchen/braai builders, off-road overland outfitters (AOV R35,000 to R350,000+).

---

## 1. Executive Strategy & Technical Architecture Overview

The purpose of this document is to specify the complete, self-contained implementation architecture for `07_cyber_physical_machinery.html`. This page speaks the high-torque, heavy-duty language of fiber laser cutters, CNC press brakes, TIG welding bays, and multi-week custom chassis fabrication. It eliminates the credibility gap created by delicate, generic web agencies by presenting an industrial-grade interface built with chamfered geometry, hazard warning textures, volt yellow accents, and direct links between web deposit clearance and shop floor CNC scheduling.

### 1.1 Technical Constraints & Standards
* **Self-Contained File:** Single HTML5 document containing all semantic markup, custom CSS properties, responsive media queries, and vanilla JavaScript calculation logic. Zero external runtime dependencies or CSS frameworks.
* **Typography:** Preconnected Google Fonts:
  - `Chakra Petch:wght@600;700` (Angular, technological industrial headings and telemetry badges, uppercase styling)
  - `JetBrains Mono:wght@400;500;600;700` (CNC cut data, machine coordinates, pricing readouts)
  - `Inter:wght@400;500;600` (Clear, high-contrast explanatory copy)
* **Color System & Heavy Industrial Aesthetics:**
  - Matte carbon black: `--bg-carbon: #090a0d`
  - Metal plate surface: `--bg-metal: #12141a`
  - Machine panel surface: `--bg-panel: #181b24`
  - Heavy steel borders: `--border-steel: #2a303f`
  - Focus border: `--border-hazard: #444f68`
  - Volt yellow primary accent: `--volt-yellow: #facc15`
  - Deep volt gradient: `--volt-dark: #ca8a04`
  - Volt industrial glow: `--volt-glow: rgba(250, 204, 21, 0.2)`
  - Active machine signal green: `--signal-green: #22c55e`
  - Hazard warning red: `--signal-red: #ef4444`
* **Chamfered Geometry & Visual Textures:**
  - 45-degree polygon corner cutouts via CSS `clip-path`:
    `clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)`
  - Pure CSS hazard diagonal warning stripe: `repeating-linear-gradient(45deg, #facc15, #facc15 12px, #090a0d 12px, #090a0d 24px)`.
* **Core Interactive Engines:**
  - Modular CNC & Outfitting Quoting Simulator with parametric length/width sliders, heavy material switches, live footprint ($m^2$), and 50% deposit banner.
  - Workshop fabrication bay dispatch queue preview (Bays 1–4).
  - High-security industrial screening intake modal.

---

## 2. Granular Task Checklist

### Phase 1: Document Foundation & Heavy Industrial Tokens
- [x] **1.1 HTML5 Skeleton & Forge Metadata:**
  - Semantic `<head>` with viewport meta, charset UTF-8, title: `Auraworks Forge | Cyber-Physical Machinery & CNC Quoting Pipelines`.
  - OpenGraph meta tags, robots meta (`index, follow`), Google Fonts preconnect for `Chakra Petch`, `JetBrains Mono`, and `Inter`.
- [x] **1.2 CSS Root Variables & Chamfered Tokens:**
  - Declare root color variables (`--bg-carbon`, `--bg-metal`, `--bg-panel`, `--border-steel`, `--volt-yellow`, `--signal-green`, `--signal-red`).
  - Declare chamfer clip-path utility classes (`.chamfer-btn`, `.chamfer-card`, `.chamfer-badge`).
  - Declare fluid typography clamp formulas (`--fs-hero`, `--fs-h2`, `--fs-h3`, `--fs-telemetry`).
- [x] **1.3 Base Resets & Pure CSS Hazard Textures:**
  - Standard box-sizing border-box reset, font-smoothing antialiased.
  - Define CSS repeating linear gradient hazard stripe (`4px` height accent strip).
  - Custom industrial scrollbar with carbon track and volt yellow rectangular thumb.

### Phase 2: Hazard Stripe Banner & Industrial Header
- [x] **2.1 Top Hazard Stripe & Telemetry Bar:**
  - Diagonal hazard stripe bar running across top of page.
  - Monospaced system telemetry bar: `MODULE: CYBER-PHYSICAL WORKSHOP PIPELINE ARCHITECTURE // TARGET: HIGH-TICKET FABRICATION & OUTFITTING | CAPACITY: 1–3 RETAINED ACCOUNTS / MONTH (1 SLOT OPEN)`.
  - Pulsing emerald live status LED (`#22c55e`).
- [x] **2.2 Industrial Header Navigation:**
  - Logo: Chamfered `AW-FORGE` badge with yellow border + wordmark `"AURAWORKS CYBER-PHYSICAL"`.
  - Navigation anchors: `#sectors`, `#cnc-quoting`, `#heavy-shift`, `#commercials`, `#qualification`.
  - CTA Button: Chamfered volt yellow button: `[ INITIATE_WORKSHOP_SCREENING ]`.

### Phase 3: Hero Chapter & Heavy Industrial Value Proposition
- [x] **3.1 Angular Hero Typography & Narrative:**
  - Eyebrow badge: `[STRATEGIC REPOSITIONING BRIEF // INTERNAL SALES ENABLEMENT]`.
  - H1 Display: `"Custom dimension quoting & pipelines for bespoke physical fabricators."` (Uppercase `Chakra Petch`, heavy machine presence).
  - Subtitle: Articulate how Auraworks replaces unstructured WhatsApp voice notes, lost PDF attachments, and manual estimating bottlenecks with mathematical dimension quoting, instant 50% deposit capture, and workshop dispatch pipelines.
- [x] **3.2 Primary Action Buttons:**
  - Primary button: `[ INITIALIZE_CNC_SIMULATOR ]` (volt yellow chamfered).
  - Secondary button: `[ REVIEW_COMMERCIAL_BOM ]` (metal plate chamfered).
- [x] **3.3 Four-Card Chamfered Telemetry Scorecards:**
  - Card 1: `R15,000+` — Target Minimum AOV required for positive client ROI.
  - Card 2: `50% Lock` — Mandatory automated web deposit locking CNC laser schedule.
  - Card 3: `1–3 Accounts / Mo` — Production capacity ceiling.
  - Card 4: `1 Order Payback` — Single high-ticket build completely offsets monthly retainer.

### Phase 4: Module 01 // Target Client Profile (ICP Sectors)
- [x] **4.1 Three-Column Metal Plate Grid:**
  - Heavy metal plate cards (`#12141a`) with chamfered corners and steel perimeter borders.
- [x] **4.2 Sector 01: Bespoke Architectural Furniture (`SUB_SECTOR_01`):**
  - *Offerings:* Structural timber & steel boardroom tables, architectural credenzas, custom executive furniture.
  - *Current Failure Mode (Red Box):* Estimators spending unpaid days manually calculating steel tube yields for unvetted leads.
  - *Auraworks Build (Green Box):* Parametric dimension sliders with instant board-foot and steel yield math and 50% deposit capture.
- [x] **4.3 Sector 02: High-End Architectural Finishes (`SUB_SECTOR_02`):**
  - *Offerings:* Custom steel & glass partitions, decorative acoustic metal screens, architectural pergolas.
  - *Current Failure Mode (Red Box):* Specifiers waiting weeks for custom CAD takeoffs over endless unread email threads.
  - *Auraworks Build (Green Box):* Self-service specifier portal with downloadable DXF drawing packs and instant finish multipliers.
- [x] **4.4 Sector 03: Specialized Fabrication & Outfitting (`SUB_SECTOR_03`):**
  - *Offerings:* Overland camper conversions, commercial braai islands, custom chassis trailers.
  - *Current Failure Mode (Red Box):* Scope creep during multi-week welding runs causing severe working capital stress.
  - *Auraworks Build (Green Box):* Modular add-on selection with phased milestone deposit gating and live bay telemetry.

### Phase 5: Module 02 // CNC Quoting Simulator & Workshop Spec Intake
- [x] **5.1 Dual-Pane Industrial Simulator Layout:**
  - Left Pane: Parametric dimensional sliders and heavy substrate switches.
  - Right Pane: Shop spec intake summary card with live footprint, total order value, and 50% deposit banner.
- [x] **5.2 Heavy Substrate Grade Switches:**
  - *Heavy 304 Stainless Steel (1.5mm–2.0mm):* Marine-grade corrosion resistance for coastal kitchens ($1.00\times$ base).
  - *French Oak & Structural Box Steel Hybrid:* Architectural outdoor/indoor joinery ($1.25\times$ base).
  - *5083 Marine-Grade Aluminum:* Lightweight high-strength alloy for expedition camper bodies ($1.40\times$ base).
- [x] **5.3 Parametric Dimensional Controls:**
  - Overall Length: 1,800 mm to 4,500 mm (100 mm increments) with active readout.
  - Overall Width / Span: 800 mm to 1,800 mm (50 mm increments) with active readout.
- [x] **5.4 Mathematical Engine & 50% Deposit Banner:**
  - Compute surface footprint in $m^2$: $\text{Area} = \frac{\text{Length}}{1000} \times \frac{\text{Width}}{1000}$.
  - Base Rate: R13,500 per $m^2$.
  - Price Formula: $\text{Total} = (\text{Area} \times \text{Base Rate}) \times \text{Substrate Multiplier} + \text{Chassis Cost}$.
  - High-Contrast Deposit Banner:
    `REQUIRED 50% DEPOSIT: R XX,XXX`.
    *Workshop Guarantee: "Binds raw sheet inventory allocation, locks CNC cutting schedule, and reserves welding bay time upon clearance."*
  - Action Button: `[ LOCK_FABRICATION_SPEC ]` opening the intake modal with locked parameters.

### Phase 6: The Heavy Shift (Manual Clipboard Chaos vs. Cyber-Physical Pipeline)
- [x] **6.1 Comparative Split Matrix:**
  - Side-by-side contrast: `"LEGACY WORKSHOP INTAKE // UNSTRUCTURED MANUAL FRICTION"` vs. `"AURAWORKS CYBER-PHYSICAL PIPELINE"`.
- [x] **6.2 Left Column: Clipboard Bottlenecks:**
  - Incomplete customer inquiries via WhatsApp without dimensional tolerances.
  - Estimators spending 3 to 5 days manually typing spreadsheet proposals.
  - Materials ordered before deposits clear; severe capital exposure.
  - Welding bays stalled waiting for drawing revisions.
- [x] **6.3 Right Column: Automated Cyber-Physical Pipeline:**
  - Self-service parametric configuration on high-speed web interface.
  - Instant mathematical quoting with zero estimator overhead.
  - Automated 50% milestone deposit capture via secure web gateway.
  - Direct generation of shop floor cut-lists with CNC bay routing (Bay 1: Laser $\rightarrow$ Bay 2: Welding $\rightarrow$ Bay 3: Powdercoat $\rightarrow$ Bay 4: QC).

### Phase 7: Module 03 // Commercial Package Structure
- [x] **7.1 Commercial Presentation Cards:**
  - Two heavy metal plate cards with volt yellow accents and chamfered borders.
- [x] **7.2 Phase 1: Core Architecture Build:**
  - Investment: `R45,000 – R75,000` (Once-off milestone payment).
  - Scope: Bespoke high-converting showcase, interactive parametric dimension quoting engine, 50% web deposit gateway, automated shop-floor cut-list generation, and legacy asset migration.
  - Timeline: 4–6 weeks execution.
- [x] **7.3 Phase 2: Growth & Infrastructure Retainer:**
  - Investment: `R10,000 – R18,000` / month.
  - Scope: Technical SEO & Generative Engine Optimization (GEO) ensuring top AI citations in ChatGPT, Perplexity, and Google AI Overviews; cloud infrastructure maintenance, security monitoring, and continuous quoting engine speed tuning.
- [x] **7.4 Boardroom Payback Guarantee:**
  - Explicit proof showing that with an AOV of R35,000 and 45% gross margin, exactly **1 single closed order per month** produces R15,750 gross profit—fully covering the retainer while all subsequent orders are pure net profit.

### Phase 8: Module 04 // Qualification Tolerance Matrix
- [x] **8.1 Pass / Reject Technical Scorecard:**
  - Two-column engineering scorecard establishing strict intake criteria.
- [x] **8.2 [PASS] Target Qualifiers (Book Discovery):**
  - Physical manufacturing plant, workshop bays, or showroom in South Africa.
  - Average Order Value strictly R15,000 to R350,000+.
  - Managing Director / Head of Fabrication directly engaged in deployment.
  - Experiencing significant quotation turnaround bottlenecks and lost manual proposals.
- [x] **8.3 [REJECT] Immediate Disqualifiers (Do Not Book):**
  - Pure dropshippers, ecommerce resellers, and third-party importers.
  - Mass low-margin retail products with AOV below R5,000.
  - Solo hobbyists operating from domestic premises without commercial tooling.
  - Unpaid contingency or equity-only proposals.

### Phase 9: Workshop Discovery Intake Modal
- [x] **9.1 Industrial Terminal Modal Dialog:**
  - Chamfered dialog container with carbon black surface, volt yellow border, and close button `[ ESC / CLOSE_TERMINAL ]`.
  - Backdrop blur with dark slate tint.
- [x] **9.2 Qualification Intake Input Fields:**
  - Executive / Works Manager Name & Title.
  - Fabrication Facility / Brand Name & Location.
  - Corporate Email Address & Direct Telephone.
  - Average Order Value Bracket (Dropdown).
  - Primary Operational Bottleneck (Checkboxes).
  - Pre-populated dimension and substrate parameters from Section 05.
- [x] **9.3 Client-Side Validation & Confirmation Screen:**
  - Validates required fields and business email domain.
  - Confirmation screen: `SPECIFICATION DISPATCHED // Auraworks engineering evaluates fabrication bay allocation within 24 hours.`

### Phase 10: Heavy Industrial Footer
- [x] **10.1 Structured Forge Footer:**
  - Auraworks Cyber-Physical branding and engineering mandate.
  - Industrial telemetry indicators, regional manufacturing nodes.
  - Legal & Data Governance: POPIA Compliance Notice, Mutual Non-Disclosure Guarantee.
  - Copyright: `© 2026 Auraworks Forge. Built for South African Specialized Fabricators & Industrial Plants.`

---

## 3. Responsive Breakpoint Specification

| Breakpoint | Target Display | Layout Adjustments |
|---|---|---|
| **> 1200px** | High-Res Industrial Workstations | Max 1200px container, full 2-column simulator (controls left, spec receipt right), 4-column metric grid. |
| **992px – 1199px** | Standard Laptops | Stacked simulator with sticky spec panel, 2-column metric cards, full-width commercial cards. |
| **768px – 991px** | Workshop Ruggedized Tablets | Single-column sector layout, touch-friendly material switches (min height 48px), full-width sliders. |
| **< 768px** | Mobile Handhelds (375px – 480px) | Single column throughout, condensed hazard notice strip, vertical commercial cards, full-screen chamfered modal. |

---

## 4. Verification & Quality Assurance Protocol

Before marking the implementation of Design 07 as complete, the following tests will be performed:
- [x] **CSS Polygon Chamfer Rendering:** Ensure `clip-path: polygon(...)` renders cleanly across Chromium, Firefox, and WebKit without visual artifacts.
- [x] **Mathematical Engine Validation:**
  * Verify `2400 mm × 1000 mm` ($2.4 m^2$) in 304 Stainless base = R32,400. 50% deposit = R16,200.
  * Verify `3600 mm × 1200 mm` ($4.32 m^2$) in 5083 Aluminum ($1.40\times$) = $(4.32 \times 13,500) \times 1.40 = \text{R}81,648$. 50% deposit = R40,824.
- [x] **Hazard Pattern Gradient:** Verify pure CSS diagonal hazard stripe renders crisply without pixel blur.
- [x] **Modal State Integrity:** Ensure modal opens with pre-set dimensions from the simulator and enforces AOV qualification logic.
- [x] **Visual Impact:** Confirm volt yellow (`#facc15`) against carbon black (`#090a0d`) provides stark, authoritative contrast.
