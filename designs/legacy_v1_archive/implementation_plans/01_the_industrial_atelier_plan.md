# Implementation Plan: Design 01 — The Industrial Atelier (Dark Monolith)
**Target File:** `designs/01_atelier_dark_monolith.html`  
**Specification Reference:** `designs/specifications/01_the_industrial_atelier.md`  
**Design Code:** `AW-DSGN-01-ATELIER`  
**Archetype:** Obsidian Monolith & Patina Bronze Ateliers  
**Target Audience:** Bespoke furniture makers, master architectural joiners, and luxury physical fabricators (AOV R15,000 to R150,000+).

---

## 1. Executive Strategy & Technical Architecture Overview

The purpose of this document is to define the exact execution blueprint for building `01_atelier_dark_monolith.html`. The page must serve as an authoritative, high-converting digital storefront and technical operational demonstration for physical product manufacturers.

### 1.1 Technical Constraints & Standards
* **Self-Contained File:** Single HTML5 document containing all semantic markup, CSS custom properties, responsive media queries, and vanilla JavaScript calculation logic. Zero external runtime dependencies, npm packages, or CSS frameworks.
* **Typography:** Preconnected Google Fonts (`Syne:wght@600;700;800` for headings, `Inter:wght@300;400;500;600;700` for UI and body text, `JetBrains Mono:wght@400;500;600` for dimensional calculations and telemetry).
* **Color Space & Finish:** Obsidian `#06090e`, deep surface `#0c1017`, card surface `#111722`, burnished bronze `#c28445`, amber highlight `#f59e0b`, emerald status `#10b981`, and hairline borders `#1e2638`.
* **State Engines:**
  - Real-time dimensional area calculation ($L \times W$) with wood species multiplier and base selection.
  - Automatic 50% deposit calculation displaying exact ZAR value and production slot reservation status.
  - Interactive qualification intake modal with dynamic validation against the R15,000+ AOV threshold.

---

## 2. Granular Task Checklist

### Phase 1: Document Foundation & Styling Engine
- [x] **1.1 HTML5 Skeleton & Metadata:**
  - Semantic `<head>` with viewport meta, charset UTF-8, title: `Auraworks Atelier | Bespoke Dimension Quoting Engines & Manufacturing Pipelines`.
  - OpenGraph meta tags, robots meta (`index, follow`), and preconnect links for `fonts.googleapis.com` and `fonts.gstatic.com`.
- [x] **1.2 CSS Root Variables & Theming Tokens:**
  - Declare all surface colors: `--bg-obsidian: #06090e`, `--bg-surface: #0c1017`, `--bg-card: #111722`, `--bg-card-hover: #161e2c`.
  - Declare border tokens: `--border-subtle: #1e2638`, `--border-bright: #2d3852`, `--border-bronze: rgba(194, 132, 69, 0.3)`.
  - Declare brand accents: `--bronze-craft: #c28445`, `--amber-light: #f59e0b`, `--amber-glow: rgba(245, 158, 11, 0.15)`, `--emerald-status: #10b981`, `--crimson-alert: #f87171`.
  - Declare typography scales using CSS `clamp()` for responsive fluid typography without layout shift.
- [x] **1.3 Base Resets & Global Utility Styling:**
  - Box-sizing border-box reset, smooth scrolling behavior, custom dark scrollbar with bronze thumb.
  - Glassmorphic card styling (`backdrop-filter: blur(16px)`, `background: rgba(17, 23, 34, 0.75)`).
  - Ambient radial background illumination at top of page (`radial-gradient(ellipse 80% 50% at 50% -20%, rgba(194, 132, 69, 0.15), transparent 70%)`).

### Phase 2: Structural Navigation & Telemetry Banner
- [x] **2.1 Scarcity Telemetry Top Bar:**
  - Persistent sticky top bar with pulsing emerald status LED (`animation: pulseLed 2s infinite`).
  - Strict scarcity notice: `"STRICT CAPACITY: 1–3 RETAINED ACCOUNTS / MONTH • 1 SLOT REMAINING FOR Q4"`.
  - Mini CTA: `"Apply for Q4 Slot"`.
