# Design Specification 12: Trade Specifier & Drawing Vault Portal (Architect & Designer B2B Hub)
**Design Code:** `AW-DSGN-12-VAULT`  
**Target Sub-Sectors:** High-End Architectural Finishes (Steel & Glass Partitions, Handcrafted Tiles, Acoustic Panels), Contract Furniture Makers, High-Ticket Joinery Studios  
**Strategic Archetype:** B2B Trade Specifier Portal, Gated CAD/BIM Vault & Commercial Trade Discount Engine  
**Primary Psychological Objective:** Commercial architectural dominance, frictionless specification into major building tenders, trade account loyalty, and automated deposit capture.

---

## 1. Executive Persona & Trust Thesis

### 1.1 The Prospective Client Profile
* **Target Decision Maker:** Founder, Managing Director, or Head of Commercial Sales of an established architectural finish manufacturer, custom steel & glass partition atelier, or contract joinery workshop.
* **Economic Reality:**
  - Average Order Value (AOV) is **R25,000 to R350,000+** per commercial order.
  - Their largest, most lucrative contracts come from **professional trade specifiers**: architects, commercial interior designers, quantity surveyors, and luxury property developers specifying complete commercial offices, boutique hotels, or residential developments.
* **The Emotional & Tactical Reality:**
  - They know that getting specified into an architect's building schedule early in the design phase virtually guarantees the final manufacturing tender.
  - **Their Major Operational Bottleneck:**
    - Architects need instant access to technical CAD drawings (.dwg, .dxf), Revit BIM models (.rfa), acoustic decibel ratings, and fire-rating certificates to drop products into project drawings.
    - Currently, an architect must email the manufacturer to ask: *"Do you have the CAD block for this steel glass pivot partition? What is the maximum acoustic glass thickness?"*
    - If the manufacturer takes 24 to 48 hours to reply with a CAD file, the busy architect simply specs a competitor's product who provided an instant download.
    - Furthermore, registered interior designers demand tiered trade discounts (e.g. 15%–25% designer margin), but managing these discounts manually over WhatsApp and invoice emails leads to pricing errors, delayed quotes, and lost 50% deposits.
  - **What They Need to See:** A dual-mode digital platform that presents a breathtaking visual catalog for high-net-worth homeowners, while providing an authenticated **B2B Specifier Trade Vault** for architects with instant CAD downloads, trade discount pricing, and structured 50% deposit capture.

### 1.2 The Trust Architecture: Why They Trust Auraworks Instantly
1. **The B2B Trade & Specifier Architecture:** Design 12 proves immediately that Auraworks understands how commercial architectural projects actually close. It provides a dedicated "Trade Specifier View" with gated BIM/CAD asset vaults, trade tier discounts, and automated tender specification sheets.
2. **Specifier Lead Telemetry:** Proves how the digital platform captures the architect's firm name, project location, and contact information the moment they download a drawing, giving the manufacturer's sales team immediate, high-intent lead intelligence before tenders are published.
3. **50% Deposit Commitment Structure:** Allows registered trade accounts to generate binding contract quotes with automated 50% deposit collection, locking in project production schedules without manual administrative chasing.

---

## 2. Bespoke Ecommerce Architecture (Dual-Mode Trade Storefront)

### 2.1 Visual Atmosphere & Art Direction
* **Canvas Styling:** Vault obsidian (`#080b11`), container slate (`#0f1420`), card panel (`#151c2c`), and blueprint border lines (`#1e293b` to `#2b3a55`).
* **Accents:** Specifier gold (`#d4af37`), architectural cyan (`#38bdf8`), trade status emerald (`#10b981`), and blueprint royal (`#2563eb`).
* **Dual-Mode Interactive Toggle:** Prominent toggle in the navigation bar allowing users to switch between:
  - *Public Showcase Mode:* Full retail pricing, consumer finish options, lifestyle photography.
  - *Trade Specifier Mode:* Unlocks trade margin discounts (20% off retail), technical CAD/BIM download links, acoustic data sheets, and commercial quantity pricing.
