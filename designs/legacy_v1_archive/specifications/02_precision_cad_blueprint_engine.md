# Design Specification 02: Precision CAD & Blueprint Engine (Engineering Tolerance)
**Design Code:** `AW-DSGN-02-CAD`  
**Target Sub-Sectors:** Specialized Fabrication & Outfitting, Architectural Steel & Glass Finishes, Heavy Bespoke Metal & Timber Workshops  
**Strategic Archetype:** Technical Blueprint, CAD Viewports & Industrial Telemetry  
**Primary Psychological Objective:** Uncompromising mathematical rigor, tolerance control, and zero-defect operational credibility.

---

## 1. Executive Persona & Trust Thesis

### 1.1 The Prospective Client Profile
* **Target Decision Maker:** Founder, Chief Engineer, Managing Director, or Head of Fabrication of an established specialized fabrication shop, architectural metalwork atelier, or bespoke overland vehicle outfitter.
* **Economic Reality:** Average Order Value (AOV) is **R25,000 to R250,000+** per build (complete overland expedition camper fitments, custom stainless steel commercial kitchen islands, crittall-style steel & glass partition walls, heavy chassis trailers).
* **The Emotional & Operational Reality:**
  - These founders live in millimeters, structural weld tolerances, and CAD layers. They detest vague marketing fluff and hand-waving "growth agency" jargon.
  - Their most frustrating bottleneck is the "tire-kicker" inquiry: customers message on WhatsApp asking *"Can you do a custom canopy for my Land Cruiser?"* or *"Roughly how much for a steel glass partition?"*
  - The founder or lead draughtsman spends 3 to 6 unpaid hours generating CAD models and custom material takeoffs, only for the client to stall when told a 50% deposit is required before metal is cut.
  - Fabrication schedules in the welding bays and CNC laser cutters stall because orders arrive with incomplete dimensional specifications.

### 1.2 The Trust Architecture: Why They Trust Auraworks Instantly
1. **The Language of Technical Draughting:** From the first glance, the interface feels like an engineering workstation: blueprint deep navy (`#060c18`), drafting crosshairs `[+]`, coordinate telemetry (`SYS_ID: AW-CAD-2026`), and monospaced technical metadata (`JetBrains Mono`).
2. **Interactive SVG CAD Viewport:** When founders see a live isometric SVG wireframe dynamically resizing its structural dimensions (Length, Width, Height) in real time while outputting board footage, square meters, and calculated steel weight, they recognize immediate technical mastery.
3. **Structured Bill of Materials (BOM) Output:** The platform doesn't produce an ambiguous shopping cart; it generates a structured, itemized engineering specification and captures a 50% commitment deposit directly on the web before routing to the shop floor queue.

---

## 2. Bespoke Ecommerce Architecture (Client-Facing Storefront)

### 2.1 Visual Atmosphere & Art Direction
* **Canvas Ambience:** High-precision blueprint environment featuring subtle millimeter grid lines (`32px x 32px` coordinate grid in `rgba(56, 189, 248, 0.05)`), dark technical slate surfaces (`#0a1325`), and technical panel borders (`#1d335a`).
* **Visual Motifs:**
  - Drafting crosshairs at page corners `[+ 00.00]` and `[+ 99.99]`.
  - Dimension leader lines with arrowheads pointing to active parameter inputs.
  - Technical revision stamps (`SPEC_REV_2.4 // STATUS: CERTIFIED`).
* **Typography:** *Space Grotesk* for structured engineering titles, *JetBrains Mono* for coordinates, tolerances, calculations, and BOM parameters, and *Inter* for readable body text.

### 2.2 The Interactive CAD Dimension Configurator
The centerpiece of the client-facing storefront is an interactive **CAD Viewport & Dynamic Dimension Configurator**:
* **Live SVG Isometric Drafting Viewport:**
  - Displays an architectural wireframe assembly (e.g. structural dining table, architectural partition frame, or camper drawer module).
  - Features dynamic SVG dimension leader lines (`L: 3000 mm`, `W: 1100 mm`) with dashed guidelines that expand and contract smoothly as sliders are adjusted.