- [x] **2.2 Executive Primary Navigation:**
  - Logo: Auraworks wordmark with bronze dot and sub-label `"INDUSTRIAL ATELIER"`.
  - Navigation anchors: `#sectors`, `#quoting-simulator`, `#pipeline-shift`, `#commercials`, `#qualification`.
  - Action Button: `"Request Executive Briefing"` triggering the intake modal.

### Phase 3: Hero Chapter & Executive Trust Architecture
- [x] **3.1 Hero Typography & Value Proposition:**
  - Eyebrow badge: `"BESPOKE MANUFACTURING WEB INFRASTRUCTURE"`.
  - H1 Display: `"Stop quoting via WhatsApp. Automate custom dimensions, lock 50% deposits, and track production."`
  - Subtitle: Articulate the shift from lost unstructured WhatsApp chats to precision engineering and automated 50% deposit capture for manufacturers with AOV between R15,000 and R150,000+.
- [x] **3.2 Primary CTA Cluster:**
  - High-contrast bronze button: `"Launch Quoting Simulator"`.
  - Secondary transparent hairline button: `"Review 2-Phase Commercials"`.
- [x] **3.3 Four Executive Trust Metric Scorecards:**
  - Card 1: `R15k – R150k+` — Minimum Average Order Value (AOV) threshold for mathematical ROI.
  - Card 2: `50% Deposit` — Milestone funds captured directly on-web before timber cut or steel prep.
  - Card 3: `1–3 Accounts / Mo` — Strict capacity cap guaranteeing dedicated technical execution.
  - Card 4: `1 Closed Deal` — Exactly 1 monthly bespoke commission pays for the entire Growth Retainer.

### Phase 4: ICP Sub-Sectors Showcase
- [x] **4.1 Architecture of the 3 Target Verticals:**
  - Responsive 3-column card grid detailing the exact manufacturing profiles Auraworks serves.
- [x] **4.2 Sector 1: Bespoke Furniture & Joinery Workshops:**
  - *Offerings:* Custom solid French oak dining tables, executive boardroom suites, luxury architectural cabinetry.
  - *Current Pain:* Founders calculating board footage and manual PDF quotes for tire-kickers late at night.
  - *Auraworks Solution:* Interactive live dimensional sliders with instant timber rate calculations and 50% web deposit.
- [x] **4.3 Sector 2: High-End Architectural Finishes:**
  - *Offerings:* Custom steel-and-glass acoustic partitions, bronze door hardware, decorative acoustic timber paneling.
  - *Current Pain:* Complex specifier quote requests stuck in back-and-forth emails while client chooses finishes.
  - *Auraworks Solution:* Finish swatch pickers, automatic surface area multipliers, and instant CAD drawing pack downloads.
- [x] **4.4 Sector 3: Specialized Fabrication & Outfitting:**
  - *Offerings:* Custom overland camper conversions, luxury pergola systems, commercial modular stainless braai islands.
  - *Current Pain:* Scope creep and verbal change requests during 6-week fabrication cycles causing cash flow crunches.
  - *Auraworks Solution:* Modular add-on configurator with phased deposit gating and live shop-floor milestone tracking.

### Phase 5: The Live Interactive Dimension & Quoting Engine
- [x] **5.1 Quoting Engine UI Container:**
  - High-density workshop simulator interface with dark steel styling and amber readouts.
- [x] **5.2 Interactive Input Controls:**
  - Length Slider: 1,800 mm to 4,200 mm (step 100 mm).
  - Width Slider: 800 mm to 1,500 mm (step 50 mm).
  - Timber Species Selection (Radio cards with visual grain indicator):
    * *French Oak (Prime Grade)* — Base ($1.00\times$)
    * *American Black Walnut (Hand-Selected Flitch)* — Premium ($1.35\times$)
    * *Indigenous African Kiaat (Sustainably Harvested)* — Exotics ($1.15\times$)
  - Architectural Base Selection (Select / Radio pills):
    * *Matte Black Spider Steel Frame* (Included)
    * *Hand-Brushed Patina Brass Trestles* (+R8,500)
    * *Solid Monolith Timber Slab Legs* (+R6,200)
