# Implementation Plan: Design 02 — Precision CAD & Blueprint Engine
**Target File:** `designs/02_precision_cad_blueprint_engine.html`  
**Specification Reference:** `designs/specifications/02_precision_cad_blueprint_engine.md`  
**Design Code:** `AW-DSGN-02-CAD`  
**Archetype:** Technical Blueprint, CAD Viewports & Industrial Telemetry  
**Target Audience:** Specialized physical fabricators, architectural steel & glass studios, heavy bespoke vehicle/joinery builders (AOV R25,000 to R250,000+).

---

## 1. Executive Strategy & Technical Architecture Overview

The purpose of this document is to specify the complete, self-contained implementation architecture for `02_precision_cad_blueprint_engine.html`. This page speaks the uncompromising language of structural engineers, master fabricators, and CAD draughtspeople. It demonstrates operational mastery through real-time SVG isometric wireframe deformation, live board-foot and weight estimation, automated 50% deposit capture, and an engineering-grade contract Bill of Materials (BOM).

### 1.1 Technical Constraints & Standards
* **Self-Contained File:** Pure single-file HTML5 document containing all semantic markup, CSS custom properties, responsive media queries, and vanilla JavaScript calculation logic. Zero external runtime dependencies or CSS frameworks.
* **Typography:** Preconnected Google Fonts:
  - `Space Grotesk:wght@500;600;700` (Technical headlines, assembly titles, section titles)
  - `JetBrains Mono:wght@400;500;600;700` (CAD coordinates, BOM tables, dimension leader labels, price meters)
  - `Inter:wght@400;500;600` (Readable architectural descriptions and body copy)
* **Color System & Aesthetics:**
  - Deep blueprint canvas: `--bg-blueprint: #060c18`
  - Blueprint surface: `--bg-surface: #0a1325`
  - Data panel: `--bg-panel: #0e1b33`
  - Blueprint grid border: `--border-cad: #1d335a`
  - Active line border: `--border-bright: #2d4f8a`
  - Primary technical cyan: `--cad-cyan: #38bdf8`
  - Technical glow: `--cad-cyan-glow: rgba(56, 189, 248, 0.15)`
  - Secondary blue: `--cad-blue: #2563eb`
  - Status indicators: Emerald `#10b981` (Pass/Nominal), Amber `#f59e0b` (Caution), Red `#f43f5e` (Fail/Bottleneck)
* **Interactive Dynamic Modules:**
  - Dynamic SVG isometric CAD viewport that mutates its polygon vertices and dimension arrows in real time as sliders move.
  - Mathematical BOM calculation for square meters, estimated metal weight, total cost, and 50% production deposit.
  - Interactive QA pass/fail qualification filter and engineering intake modal.

---

## 2. Granular Task Checklist

### Phase 1: Document Foundation & Technical Drafting Theme
- [x] **1.1 HTML5 Skeleton & Blueprint Metadata:**
  - Semantic `<head>` with viewport meta, charset UTF-8, title: `Auraworks CAD Blueprint Engine | Precision Manufacturing Quoting & Workshop Pipelines`.
  - OpenGraph tags, robots meta (`index, follow`), Google Fonts preconnect for `Space Grotesk`, `JetBrains Mono`, and `Inter`.
- [x] **1.2 CSS Root Variables & Engineering Tokens:**
  - Declare canvas, surface, panel, and border tokens (`--bg-blueprint`, `--bg-surface`, `--bg-panel`, `--border-cad`, `--border-bright`).
  - Declare CAD accent tokens: `--cad-cyan: #38bdf8`, `--cad-cyan-glow: rgba(56, 189, 248, 0.15)`, `--cad-blue: #2563eb`, `--emerald-status: #10b981`, `--amber-warn: #f59e0b`, `--red-alert: #f43f5e`.
  - Declare typography fluid sizing variables (`--fs-hero`, `--fs-h2`, `--fs-h3`, `--fs-mono`).
- [x] **1.3 Blueprint Canvas Grid & Crosshair Geometry:**
  - Pure CSS blueprint grid background: dual-layer repeating linear gradients (`32px` major grid and `8px` minor grid in cyan opacity `rgba(56, 189, 248, 0.04)`).
  - Corner drafting crosshairs `[+ 00.00]` and `[+ 99.99]` using absolute pseudo-elements.
  - Custom scrollbar styled with cyan hairline track and dark slate thumb.

