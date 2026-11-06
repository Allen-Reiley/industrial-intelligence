# Design Specification 05: Tactile Materiality & Raw Grain Workbench (Sensory Physicality)
**Design Code:** `AW-DSGN-05-TACTILE`  
**Target Sub-Sectors:** Solid Timber Artisans, Master Joinery Workshops, Architectural Metal & Patina Fabricators, Stone & Glass Studios  
**Strategic Archetype:** Physical Material Honesty, Tactile Swatches & Studio Workbench  
**Primary Psychological Objective:** Overcoming the digital-physical divide, honoring tactile craftsmanship, and transforming physical finishes into digital commercial assets.

---

## 1. Executive Persona & Trust Thesis

### 1.1 The Prospective Client Profile
* **Target Decision Maker:** Founder, Master Craftsman, or Managing Director of an established artisanal fabrication workshop specializing in solid timber, hand-finished architectural metal, or custom stone joinery.
* **Economic Reality:**
  - Average Order Value (AOV) is **R18,000 to R180,000+** per commissioned piece (live-edge monolithic dining tables, solid timber executive boardroom suites, patinated brass credenzas, custom architectural timber paneling).
  - Operations involve raw material sourcing: kiln-dried French oak slabs, American black walnut flitches, indigenous African kiaat, cold-rolled steel, and unlacquered architectural brass.
* **The Emotional & Tactical Reality:**
  - They are tactile purists. They believe their physical product can only be truly appreciated through touch: running a hand over hand-planed grain, feeling the cool mass of solid steel, and smelling Danish finishing oils.
  - **Their Core Skepticism:** *"Software is cold, flat, and synthetic. Our clients buy because they walk into our physical workshop, touch the wood, and see our craft. A website cannot capture the soul of raw timber."*
  - **Their Operational Bottleneck:** Because they believe everything must happen in person, their market is geographically trapped. They spend hours giving unpaid physical showroom tours to indecisive visitors, mailing heavy physical timber blocks via expensive couriers, and answering repetitive questions about wood finishes over WhatsApp.
  - Orders stall for weeks while clients deliberate over finishes without placing a deposit, creating cash flow stagnation.

### 1.2 The Trust Architecture: Why They Trust Auraworks Instantly
1. **Materiality as the Centerpiece of the UI:** Design 05 does not hide behind generic corporate tech styling. It immerses the visitor in a workshop environment: studio charcoal (`#121418`), oiled walnut hazel (`#c69255`), raw titanium slate (`#94a3b8`), and warm patina brass (`#d4af37`).
2. **The Digital Spec Workbench:** Proves to the founder that digital software does not replace physical craft—it **amplifies** it. By allowing remote architects, interior designers, and high-net-worth homeowners to explore wood species, grain characteristics, oil lusters, and base frames online, it qualifies buyers before they ever step into the workshop.
3. **50% Raw Material Deposit Lock:** Protects the craftsman's capital by requiring cleared 50% commitment funds before valuable kiln-dried timber slabs are allocated or cut on the shop floor.

---

## 2. Bespoke Ecommerce Architecture (Sensory Storefront Standard)

### 2.1 Visual Atmosphere & Art Direction
* **Canvas Ambience:** Deep workshop charcoal (`#121418`) with ambient warm timber illumination (`radial-gradient at 50% 0% in rgba(198, 146, 85, 0.12)`), conveying the warmth of a sunlit woodworking shop at dusk.
* **Physical Swatch UI:** Interactive material cards designed like physical architect sample blocks, featuring authentic color blocks and finish descriptions.
* **Typography:**
  - Headings: *Outfit* (Google Fonts: 600, 700, 800) — an organic, humanist geometric typeface that feels warm, crafted, and tactile.
  - Body & Specifications: *Inter* (Google Fonts: 400, 500, 600) for clean dimensional readability.

### 2.2 The Material & Spec Dimension Workbench
The core client interaction is an interactive **Tactile Dimension & Finish Workbench**:
* **Physical Timber & Metal Swatches:**
  - *French Oak (Monocoat Pure Oil Finish):* Warm golden honey tone, pronounced open grain, durable matte finish ($1.00\times$ base).
  - *American Black Walnut (Satin Hand-Rubbed Oil):* Deep chocolate/espresso hues, tight swirling grain, silky tactile feel ($1.35\times$ base).
  - *Brushed 304 Stainless Steel & Architectural Glass:* Industrial cool slate with directional hairline brush grain ($1.25\times$ base).
* **Parametric Dimension Controls:**
  - Overall Length: 1,800 mm to 4,000 mm (100 mm increments)
  - Overall Width: 800 mm to 1,500 mm (50 mm increments)
  - Live surface area footprint calculation in $m^2$.
