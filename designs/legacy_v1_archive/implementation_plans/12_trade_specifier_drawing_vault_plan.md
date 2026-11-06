# Implementation Plan: Design 12 — Trade Specifier & Drawing Vault
**Target File:** `designs/12_trade_specifier_drawing_vault.html`  
**Specification Reference:** `designs/specifications/12_trade_specifier_drawing_vault.md`  
**Design Code:** `AW-DSGN-12-VAULT`  
**Archetype:** B2B Trade Specifier Portal, Gated CAD/BIM Vault & Commercial Trade Discount Engine  
**Target Audience:** High-end architectural finish manufacturers, custom steel & glass partition ateliers, contract joinery studios specifying into major commercial building tenders (AOV R25,000 to R350,000+).

---

## 1. Executive Strategy & Technical Architecture Overview

The purpose of this document is to specify the complete, self-contained implementation architecture for `12_trade_specifier_drawing_vault.html`. This page represents a dual-mode commercial B2B platform built specifically for high-ticket manufacturers whose largest, most lucrative revenues come from commercial trade specifiers (architects, commercial interior designers, quantity surveyors, and developers). It features a **Dual-Mode Interactive Toggle (Public Showcase vs. Trade Specifier Mode)** that instantly unlocks 20% trade discounts, technical CAD/BIM asset downloads (.dwg, .rfa), acoustic data sheets, and automated 50% deposit capture, while capturing high-intent specifier lead telemetry before commercial tenders are awarded.

### 1.1 Technical Constraints & Standards
* **Self-Contained File:** Single HTML5 document containing all markup, custom CSS properties, responsive media queries, and vanilla JavaScript calculation logic. Zero external runtime dependencies or CSS frameworks.
* **Typography:** Preconnected Google Fonts:
  - `Plus Jakarta Sans:wght@600;700;800` (Bold, architectural, authoritative display headings)
  - `JetBrains Mono:wght@400;500;600` (Technical metadata, CAD file formats `.DWG`, `.RFA`, `.DXF`, acoustic decibel ratings)
  - `Inter:wght@400;500;600` (Crisp, high-density legibility for body copy and specifications)
* **Color System & Vault Aesthetics:**
  - Vault obsidian: `--vault-obsidian: #080b11`
  - Container surface: `--vault-surface: #0f1420`
  - Elevated card surface: `--vault-card: #151c2c`
  - Boundary gridline borders: `--border-blueprint: #1e293b`
  - Active hover borders: `--border-active: #2b3a55`
  - Specifier gold accent: `--specifier-gold: #d4af37`
  - Architectural cyan: `--arch-cyan: #38bdf8`
  - Trade status emerald: `--status-emerald: #10b981`
  - Warning/pain red: `--alert-red: #ef4444`
  - Pure white headings: `--text-white: #ffffff`
  - Explanatory slate: `--text-muted: #94a3b8`
  - Technical metadata: `--text-dim: #64748b`
* **Core Interactive Engines:**
  - Dual-Mode State Machine (Public Retail vs. Trade Specifier Mode) dynamically updating prices, discounting 20%, and unlocking CAD download actions.
  - Parametric Architectural Opening Configurator with length/height sliders and acoustic performance matrix.
  - Gated CAD/BIM download lead capture micro-modal.
  - High-ticket partnership discovery scheduler.

---

## 2. Granular Task Checklist

### Phase 1: Document Foundation & Trade Vault Styling Tokens
- [ ] **1.1 HTML5 Skeleton & Vault Metadata:**
  - Semantic `<head>` with viewport meta, charset UTF-8, title: `Auraworks Vault | B2B Trade Specifier Portal & Gated CAD/BIM Architecture`.
  - OpenGraph meta tags, robots meta (`index, follow`), Google Fonts preconnect for `Plus Jakarta Sans`, `JetBrains Mono`, and `Inter`.
- [ ] **1.2 CSS Root Variables & Vault Tokens:**
  - Declare obsidian vault surfaces (`--vault-obsidian`, `--vault-surface`, `--vault-card`, `--border-blueprint`, `--border-active`).
  - Declare trade accents: `--specifier-gold: #d4af37`, `--arch-cyan: #38bdf8`, `--status-emerald: #10b981`, `--alert-red: #ef4444`.
  - Declare fluid typography clamp formulas (`--fs-hero`, `--fs-h2`, `--fs-h3`, `--fs-mono`).