### Phase 2: Telemetry Top Bar & CAD Navigation
- [x] **2.1 System Telemetry Strip:**
  - Monospaced persistent top bar: `SYS_ID: AW-CAD-PIPELINE-2026 // CAPACITY: 2 OF 3 RETAINED ACCOUNTS COMMITTED [ 1 SLOT AVAILABLE ]`.
  - Pulsing emerald live status beacon (`animation: pulseCyan 2s infinite`).
- [x] **2.2 Engineering Navigation Header:**
  - Wordmark: `AURAWORKS // CAD_ENGINE` with monospaced version tag `[v2.4]`.
  - Nav anchors: `01_SECTORS`, `02_CAD_SIMULATOR`, `03_PIPELINE_SHIFT`, `04_BOM_COMMERCIALS`, `05_QA_TOLERANCE`.
  - CTA Button: Styled as an engineering action command: `[ EXECUTE_DISCOVERY_INTAKE ]`.

### Phase 3: Hero Chapter & Technical Specification Brief
- [x] **3.1 Technical Eyebrow & Headline:**
  - System Tag: `SPECIFICATION BRIEF // STRATEGIC REPOSITIONING & ICP TARGET SHIFT`.
  - H1 Display Headline: `"Custom dimension quoting engines & pipelines for bespoke physical fabricators."`
  - Subtitle: Articulate the elimination of unpaid CAD takeoffs, manual PDF quotes, and verbal approvals through parametric dimension configuration and mandatory 50% deposit locks.
- [x] **3.2 Primary Action Buttons:**
  - Primary button: `[ INITIALIZE_PARAMETRIC_VIEWPORT ]` (links to simulator).
  - Secondary button: `[ INSPECT_CONTRACT_BOM ]` (links to commercial table).
- [x] **3.3 Four-Card Engineering Telemetry Bar:**
  - Card 1: `AOV THRESHOLD: R15k–R150k+` — Minimum economic scale for positive client ROI.
  - Card 2: `MANDATORY 50% DEPOSIT` — Production slot locked before CNC or laser cut.
  - Card 3: `CAPACITY: 1–3 ACCOUNTS/MO` — Engineering team bandwidth constraint.
  - Card 4: `PAYBACK: 1 CLOSED COMM.` — Exactly 1 single order covers the entire retainer.

### Phase 4: Module 01 // Qualified ICP Sub-Sectors (Assemblies)
- [x] **4.1 Three-Column Engineering Module Grid:**
  - Presenting the 3 qualified manufacturing sectors in formal CAD assembly cards with technical headers.
- [x] **4.2 Assembly 01: Bespoke Furniture & Master Joinery (`ASSEMBLY_REF: JNY-01`):**
  - *Target Profile:* Solid timber dining tables, boardroom desks, bespoke cabinetry.
  - *Current Failure Mode:* Founders spending 45+ minutes on manual cutting lists for uncommitted prospects.
  - *Auraworks Resolution:* Parametric millimeter sliders with instant timber board-foot yield and 50% deposit capture.
- [x] **4.3 Assembly 02: High-End Architectural Finishes (`ASSEMBLY_REF: ARC-02`):**
  - *Target Profile:* Custom steel & glass Crittall partitions, bronze hardware, acoustic architectural panels.
  - *Current Failure Mode:* Architects requesting custom dimensional revisions over endless unread email threads.
  - *Auraworks Resolution:* Self-serve CAD specifier engine with instant PDF drawing pack generation.
- [x] **4.4 Assembly 03: Specialized Fabrication & Outfitting (`ASSEMBLY_REF: FAB-03`):**
  - *Target Profile:* Modular overland expedition campers, commercial braai islands, custom chassis trailers.
  - *Current Failure Mode:* Uncontrolled verbal scope changes during 6-week welding cycles causing cash-flow strain.
  - *Auraworks Resolution:* Modular add-on selection with phased milestone deposit gating and live bay telemetry.

### Phase 5: Module 02 // Live Interactive SVG CAD Viewport & Cost Estimator
- [x] **5.1 Dual-Pane Blueprint Viewport Container:**
  - Left Pane: Dynamic SVG drafting viewport displaying isometric table/structural frame wireframe.
  - Right Pane: Parametric controls, material gauge matrix, live BOM calculation, and 50% deposit lock.
- [x] **5.2 Dynamic SVG Wireframe Graphics:**
  - Render isometric projection of a structural manufacturing workpiece with cyan wireframe edges (`stroke="#38bdf8"`).
  - Dynamic dimension leader lines (`L: [value] mm`, `W: [value] mm`) with dashed extension lines that expand and contract smoothly via JavaScript DOM point manipulation.