* **Typography:**
  - Headings: *Plus Jakarta Sans* (Google Fonts: 600, 700, 800) — bold, architectural, authoritative.
  - Technical Data & File Types: *JetBrains Mono* (Google Fonts: 400, 500, 600) — CAD extensions (`.DWG`, `.RFA`, `.DXF`), decibel ratings, trade multipliers.
  - Body Text: *Inter* (Google Fonts: 400, 500, 600) — crisp, high-density legibility.

### 2.2 The Interactive Specifier Configurator & CAD Vault
The storefront features an interactive **Parametric Architectural Specifier Engine**:
* **Parametric Opening Controls:**
  - Partition / Wall Length: 2,000 mm to 6,000 mm (100 mm steps)
  - Clear Opening Height: 2,100 mm to 3,200 mm (50 mm steps)
  - Real-time calculation of total glass/timber surface area in $m^2$.
* **Architectural Finish & Performance Matrix:**
  - *Crittall-Style Blackened Steel & Acoustic Laminate:* Heavy steel grid, 38dB sound reduction ($1.00\times$ base).
  - *Handcrafted Fluted Glass & Brushed Brass Profile:* Luxury hospitality finish ($1.35\times$ base).
  - *Acoustic Slatted Timber & Micro-Perforated Core:* NRC 0.85 acoustic wall system ($1.20\times$ base).
* **Dual Pricing Output (Retail vs. Trade):**
  - Standard Commercial Value: `R68,000`
  - Registered Trade Specifier Price (20% Margin): `R54,400`
* **50% Production Deposit Commitment Gate:**
  - Displays: `50% Mandatory Production Deposit: R27,200`.
  - Action buttons:
    - `[ Download CAD / BIM Package (.DWG & .RFA) ]`
    - `[ Lock 50% Deposit & Reserve Factory Schedule ]`

---

## 3. Custom Operational Tool Architecture (Back-of-House Systems)

### 3.1 Gated CAD/BIM Vault & Specifier Lead Intelligence
The core back-of-house operational tool automates high-ticket B2B pipeline capture:
* **The Gated Download Capture:** When an architect clicks to download CAD blocks or Revit families, a frictionless micro-modal captures:
  * Architect Name & Professional Email
  * Architectural Practice (e.g. *SAOTA, Paragon Architects, Boogertman + Partners*)
  * Project Type & Location (e.g. *Commercial Office, Sandton*)
* **Real-Time Sales Telemetry Alert:** Automatically dispatches a priority notification to the manufacturer's commercial sales manager:
  *"Senior Architect at Paragon Architects downloaded 3D Revit models for 20 custom steel partitions for Project Sandton."*
* **Tender Conversion Impact:** Transforms passive website visits into active, high-ticket commercial sales opportunities weeks before tenders go out for procurement.

### 3.2 Curated Material Sample Kit Logistics Engine
* Automates the fulfillment of physical architect sample boxes (metal finish swatches, timber oil blocks, acoustic felt samples).
* Tracks courier delivery status and triggers automated follow-ups to verify if the sample met the project specification criteria.

---