- [ ] **1.3 Dual-Mode Styling & Monospaced Utility Classes:**
  - Define styles for the interactive mode toggle pill in the navbar.
  - Monospaced badge styling for `.DWG`, `.RFA`, `.DXF`, and acoustic decibel tags.
  - Custom scrollbar styled with vault slate track and specifier gold thumb.

### Phase 2: Trade Bar & Dual-Mode Header Navigation
- [ ] **2.1 Monospaced Trade Bar (Top Rule):**
  - High-density dark strip: `TRADE ACCESS PORTAL // CAD & BIM SPECIFIER VAULT // STRICT CAPACITY: 1–3 RETAINED ACCOUNTS [ 1 RETAINER SLOT OPEN ]`.
  - Pulsing emerald live status beacon (`#10b981`).
- [ ] **2.2 Dual-Mode Navigation Header:**
  - Logo: `AW-TRADE` badge with architectural cyan accent + wordmark `"AURAWORKS TRADE SPECIFIER"`.
  - **Dual-Mode Interactive Toggle:** Clean segmented switch `[ Public Showcase | Trade Specifier View ]` allowing instant pricing and asset mode toggling.
  - Navigation anchors: `#sectors`, `#cad-vault`, `#trade-shift`, `#commercials`, `#qualification`.
  - CTA Button: Gold-bordered button: `Trade Specifier Login`.

### Phase 3: Hero Chapter & Trade Specifier Value Proposition
- [ ] **3.1 Architectural Hero Typography & Narrative:**
  - Eyebrow tag: `B2B TRADE INFRASTRUCTURE & ARCHITECTURAL VAULT ARCHITECTURE`.
  - H1 Display: `"Digital infrastructure for high-ticket manufacturers & trade specifiers."`
  - Subtitle: Articulate how Auraworks provides master architectural fabricators with dual-mode storefronts, gated CAD/BIM drawing vaults, and automated 50% deposit capture for commercial projects.
- [ ] **3.2 Dual Action Buttons:**
  - Primary button: `[ Open CAD Specifier Vault ]` (architectural cyan).
  - Secondary button: `[ Explore Public Showcase ]` (hairline gold border).
- [ ] **3.3 Four-Card Trade Telemetry Scorecards:**
  - Card 1: `R15,000+` — Minimum Order Threshold for viable commercial payback.
  - Card 2: `50% Web Deposit` — Structures Cash Flow Before Procurement.
  - Card 3: `1–3 Accounts / Mo` — Dedicated master engineering capacity.
  - Card 4: `1 Project Tender` — Single commercial building contract covers entire annual retainer.

### Phase 4: Section 01 // Target Client Profile (ICP Sectors)
- [ ] **4.1 Three-Column Architectural Grid:**
  - Vault container cards (`#151c2c`) with fine borders (`#1e293b`) detailing the 3 qualified manufacturing sectors.
- [ ] **4.2 Sector 01: High-End Architectural Finishes (`VERTICAL_01`):**
  - *Offerings:* Crittall-style steel & glass acoustic partitions, decorative bronze panels, architectural lighting.
  - *Trade Bottleneck (Red Box):* Architects waiting 48+ hours for CAD blocks over email, leading to lost specification in tender drawings.
  - *Vault Solution (Green Box):* Instant gated 2D/3D CAD downloads capturing specifier lead telemetry before tenders publish.
- [ ] **4.3 Sector 02: Bespoke & Contract Furniture (`VERTICAL_02`):**
  - *Offerings:* Executive boardroom suites, luxury office joinery, modular acoustic credenzas.
  - *Trade Bottleneck (Red Box):* Managing tiered trade discounts manually across scattered WhatsApp chats and spreadsheets.
  - *Vault Solution (Green Box):* Automated 20% trade discount pricing and direct 50% deposit collection.
