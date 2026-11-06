# Implementation Plan: Design 11 — High-Velocity Conversion Funnel
**Target File:** `designs/11_high_velocity_conversion_funnel.html`  
**Specification Reference:** `designs/specifications/11_high_velocity_conversion_funnel.md`  
**Design Code:** `AW-DSGN-11-DEALROOM`  
**Archetype:** Conversion-Optimized Executive Deal Room & Multi-Step Qualification Funnel  
**Target Audience:** High-ticket commercial manufacturers, high-growth fabrication brands, bespoke outfitting studios (AOV R15,000 to R250,000+).

---

## 1. Executive Strategy & Technical Architecture Overview

The purpose of this document is to specify the complete, self-contained implementation architecture for `11_high_velocity_conversion_funnel.html`. This page represents an executive commercial deal room engineered for sales velocity, radical transparency, and zero wasted sales time. Built for time-poor manufacturing founders receiving 30–100+ inquiries a month (where up to 70% is low-ticket retail noise), it features an interactive **60-second multi-step qualification funnel** right in the hero section that instantly screens prospects against the commercial brief's criteria, paired with an interactive **Retainer Payback Simulator** proving that exactly 1 closed deal per month pays for the entire partnership.

### 1.1 Technical Constraints & Standards
* **Self-Contained File:** Single HTML5 document containing all markup, custom CSS properties, responsive media queries, and vanilla JavaScript calculation logic. Zero external runtime dependencies or CSS frameworks.
* **Typography:** Preconnected Google Fonts:
  - `Plus Jakarta Sans:wght@600;700;800` (Commanding, conversion-optimized display headlines and call-to-actions)
  - `Inter:wght@400;500;600` (Clean, high-contrast analytical copy and calculator readouts)
* **Color System & Enterprise Slate Aesthetics:**
  - Deep enterprise slate: `--slate-dark: #0f172a`
  - Container surface: `--slate-surface: #1e293b`
  - Elevated card surface: `--slate-card: #243044`
  - Structural boundary borders: `--border-slate: #334155`
  - Highlighted hover borders: `--border-bright: #475569`
  - Primary emerald accent: `--emerald-bright: #10b981`
  - Emerald glow: `--emerald-glow: rgba(16, 185, 129, 0.2)`
  - Sapphire blue accent: `--sapphire: #3b82f6`
  - Coral alert: `--coral-alert: #ef4444`
  - Display white: `--text-white: #ffffff`
  - Muted slate: `--text-muted: #94a3b8`
  - Dim footnote: `--text-dim: #64748b`
* **Core Interactive Engines:**
  - 60-Second Multi-Step Qualification Funnel (Step 1: AOV $\rightarrow$ Step 2: Footprint $\rightarrow$ Step 3: Bottleneck $\rightarrow$ Result: Qualified vs. Disqualified Panel).
  - Dynamic Retainer Payback & Unit Economics Simulator with parametric sliders (AOV, Gross Margin %, Retainer cost).
  - Frictionless Direct Discovery Booking Integration.

---

## 2. Granular Task Checklist

### Phase 1: Document Foundation & Deal Room Styling Tokens
- [ ] **1.1 HTML5 Skeleton & Deal Room Metadata:**
  - Semantic `<head>` with viewport meta, charset UTF-8, title: `Auraworks Deal Room | High-Velocity Quoting Funnels & Retainer Payback Simulator`.
  - OpenGraph meta tags, robots meta (`index, follow`), Google Fonts preconnect for `Plus Jakarta Sans` and `Inter`.
- [ ] **1.2 CSS Root Variables & Enterprise Slate Tokens:**
  - Declare dark slate surfaces (`--slate-dark`, `--slate-surface`, `--slate-card`, `--border-slate`, `--border-bright`).
  - Declare conversion accents: `--emerald-bright: #10b981`, `--emerald-glow: rgba(16, 185, 129, 0.2)`, `--sapphire: #3b82f6`, `--coral-alert: #ef4444`.
  - Declare typography clamp formulas (`--fs-hero`, `--fs-h2`, `--fs-h3`, `--fs-btn`).