* **Parametric Dimensional Controls:**
  - *PARAM_LENGTH (X-Axis):* 1,800 mm to 4,200 mm (100 mm steps)
  - *PARAM_WIDTH (Y-Axis):* 800 mm to 1,500 mm (50 mm steps)
  - *PARAM_HEIGHT / DEPTH (Z-Axis):* 720 mm to 1,050 mm
* **Substrate Material & Gauge Matrix:**
  - *304 Brushed Stainless Steel (1.5mm - 2.0mm)*: Heavy commercial/marine grade ($1.25\times$)
  - *5083 Marine-Grade Aluminum (Laser Cut & TIG Welded)*: Lightweight expedition grade ($1.40\times$)
  - *French Oak Solid Slab on Structural Steel Box*: Architectural hybrid ($1.00\times$)
* **Instant Dynamic Specification Summary:**
  - Surface Area Calculation: Footprint in $m^2$
  - Estimated Structural Weight: kg output based on material density formulas
  - Lead Production Window: Real-time estimate based on workshop queue capacity
* **Automated 50% Production Deposit Gate:**
  - Price recalculates live using mathematical shop floor formulas:
    $$\text{Price} = (\text{Area } m^2 \times \text{Base Rate}) \times \text{Material Multiplier}$$
  - Locks exactly 50% as a mandatory commitment deposit:
    `50% MANDATORY WEB DEPOSIT: R[Amount]`
  - Emphasizes: *"Binds engineering tolerance lock and reserves CNC laser cut slot upon payment."*

---

## 3. Custom Operational Tool Architecture (Back-of-House Systems)

### 3.1 Commercial Bill of Materials (BOM) & Cut-List Generator
When a client locks their dimensions and clears the 50% deposit, the Auraworks system automatically translates web parameters into an **Internal Engineering Job Card**:
* **Auto-Generated Cut-List:** Converts length and width parameters into linear tube cutting lists, plate nesting layouts, and sheet yield calculations.
* **Shop Floor Bay Routing:** Assigns the project ticket to the appropriate workshop bay (Bay 1: CNC Laser/Brake, Bay 2: TIG/MIG Welding, Bay 3: Surface Powdercoating/Pickling, Bay 4: Bench Assembly & QC).
* **Automated Drawing Generation:** Pre-renders standard orthographic projection views (Top, Front, Side) with locked customer dimensions for shop floor craftspeople.

### 3.2 Workshop Queue Telemetry & Capacity Balancer
The system features an internal operational dashboard that prevents shop floor overbooking:
* Tracks committed machine hours across CNC routers, laser cutters, and welding bays.
* Dynamically adjusts the client-facing estimated delivery lead time (e.g., shifts from *"4 Weeks"* to *"6 Weeks"* when workshop bay capacity crosses 80%).
* Automatically alerts the workshop manager when material stock (e.g., 304 stainless sheet inventory) reaches re-order thresholds based on incoming paid deposits.

---