- [x] **5.3 Parametric Dimension Controls:**
  - Length Slider: 1,800 mm to 4,200 mm (100 mm increments) with active digital readout.
  - Width Slider: 800 mm to 1,500 mm (50 mm increments) with active digital readout.
  - Substrate Material & Gauge Matrix (Radio Cards):
    * *French Oak Solid Slab on Structural Box:* Base rate ($1.00\times$)
    * *304 Brushed Stainless Steel (1.5mm - 2.0mm):* Heavy marine grade ($1.25\times$)
    * *5083 Marine-Grade Aluminum (TIG Welded):* Expedition grade ($1.40\times$)
- [x] **5.4 Mathematical BOM & Weight Engine (JavaScript):**
  - Compute surface footprint in $m^2$: $\text{Area} = \frac{\text{Length}}{1000} \times \frac{\text{Width}}{1000}$.
  - Compute estimated structural mass in kg based on selected material density.
  - Base Rate: R13,500 per $m^2$.
  - Formula: $\text{Total} = (\text{Area} \times \text{Base Rate}) \times \text{Material Multiplier}$.
  - Compute 50% Production Deposit: $\text{Deposit} = \text{Total} \times 0.50$.
- [x] **5.5 Live Telemetry Output & Deposit Callout:**
  - Digital odometer showing total cost in ZAR: `R XX,XXX`.
  - Emerald highlighted callout box: `REQUIRED 50% PRODUCTION DEPOSIT: R XX,XXX`.
  - Telemetry Note: `"Locks CNC cutting bay and allocates raw substrate upon clearance."`
  - Action Button: `[ LOCK_SPECIFICATION_AND_APPLY ]` which transfers current parameters into the intake modal.

### Phase 6: The Engineering Shift (Before vs. After Workflow)
- [x] **6.1 Technical Comparative Grid:**
  - Side-by-side contrast between `"LEGACY WORKFLOW // UNSTRUCTURED MANUAL FRICTION"` and `"AURAWORKS PIPELINE // PARAMETRIC WEB MACHINE"`.
- [x] **6.2 Left Column: Legacy Failure Points:**
  - Incomplete customer inquiries via WhatsApp without dimensional tolerances.
  - Unpaid draughtsman hours spent generating manual PDF quotes.
  - Verbal approvals followed by price haggling and client ghosting.
  - Materials purchased before funds clear; severe working capital risk.
- [x] **6.3 Right Column: Auraworks Parametric Pipeline:**
  - Self-service millimeter dimensioning on high-speed web interface.
  - Instant mathematical pricing with zero manual calculation overhead.
  - Automated 50% milestone deposit capture via secure web gateway.
  - Direct generation of workshop job card with cutting list and CNC bay routing.

### Phase 7: Module 03 // Commercial Package Structure (Contract BOM Table)
- [x] **7.1 Formal Engineering BOM Table Layout:**
  - High-density responsive contract table styled with cyan borders, alternating row fills, and monospaced technical codes.
- [x] **7.2 Phase 1 Line Item: Custom Storefront & Quoting Pipeline Build:**
  - *Code:* `PHASE_01_BUILD`
  - *Investment:* `R45,000 – R75,000` (Once-off milestone payment)
  - *Scope Deliverables:* Bespoke responsive CAD/storefront web application, interactive parametric dimension quoting engine, 50% deposit checkout gateway integration, automated shop-floor cut-list generation, and legacy asset migration.
  - *Timeline:* 4–6 weeks execution.
- [x] **7.3 Phase 2 Line Item: Growth & Infrastructure Retainer:**
  - *Code:* `PHASE_02_RETAINER`
  - *Investment:* `R10,000 – R18,000` / month
  - *Scope Deliverables:* Technical SEO & Generative Engine Optimization (GEO) ensuring top AI citations in ChatGPT, Perplexity, and Google AI Overviews for high-ticket commercial queries; cloud infrastructure maintenance, security monitoring, and continuous quoting engine speed tuning.
- [x] **7.4 Boardroom Unit Economics & Payback Proof:**
  - Interactive breakeven slider demonstrating that at typical AOV (R35,000+) and standard manufacturing margins (35%–45%), exactly **1 closed commission per month** produces R12,250 to R15,750 gross profit—fully covering the Phase 2 retainer, making all additional orders pure net profit.

### Phase 8: Module 04 // QA Tolerance Qualification Matrix
- [x] **8.1 Pass / Fail Technical Matrix:**
  - Two-column engineering scorecard explicitly establishing partner selection criteria.
