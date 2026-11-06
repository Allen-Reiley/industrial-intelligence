# Implementation Plan: Design 09 — Interactive Pipeline OS
**Target File:** `designs/09_interactive_pipeline_os.html`  
**Specification Reference:** `designs/specifications/09_interactive_pipeline_os.md`  
**Design Code:** `AW-DSGN-09-OS`  
**Archetype:** Modern Software IDE, Interactive Operating System & Live Kanban Telemetry  
**Target Audience:** High-volume custom fabricators, multi-bay joinery workshops, multi-stage architectural finish plants (AOV R20,000 to R200,000+).

---

## 1. Executive Strategy & Technical Architecture Overview

The purpose of this document is to specify the complete, self-contained implementation architecture for `09_interactive_pipeline_os.html`. This page represents a software-first approach to physical manufacturing operations. It is styled as a high-density, professional developer IDE (reminiscent of GitHub dark or modern terminal interfaces) featuring a **working dual-pane operational simulator**: visitors configure a custom physical piece on the left and click `+ Simulate 50% Deposit`, which dynamically generates an internal job ticket and animates it directly into the shop floor Kanban board on the right. This proves conclusively that Auraworks eliminates administrative double-handling and connects web deposits directly to workshop machinery.

### 1.1 Technical Constraints & Standards
* **Self-Contained File:** Single HTML5 document containing all markup, custom CSS properties, responsive media queries, and vanilla JavaScript calculation logic. Zero external runtime dependencies or CSS frameworks.
* **Typography:** Preconnected Google Fonts:
  - `Inter:wght@400;500;600;700;800` (Dense, legible UI and dashboard interface text)
  - `JetBrains Mono:wght@400;500;600;700` (Terminal commands, ticket IDs, price telemetry, code breadcrumbs)
* **Color System & IDE Aesthetics:**
  - Dark IDE canvas: `--os-bg: #0d1117`
  - Container surface: `--os-surface: #161b22`
  - Elevated card & ticket surface: `--os-card: #21262d`
  - Structural divider borders: `--os-border: #30363d`
  - Highlighted hover borders: `--os-border-bright: #484f58`
  - Git green accent: `--os-green: #2ea043`
  - Git green glow: `--os-green-glow: rgba(46, 160, 67, 0.15)`
  - Pipeline blue: `--os-blue: #58a6ff`
  - Machine purple: `--os-purple: #bc8cff`
  - Warning amber: `--os-amber: #d29922`
  - Close/alert red: `--os-red: #f85149`
  - Text primary: `--os-text: #f0f6fc`
  - Text secondary: `--os-muted: #8b949e`
  - Text dim: `--os-dim: #6e7681`
* **Core Interactive Engines:**
  - Live dual-pane Pipeline OS container with Mac/Linux window chrome controls.
  - Left Pane Quoting Engine with parametric sliders, material selection pills, live square meter calculation, and 50% deposit callout.
  - Right Pane 4-Column Kanban Dispatch Board with interactive DOM ticket injection and animated state transitions.
  - Technical qualification intake modal.

---

## 2. Granular Task Checklist

### Phase 1: Document Foundation & IDE Styling Tokens
- [ ] **1.1 HTML5 Skeleton & IDE Metadata:**
  - Semantic `<head>` with viewport meta, charset UTF-8, title: `Auraworks Pipeline OS | Manufacturing Quoting & Workshop Kanban Architecture`.
  - OpenGraph meta tags, robots meta (`index, follow`), Google Fonts preconnect for `Inter` and `JetBrains Mono`.
- [ ] **1.2 CSS Root Variables & OS Theming Tokens:**
  - Declare dark IDE surfaces (`--os-bg`, `--os-surface`, `--os-card`, `--os-border`, `--os-border-bright`).
  - Declare accent tokens: `--os-green: #2ea043`, `--os-blue: #58a6ff`, `--os-purple: #bc8cff`, `--os-amber: #d29922`, `--os-red: #f85149`.
  - Declare typography clamp formulas (`--fs-hero`, `--fs-h2`, `--fs-h3`, `--fs-mono`).