- [ ] **4.4 Sector 03: Specialized Fabrication & Outfitting (`VERTICAL_03`):**
  - *Offerings:* Commercial braai islands, luxury pergolas, custom architectural chassis.
  - *Trade Bottleneck (Red Box):* Verbal revisions during commercial tender cycles causing working capital stress.
  - *Vault Solution (Green Box):* Modular specifier selection with phased milestone deposit gating and live bay telemetry.

### Phase 5: Section 02 // Interactive Specifier Configurator & CAD Vault
- [ ] **5.1 Dual-Pane Specifier Interface:**
  - Left Pane: Parametric dimensional sliders for opening length and height, finish selector, and trade mode toggle.
  - Right Pane: Specifier summary receipt with live footprint, acoustic ratings, trade pricing, 50% deposit lock, and download buttons.
- [ ] **5.2 Parametric Opening Controls:**
  - Partition / Wall Length: 2,000 mm to 6,000 mm (100 mm steps) with active readout.
  - Clear Opening Height: 2,100 mm to 3,200 mm (50 mm steps) with active readout.
- [ ] **5.3 Architectural Finish & Performance Matrix:**
  - *Crittall Blackened Steel & Acoustic Laminate:* Heavy steel grid, 38dB sound reduction ($1.00\times$ base).
  - *Fluted Glass & Brushed Brass Profile:* Luxury hospitality finish, 34dB reduction ($1.35\times$ base).
  - *Acoustic Slatted Timber & Felt Core:* NRC 0.85 acoustic wall system ($1.20\times$ base).
- [ ] **5.4 Dual Pricing Output & 50% Deposit Lock (JavaScript):**
  - Surface Area Calculation: $\text{Area} = \frac{\text{Length}}{1000} \times \frac{\text{Height}}{1000}$.
  - Base Rate: R11,000 per $m^2$.
  - Public Retail Price: $\text{Retail} = (\text{Area} \times \text{Base Rate}) \times \text{Finish Multiplier}$.
  - Trade Specifier Price: $\text{Trade} = \text{Retail} \times 0.80$ (20% Trade Discount applied when Trade Mode is active).
  - 50% Deposit Callout:
    `50% Mandatory Production Deposit: R XX,XXX`.
    *Notice: "Locks raw metal/timber batch allocation and reserves factory CNC schedule upon payment clearance."*
- [ ] **5.5 Action Buttons:**
  - Primary button: `[ Download CAD / BIM Package (.DWG & .RFA) ]` triggering the gated download modal.
  - Secondary button: `[ Lock 50% Deposit & Reserve Factory Slot ]` opening the partnership scheduler.

### Phase 6: The Trade Shift (From Lost Email Attachments to 24/7 Gated Vault)
- [ ] **6.1 Comparative Split Architecture:**
  - Side-by-side contrast between `"The Email Attachment Friction"` and `"The 24/7 Gated Specifier Vault"`.
- [ ] **6.2 Left Column: Manual Email Friction:**
  - Architect asks for CAD block via email $\rightarrow$ manufacturer replies 2 days later.
  - Architect already substituted a competitor's product who provided an instant download.
  - Manual trade discount calculations lead to pricing discrepancies.
  - Project tenders awarded without manufacturer's knowledge.
- [ ] **6.3 Right Column: Automated Vault Architecture:**
  - Instant self-service CAD/BIM downloads available 24/7.
  - Automated lead capture notifies sales team the instant an architectural firm downloads files.
  - Transparent trade margin discounts applied automatically.
  - 50% milestone deposits captured directly on web rails.

### Phase 7: Section 03 // Two-Phase Commercial Framework
- [ ] **7.1 Commercial Presentation Cards:**
  - Two high-contrast cards with cyan and gold accents.
- [ ] **7.2 Phase 1: Foundation Storefront & Specifier Vault Build:**
  - Investment: `R45,000 – R75,000` (Once-off milestone payment).
  - Scope: Bespoke responsive storefront, gated CAD/BIM vault, interactive parametric dimension quoting engine, 50% web deposit gateway, automated shop-floor cut-list generation, and legacy asset migration.
  - Timeline: 4–6 weeks execution.
