# Implementation Plan: Design 01 — Full-Screen Interactive CAD Drafting Board
**Target File:** `designs/01_cad_drafting_workbench.html`  
**Specification Reference:** `designs/specifications/01_cad_drafting_workbench.md`  
**Design Code:** `AW-ARCH-CAD-WORKBENCH`  
**Archetype:** Full-Screen Interactive CAD Drafting Environment & Precision Viewport  
**Target Audience:** Specialized architectural joiners, custom metal fabricators, industrial outfitting plants (AOV R25,000 to R250,000+).

---

## 1. Executive Strategy & Technical Architecture Overview

`01_cad_drafting_workbench.html` is built as an uncompromising, full-screen technical CAD application interface. It completely breaks away from generic website landing page structures. There are no generic marketing hero headers, no 3-column cards with bottlenecks, and no cookie-cutter pricing tables. Instead, the user is immersed inside an active engineering CAD drawing environment that proves Auraworks' software capabilities through direct interaction.

### 1.1 Technical Constraints & Standards
* **Self-Contained File:** Single HTML5 document with embedded CSS custom properties, responsive canvas/SVG viewport, and vanilla JavaScript for drag interactions and mathematical BOM generation. Zero external libraries, zero framework bloat.
* **Viewport Geometry:** 100vh app interface with a fixed top command bar, collapsible left tool inspector, central interactive CAD canvas, right docked BOM panel, and bottom engineering title block.
* **Typography:** Preconnected Google Fonts:
  - `Space Grotesk:wght@500;700` (Technical title block, command labels, executive actions)
  - `JetBrains Mono:wght@400;500;700` (Coordinate readouts, dimension callouts, itemized BOM line items, tolerances)
* **Color System:**
  - Blueprint canvas: `--bg-blueprint: #060c18`
  - Docked panels: `--bg-panel: #0b1325`
  - Grid line: `--grid-line: rgba(56, 189, 248, 0.08)`
  - CAD vector cyan: `--cad-cyan: #38bdf8`
  - Laser amber: `--laser-amber: #f59e0b`
  - Signal green: `--signal-green: #10b981`
  - Technical border: `--border-cad: #1e293b`
  - Chalk white: `--text-chalk: #f8fafc`
  - Muted slate: `--text-slate: #94a3b8`

---

## 2. Granular Task Checklist

### Phase 1: Full-Screen Workspace Shell & Blueprint Grid
- [x] **1.1 HTML5 Skeleton & CAD Viewport Meta:**
  - Meta tags, title: `Auraworks CAD Workbench | Precision Parametric Manufacturing Engine & Quoting Terminal`.
  - Preconnect Google Fonts for `Space Grotesk` and `JetBrains Mono`.
- [x] **1.2 Fullscreen 100vh CSS Grid Layout:**
  - CSS Grid with header (`44px`), middle workspace (`1fr`), and title block (`48px`).
  - Left dock (290px), center CAD canvas (`1fr`), right BOM dock (350px).
- [x] **1.3 Blueprint Canvas Background & Coordinate Rulers:**
  - Scalable background grid using CSS linear gradients simulating 10mm drafting grid.
  - Interactive mouse coordinate tracker displaying X/Y crosshairs and real-time millimeter cursor coordinates.

### Phase 2: Top CAD Command Bar
- [x] **2.1 Engineering Command Bar Components:**
  - Brand block: `AURAWORKS CAD WORKBENCH`.
  - Active drawing project identifier: `DWG-2026-AW-01 [PARAMETRIC_ENGINE]`.
  - Projection view toggles: `[ISOMETRIC 3D]`, `[TOP PLAN / NESTING]`, `[FRONT ELEVATION]`.
  - Capacity status indicator: Pulsing green beacon `CAPACITY: 1–3 ACCOUNTS / MO [1 ALLOCATION OPEN]`.
  - Primary button: `[ COMMERCIAL_DOCKET ]` which triggers the slide-over commercial docket.

### Phase 3: Left Tool & Layer Inspector Panel
- [x] **3.1 Parametric Dimension Controls:**
  - Length Slider (1,800 mm to 4,200 mm) with numerical readout.
  - Width Slider (800 mm to 1,600 mm) with numerical readout.
  - Height / Depth Slider (650 mm to 1,100 mm).
- [x] **3.2 Material Substrate & Finish Selectors:**
  - *French Oak Prime Slab* (Multiplier $1.00\times$).
  - *American Black Walnut Flitch* (Multiplier $1.35\times$).
  - *304 Marine Stainless Steel* (Multiplier $1.25\times$).
  - *African Kiaat Hardwood* (Multiplier $1.18\times$).
- [x] **3.3 Sub-Sector Presets & Tolerances:**
  - Presets: Boardroom Suite, Dining Monolith, Braai Island, Acoustic Credenza.
  - Machining tolerance indicator: `CNC TOLERANCE: ±0.25 MM`.