- [x] **5.3 Real-Time Mathematical Engine (JavaScript):**
  - Compute surface area in $m^2$: $\text{Area} = \frac{\text{Length}}{1000} \times \frac{\text{Width}}{1000}$.
  - Base timber rate: R12,500 per $m^2$.
  - Price Formula: $\text{Total} = (\text{Area} \times \text{Base Rate}) \times \text{Species Multiplier} + \text{Base Frame Modifier}$.
  - Compute 50% Production Deposit: $\text{Deposit} = \text{Total} \times 0.50$.
- [x] **5.4 Dynamic Output & Order Summary Panel:**
  - Live metric odometer updating total price in ZAR formatted currency (`R XX,XXX`).
  - Highlighted green callout: `"50% Milestone Deposit Required: R XX,XXX"` with explanatory badge: `"Secures timber batch allocation & 4-week production slot."`
  - Action CTA: `"Export Spec & Reserve Slot"` linking directly to the intake modal pre-filled with the calculated dimensions.

### Phase 6: The Operational Workflow Transition
- [x] **6.1 Comparative Split Architecture:**
  - Side-by-side contrast grid: `"The WhatsApp & Email Friction"` vs. `"The Auraworks Structured Machine"`.
- [x] **6.2 Left Column: Current Operational Bottlenecks (Friction Points):**
  - Voice notes requesting rough estimates without dimensions.
  - Unpaid evenings spent preparing manual Excel / PDF quotes.
  - Verbal approvals leading to unpaid changes and ghosting.
  - Workshop materials ordered prior to deposit clearance.
- [x] **6.3 Right Column: Auraworks Automated Pipeline (Resolution):**
  - Client enters exact millimeter dimensions into digital configurator.
  - Web engine computes price instantly and requires 50% deposit via PayFast/Stripe/Instant EFT.
  - Automated production ticket generated with board-foot cut list.
  - Buyer receives automated milestone alerts without manual founder intervention.

### Phase 7: Two-Phase Commercial Architecture & Retainer ROI Model
- [x] **7.1 Commercial Strategy Presentation:**
  - Transparent pricing cards showing the two-phase partnership structure.
- [x] **7.2 Phase 1: Custom Storefront & Quoting Pipeline Build:**
  - Pricing: `R45,000 – R75,000` (Once-off investment).
  - Scope: Bespoke responsive storefront, interactive parametric dimension quoting engine, 50% deposit checkout integration, automated shop-floor job card webhook generation, and domain asset migration.
  - Timeline: 4–6 weeks execution.
- [x] **7.3 Phase 2: Growth & Infrastructure Retainer:**
  - Pricing: `R10,000 – R18,000` / month.
  - Scope: Technical SEO, Generative Engine Optimization (GEO) ensuring presence in ChatGPT, Perplexity, and Google AI Overviews when architects search for high-ticket manufacturers; speed and uptime maintenance, and conversion optimization.
- [x] **7.4 Executive Payback Proof (Boardroom ROI Model):**
  - Interactive ROI calculator showing that with an AOV of R35,000 and 40% gross margin, exactly **1 single closed order per month** yields R14,000 gross profit—fully covering the retainer while all subsequent orders are pure net profit.

### Phase 8: Executive Qualification Matrix
- [x] **8.1 Two-Column Qualification Filter:**
  - Establishes Auraworks as a selective engineering partner that rejects unsuitable leads.
- [x] **8.2 Column 1: Qualified Profiles (We Welcome You):**
  - Physical manufacturing workshop or showroom in South Africa.
  - Average Order Value strictly R15,000 to R150,000+.
  - Managing Director / Founder directly involved in operational scaling.
  - Frustrated by intake bottlenecks and manual quotation delays.