* **Real-Time Dynamic Pricing Formula:**
  $$\text{Custom Price} = (\text{Area } m^2 \times \text{Base Timber Rate}) \times \text{Material Multiplier}$$
* **Structured 50% Web Production Deposit:**
  - Instant calculation: `50% Web Production Deposit: R[Amount]`
  - Explicit customer commitment notice: *"Locks timber slab allocation, reserves kiln-dried lumber stock, and schedules 4–6 week workshop bench assembly upon clearance."*

---

## 3. Custom Operational Tool Architecture (Back-of-House Systems)

### 3.1 Raw Lumber Inventory & Slab Reservation System
When a customer configures a table and clears the 50% deposit, the Auraworks back-of-house tool triggers automated workshop logistics:
* **Board-Foot Stock Allocation:** Automatically calculates the required board footage ($m^3$) and checks current workshop kiln-dried inventory.
* **Slab Reservation Lock:** Generates an internal job card tagging specific timber packs or steel stock to the client's order number, preventing accidental double-allocation.
* **Supplier Re-Order Triggers:** Flags raw lumber re-order thresholds when active workshop deposits consume critical species stock.

### 3.2 Architect & Designer Sample Box Logistics Funnel
For high-intent commercial architects and interior designers specifying large building projects:
* Features an automated **Curated Finish Sample Box Request** module.
* Tracks sample dispatch, courier delivery, and follow-up consultation scheduling, turning sample requests into committed high-ticket commercial orders.

---