## 4. Full Page Architecture & Section-by-Section Wireframe Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│ 0. TRADE BAR (TRADE ACCESS PORTAL // CAD & BIM VAULT // 1 SLOT OPEN)   │
├────────────────────────────────────────────────────────────────────────┤
│ 1. HEADER (AW-TRADE Brand, Dual Mode Switch, Nav Links, Trade Login)   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. HERO CHAPTER (Specifier Tag, H1, Lead Copy, Dual Action Buttons)    │
├────────────────────────────────────────────────────────────────────────┤
│ 3. SECTION 01: THREE QUALIFIED ARCHITECTURAL VERTICALS (Finishes, Join)│
├────────────────────────────────────────────────────────────────────────┤
│ 4. SECTION 02: THE SPECIFIER CONFIGURATOR & GATED CAD DRAWING VAULT    │
├────────────────────────────────────────────────────────────────────────┤
│ 5. THE TRADE SHIFT: From Lost Email Attachments to 24/7 Gated Vault    │
├────────────────────────────────────────────────────────────────────────┤
│ 6. SECTION 03: TWO-PHASE COMMERCIAL FRAMEWORK (Phase 1 & Phase 2)      │
├────────────────────────────────────────────────────────────────────────┤
│ 7. SECTION 04: QUALIFICATION MATRIX FOR BOOKING (Green vs. Red)        │
├────────────────────────────────────────────────────────────────────────┤
│ 8. SPECIFIER PARTNERSHIP SCHEDULER (Commercial Architecture Discovery) │
├────────────────────────────────────────────────────────────────────────┤
│ 9. TRADE VAULT FOOTER (Architectural Standards, Legal Governance)      │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Section Breakdown Details
1. **Trade Bar:** Blueprint navy bar: `TRADE ACCESS PORTAL // CAD & BIM SPECIFIER VAULT // STRICT CAPACITY: 1–3 RETAINED ACCOUNTS [ 1 RETAINER SLOT OPEN ]`.
2. **Header:** Features the `AW-TRADE` logo mark, interactive `[ Public / Trade ]` mode toggle, navigation links (`ICP Verticals`, `CAD Vault`, `Commercial Packages`, `Filtration`), and primary action button: `Trade Specifier Login`.
3. **Hero Chapter:**
   - Tag: `B2B TRADE INFRASTRUCTURE & ARCHITECTURAL VAULT ARCHITECTURE`
   - Headline: *"Digital infrastructure for high-ticket manufacturers & trade specifiers."*
   - Lead: How Auraworks provides master architectural fabricators with dual-mode storefronts, gated CAD/BIM drawing vaults, and automated 50% deposit capture for commercial projects.
   - Dual Actions: `Explore Public Showcase` vs. `Open CAD Specifier Vault`.
   - 4-Card Trade Metrics Grid:
     * `R15,000+` (Minimum Order Threshold)
     * `50% Web Deposit` (Structures Cash Flow Before Procurement)
     * `1–3 Accounts / Mo` (Strict Capacity Limit)
     * `1 Project Tender` (Covers Entire Annual Retainer)
4. **Section 01 // Target Client Profile (ICP):**
   - Three structured architectural cards:
     * *Vertical 01: High-End Architectural Finishes* (steel & glass partitions, handcrafted tiles, lighting).
     * *Vertical 02: Bespoke & Contract Furniture* (executive office desks, modular boardroom suites).
     * *Vertical 03: Specialized Fabrication & Outfitting* (luxury pergolas, commercial braais, campers).
   - Each card details the trade bottleneck and the Auraworks specifier solution.
5. **Section 02 // Interactive Specifier Configurator & CAD Vault:**
   - Left: Parametric sliders for Length and Height, finish selector (Crittall Steel, Fluted Brass, Acoustic Slats), and Trade Mode toggle.
   - Right: Specifier summary receipt with footprint in $m^2$, decibel rating, trade discounted price, 50% deposit lock, and direct `[ Download CAD (.DWG/.RFA) ]` action.
6. **Section 03 // Commercial Framework:**
   - Two high-contrast cards:
     * **Phase 01 // Foundation:** `R45,000 – R75,000 once-off` (Blueprint cyan highlight: High-converting showcase, CAD/BIM vault, dimension quoting engine, internal pipeline dashboard).
     * **Phase 02 // Ongoing:** `R10,000 – R18,000 / month` (Gold highlight: Technical SEO, AI search visibility in ChatGPT/Google AI, lead flow auditing, speed assurance).
7. **Section 04 // Qualification Matrix:**
   - Two-column comparison: `Target Qualifiers (Book Call)` in green vs. `Immediate Disqualifiers (Do Not Book)` in red.
