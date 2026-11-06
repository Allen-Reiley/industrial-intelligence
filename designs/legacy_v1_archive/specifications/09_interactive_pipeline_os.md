# Design Specification 09: The Pipeline OS & Workshop Engine (Software-First Operational Hub)
**Design Code:** `AW-DSGN-09-OS`  
**Target Sub-Sectors:** High-Volume Custom Fabricators, Multi-Bay Joinery Workshops, Multi-Stage Architectural Finish Plants  
**Strategic Archetype:** Modern Software IDE, Interactive Operating System & Live Kanban Telemetry  
**Primary Psychological Objective:** Operational automation, elimination of double-handling, real-time pipeline visibility, and unified workshop control.

---

## 1. Executive Persona & Trust Thesis

### 1.1 The Prospective Client Profile
* **Target Decision Maker:** Managing Director, Operations Director, Works Manager, or Tech-Forward Founder of an established custom physical manufacturing business.
* **Economic Reality:**
  - Average Order Value (AOV) is **R20,000 to R200,000+** per commissioned project.
  - The business processes 10 to 40+ custom bespoke orders per month, managing multiple active trades simultaneously (CNC cutting, joinery bench assembly, spray finishing, metal fabrication, site installation).
* **The Emotional & Tactical Reality:**
  - They are systematic and process-oriented. They hate friction, duplicated data entry, and dropped balls.
  - **Their Current Operational Nightmare:** Their front-of-house sales process is completely disconnected from their back-of-house workshop floor:
    1. Inquiries arrive on WhatsApp, email, or showroom paper forms.
    2. An estimator re-types dimensions into an Excel spreadsheet to produce a quote.
    3. If the quote is accepted, a bookkeeper checks the bank account for an EFT deposit.
    4. Someone then creates a manual Trello or white-board card for the shop floor.
    5. Craftspeople on the floor lose the latest dimension revision, leading to expensive shop floor rework and delayed delivery deadlines.
  - **What They Need to See:** When they visit Auraworks, they don't want a generic creative marketing agency. They want to see **industrial-grade software architecture**: a unified platform where customer dimension quoting *automatically* creates, funds, and routes the production ticket straight to the factory floor without a single manual re-entry.

### 1.2 The Trust Architecture: Why They Trust Auraworks Instantly
1. **The Live Dual-Pane OS Interface:** Right on the landing page, visitors interact with a live working operating system: adjusting sliders on the client quoting engine on the left, clicking *"Simulate 50% Deposit"*, and watching an animated job ticket dynamically appear inside the live workshop Kanban board on the right.
2. **Elimination of Administrative Double-Handling:** Proves to operations managers that Auraworks eliminates the 15–20 hours a week spent re-entering customer specs into internal clipboards or spreadsheets.
3. **Structured Webhook & Accounting Integration:** Shows how web deposit capture automatically reconciles accounting, locks inventory, and releases CAD cut-lists to shop floor machinery.

---

## 2. Bespoke Ecommerce Architecture (Pipeline OS Storefront)

### 2.1 Visual Atmosphere & Art Direction
* **Canvas Styling:** High-density dark IDE theme (`#0d1117`), dark slate container panels (`#161b22`), elevated cards (`#21262d`), and fine structural divider borders (`#30363d`).
* **OS Window Chrome:** Mac/Linux-style window controls (red close `#f85149`, yellow minimize `#d29922`, green expand `#2ea043`), code terminal breadcrumbs, and live telemetry badges (`ACTIVE TELEMETRY: CONNECTED`).
* **Typography:**
  - Headings & Interface Copy: *Inter* (Google Fonts: 400, 500, 600, 700, 800) — clean, modern, and perfectly suited for dense dashboard UI.
  - Terminal Prompts, Calculations & Tags: *JetBrains Mono* (Google Fonts: 400, 500, 600, 700) — technical monospaced precision.

### 2.2 The Storefront Quoting Engine (Left Pane)
The left pane functions as the customer-facing spec intake module:
* **Parametric Controls:**
  - Table Length Slider: 1,800 mm to 4,200 mm (100 mm steps) with live monospaced feedback.
  - Table Width Slider: 800 mm to 1,500 mm (50 mm steps).
* **Substrate Material Pills:**
  - *French Oak Solid Slab:* Base multiplier $1.00\times$.
  - *American Walnut Core:* Multiplier $1.35\times$.
  - *Structural Steel Base Frame:* Multiplier $1.20\times$.
* **Calculated Pricing & 50% Deposit Display:**
  - Dynamically computes total specification value: `R51,000`.
  - Calculates mandatory 50% production deposit: `50% Production Deposit: R25,500`.