- [ ] **7.3 Phase 2: Growth & Infrastructure Retainer:**
  - Investment: `R10,000 – R18,000` / month.
  - Scope: Technical SEO & Generative Engine Optimization (GEO) ensuring top AI citations in ChatGPT, Perplexity, and Google AI Overviews; cloud infrastructure maintenance, security monitoring, and continuous quoting engine speed tuning.
- [ ] **7.4 Boardroom Payback Guarantee:**
  - Explicit proof showing that with an AOV of R35,000 and 45% gross margin, exactly **1 single closed order per month** produces R15,750 gross profit—fully covering the retainer while all subsequent orders are pure net profit.

### Phase 8: Section 04 // Qualification Matrix for Outreach & Booking
- [ ] **8.1 Two-Column Filtration Matrix:**
  - Evaluates partner fit and protects engineering capacity.
- [ ] **8.2 Target Qualifiers (Book Strategic Briefing):**
  - Physical manufacturing workshop, plant bays, or showroom in South Africa.
  - Average Order Value strictly R15,000 to R350,000+.
  - Managing Director / Head of Sales directly engaged in commercial transformation.
  - Frustrated by intake bottlenecks and manual quotation delays.
- [ ] **8.3 Immediate Disqualifiers (Do Not Book):**
  - Pure dropshippers, ecommerce resellers, and third-party importers.
  - Mass low-margin retail products with AOV below R5,000.
  - Solo hobbyists operating from domestic premises without commercial tooling.
  - Unpaid contingency or equity-only proposals.

### Phase 9: Gated CAD Download Micro-Modal & Partnership Scheduler
- [ ] **9.1 Gated Download Micro-Modal Container:**
  - Clean dialog capturing Architect Name, Architectural Practice, and Project Location before delivering simulated `.DWG / .RFA` download.
- [ ] **9.2 Specifier Partnership Scheduler:**
  - Dedicated consultation intake allowing manufacturers to schedule an architecture briefing.
  - Enforces corporate email validation and AOV criteria.

### Phase 10: Trade Vault Footer & Standards Metadata
- [ ] **10.1 Structured Vault Footer:**
  - Auraworks Trade Specifier branding and architectural mandate.
  - BIM compliance notices, ISO 9001 quality standards, POPIA compliance notice.
  - Copyright: `© 2026 Auraworks Trade Vault. Built for South African High-Ticket Architectural Fabricators.`

---

## 3. Responsive Breakpoint Specification

| Breakpoint | Target Display | Layout Adjustments |
|---|---|---|
| **> 1200px** | High-Res Enterprise Displays | Max 1200px container, full 2-column specifier configurator (controls left, receipt right), 4-column metric grid. |
| **992px – 1199px** | Small Laptops | Stacked specifier configurator with sticky receipt, 2-column metric cards, relaxed padding. |
| **768px – 991px** | Tablets | Single-column sector layout, touch-friendly mode toggle, full-width opening sliders. |
| **< 768px** | Mobile Handhelds (375px – 480px) | Single column throughout, condensed trade bar, vertical commercial cards, full-screen download modal. |

---

## 4. Verification & Quality Assurance Protocol

Before marking the implementation of Design 12 as complete, the following tests will be performed:
- [ ] **Dual-Mode Toggle State Transitions:** Verify clicking between Public and Trade mode updates prices, strikes through retail values, and updates button actions in real time.
- [ ] **Mathematical Engine Validation:**
  * Verify `3000 mm × 2400 mm` ($7.2 m^2$) in Crittall Steel base:
    - Retail: $7.2 \times 11,000 = \text{R}79,200$. 50% deposit = R39,600.
    - Trade Mode: $79,200 \times 0.80 = \text{R}63,360$. 50% deposit = R31,680.
- [ ] **Gated Download Modal Usability:** Confirm micro-modal captures architect information and triggers immediate confirmation feedback.
- [ ] **High-Contrast Vault Visuals:** Confirm specifier gold (`#d4af37`) and architectural cyan (`#38bdf8`) against `#080b11` vault obsidian render with razor-sharp legibility.
- [ ] **Zero-Dependency Architecture:** Pure HTML5, modern CSS custom properties, and native JavaScript.