- [ ] **1.3 Window Chrome Styling & Monospaced Utility Classes:**
  - OS window header styling with red, yellow, and green circular control dots (`12px x 12px`).
  - Clean monospace badge styles, ticket card border styles, and custom IDE scrollbar with slate track and dark grey thumb.

### Phase 2: Top OS Bar & Terminal Header Navigation
- [ ] **2.1 Monospaced System Bar (Top Rule):**
  - High-density dark strip: `AURAWORKS_PIPELINE_OS // PRODUCTION TRACKING & QUOTING | CAPACITY: 1–3 RETAINED ACCOUNTS / MONTH [1 SLOT OPEN]`.
  - Live pulsing green status pip (`#2ea043`).
- [ ] **2.2 Terminal Navigation Header:**
  - Logo: `>_ AW` code monogram + `PIPELINE OS` version badge (`v2.4`).
  - Navigation anchors: `#live-app`, `#sectors`, `#operational-shift`, `#commercials`, `#qualification`.
  - CTA Button: Git green button: `Apply for Retainer`.

### Phase 3: Hero Chapter & Software-First Value Proposition
- [ ] **3.1 Angular Hero Typography & Narrative:**
  - Eyebrow badge: `EXECUTIVE ICP TARGET SHIFT: BESPOKE PHYSICAL MANUFACTURERS`.
  - H1 Display: `"Custom dimension quoting & production pipeline architecture."`
  - Subtitle: Articulate how Auraworks replaces manual WhatsApp quoting and stalled spreadsheets with automated dimension estimating, 50% web deposit capture, and internal shop floor queue tracking.
- [ ] **3.2 Primary Action Buttons:**
  - Primary button: `[ Launch Live Simulator ]` (smooth scrolls to `#live-app`).
  - Secondary button: `[ Review Commercial Contracts ]` (smooth scrolls to `#commercials`).
- [ ] **3.3 Four-Card Engineering Telemetry Grid:**
  - Card 1: `R15,000+` — Minimum Average Order Value for viable client payback.
  - Card 2: `50% Lock` — Automated Web Deposit Collection.
  - Card 3: `1–3 Accounts / Mo` — Dedicated senior engineering capacity.
  - Card 4: `1 Closed Deal` — Exactly 1 bespoke order covers the entire monthly retainer.

### Phase 4: The Live Pipeline OS Dual-Pane Application
- [ ] **4.1 Window Container & Chrome:**
  - Sleek IDE window container with dark slate surface (`#161b22`), top bar with Mac/Linux window dots, window title `AURA_PIPELINE_ENGINE v2.4`, and live telemetry status badge.
- [ ] **4.2 Left Pane: Storefront Quoting Engine (440px):**
  - Length Slider: 1,800 mm to 4,200 mm (100 mm steps) with active monospaced feedback.
  - Width Slider: 800 mm to 1,500 mm (50 mm steps) with active monospaced feedback.
  - Substrate Material Pills:
    * *French Oak Solid Slab:* Base multiplier $1.00\times$.
    * *American Walnut Core:* Multiplier $1.35\times$.
    * *Structural Steel Base Frame:* Multiplier $1.20\times$.
  - Calculated Output & 50% Deposit Display:
    * Surface Area in $m^2$: $\text{Area} = \frac{\text{Length}}{1000} \times \frac{\text{Width}}{1000}$.
    * Base Rate: R13,000 per $m^2$.
    * Total Price Formula: $\text{Total} = (\text{Area} \times \text{Base Rate}) \times \text{Substrate Multiplier}$.
    * 50% Deposit Callout: `50% Production Deposit: R XX,XXX`.
  - The Live Simulation Trigger Button:
    `+ Simulate 50% Deposit & Queue In Pipeline` (Git green button).
- [ ] **4.3 Right Pane: 4-Column Workshop Kanban Dispatch Board:**
  - Column 1 // Inbound Inquiries (`INQ-9481`, `INQ-9482`).
  - Column 2 // Dimensions Locked (`SPEC-8812`).
  - Column 3 // 50% Deposit Paid (`PAID_DEP: R34,000` — highlighted with green border).
  - Column 4 // CNC & Workshop Queue (`SHOP-01 In CNC`, `SHOP-02 Assembly`).