### Phase 4: Center CAD Drafting Viewport & Interactive 3D Wireframe
- [x] **4.1 Interactive SVG Isometric Wireframe:**
  - Dynamic parametric wireframe rendered in CAD vector cyan (`#38bdf8`).
  - Draggable corner vertex handles that deform the table wireframe in real time.
  - Dimension leader lines with arrowheads and dynamic millimeter readouts:
    - `<-- L: 3,200 MM -->`
    - `<-- W: 1,100 MM -->`
    - `<-- H: 760 MM -->`
- [x] **4.2 Multi-View Projection Switching:**
  - Instant SVG transformation when clicking `Isometric 3D`, `Top Plan / Nesting`, or `Front Elevation`.
  - Plan View displays flat nesting sheet with cut path layout.

### Phase 5: Right Docked Engineering BOM & 50% Deposit Lock
- [x] **5.1 Real-Time Bill of Materials (BOM) Table:**
  - Live calculations: Surface area ($m^2$), timber volume ($m^3$), estimated mass (kg), CNC run time.
  - Shop-floor routing queue: `Bay 01 Laser Nesting -> Bay 02 Press Brake -> Bay 03 TIG Assembly -> Bay 04 QC`.
- [x] **5.2 Commercial Quotation & 50% Deposit Commitment Gate:**
  - Total calculated commercial quote in high-contrast monospaced font: `R XX,XXX`.
  - High-impact green deposit lock container:
    `50% WEB COMMITMENT GATE: R XX,XXX`.
    *Engineering Guarantee: "Locks raw lumber allocation, generates binding CNC job ticket, and reserves 4-week workshop bay upon payment clearance."*
- [x] **5.3 Direct Action Button:**
  - `[ LOCK_SPECIFICATION & BOOK_AUDIT ]` triggering the slide-over drawer with locked parameters.

### Phase 6: Slide-Over Commercial Architecture Docket
- [x] **6.1 Technical Slide-Over Drawer:**
  - Slides smoothly from the right side over the CAD workspace.
  - Header: `AURAWORKS COMMERCIAL SPECIFICATION // STRATEGIC REPOSITIONING BRIEF`.
- [x] **6.2 Two-Phase Commercial Framework:**
  - **Phase 1: Custom Storefront & Quoting Pipeline Build** (R45,000 – R75,000 once-off).
  - **Phase 2: Growth & Infrastructure Retainer** (R10,000 – R18,000/month for Technical SEO & GEO citations in ChatGPT, Perplexity, and Google AI Overviews).
  - Mathematical Single-Order Payback Proof: 1 closed commission/month covers the retainer.
- [x] **6.3 Manufacturing Partner Intake Form:**
  - Executive Name, Manufacturing Facility, Business Email, Direct Telephone.
  - AOV bracket filter (strictly R15k+).
  - Operational objective checkboxes.
  - Client-side validation and instant dispatch confirmation.

### Phase 7: Bottom Engineering Title Block
- [x] **7.1 Classical Engineering Title Block:**
  - Drawing Number: `AW-CAD-01-REV-2026.11`.
  - Specification Archetype: `FULL-SCREEN PARAMETRIC WORKBENCH // SOUTH AFRICAN BESPOKE FABRICATION`.
  - Legal: `POPIA COMPLIANT // MUTUAL NDA GUARANTEED`.
  - Interactive button: `[ VIEW_COMMERCIAL_TERMS ]`.

---

## 3. Responsive Breakpoint Specification

| Breakpoint | Target Display | Layout Adjustments |
|---|---|---|
| **> 1200px** | High-Res Workstations (1080p / 4K) | Full 3-pane layout (Left Inspector 290px, Center CAD 1fr, Right BOM 350px). |
| **992px – 1199px** | Laptops | 260px Left Inspector, full-height Center CAD, Right BOM 300px. |
| **< 860px** | Mobile & Tablets | Stacked responsive layout with 480px touch CAD canvas and scrollable panels. |

---

## 4. Verification & Quality Assurance Protocol

Before marking the implementation of Design 01 as complete, the following tests will be performed:
- [x] **Full-Screen 100vh Application Rigor:** Verify layout fills exact viewport with zero unwanted horizontal scrollbars.
- [x] **Draggable Wireframe Mechanics:** Ensure vertex handles drag smoothly and recalculate length and width within calibrated bounds.
- [x] **Mathematical Engine Validation:**
  * Verify `2400 mm × 1000 mm` ($2.4 m^2$) in French Oak base = R32,400. 50% deposit = R16,200.
  * Verify `3600 mm × 1200 mm` ($4.32 m^2$) in Walnut ($1.35\times$) = $(4.32 \times 13,500) \times 1.35 = \text{R}78,732$. 50% deposit = R39,366.
- [x] **Multi-View Projection Switching:** Confirm switching between Isometric, Plan, and Elevation renders correct technical geometry.
- [x] **Slide-Over Drawer Usability:** Ensure drawer slides open smoothly, captures focus, and closes on Escape or backdrop click.