## 4. Full Page Architecture & Section-by-Section Wireframe Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│ 0. TELEMETRY STRIP (SYS_ID: AW-CAD-PIPELINE-2026 // CAPACITY: 1 OPEN)  │
├────────────────────────────────────────────────────────────────────────┤
│ 1. CAD NAVIGATION (AW_CAD Logo, 01_SECTORS, 02_SIM, 03_BOM, 04_QA)    │
├────────────────────────────────────────────────────────────────────────┤
│ 2. HERO CHAPTER (Drafting Crosshairs, Spec Brief Tag, H1, Telemetry Bar)│
├────────────────────────────────────────────────────────────────────────┤
│ 3. MODULE 01: THREE QUALIFIED ICP ASSEMBLIES (Furniture, Steel, Fab)   │
├────────────────────────────────────────────────────────────────────────┤
│ 4. MODULE 02: LIVE SVG CAD DIMENSION SIMULATOR & BILL OF COSTS         │
├────────────────────────────────────────────────────────────────────────┤
│ 5. THE ENGINEERING SHIFT: WhatsApp Chaos vs. Parametric Pipeline       │
├────────────────────────────────────────────────────────────────────────┤
│ 6. MODULE 03: COMMERCIAL FRAMEWORK IN BOM TABLE FORMAT (Phase 1 & 2)   │
├────────────────────────────────────────────────────────────────────────┤
│ 7. UNIT ECONOMICS MODEL (AOV R25k-R250k+, Single Order Retainer Payback)│
├────────────────────────────────────────────────────────────────────────┤
│ 8. MODULE 04: QA TOLERANCE QUALIFICATION MATRIX (Pass/Fail Criteria)   │
├────────────────────────────────────────────────────────────────────────┤
│ 9. CAD INTAKE MODAL (Specification Intake & Workshop Screening)        │
├────────────────────────────────────────────────────────────────────────┤
│ 10. TECHNICAL FOOTER (System Ref, Regional Nodes, Confidentiality)     │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Section Breakdown Details
1. **Top Telemetry Strip:** Monospaced system telemetry: `SYSTEM_ID: AW-CAD-PIPELINE-2026 | TARGET: HIGH-TICKET PHYSICAL FABRICATORS | ALLOCATION: 2 OF 3 RETAINED SLOTS COMMITTED [ 1 SLOT AVAILABLE ]`.
2. **Hero Chapter:**
   - Spec Tag: `SPECIFICATION BRIEF // STRATEGIC REPOSITIONING & ICP TARGET SHIFT`
   - Headline: *"Custom dimension quoting engines & pipelines for bespoke physical manufacturers."*
   - Lead: How parametric quoting replaces WhatsApp voice notes and lost PDF takeoffs with automated math and 50% deposit capture.
   - 4-Item Schematic Bar: `R15,000+ Minimum AOV`, `50% Web Deposit Lock`, `1–3 Accounts / Mo Limit`, `1 Order Retainer Break-Even`.
3. **Module 01 // Qualified ICP Sub-Sectors (Assemblies):**
   - *SECTOR_SPEC_01 // JOINERY:* Bespoke timber/steel tables & modular boardrooms. Bottleneck: WhatsApp spec confusion & delayed milestones.
   - *SECTOR_SPEC_02 // ARCHITECTURAL:* Custom steel & glass partitions, decorative panels. Bottleneck: Lack of a structured digital spec catalog for architects.
   - *SECTOR_SPEC_03 // SPECIALIZED FAB:* Off-road campers, commercial braais, trailers. Bottleneck: Discovery-to-build queue stall due to manual intake.
4. **Module 02 // Live Interactive CAD Simulator:**
   - Left Pane: Interactive SVG drafting viewport with isometric projection, dynamic leader lines, and real-time wireframe table geometry.
   - Right Pane: Parametric X, Y, Z sliders, substrate material matrix, live footprint, calculated order value, and 50% deposit gate.
5. **The Engineering Shift (Before vs. After):** Contrasts the "Fragmented Manual Takeoff" trap against the "Parametric High-Ticket Web Machine".
6. **Module 03 // Commercial Package Structure (Contract BOM Table):**
   - Structured as a formal engineering Bill of Materials with columns: *COMMERCIAL PHASE*, *INVESTMENT STRUCTURE*, *SCOPE DELIVERABLES*, *CLIENT VALUE PROPOSITION*.
   - **Phase 1: Custom Storefront & Pipeline Build** (R45,000 – R75,000 once-off)
   - **Phase 2: Growth & Infrastructure Retainer** (R10,000 – R18,000 / month)
7. **Module 04 // QA Tolerance Qualification Matrix:**
   - *QA PASS (Schedule Discovery):* AOV R15,000+, physical workshop/machinery footprint, manual quoting bottleneck, leadership engagement.
   - *QA FAIL (Reject Intake):* Dropshipping/reselling, mass low-margin retail (AOV < R5k), solo home hobbyists, equity startups.