- [x] **8.3 Column 2: Disqualified Profiles (Do Not Apply):**
  - Pure dropshippers, ecommerce resellers, and white-label importers.
  - Mass-market retail products with AOV below R5,000.
  - Hobbyists operating from home garages without commercial capacity.
  - Equity-only or unpaid contingency proposals.

### Phase 9: Interactive Executive Intake Modal
- [x] **9.1 Modal Dialog Structure & Styling:**
  - Accessible `<dialog>` or overlay modal with smooth backdrop blur.
  - Close button (`×` or `ESC` key listener).
- [x] **9.2 Qualification Intake Form Fields:**
  - Full Name & Executive Title.
  - Workshop / Brand Name & Website URL.
  - Corporate Email Address & Direct Phone / WhatsApp.
  - Estimated Average Order Value (AOV) Dropdown:
    * `Below R15,000 (Disqualified)`
    * `R15,000 – R35,000 (Standard Commercial)`
    * `R35,000 – R75,000 (High-Ticket Bespoke)`
    * `R75,000 – R150,000+ (Master Architectural)`
  - Current Primary Quoting Bottleneck (Radio / Checklist).
  - Pre-filled dimension notes (if triggered from Quoting Simulator).
- [x] **9.3 JavaScript Client-Side Validation & Feedback:**
  - Validates that email and workshop name are present.
  - If user selects "Below R15,000", gracefully alerts them to partner resources.
  - If qualified, displays a success confirmation screen: `"Application Received. Auraworks evaluates workshop capacity within 24 business hours."`

### Phase 10: Footer & Compliance
- [x] **10.1 Structured Footer Navigation:**
  - Auraworks Atelier branding and positioning statement.
  - Legal & Data Governance: POPIA Compliance Notice, Non-Disclosure Statement, Terms of Engagement.
  - Direct executive communication links (confidential email).
  - Copyright: `© 2026 Auraworks. Built for South African Physical Product Fabricators.`

---

## 3. Responsive Breakpoint Specification

| Breakpoint | Target Devices | Layout Adjustments |
|---|---|---|
| **> 1200px** | Desktops & Large Displays | Full 1200px max-width container, 4-column metric grid, side-by-side simulator layout (controls left, live quote right). |
| **992px – 1199px** | Small Laptops & Tablets (Landscape) | 2-column metric grid, stacked simulator layout with sticky quote summary, relaxed padding. |
| **768px – 991px** | Tablets (Portrait) | Single column for ICP verticals, stacked comparison cards, simplified navigation with hamburger or mobile menu trigger. |
| **< 768px** | Mobile Devices (375px – 480px) | Single column throughout, full-width sliders with larger touch targets (min 44px), sticky bottom bar with quick quote button, modal full-screen overlay. |

---

## 4. Verification & Quality Assurance Protocol

Before marking the implementation of Design 01 as complete, the following tests will be performed:
- [x] **Semantic Markup Validation:** Ensure valid HTML5 with proper heading hierarchy (`h1` $\rightarrow$ `h2` $\rightarrow$ `h3`), ARIA labels on sliders and modal triggers.
- [x] **Mathematical Engine Accuracy:**
  * Verify `2400 mm × 1000 mm` ($2.4 m^2$) French Oak base = R30,000.
  * Verify `3000 mm × 1200 mm` ($3.6 m^2$) Walnut + Patina Brass = $(3.6 \times 12,500 \times 1.35) + 8,500 = \text{R}69,250$. Deposit = R34,625.
- [x] **Interactive Responsiveness:** Slider drag and touch events function smoothly on mobile without stutter or layout shift.
- [x] **Modal Usability:** Modal opens cleanly from all CTA buttons, closes on backdrop click or `Escape` key, traps focus appropriately.
- [x] **Visual Cohesion:** Dark obsidian background with bronze and amber illumination renders identically across Chromium and WebKit rendering engines.