- [ ] **1.3 Base Resets & Conversion Button Styling:**
  - Box-sizing border-box reset, font-smoothing antialiased.
  - Button elevation styles with glowing emerald box-shadow (`0 8px 24px rgba(16, 185, 129, 0.35)`).
  - Custom scrollbar styled with enterprise slate track and bright emerald thumb.

### Phase 2: Top Scarcity Bar & Deal Room Navigation Header
- [ ] **2.1 Monospaced Scarcity Bar (Top Rule):**
  - High-density dark strip: `Capacity: Strictly 1–3 Retained Accounts / Month | Preserving high engineering rigor. 1 Retained Client Slot Remaining for This Quarter.`
  - Pulsing emerald live status beacon (`#10b981`).
- [ ] **2.2 Deal Room Navigation Header:**
  - Logo: Emerald `A` monogram + wordmark `"AURAWORKS DEAL ROOM"`.
  - Navigation anchors: `#qualification-funnel`, `#sectors`, `#payback-simulator`, `#commercials`, `#matrix`.
  - CTA Button: High-contrast emerald button: `Check Qualification`.

### Phase 3: Hero Chapter & 60-Second Qualification Funnel
- [ ] **3.1 Hero Typography & Value Proposition:**
  - Eyebrow tag: `Strategic Repositioning & ICP Target Shift`.
  - H1 Display: `"Custom dimension quoting & pipelines for high-ticket bespoke manufacturers."`
  - Subtitle: Articulate how Auraworks replaces manual WhatsApp quoting with automated dimension math, 50% web deposit capture, and automated lead triage.
- [ ] **3.2 The 60-Second Interactive Qualification Funnel:**
  - Step 1 // Deal Economics & AOV Screening:
    * `< R5,000 / order` $\rightarrow$ Triggers Disqualification Panel (gracefully explains unit economics).
    * `R15,000 – R45,000 / order` $\rightarrow$ Unlocks Step 2 (Commercial Qualified).
    * `R45,000 – R150,000+ / order` $\rightarrow$ Unlocks Step 2 (High-Ticket Bespoke).
  - Step 2 // Physical Manufacturing Footprint:
    * `Home garage / solo hobbyist` $\rightarrow$ Triggers Disqualification Panel.
    * `Dedicated workshop / machinery bays / showroom` $\rightarrow$ Unlocks Step 3.
  - Step 3 // Primary Intake Bottleneck:
    * `Unstructured WhatsApp & email chains` $\rightarrow$ Unlocks Step 4 (Fit).
    * `Manual PDF drawing takeoffs` $\rightarrow$ Unlocks Step 4 (Fit).
  - Step 4 // Verified Qualification Status Panel:
    * High-contrast emerald card: `VERIFIED QUALIFICATION STATUS: 100% FIT`.
    * Explains how their specific AOV and physical workshop will achieve rapid ROI.
    * Unlocks instant booking CTA: `[ Book 20-Minute Architecture Session ]`.

### Phase 4: Section 01 // Target Client Profile (ICP Sectors)
- [ ] **4.1 Three-Column Dark Slate Card Grid:**
  - Container cards (`#243044`) with fine borders (`#334155`) detailing the 3 qualified manufacturing sectors.
- [ ] **4.2 Sector 01: Bespoke Architectural Furniture:**
  - *Offerings:* Custom solid French oak dining suites, executive boardroom desks, custom architectural cabinetry.
  - *The Bottleneck (Red Box):* Sales reps spending 15+ unpaid hours weekly calculating timber board footage for uncommitted leads.
  - *Auraworks Build (Green Box):* Parametric dimension sliders with instant timber rate calculations and 50% web deposit.