- [ ] **4.4 JavaScript Dynamic Ticket Injection Engine:**
  - Clicking the trigger button dynamically generates a new DOM ticket with the user's selected dimensions, wood type, and deposit amount.
  - Animates the ticket into Column 3 (`50% Deposit Paid`) with a smooth slide-and-glow effect.
  - Updates the column counter badge (`+1`) and flashes a green confirmation message.

### Phase 5: Section 01 // Target Client Profile (ICP Sectors)
- [ ] **5.1 Three-Column Container Cards:**
  - Dark IDE cards (`#161b22`) with fine borders (`#30363d`) and code headers.
- [ ] **5.2 Sector 01: Bespoke Architectural Furniture (`JOINERY_01`):**
  - *Offerings:* Custom timber/steel dining tables, modular boardroom systems, architectural cabinetry.
  - *Friction (Red Box):* Estimators typing manual spreadsheets for uncommitted leads late at night.
  - *Pipeline Solution (Green Box):* Parametric sliders with instant board-foot math and 50% web deposit.
- [ ] **5.3 Sector 02: High-End Architectural Finishes (`ARCH_FINISH_02`):**
  - *Offerings:* Custom steel & glass partitions, decorative metal panels, acoustic screens.
  - *Friction (Red Box):* Architects waiting weeks for quote takeoffs over endless unread email threads.
  - *Pipeline Solution (Green Box):* Specifier hub with downloadable CAD packs and instant finish multipliers.
- [ ] **5.4 Sector 03: Specialized Fabrication & Outfitting (`SPEC_FAB_03`):**
  - *Offerings:* Overland camper conversions, commercial braai islands, luxury pergolas.
  - *Friction (Red Box):* Scope creep during multi-week welding runs causing severe working capital stress.
  - *Pipeline Solution (Green Box):* Modular add-on selection with phased milestone deposit gating and live bay telemetry.

### Phase 6: The Operational Shift (From Clipboard Chaos to Unified Pipeline OS)
- [ ] **6.1 Comparative Split Architecture:**
  - Side-by-side contrast between `"Disconnected Clipboard & WhatsApp Friction"` and `"Unified Auraworks Pipeline OS"`.
- [ ] **6.2 Left Column: Manual Double-Handling:**
  - Customer sends WhatsApp request $\rightarrow$ estimator re-types into Excel.
  - Bookkeeper checks bank statement for manual EFT deposit.
  - Manager writes paper job card $\rightarrow$ shop floor builds from outdated spec sheet.
  - Customer calls anxious about delivery dates.
- [ ] **6.3 Right Column: Unified Operating System:**
  - Customer configures millimeter spec on web storefront.
  - 50% deposit cleared automatically via web gateway.
  - Webhook generates internal job card with CNC cut-list.
  - Automated photo-verified milestone updates dispatched to client without manual intervention.

### Phase 7: Section 02 // Two-Phase Commercial Framework
- [ ] **7.1 Commercial Presentation Cards:**
  - Two high-contrast cards styled with IDE borders and code badges.
- [ ] **7.2 Phase 1: Core Architecture Build:**
  - Investment: `R45,000 – R75,000` (Once-off milestone payment).
  - Scope: Bespoke responsive storefront, interactive parametric dimension quoting engine, 50% web deposit gateway, automated shop-floor cut-list generation, and legacy asset migration.
  - Timeline: 4–6 weeks execution.
- [ ] **7.3 Phase 2: Growth & Infrastructure Retainer:**
  - Investment: `R10,000 – R18,000` / month.
  - Scope: Technical SEO & Generative Engine Optimization (GEO) ensuring top AI citations in ChatGPT, Perplexity, and Google AI Overviews; cloud infrastructure maintenance, security monitoring, and continuous quoting engine speed tuning.
- [ ] **7.4 Boardroom Payback Guarantee:**
  - Explicit proof showing that with an AOV of R35,000 and 45% gross margin, exactly **1 single closed order per month** produces R15,750 gross profit—fully covering the retainer while all subsequent orders are pure net profit.

