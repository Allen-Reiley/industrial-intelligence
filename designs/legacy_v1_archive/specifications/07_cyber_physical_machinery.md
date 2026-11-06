# Design Specification 07: Cyber-Physical Machinery Forge (Heavy Industry & Telemetry)
**Design Code:** `AW-DSGN-07-FORGE`  
**Target Sub-Sectors:** Specialized Fabrication & Outfitting, Heavy Metalwork Workshops, Commercial Braai/Kitchen Fabricators, Off-Road Camper Outfitting  
**Strategic Archetype:** Heavy Industrial Machinery, Chamfered Geometry & Shop Floor Telemetry  
**Primary Psychological Objective:** Industrial strength, shop floor credibility, machine-level precision, and end-to-end fabrication control.

---

## 1. Executive Persona & Trust Thesis

### 1.1 The Prospective Client Profile
* **Target Decision Maker:** Founder, Plant Director, Head of Fabrication, or Works Manager of an established specialized fabrication plant, heavy structural metal workshop, or custom overland vehicle outfitting facility.
* **Economic Reality:**
  - Average Order Value (AOV) is **R35,000 to R350,000+** per commissioned physical build (turnkey off-road expedition camper conversions, commercial stainless steel braai/kitchen islands, heavy chassis trailers, luxury architectural pergolas).
  - Heavy capital investment in equipment: fiber laser cutters, CNC press brakes, TIG/MIG welding bays, plasma tables, and powdercoating booths.
* **The Emotional & Tactical Reality:**
  - These leaders operate in high-torque physical environments. They value durability, structural integrity, and raw machinery capability.
  - **Their Core Skepticism:** *"Typical tech agencies build delicate retail shops for T-shirts and coffee beans. They don't have a clue what a fiber laser cut-sheet looks like, how welding bay scheduling works, or how many hours go into TIG welding a custom fuel tank."*
  - **Their Operational Nightmare:**
    - Customers inquire with complex, modular requirements (*"Can you build a camper canopy with integrated lithium battery power, 80L water tank, slide-out fridge tray, and rooftop tent brackets?"*).
    - Estimators spend 3 to 5 days manually building spreadsheets to calculate steel gauges, wiring harnesses, and labor hours.
    - Orders stall on clipboards in the workshop office; materials are ordered before deposits clear; welding bays sit idle waiting for specifications or get bottlenecked during crunch weeks.

### 1.2 The Trust Architecture: Why They Trust Auraworks Instantly
1. **The Visual Language of Heavy Machinery:** Carbon matte black surfaces (`#090a0d`), chamfered/angled card corners (`clip-path: polygon(...)`), high-torque volt yellow accents (`#facc15`), status LEDs, and hazard warning geometry create immediate industrial alignment.
2. **Modular Parametric Intake:** Proves that Auraworks understands complex multi-variable manufacturing: structural steel gauges, aluminum alloys, integrated auxiliary systems, and bay labor hours.
3. **Machine Bay Allocation & 50% Deposit Lock:** Connects web customer checkout directly to shop floor scheduling, ensuring no CNC laser cuts metal and no welder strikes an arc without a cleared 50% commitment deposit.

---

## 2. Bespoke Ecommerce Architecture (Heavy Outfitting Storefront)

### 2.1 Visual Atmosphere & Art Direction
* **Canvas Styling:** Matte carbon black (`#090a0d`) paired with steel plate panels (`#12141a`), machine borders (`#2a303f`), and volt yellow illuminated accents (`#facc15`).
* **Chamfered Component Geometry:** Faceted 45-degree corner cuts on buttons, badges, and card containers mimicking heavy-duty CNC-milled chassis components:
  `clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)`
* **Typography:**
  - Headings & Telemetry: *Chakra Petch* (Google Fonts: 600, 700) — an angular, technological industrial typeface with heavy machine presence.
  - Parameters & Coordinates: *JetBrains Mono* (Google Fonts: 400, 500, 600) for telemetry and cut data.
  - Analytical Copy: *Inter* (Google Fonts: 400, 500, 600) for readable explanations.

### 2.2 The Modular Outfitting & CNC Quoting Simulator
The client-facing storefront replaces vague inquiry forms with a high-performance **Modular Outfitting Engine**:
* **Parametric Dimensional Controls:**
  - Overall Length: 1,800 mm to 4,500 mm (100 mm increments)
  - Overall Width / Span: 800 mm to 1,800 mm (50 mm increments)
  - Live calculated surface footprint in $m^2$.
* **Material & Substrate Grade Switches:**
  - *Heavy 304 Stainless Steel (1.5mm–2.0mm)*: Marine-grade corrosion resistance for coastal kitchens and commercial braais ($1.00\times$ base).
  - *French Oak & Structural Box Steel Hybrid*: Architectural outdoor/indoor joinery ($1.25\times$ base).
  - *5083 Aviation/Marine Grade Aluminum*: Lightweight high-strength alloy for expedition camper bodies ($1.40\times$ base).