- [ ] **4.3 Sector 02: High-End Architectural Finishes:**
  - *Offerings:* Custom steel & glass partitions, decorative metal panels, acoustic timber screens.
  - *The Bottleneck (Red Box):* Architects waiting weeks for quote takeoffs over endless unread email threads.
  - *Auraworks Build (Green Box):* Specifier hub with downloadable CAD packs and instant finish multipliers.
- [ ] **4.4 Sector 03: Specialized Fabrication & Outfitting:**
  - *Offerings:* Overland camper conversions, commercial braai islands, luxury pergolas.
  - *The Bottleneck (Red Box):* Scope creep during multi-week welding runs causing severe working capital stress.
  - *Auraworks Build (Green Box):* Modular add-on selection with phased milestone deposit gating and live bay telemetry.

### Phase 5: Section 02 // Dynamic Retainer Payback Simulator
- [ ] **5.1 Dual-Pane Payback Simulator Layout:**
  - Left Pane: Interactive sliders for Deal Size (AOV) and Gross Margin %, with unit economics thesis box.
  - Right Pane: Real-time financial summary card displaying gross profit per deal, monthly retainer cost, net monthly profit, and break-even order count.
- [ ] **5.2 Slider Controls & Mathematical Formulas (JavaScript):**
  - Average Deal Size (AOV): Slider range R15,000 to R150,000 (Default: R45,000).
  - Estimated Gross Margin (%): Slider range 30% to 65% (Default: 45%).
  - Monthly Growth Retainer: Default R14,000 / month.
  - Gross Profit Calculation: $\text{Gross Profit} = \text{AOV} \times (\text{Margin } / 100) = \text{R}20,250$.
  - Net Profit After Retainer on 1 Deal: $\text{Net Profit} = \text{Gross Profit} - \text{Retainer} = +\text{R}6,250\text{/mo}$.
- [ ] **5.3 Fiduciary Verdict Banner:**
  - Prominent high-contrast emerald banner:
    `ORDERS NEEDED TO BREAK EVEN: EXACTLY 1 CLOSED DEAL`.
    *Thesis: "Every subsequent closed deal generates pure incremental net profit for your workshop."*

### Phase 6: The Conversion Shift (From Unqualified Noise to 100% Qualified Deals)
- [ ] **6.1 Comparative Split Architecture:**
  - Side-by-side contrast between `"The Unfiltered WhatsApp Trap"` and `"The High-Velocity Deal Room"`.
- [ ] **6.2 Left Column: Manual Intake Friction:**
  - 70% of inquiries are unqualified retail consumers (< R5k) or dropshippers.
  - Sales reps spend 20+ hours a week fielding low-intent inquiries.
  - Quotes delivered as manual PDF attachments that get ghosted.
  - Raw materials ordered before deposits clear; cash flow risk.
- [ ] **6.3 Right Column: High-Velocity Deal Room:**
  - Self-serve 60-second qualification screens out low-budget inquiries automatically.
  - High-ticket buyers (R50k+) routed directly to senior leadership.
  - 50% commitment deposits captured directly on web rails.
  - Sales cycle compressed from 14 days of WhatsApp hesitation to under 24 hours.

### Phase 7: Section 03 // Two-Phase Commercial Framework
- [ ] **7.1 Commercial Presentation Cards:**
  - Two deal-room package cards with high-contrast borders and glowing CTAs.
- [ ] **7.2 Phase 1: Core Architecture Build:**
  - Investment: `R45,000 – R75,000` (Once-off milestone payment).
  - Scope: Bespoke responsive storefront, interactive parametric dimension quoting engine, 50% web deposit gateway, automated shop-floor cut-list generation, and legacy asset migration.
  - Timeline: 4–6 weeks execution.
- [ ] **7.3 Phase 2: Growth & Infrastructure Retainer:**
  - Investment: `R10,000 – R18,000` / month.
  - Scope: Technical SEO & Generative Engine Optimization (GEO) ensuring top AI citations in ChatGPT, Perplexity, and Google AI Overviews; cloud infrastructure maintenance, security monitoring, and continuous quoting engine speed tuning.