- [x] **8.2 QA PASS (Qualified for Partnership):**
  - Physical manufacturing footprint (workshop, machinery bays, showroom) in South Africa.
  - Average Order Value strictly R15,000 to R250,000+.
  - Direct founder / engineering director involvement in technical deployment.
  - Experiencing significant quotation turnaround bottlenecks and lost manual proposals.
- [x] **8.3 QA FAIL (Disqualified from Intake):**
  - Pure dropshippers, ecommerce resellers, and third-party importers.
  - Mass low-margin retail products with AOV below R5,000.
  - Solo hobbyists operating from domestic premises without commercial tooling.
  - Unpaid contingency or equity-only compensation models.

### Phase 9: CAD Intake Terminal Modal
- [x] **9.1 Engineering Terminal Modal Container:**
  - Monospaced dialog with blueprint styling, cyan perimeter glow, and backdrop filter.
  - Accessible close button `[ ESC / CLOSE_TERMINAL ]`.
- [x] **9.2 Technical Intake Input Fields:**
  - Executive / Engineer Name & Title.
  - Workshop / Fabrication Brand Name & Workshop Location.
  - Corporate Email Address & Direct Telephone / WhatsApp.
  - Average Order Value Bracket (Dropdown):
    * `< R15,000 [ Disqualified from Retainer ]`
    * `R15,000 – R35,000 [ Tier 1 Commercial ]`
    * `R35,000 – R75,000 [ Tier 2 Bespoke ]`
    * `R75,000 – R250,000+ [ Tier 3 Enterprise / Architectural ]`
  - Current Primary Operational Bottleneck (Checkboxes: Manual Quoting Delays, Delayed Deposits, WhatsApp Scope Creep, Incomplete Spec Sheets).
  - Pre-populated CAD dimension values from simulator.
- [x] **9.3 JavaScript Client-Side Validation & Submission Simulation:**
  - Real-time validation verifying business email domain and workshop name.
  - Instant feedback: If qualified, displays green confirmation: `SPECIFICATION DISPATCHED // Auraworks engineering evaluates fabrication bay allocation within 24 hours.`

### Phase 10: Technical Footer & Drawing Metadata Block
- [x] **10.1 Engineering Drawing Title Block:**
  - Styled as an authentic CAD drawing title block in the bottom right corner with drawing number, date, scale, approval signature, and revision code `REV: 2026.11`.
- [x] **10.2 System Governance & Legal Notice:**
  - POPIA compliance statement, mutual Non-Disclosure Agreement (NDA) guarantee for proprietary engineering drawings and tooling specs.
  - Copyright: `© 2026 Auraworks. Built for South African Specialized Fabricators & Physical Manufacturers.`

---

## 3. Responsive Breakpoint Specification

| Breakpoint | Target Display | Layout Adjustments |
|---|---|---|
| **> 1200px** | High-Res CAD Monitors (1440px+) | Full dual-pane CAD viewport (SVG left 55%, parameters right 45%), 4-column metric bar, full BOM table layout. |
| **992px – 1199px** | Standard Laptops | Stacked CAD viewport with SVG top and controls below, 2-column metric cards, responsive BOM scroll wrapper. |
| **768px – 991px** | Workshop Tablets | Single column for ICP assemblies, simplified SVG rendering, full-width touch-friendly range sliders (min height 48px). |
| **< 768px** | Mobile Handhelds (375px – 480px) | Streamlined mobile blueprint mode, condensed telemetry strip, vertical BOM cards instead of wide table, full-screen terminal modal. |

---

## 4. Verification & Quality Assurance Protocol

Before marking the implementation of Design 02 as complete, the following tests will be performed:
- [x] **SVG Viewport Performance:** Ensure smooth 60fps deformation of isometric SVG points when scrubbing length and width sliders.
- [x] **Mathematical Engine Validation:**
  * Verify `2400 mm × 1000 mm` ($2.4 m^2$) in French Oak base = R32,400. 50% deposit = R16,200.
  * Verify `3600 mm × 1200 mm` ($4.32 m^2$) in 304 Stainless ($1.25\times$) = $(4.32 \times 13,500) \times 1.25 = \text{R}72,900$. 50% deposit = R36,450.
  * Verify weight calculation accurately adjusts based on selected alloy/timber density factor.
- [x] **BOM Table Responsiveness:** Verify table is legible and horizontal scroll functions smoothly on mobile displays without clipping text.
- [x] **Modal State Integrity:** Ensure modal cleanly loads pre-set dimensions from the interactive simulator and enforces AOV qualification logic.
- [x] **Visual Fidelity:** Confirm blueprint coordinate grid and cyan typography render crisply on both Retina and standard resolution screens.