* **Live Calculation & 50% Deposit Banner:**
  - Total order value calculates instantly: `TOTAL ORDER VALUE: R57,500`.
  - Prominent high-contrast deposit banner:
    `REQUIRED 50% DEPOSIT: R28,750`.
  - Customer guarantee: *"Binds raw sheet inventory allocation, locks CNC cutting schedule, and reserves welding bay time upon clearance."*

---

## 3. Custom Operational Tool Architecture (Back-of-House Systems)

### 3.1 Real-Time Fabrication Bay & CNC Queue Monitor
The internal tool provides the works manager with a real-time **Shop Floor Dispatch Board**:
* **Bay 1: CNC Laser Cutting & Press Brake:** Receives automated nested DXF cut-lists straight from the web configurator.
* **Bay 2: TIG / MIG Welding:** Tracks allocated welding hours per chassis assembly and flags build progress.
* **Bay 3: Surface Finishing & Powdercoating:** Coordinates chemical pickling, bead blasting, and powdercoat curing schedules.
* **Bay 4: Final Assembly & QC Testing:** Pre-delivery inspection checklist before customer dispatch.

### 3.2 Automated Drawing & Nesting Data Pipeline
* Converts client web specifications directly into flat-pattern dimensional data for laser cutting, eliminating hours of manual draughtsman transcription.
* Tracks sheet material yield, minimizing scrap rates and optimizing raw steel usage.

---

## 4. Full Page Architecture & Section-by-Section Wireframe Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│ 0. HAZARD STRIPE + TELEMETRY BAR (AW-FORGE // CAPACITY: 1 OPEN)        │
├────────────────────────────────────────────────────────────────────────┤
│ 1. HEADER (AW-FORGE Badge, Navigation Links, Chamfered Button Apply)   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. HERO CHAPTER (Industrial Tag, Heavy H1, Lead Copy, 4 Telemetry Cards)│
├────────────────────────────────────────────────────────────────────────┤
│ 3. MODULE 01: THREE QUALIFIED ICP VERTICALS (Furniture, Finishes, Fab) │
├────────────────────────────────────────────────────────────────────────┤
│ 4. MODULE 02: CNC QUOTING SIMULATOR & WORKSHOP SPEC INTAKE             │
├────────────────────────────────────────────────────────────────────────┤
│ 5. THE HEAVY SHIFT: Manual Clipboard Chaos vs. Cyber-Physical Pipeline │
├────────────────────────────────────────────────────────────────────────┤
│ 6. MODULE 03: COMMERCIAL FRAMEWORK (Phase 1 Build & Phase 2 Retainer)  │
├────────────────────────────────────────────────────────────────────────┤
│ 7. UNIT ECONOMICS: Single Order Payback on High-Ticket Fabrication     │
├────────────────────────────────────────────────────────────────────────┤
│ 8. MODULE 04: QUALIFICATION TOLERANCE MATRIX (Pass vs. Fail)           │
├────────────────────────────────────────────────────────────────────────┤
│ 9. WORKSHOP DISCOVERY INTAKE (Technical Screening Form)                │
├────────────────────────────────────────────────────────────────────────┤
│ 10. HEAVY INDUSTRIAL FOOTER (System Telemetry, POPIA Compliance)       │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Section Breakdown Details
1. **Hazard Stripe & Telemetry Bar:** High-contrast yellow/black diagonal warning stripe paired with a monospaced telemetry bar: `MODULE: CYBER-PHYSICAL WORKSHOP PIPELINE ARCHITECTURE // TARGET: HIGH-TICKET FABRICATION & OUTFITTING | CAPACITY: 1–3 RETAINED ACCOUNTS / MONTH (1 SLOT OPEN)`.
2. **Header:** Features the chamfered `AW-FORGE` logo mark, uppercase navigation links (`Sectors`, `CNC Quoting`, `Commercials`, `Filtration`), and primary chamfered action button: `Apply for Intake`.
3. **Hero Chapter:**
   - Tag: `[STRATEGIC REPOSITIONING BRIEF // INTERNAL SALES ENABLEMENT]`
   - Headline: *"Custom dimension quoting &amp; pipelines for bespoke physical fabricators."*
   - Lead: How Auraworks replaces unstructured WhatsApp voice notes, lost PDF attachments, and manual estimating bottlenecks with mathematical dimension quoting, instant 50% deposit capture, and workshop dispatch pipelines.
   - 4-Card Chamfered Telemetry Grid:
     * `R15,000+` (Target Minimum AOV)
     * `50% Lock` (Automated Web Deposit in Green)
     * `1–3 Accounts` (Monthly Retainer Cap)
     * `1 Order` (Retainer Payback)
