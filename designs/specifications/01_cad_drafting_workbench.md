# Design Specification 01: Full-Screen Interactive CAD Drafting Board
**Design Code:** `AW-ARCH-CAD-WORKBENCH`  
**Target Sub-Sectors:** Specialized Architectural Joinery, Custom Metal Fabricators, Industrial Outfitting Plants  
**Archetype & Format:** Full-Screen Interactive CAD Drafting Environment (No traditional hero or generic landing page sections)  
**Aesthetic References:** Autodesk AutoCAD, Shapr3D, teenage engineering, Bauhaus drafting tables  
**Color Palette:** Deep Blueprint Navy (`#060c18`), Secondary Slate (`#0f172a`), CAD Vector Cyan (`#38bdf8`), Laser Amber (`#f59e0b`), Drawing Grid Hairline (`rgba(56, 189, 248, 0.08)`), High-Contrast Chalk White (`#f8fafc`)

---

## 1. Executive Trust & Psychological Architecture

### 1.1 The Audience & Mindset
* **Target Decision Maker:** Managing Director, Works Manager, or Head of Engineering at a multi-million-rand bespoke fabrication workshop (AOV R25,000 to R250,000+).
* **The Reality:** They spend their days inside CAD/CAM software (SolidWorks, AutoCAD, Rhino, Fusion 360). They instinctively distrust delicate marketing websites with fluffy copy and smiling stock photos.
* **The Hook:** When they land on Design 01, they do NOT see a marketing landing page. They are dropped directly into a high-precision, technical CAD drafting workstation with interactive coordinate crosshairs, dimensioned isometric wireframes, live draggable vertex nodes, and real-time Bill of Materials (BOM) cut-yields.
* **The Commercial Revelation:** The CAD interface itself proves what Auraworks builds for them: a web-based parametric engineering engine that allows remote commercial clients and architects to configure exact physical dimensions online, instantly calculate fabrication costs, and lock a mandatory **50% Upfront Web Deposit** before a single sheet of steel is prepped or timber is surfaced.

---

## 2. Layout Structure & Viewport Architecture (Zero Generic Sections)

Instead of a generic scrolling page with 4 metric cards and 3 columns, Design 01 is structured as a **Single Fullscreen Application Workspace (100vh)** with dockable side panels, interactive canvas viewports, and drawing title blocks:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. TOP CAD COMMAND BAR: Project ID // Scale // Active Tool // Capacity: 1 Slot Open   │
├──────────────────────────┬────────────────────────────────────────┬────────────────────┤
│ 2. LEFT TOOL & LAYER     │ 3. MAIN INTERACTIVE CAD VIEWPORT       │ 4. RIGHT DOCKED    │
│    INSPECTOR PANEL       │    - Blueprint Grid Canvas (100vh)     │    ENGINEERING BOM │
│                          │    - Real-Time Draggable 3D Wireframe  │    & DEPOSIT LOCK  │
│    - Dimension Controls  │    - Dynamic Dimension Callout Leaders │                    │
│      (L, W, H, Spans)    │    - Live Crosshair Coordinates        │    - Itemized Cut  │
│    - Material Substrate  │    - Scale & Projection Selector       │      Yield & Mass  │
│      (French Oak, 304    │      (Isometric / Plan / Elevation)    │    - 50% Deposit   │
│       Stainless, Brass)  │    - Engineering Title Block (Bottom)  │      Commitment    │
│    - Shop Floor Bay      │                                        │    - Book Briefing │
│      Routing Selector    │                                        │      Drawer        │
├──────────────────────────┴────────────────────────────────────────┴────────────────────┤
│ 5. BOTTOM ENGINEERING TITLE BLOCK: Revision // Tolerances // Commercial Master Terms   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Bespoke Interactive Features

### 3.1 Draggable Interactive 3D Wireframe on Blueprint Canvas
* Built using pure SVG and vanilla JavaScript.
* Features interactive vertex handles that users can click and drag directly on the screen to stretch the product dimensions in real time.
* Live dimension callout leaders update dynamically (e.g., `<-- 3,400 MM -->`) with crisp technical tick-marks.
* Projection switch toggles between **Isometric 3D Wireframe**, **Top Plan View (DXF/Nesting)**, and **Front Elevation View**.

### 3.2 Real-Time Bill of Materials (BOM) & Cut-Yield Calculator
* The right-hand docked engineering panel computes:
  - Surface footprint in $m^2$ and volumetric yield in $m^3$.
  - Calculated raw material cost based on selected substrate (French Oak Prime, American Walnut, or 304 Marine Stainless).
  - Estimated component mass (kg) and shop-floor CNC routing time (hours).
  - **50% Web Production Deposit Gate**:
    `50% UPFRONT WEB COMMITMENT: R XX,XXX`.
    *"Locks raw material flitch allocation, dispatches nested cut-sheet to CNC queue, and reserves 4-week workshop bay upon payment."*

### 3.3 The Commercial Master Terms Drawer (Slide-Over Docket)
* Clicking `"View Commercial Architecture"` slides open an authentic engineering docket:
  - **Phase 1: Custom Storefront & Quoting Pipeline Build** (R45,000 – R75,000 once-off).
  - **Phase 2: Growth & Infrastructure Retainer** (R10,000 – R18,000/month for Technical SEO & GEO citations in ChatGPT, Perplexity, and Google AI Overviews).
  - Mathematical Single-Order Payback Guarantee: exactly 1 bespoke commission covers the entire monthly retainer.
  - Strict Capacity Limit: 1–3 Retained Accounts / Month.
  - Technical Intake Screening Form for prospective manufacturing partners.

---

## 4. Typography & Visual Rules
* **Technical Monospace:** `JetBrains Mono` (Google Fonts: 400, 500, 700) for coordinates, dimensions, tooltips, BOM line items, and engineering drawing metadata.
* **Structural Sans:** `Space Grotesk` (Google Fonts: 500, 700) for drawing title blocks, command labels, and primary actions.
* **No generic card shadows or rounded consumer pills.** All edges are razor-sharp technical boxes (`border-radius: 0px` to `2px`), calibrated borders (`1px solid #1e293b`), and crosshair indicators.