* **The Live Simulation Trigger Button:**
  - A prominent green action button:
    `+ Simulate 50% Deposit & Queue In Pipeline`.
  - Clicking this button executes a real-time JavaScript DOM injection that generates an order ticket and animates it directly into the shop floor Kanban board in the right pane.

---

## 3. Custom Operational Tool Architecture (Live Kanban Pipeline)

### 3.1 The 4-Column Workshop Dispatch Board (Right Pane)
The right pane demonstrates the internal workshop dispatch board:
* **Column 1 // Inbound Inquiries:**
  - Displays incoming quote configurations with order IDs (`INQ-9481`, `INQ-9482`), time elapsed, project titles, and estimated values.
* **Column 2 // Dimensions Locked:**
  - Orders where technical parameters have been mathematically verified against workshop lumber and steel availability (`SPEC-8812`).
* **Column 3 // 50% Deposit Paid (Shop Gate):**
  - Highlighted with green borders. Displays cleared web deposits (`PAID_DEP: R34,000`), locking production dates on the workshop schedule.
  - Dynamically receives the simulated order when the user interacts with the left-hand engine.
* **Column 4 // CNC & Workshop Queue:**
  - Displays active shop floor jobs assigned to specific machinery bays (`SHOP-01 In CNC`, `SHOP-02 Assembly`).

### 3.2 Real-Time Webhook & ERP Bridge
The back-of-house software architecture connects the web storefront to the client's broader operational ecosystem:
* Automatically fires webhooks into accounting platforms (Xero, QuickBooks) for deposit invoice reconciliation.
* Syncs with team messaging platforms (Slack, Teams, WhatsApp Business API) to notify the works manager the second a customer clears a milestone payment.

---