8. **CAD Intake Modal:** Monospaced terminal form collecting: Executive Name & Title, Workshop/Studio Name, Business Email, AOV bracket, and primary quoting bottleneck.

---

## 5. Design System Tokens & Micro-Interactions

### 5.1 Color Tokens
| Token Name | Hex Code | Purpose |
|---|---|---|
| `--bg-blueprint` | `#060c18` | Deep blueprint canvas background |
| `--bg-surface` | `#0a1325` | Primary container surface |
| `--bg-panel` | `#0e1b33` | Elevated data panels & bill cards |
| `--border-cad` | `#1d335a` | Blueprint grid borders & dividers |
| `--border-bright` | `#2d4f8a` | Active focus borders & hover states |
| `--cad-cyan` | `#38bdf8` | Primary technical accent, wireframes, leader lines |
| `--cad-cyan-glow` | `rgba(56, 189, 248, 0.15)` | Glowing technical telemetry highlights |
| `--cad-blue` | `#2563eb` | Secondary engineering accent |
| `--emerald-status`| `#10b981` | QA Pass, 50% deposit locks, nominal telemetry |
| `--amber-warn` | `#f59e0b` | Caution alerts, capacity warnings |
| `--red-alert` | `#f43f5e` | QA Fail, bottleneck indicators |
| `--text-main` | `#f8fafc` | Primary high-contrast technical headings |
| `--text-muted` | `#94a3b8` | Technical descriptions & parameter labels |
| `--text-dim` | `#64748b` | Coordinate metadata & footnote specs |

### 5.2 Typography System
* **Display & Headings:** `Space Grotesk` (Google Fonts: 500, 600, 700)
  - Hero H1: `clamp(34px, 5vw, 62px)`, line-height: `1.1`, tracking: `-0.02em`
  - Section H2: `clamp(26px, 3.5vw, 40px)`, line-height: `1.15`, tracking: `-0.01em`
  - Assembly Titles: `20px to 22px`, font-weight: `700`
* **Technical Parameters & Telemetry:** `JetBrains Mono` (Google Fonts: 400, 500, 600, 700)
  - Coordinates & Status Badges: `10px to 12px`, uppercase, letter-spacing: `0.08em`
  - Calculated Pricing & Dimensions: `22px to 28px`, font-weight: `700`
  - BOM Table Data: `11.5px to 13px`, font-weight: `500`
* **Body Text:** `Inter` (Google Fonts: 400, 500, 600)
  - Standard Explanations: `14px to 16px`, line-height: `1.55`

### 5.3 Micro-Interactions & Animation Specs
1. **SVG Wireframe Isometric Morphing:** Adjusting the length or width slider instantly updates SVG polygon vertex points (`points="x1,y1 x2,y2 x3,y3 x4,y4"`) and repositions the dimension leader callout line with fluid CSS transition.
2. **Coordinate Telemetry Hover:** Interactive cards feature subtle cyan glow shifts (`box-shadow: 0 0 20px rgba(56, 189, 248, 0.15)`) on hover.
3. **Parametric Slider Styling:** Custom cyan slider track with square thumb (`width: 16px; height: 16px; border-radius: 2px`) echoing technical CAD scrub controls.
4. **BOM Line Item Calculation:** Dynamic recalculation of area, price, and deposit without page refresh.

---

## 6. Implementation Readiness Checklist

- [ ] **Technical Grid System:** Blueprint coordinate background using pure CSS gradients (`linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px)`).
- [ ] **Interactive SVG Viewport:** Pure scalable vector graphic with dynamic JavaScript DOM node updates for points and text coordinates.
- [ ] **BOM Spec Table:** Responsive, high-density table structure with semantic styling for contract phases.
- [ ] **QA Tolerance Validation:** Pass/Fail qualification matrix with clear visual dichotomy.
- [ ] **Responsive Engineering:** Fluid adaptation across widescreen CAD monitors (1440px+), standard laptops (1024px), and mobile workshop tablets (768px).
- [ ] **Zero Framework Bloat:** Self-contained, ultra-fast vanilla HTML5, CSS3, and JavaScript.