- [ ] **7.4 Boardroom Payback Proof:**
  - Clear mathematical verification that 1 monthly commission fully offsets the retainer.

### Phase 8: Section 04 // Qualification Matrix for Outreach & Booking
- [ ] **8.1 Two-Column Filtration Matrix:**
  - Side-by-side comparison establishing strict partner criteria.
- [ ] **8.2 Target Qualifiers (Book Strategic Briefing):**
  - Physical manufacturing workshop, machinery bays, or showroom in South Africa.
  - Average Order Value strictly R15,000 to R250,000+.
  - Managing Director / Founder directly engaged in commercial transformation.
  - Frustrated by intake bottlenecks and manual quotation delays.
- [ ] **8.3 Immediate Disqualifiers (Do Not Book):**
  - Pure dropshippers, ecommerce resellers, and third-party importers.
  - Mass low-margin retail products with AOV below R5,000.
  - Solo hobbyists operating from domestic premises without commercial tooling.
  - Unpaid contingency or equity-only proposals.

### Phase 9: Direct Discovery Booking Integration
- [ ] **9.1 Frictionless Booking Container:**
  - Clean scheduling module allowing qualified founders to book their 20-minute architecture session.
- [ ] **9.2 Qualification Intake Input Fields:**
  - Executive / Commercial Director Name & Title.
  - Manufacturing Enterprise / Workshop Name & City.
  - Corporate Email Address & Direct Telephone.
  - Average Order Value (AOV) Bracket.
  - Primary Operational Objective.
- [ ] **9.3 Client-Side Validation & Confirmation Screen:**
  - Validates required fields and business email domain.
  - Confirmation screen: `DISCOVERY BRIEF CONFIRMED // Auraworks evaluates workshop capacity and will confirm session details within 24 business hours.`

### Phase 10: Deal Room Footer & Legal Governance
- [ ] **10.1 Structured Deal Room Footer:**
  - Auraworks Deal Room branding and commercial mandate.
  - Regional node metadata, POPIA compliance notice, and mutual NDA guarantee.
  - Copyright: `© 2026 Auraworks Deal Room. Built for South African High-Ticket Fabricators & Physical Manufacturers.`

---

## 3. Responsive Breakpoint Specification

| Breakpoint | Target Display | Layout Adjustments |
|---|---|---|
| **> 1200px** | High-Res Enterprise Displays | Max 1200px container, full 2-column payback simulator, 4-column metric grid. |
| **992px – 1199px** | Small Laptops | Stacked payback simulator with sticky financial summary, 2-column metric cards. |
| **768px – 991px** | Tablets | Single-column sector layout, touch-friendly quiz buttons (min height 48px), full-width sliders. |
| **< 768px** | Mobile Handhelds (375px – 480px) | Single column throughout, condensed scarcity bar, vertical commercial cards, full-screen quiz cards. |

---

## 4. Verification & Quality Assurance Protocol

Before marking the implementation of Design 11 as complete, the following tests will be performed:
- [ ] **Multi-Step Quiz State Machine:** Test all paths (Under R5k $\rightarrow$ Disqualified, R15k+ $\rightarrow$ Step 2 $\rightarrow$ Step 3 $\rightarrow$ 100% Fit).
- [ ] **Payback Calculator Algorithm:** Verify real-time mathematical accuracy across AOV, Gross Margin, and Retainer sliders.
- [ ] **High-Contrast Slate & Emerald Contrast:** Ensure full WCAG AAA contrast compliance across all text and interactive buttons.
- [ ] **Booking Form Validation:** Confirm client-side validation prevents submission without valid email and company details.
- [ ] **Responsive Integrity:** Confirm smooth quiz interaction on mobile viewports without horizontal scrolling or clipped cards.