8. **Specifier Partnership Scheduler:** Direct booking form for architectural fabricators looking to establish automated trade pipelines.
9. **Trade Vault Footer:** Complete architectural standards metadata, BIM compliance notices, and confidentiality statements.

---

## 5. Design System Tokens & Micro-Interactions

### 5.1 Color Tokens
| Token Name | Hex Code | Semantic Role |
|---|---|---|
| `--vault-obsidian`| `#080b11` | Root dark vault background |
| `--vault-surface` | `#0f1420` | Container surfaces & trade panels |
| `--vault-card` | `#151c2c` | Elevated card surfaces |
| `--border-blueprint`| `#1e293b`| Boundary gridlines & dividers |
| `--border-active` | `#2b3a55` | Highlighted borders on hover |
| `--specifier-gold`| `#d4af37` | Trade badges, active trade pricing highlights |
| `--arch-cyan` | `#38bdf8` | CAD leader lines, wireframes, Phase 1 highlight |
| `--status-emerald`| `#10b981` | 50% deposit badges, qualified tags |
| `--alert-red` | `#ef4444` | Disqualified tags & pain indicators |
| `--text-white` | `#ffffff` | High-contrast headings |
| `--text-muted` | `#94a3b8` | Explanatory copy & descriptions |
| `--text-dim` | `#64748b` | File formats (`.DWG`, `.RFA`) & metadata |

### 5.2 Typography System
* **Display & Headings:** `Plus Jakarta Sans` (Google Fonts: 600, 700, 800)
  - Hero H1: `clamp(36px, 5.2vw, 64px)`, weight: `800`, line-height: `1.12`, tracking: `-0.02em`
  - Section H2: `clamp(28px, 4vw, 42px)`, weight: `800`, tracking: `-0.01em`
  - Card Titles: `22px to 24px`, weight: `800`
  - Price Outputs: `32px to 36px`, weight: `800`
* **Technical Metadata & Code:** `JetBrains Mono` (Google Fonts: 400, 500, 600)
  - File Formats & Tags: `10.5px to 11.5px`, uppercase, tracking: `0.08em`
  - Decibel & Metric Ratings: `12px to 13px`, weight: `600`
* **Body Copy:** `Inter` (Google Fonts: 400, 500, 600)
  - Lead Copy: `18px`, line-height: `1.6`, color: `#94a3b8`
  - Standard Body: `13.5px to 14.5px`, line-height: `1.55`

### 5.3 Micro-Interactions & Animation Specs
1. **Trade Mode Switch Inversion:** Toggling between Public and Trade mode triggers a smooth CSS transition where prices recalculate live, displaying standard retail crossed out and the discounted trade rate highlighted in gold (`#d4af37`).
2. **CAD Download Modal:** Clicking `Download CAD (.DWG)` launches a frictionless 2-field micro-modal (Architect Name & Firm Name) before delivering the download payload.
3. **Parametric Slider Response:** Real-time square-meter recalculation with sub-millisecond execution.

---

## 6. Implementation Readiness Checklist

- [ ] **Dual-Mode Interactive State Machine:** Native JavaScript toggle switching between Public Retail and Gated Trade Account pricing.
- [ ] **Gated CAD Download Capture:** Functional modal capturing architect details and triggering download events.
- [ ] **Vault Color Calibration:** Precise pairing of `#38bdf8` cyan and `#d4af37` gold against `#080b11` vault obsidian.
- [ ] **BIM & Architectural Metadata Formatting:** Structured tags for `.DWG`, `.RFA`, `.DXF`, and acoustic decibel ratings.
- [ ] **Responsive Fluidity:** Flawless scaling from dual-monitor workstation displays (1440px+) to mobile phones (375px).
- [ ] **Zero Framework Overhead:** Pure HTML5, modern CSS custom properties, and native JavaScript.