4. **Module 01 // Target Client Profile (ICP):**
   - Three metal plate cards detailing:
     * *SUB_SECTOR_01: Bespoke &amp; Architectural Furniture* (timber/steel tables, boardrooms).
     * *SUB_SECTOR_02: High-End Architectural Finishes* (steel & glass partitions, decorative panels).
     * *SUB_SECTOR_03: Specialized Fabrication &amp; Outfitting* (campers, braais, pergolas, trailers).
   - Each card features an alert box (red accent) and an action build box (green accent).
5. **Module 02 // CNC Quoting Simulator:**
   - Left: Length and Width sliders with heavy metal material switches (304 Stainless, Oak/Steel, Aluminum).
   - Right: Shop spec intake summary card displaying surface footprint, material spec, 4–6 week production lead time, large calculated order value (`R57,500`), and green deposit banner (`R28,750`).
6. **Module 03 // Commercial Package Structure:**
   - Two industrial cards:
     * **Phase 01 // Core Architecture:** `R45,000 – R75,000 once-off` (Volt yellow highlight: High-converting showcase, dimension quoting engine, internal pipeline dashboard).
     * **Phase 02 // Performance:** `R10,000 – R18,000 / month` (Technical SEO, AI search visibility in ChatGPT/Google AI, lead flow auditing, speed assurance).
7. **Module 04 // Qualification Tolerance Matrix:**
   - `[PASS] TARGET QUALIFIERS (BOOK DISCOVERY):` AOV R15,000+, physical workshop/machinery, manual intake bottleneck, Founder/MD engagement.
   - `[REJECT] IMMEDIATE DISQUALIFIERS (DO NOT BOOK):` Dropshippers/importers, low-margin retail (AOV < R5k), solo home hobbyists, equity startups.
8. **Heavy Machinery Footer:** Complete industrial telemetry, regional nodes, and confidentiality notices.

---

## 5. Design System Tokens & Micro-Interactions

### 5.1 Color Tokens
| Token Name | Hex Code | Semantic Role |
|---|---|---|
| `--bg-carbon` | `#090a0d` | Matte carbon black canvas |
| `--bg-metal` | `#12141a` | Metal plate container surface |
| `--bg-panel` | `#181b24` | Elevated machine panel cards |
| `--border-steel` | `#2a303f` | Heavy steel boundary lines |
| `--border-hazard`| `#444f68` | Elevated focus borders |
| `--volt-yellow` | `#facc15` | High-torque volt yellow primary accent |
| `--volt-dark` | `#ca8a04` | Secondary volt yellow gradient |
| `--volt-glow` | `rgba(250, 204, 21, 0.2)` | Glowing industrial focus states |
| `--signal-green` | `#22c55e` | Active machine running status, 50% deposit locks |
| `--signal-red` | `#ef4444` | Hazard warnings, disqualified alerts |
| `--text-white` | `#f8fafc` | High-contrast industrial titles |
| `--text-muted` | `#94a3b8` | Parameter explanations & body text |
| `--text-dim` | `#64748b` | Machine coordinates & footnote specs |

### 5.2 Typography System
* **Display & Headings:** `Chakra Petch` (Google Fonts: 500, 600, 700)
  - Hero H1: `clamp(36px, 5.5vw, 68px)`, weight: `700`, line-height: `1.05`, uppercase
  - Section H2: `clamp(28px, 4vw, 44px)`, weight: `700`, uppercase
  - Card Titles: `22px to 24px`, weight: `700`, uppercase
  - Metric Numbers: `30px to 36px`, weight: `700`
* **Telemetry & Coordinates:** `JetBrains Mono` (Google Fonts: 400, 500, 600, 700)
  - System Tags & Badges: `10.5px to 12px`, uppercase
  - Quoting Output: `13px to 14px`, weight: `600`
* **Analytical Body:** `Inter` (Google Fonts: 400, 500, 600)
  - Body Explanations: `14px to 16px`, line-height: `1.55`

### 5.3 Micro-Interactions & Animation Specs
1. **Chamfered Button Hover:** Subtle expansion with glowing volt yellow aura (`box-shadow: 0 0 20px rgba(250, 204, 21, 0.2)`).
2. **Pulsing Green LED:** Continuous pulse keyframe on the top telemetry bar indicating active operational status.
3. **Machine Switch Toggle:** Material grade switches snap decisively with an immediate background color change to volt yellow and black text.

---

## 6. Implementation Readiness Checklist

- [ ] **CSS Polygon Chamfers:** Clean cross-browser implementation of `clip-path: polygon(...)` on buttons, badges, and card corners.
- [ ] **Hazard Pattern Gradient:** CSS repeating linear gradient for the top warning stripe without image assets.
- [ ] **CNC Mathematical Engine:** Vanilla JavaScript event listeners calculating footprint and 50% deposit dynamically.
- [ ] **Industrial Color Balance:** High-contrast pairing of `#facc15` volt yellow against `#090a0d` carbon black.
- [ ] **Responsive Breakpoints:** Fully responsive across ruggedized mobile tablets (768px) and desktop workstation monitors (1280px+).