### Phase 8: Section 03 // Qualification Matrix for Booking
- [ ] **8.1 Two-Column Filtration Matrix:**
  - Establishes partner standards and screens out low-ticket inquiries.
- [ ] **8.2 [QUALIFIED] Target Qualifiers (Book Strategy Session):**
  - Physical manufacturing workshop, plant bays, or showroom in South Africa.
  - Average Order Value strictly R15,000 to R200,000+.
  - Managing Director / Operations Director directly engaged in system rollout.
  - Frustrated by intake bottlenecks and manual quotation delays.
- [ ] **8.3 [DISQUALIFIED] Immediate Disqualifiers (Do Not Book):**
  - Pure dropshippers, ecommerce resellers, and third-party importers.
  - Mass low-margin retail products with AOV below R5,000.
  - Solo hobbyists operating from domestic premises without commercial tooling.
  - Unpaid contingency or equity-only proposals.

### Phase 9: Workshop Discovery Intake Modal
- [ ] **9.1 IDE Dialog Container:**
  - Dark container with Mac/Linux window dots, monospaced title, and close button `[ ESC / CLOSE_TERMINAL ]`.
- [ ] **9.2 Qualification Intake Input Fields:**
  - Executive / Operations Director Name & Title.
  - Workshop / Enterprise Brand Name & Location.
  - Corporate Email Address & Direct Telephone.
  - Average Order Value (AOV) Bracket (Dropdown).
  - Primary Operational Bottleneck (Checkboxes).
  - Pre-populated dimension parameters from Section 04.
- [ ] **9.3 Client-Side Validation & Confirmation Screen:**
  - Validates required fields and business email domain.
  - Confirmation screen: `DISCOVERY BRIEF DISPATCHED // Auraworks operations evaluates shop capacity within 24 business hours.`

### Phase 10: Pipeline OS Footer
- [ ] **10.1 Structured System Footer:**
  - Auraworks Pipeline OS branding and mission statement.
  - Developer telemetry, regional nodes, active API status.
  - Legal & Data Governance: POPIA Compliance Notice, Mutual Non-Disclosure Guarantee.
  - Copyright: `© 2026 Auraworks. Built for South African High-Ticket Fabricators & Workshop Plants.`

---

## 3. Responsive Breakpoint Specification

| Breakpoint | Target Display | Layout Adjustments |
|---|---|---|
| **> 1200px** | High-Res Workstations | Max 1240px container, full dual-pane app (quoting left 440px, Kanban right 1fr), 4-column metric grid. |
| **992px – 1199px** | Small Laptops | Stacked dual-pane app with quoting top and Kanban below with horizontal scroll, 2-column metric cards. |
| **768px – 991px** | Workshop Tablets | Single-column sector layout, touch-friendly material pills (min height 48px), horizontal scroll on Kanban columns. |
| **< 768px** | Mobile Handhelds (375px – 480px) | Single column throughout, condensed terminal bar, vertical commercial cards, full-screen terminal modal. |

---

## 4. Verification & Quality Assurance Protocol

Before marking the implementation of Design 09 as complete, the following tests will be performed:
- [ ] **Dynamic DOM Injection Performance:** Ensure clicking `+ Simulate 50% Deposit` dynamically injects a ticket into the Kanban board without page reloads or UI stutter.
- [ ] **Mathematical Engine Validation:**
  * Verify `2400 mm × 1000 mm` ($2.4 m^2$) in French Oak base = R31,200. 50% deposit = R15,600.
  * Verify `3600 mm × 1200 mm` ($4.32 m^2$) in American Walnut ($1.35\times$) = $(4.32 \times 13,000) \times 1.35 = \text{R}75,816$. 50% deposit = R37,908.
- [ ] **Kanban Column Scrolling:** Ensure Kanban board scrolls smoothly horizontally on smaller screens without breaking layout container.
- [ ] **Modal State Integrity:** Ensure modal opens with pre-set dimensions from the quoting engine and enforces AOV qualification logic.
- [ ] **Visual Impact:** Confirm Git green (`#2ea043`) and Pipeline blue (`#58a6ff`) against `#0d1117` IDE dark provide crisp, professional contrast.