## 4. Full Page Architecture & Section-by-Section Wireframe Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│ 0. TOP OS BAR (AURAWORKS_PIPELINE_OS // CAPACITY: 1–3 ACCOUNTS / MO)   │
├────────────────────────────────────────────────────────────────────────┤
│ 1. HEADER (Logo >_ AW, PIPELINE OS Badge, Nav Links, Apply for Retainer│
├────────────────────────────────────────────────────────────────────────┤
│ 2. HERO CHAPTER (Hero Telemetry Tag, Main H1, Lead Copy, Try App CTA)  │
├────────────────────────────────────────────────────────────────────────┤
│ 3. THE LIVE PIPELINE DUAL-PANE APP (Left: Quoting // Right: Kanban)    │
├────────────────────────────────────────────────────────────────────────┤
│ 4. SECTION 01: THREE QUALIFIED ICP VERTICALS (Furniture, Metal, Fab)   │
├────────────────────────────────────────────────────────────────────────┤
│ 5. THE OPERATIONAL SHIFT: From Clipboard Chaos to Unified Pipeline OS │
├────────────────────────────────────────────────────────────────────────┤
│ 6. SECTION 02: TWO-PHASE COMMERCIAL FRAMEWORK (Phase 1 Build & Retainer│
├────────────────────────────────────────────────────────────────────────┤
│ 7. SECTION 03: QUALIFICATION MATRIX FOR BOOKING (Qualified vs. Reject) │
├────────────────────────────────────────────────────────────────────────┤
│ 8. WORKSHOP DISCOVERY APPLICATION (Technical Intake Flow)              │
├────────────────────────────────────────────────────────────────────────┤
│ 9. PIPELINE OS FOOTER (Developer Telemetry, Regional Nodes, POPIA)     │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Section Breakdown Details
1. **Top OS Bar:** High-density terminal strip: `AURAWORKS_PIPELINE_OS // PRODUCTION TRACKING &amp; QUOTING | CAPACITY: 1–3 RETAINED ACCOUNTS / MONTH [1 SLOT OPEN]`.
2. **Header:** Features the terminal logo `>_ AW`, bold `PIPELINE OS` pill badge, uppercase navigation links (`ICP Verticals`, `Live Pipeline OS`, `Commercials`, `Filtration`), and primary green button: `Apply for Retainer`.
3. **Hero Chapter:**
   - Tag: Green pulsing indicator with text: `EXECUTIVE ICP TARGET SHIFT: BESPOKE PHYSICAL MANUFACTURERS`.
   - Headline: *"Custom dimension quoting &amp; production pipeline architecture."*
   - Lead: How Auraworks replaces manual WhatsApp quoting and stalled spreadsheets with automated dimension estimating, 50% web deposit capture, and internal shop floor queue tracking.
4. **The Live Pipeline OS Dual-Pane Application:**
   - Window Header: Mac/Linux close/minimize/expand buttons, window title `AURA_PIPELINE_ENGINE v2.4`, and live telemetry indicator.
   - Left Pane (440px width): Parametric sliders, substrate selection pills, calculated specification value, 50% deposit callout, and simulation trigger button.
   - Right Pane (Flexible width): 4-column scrollable Kanban board with real cards and dynamic order counter.
5. **Section 01 // Target Client Profile (ICP):**
   - Three dark container cards detailing:
     * *JOINERY_01: Bespoke Architectural Furniture* (timber/steel tables, boardrooms).
     * *ARCH_FINISH_02: High-End Architectural Finishes* (steel & glass partitions, decorative panels).
     * *SPEC_FAB_03: Specialized Fabrication & Outfitting* (campers, braais, pergolas, trailers).
   - Each card features a red pain box and a green solution box.
6. **Section 02 // Commercial Framework:**
   - Two high-contrast cards:
     * **Phase 01 // Core Architecture:** `R45,000 – R75,000 once-off` (Featured Git-green glow: High-converting showcase, dimension quoting engine, internal pipeline dashboard).
     * **Phase 02 // Performance:** `R10,000 – R18,000 / month` (Pipeline blue accent: Technical SEO, AI search visibility in ChatGPT/Google AI, lead flow auditing, speed assurance).
7. **Section 03 // Qualification Matrix:**
   - `[QUALIFIED] Target Qualifiers (Book Call)` in green vs. `[DISQUALIFIED] Immediate Disqualifiers (Do Not Book)` in red.
8. **Pipeline OS Footer:** Monospaced system telemetry, regional nodes, and legal compliance metadata.

---

## 5. Design System Tokens & Micro-Interactions

### 5.1 Color Tokens
| Token Name | Hex Code | Semantic Role |
|---|---|---|
| `--os-bg` | `#0d1117` | Root dark IDE canvas |
| `--os-surface` | `#161b22` | Primary container & sidebar surfaces |
| `--os-card` | `#21262d` | Elevated cards & Kanban tickets |
| `--os-border` | `#30363d` | Structural grid lines & card borders |
| `--os-border-bright`| `#484f58` | Highlighted hover borders |
| `--os-green` | `#2ea043` | Git green, active buttons, cleared deposits |
| `--os-green-glow`| `rgba(46, 160, 67, 0.15)` | Glowing button focus aura |
| `--os-blue` | `#58a6ff` | Technical labels, links, Phase 2 retainer |
| `--os-purple` | `#bc8cff` | Machine tags & CNC queue indicators |
| `--os-amber` | `#d29922` | Window warning button, caution alerts |
| `--os-red` | `#f85149` | Window close button, disqualified alerts |
| `--os-text` | `#f0f6fc` | High-contrast UI text |
| `--os-muted` | `#8b949e` | Secondary copy & parameter descriptions |
| `--os-dim` | `#6e7681` | Metadata tags & timestamps |

### 5.2 Typography System
* **Interface Headings & UI:** `Inter` (Google Fonts: 400, 500, 600, 700, 800)
  - Hero H1: `clamp(34px, 5vw, 60px)`, weight: `800`, line-height: `1.1`, tracking: `-0.02em`
  - Section H2: `clamp(28px, 4vw, 42px)`, weight: `800`, tracking: `-0.01em`
  - Card Titles: `20px to 24px`, weight: `700`
* **Monospaced Code & Telemetry:** `JetBrains Mono` (Google Fonts: 400, 500, 600, 700)
  - System Tags & Badges: `10.5px to 11.5px`, uppercase
  - Price Outputs: `26px to 34px`, weight: `700`
  - Ticket IDs & Metadata: `10px to 11px`

### 5.3 Micro-Interactions & Animation Specs
1. **Interactive Kanban Ticket Injection:** Clicking `+ Simulate 50% Deposit` dynamically creates a new DOM card with a smooth fade-and-slide keyframe animation (`animation: fadeIn 0.4s ease`), increments the column badge counter, and highlights the border with a pulsing green glow.
2. **Dynamic Range Slider:** Slider thumb smoothly updates both numeric readout and square-meter calculations in real time.
3. **Pill Selector Snapping:** Clicking a substrate pill inverts colors to blue and white instantly, recalculating the base rate formula.

---

## 6. Implementation Readiness Checklist

- [ ] **Dual-Pane CSS Grid Architecture:** Stable split layout (`440px 1fr`) with responsive fallback to vertical stack on mobile.
- [ ] **Dynamic DOM Ticket Generator:** JavaScript function binding the quoting engine directly to the Kanban board array.
- [ ] **Monospaced Telemetry Contrast:** High-contrast pairing of `#58a6ff` blue and `#2ea043` green against `#0d1117` IDE dark.
- [ ] **Fluid Responsive Breakpoints:** Flawless horizontal scrolling on Kanban columns for smaller screens without breaking page bounds.
- [ ] **Zero-Framework Code:** Ultra-fast native JavaScript execution without heavy third-party dashboard libraries.