## 4. Full Page Architecture & Section-by-Section Wireframe Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│ 0. MATERIAL NOTICE STRIP (Walnut, Steel, Brass Pips // Capacity: 1–3)  │
├────────────────────────────────────────────────────────────────────────┤
│ 1. HEADER (Tactile Cube Logo, Verticals, Workbench, Commercials, Apply)│
├────────────────────────────────────────────────────────────────────────┤
│ 2. HERO CHAPTER (Craft Badge, Main Headline, Lead Copy, 4 Stat Cards) │
├────────────────────────────────────────────────────────────────────────┤
│ 3. THE MATERIAL & SPEC WORKBENCH (Interactive Sliders, Swatches, Math) │
├────────────────────────────────────────────────────────────────────────┤
│ 4. THREE HIGH-VALUE PHYSICAL GOODS VERTICALS (Furniture, Metal, Campers│
├────────────────────────────────────────────────────────────────────────┤
│ 5. THE WORKFLOW SHIFT: Showroom Bottleneck vs. Digital Material Intake │
├────────────────────────────────────────────────────────────────────────┤
│ 6. TWO-PHASE COMMERCIAL FRAMEWORK (Phase 1 Build & Phase 2 Retainer)   │
├────────────────────────────────────────────────────────────────────────┤
│ 7. QUALIFICATION MATRIX FOR BOOKING (Target Qualifiers vs. Disqualify) │
├────────────────────────────────────────────────────────────────────────┤
│ 8. WORKSHOP DISCOVERY APPLICATION (Founder Consultation Intake)        │
├────────────────────────────────────────────────────────────────────────┤
│ 9. TACTILE CRAFTSMANSHIP FOOTER (Confidential Brief Alignment, POPIA)  │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Section Breakdown Details
1. **Material Notice Strip:** Header bar with physical finish swatches: `[Oak Pip] [Steel Pip] [Brass Pip] AURAWORKS // DIGITAL INFRASTRUCTURE FOR PHYSICAL FABRICATORS | CAPACITY: 1–3 RETAINED ACCOUNTS / MONTH (1 Retainer Slot Left for Q4)`.
2. **Header:** Features the Auraworks Tactile Cube monogram (`A` in walnut/steel framing), navigation links (`Sub-Sectors`, `Spec Workbench`, `Commercials`, `Qualification`), and primary CTA: `Apply for Intake &rarr;`.
3. **Hero Chapter:**
   - Badge: `Bespoke Technical Partnerships for High-Ticket Makers`
   - Headline: *"Custom quoting engines &amp; pipelines for master physical fabricators."*
   - Lead: How Auraworks replaces unstructured WhatsApp voice notes, lost PDF attachments, and manual estimating bottlenecks with mathematical dimension quoting and 50% web deposit capture.
   - 4-Card Tactile Metrics Grid:
     * `R15,000+` (Target Average Order Value)
     * `50% Lock` (Automated Web Deposit Collection)
     * `1–3 Limit` (Monthly Retained Client Allotment)
     * `1 Deal` (Breaks Even Entire Monthly Retainer)
4. **The Material & Spec Dimension Workbench:**
   - Left: Parametric sliders for Length and Width, with interactive material swatch cards (French Oak, American Walnut, Brushed Steel & Glass).
   - Right: Structured quote summary card showing footprint in $m^2$, selected timber grade, production lead window (4–6 weeks), total price, and 50% deposit callout.
5. **Three High-Value Physical Goods Verticals:**
   - *Sector 01: Bespoke Architectural Furniture* (Custom timber/steel dining tables, executive office fittings, bespoke cabinetry).
   - *Sector 02: High-End Architectural Finishes* (Custom steel & glass partitions, handcrafted tiles, architectural lighting).
   - *Sector 03: Specialized Fabrication & Outfitting* (Off-road camper builds, custom commercial braai units, luxury pergolas).
   - Each vertical details its specific operational bottleneck and the Auraworks technical solution.
6. **Two-Phase Commercial Framework:**
   - **Phase 01 // Foundation:** `R45,000 – R75,000 once-off` (Bespoke showcase, dimension quoting engine, 50% deposit gateway, internal pipeline dashboard).
   - **Phase 02 // Performance:** `R10,000 – R18,000 / month` (Technical SEO, AI search visibility in ChatGPT/Google AI, lead flow auditing, speed assurance).
7. **Qualification Matrix for Booking:**
   - `Target Qualifiers (Book Call):` AOV R15,000+, physical workshop/showroom, manual quoting bottleneck, Founder/MD engagement.
   - `Immediate Disqualifiers (Do Not Book):` Dropshippers/importers, low-margin retail (AOV < R5k), solo home hobbyists, equity startups.
8. **Tactile Craftsmanship Footer:** Studio contact details, capacity indicators, and confidentiality notices.

---

## 5. Design System Tokens & Micro-Interactions

### 5.1 Color Tokens
| Token Name | Hex Code | Semantic Role |
|---|---|---|
| `--bg-charcoal` | `#121418` | Warm dark workshop background |
| `--bg-workbench` | `#181c24` | Workbench container surfaces |
| `--bg-card` | `#1e232e` | Elevated card surfaces |
| `--border-steel` | `#2e3646` | Chiseled metal divider borders |
| `--border-hover` | `#475569` | Highlighted interactive state |
| `--timber-walnut` | `#c69255` | Primary warm hazel/walnut accent |
| `--timber-light` | `#dfb27e` | Illuminated typography & highlights |
| `--steel-brushed` | `#94a3b8` | Cool metallic accents & subheaders |
| `--brass-patina` | `#d4af37` | Luxury hardware callouts |
| `--emerald-craft` | `#10b981` | 50% deposit badges, success indicators |
| `--crimson-warn` | `#f43f5e` | Bottleneck alerts, disqualified tags |
| `--text-pearl` | `#f8fafc` | High-contrast display copy |
| `--text-muted` | `#94a3b8` | Explanatory text & specifications |
| `--text-dim` | `#64748b` | Footnotes & dimension metadata |

### 5.2 Typography System
* **Display & Headings:** `Outfit` (Google Fonts: 500, 600, 700, 800)
  - Hero H1: `clamp(36px, 5.2vw, 64px)`, weight: `800`, line-height: `1.12`, tracking: `-0.02em`
  - Section H2: `clamp(28px, 4vw, 42px)`, weight: `800`, line-height: `1.15`, tracking: `-0.01em`
  - Card Titles: `22px to 24px`, weight: `800`
  - Stat Numbers: `28px to 34px`, weight: `800`
* **Technical Body & Values:** `Inter` (Google Fonts: 400, 500, 600)
  - Lead Copy: `18px`, line-height: `1.6`, color: `#94a3b8`
  - Body Text: `13.5px to 14.5px`, line-height: `1.55`
  - Swatch Titles: `12px`, weight: `700`

### 5.3 Micro-Interactions & Animation Specs
1. **Material Swatch Activation:** Clicking a wood sample highlights the card with a warm amber halo (`box-shadow: 0 0 12px rgba(198, 146, 85, 0.2)`) and smoothly updates the specification receipt.
2. **Tactile Slider Scrub:** Smooth custom slider thumb with glowing walnut core (`box-shadow: 0 0 10px #c69255`) and instant price recalculation.
3. **Card Lift Transition:** Subtle 3D lift (`transform: translateY(-3px)`) with border illumination on hover.

---

## 6. Implementation Readiness Checklist

- [ ] **Warm Workbench Color Harmony:** Calibrated contrast between `#121418` dark slate and `#c69255` warm walnut.
- [ ] **Interactive Swatch State Machine:** Vanilla JavaScript logic binding material multipliers to dimensional calculations.
- [ ] **Dynamic Deposit Recalculation:** Instant 50% deposit recalculation reflecting length, width, and finish selections.
- [ ] **Fluid Container Architecture:** Clean responsive CSS grid without horizontal overflow on mobile devices.
- [ ] **Zero External Script Dependencies:** Pure HTML5, CSS3, and native JavaScript for maximum loading speed.
