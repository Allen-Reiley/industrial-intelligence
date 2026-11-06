# Design Specification 08: Haute Fabrication & Bespoke Maison (Private Client Salon)
**Design Code:** `AW-DSGN-08-MAISON`  
**Target Sub-Sectors:** Haute Bespoke Furniture Houses, Luxury Architectural Finishes, Private Commission Fabricators  
**Strategic Archetype:** Private Client Salon, Champagne Gold & Haute Horlogerie Luxury  
**Primary Psychological Objective:** Unrivaled prestige, pricing power protection, private salon exclusivity, and white-glove provenance.

---

## 1. Executive Persona & Trust Thesis

### 1.1 The Prospective Client Profile
* **Target Decision Maker:** Founder, Creative Director, or Proprietor of a world-class bespoke design maison, high-end architectural finish atelier, or luxury physical product studio.
* **Economic Reality:**
  - Average Order Value (AOV) is **R45,000 to R450,000+** per commissioned physical masterpiece.
  - Clients include ultra-high-net-worth individuals (UHNWIs), prestigious architectural practices, luxury interior design studios, and five-star hospitality brands.
* **The Emotional & Brand Reality:**
  - They do not view themselves as a "factory"; they are an artistic maison. Their pieces are heirloom investments, architectural showpieces, and collector-grade goods.
  - **Their Supreme Fear:** Cheapening their brand. The moment an agency suggests a generic ecommerce cart with "Add to Cart" buttons or standard Shopify templates, they walk away. Any digital touchpoint that does not look as refined as a Swiss watch brand destroys their luxury pricing power.
  - **Their Operational Bottleneck:**
    - High-ticket clients expect concierge-level communication, but managing custom dimensions, veneer selections, and finish samples manually over WhatsApp and scattered emails consumes 20+ hours a week of the founder's time.
    - Anxious clients constantly call asking for progress updates during 8–12 week production cycles.
    - Large 50% production deposits are delayed because invoice delivery lacks structured digital capture.

### 1.2 The Trust Architecture: Why They Trust Auraworks Instantly
1. **Haute Luxury Art Direction:** Deep velvet black (`#050507`), brushed champagne gold (`#dfba73`), delicate metallic hairline borders (`rgba(223, 186, 115, 0.22)`), and high-contrast classical serif typography (*Cormorant Garamond*) create an immediate feeling of private salon elegance.
2. **Private Commission Quoting Salon:** Replaces generic checkout forms with a curated commission intake experience that feels like stepping into a private atelier in Milan or Paris.
3. **Provenance & Milestone Portals:** Proves that software can enhance luxury client relationships by providing high-resolution progress documentation and timber provenance certification.

---

## 2. Bespoke Ecommerce Architecture (Haute Salon Storefront)

### 2.1 Visual Atmosphere & Art Direction
* **Canvas Ambience:** Deepest velvet black (`#050507`) with a subtle radial champagne gold halo (`radial-gradient at 50% -10% in rgba(223, 186, 115, 0.1)`), creating an intimate, museum-grade spotlight effect.
* **Hairline Metallic Boundaries:** Ultra-fine `1px solid rgba(223, 186, 115, 0.22)` borders that glint subtly on hover.
* **Typography:**
  - Display Headings: *Cormorant Garamond* (Google Fonts: 500, 600, 700 with italic emphasis) — commanding classical elegance.
  - Subheaders & Badges: *Montserrat* (Google Fonts: 500, 600) — uppercase, letter-spaced (`0.15em` to `0.25em`) for luxury brand authority.
  - Analytical Copy: *Inter* (Google Fonts: 300, 400, 500) — clean, refined, and understated.

### 2.2 The Private Commission Quoting Salon
The client-facing storefront features a private **Commission Quoting Salon**:
* **Parametric Dimension Controls:**
  - Overall Length: 1,800 mm to 4,200 mm (100 mm increments)
  - Overall Width: 800 mm to 1,500 mm (50 mm increments)
  - Sliders feature delicate champagne gold circular scrubbers (`#dfba73`).
* **Rare Substrate & Finish Matrix:**
  - *French Oak Prime Selection:* Hand-rubbed organic oil, tight straight grain ($1.00\times$ base).
  - *American Black Walnut Flitch:* Bookmatched natural veneer flitches, silky satin finish ($1.35\times$ base).
  - *Hand-Patinated Brass & Cold-Rolled Steel:* Artisan torch-patinated metal base ($1.30\times$ base).
* **Formal Commission Statement:**
  - Surface Footprint: Live calculation in $m^2$
  - Production Lead Window: 4–6 weeks for bespoke hand assembly
  - Calculated Custom Commission Value: `R52,500`
* **50% Private Bank Deposit Gate:**
  - Reassuring luxury deposit lock:
    `50% Web Deposit Required: R26,250`.
  - Luxury guarantee: *"Confirms raw veneer selection, reserves workshop bench time, and issues your formal Certificate of Provenance upon payment clearance."*

---

## 3. Custom Operational Tool Architecture (Back-of-House Systems)

### 3.1 Private Client Provenance & Milestone Portal
Design 08 introduces a private client portal that elevates the custom commission experience:
* **Private Commission Link:** When an order is placed, the client receives a dedicated, password-protected private gallery link.
* **Workshop Build Diary:** Craftspeople upload weekly high-resolution photography showing the client's piece being glued, planed, hand-sanded, and oiled.
* **Digital Certificate of Provenance:** Generates an archival PDF certificate detailing the specific log harvest location, artisan signature, timber moisture level, and serial number.
* **Impact:** Eliminates client anxiety, cements luxury prestige, and triggers immediate final payment release upon completion.

### 3.2 White-Glove Installation & Crating Logistics
* Internal dashboard managing custom wooden crating specifications, specialized transport logistics, and on-site architectural white-glove installation schedules.

---

## 4. Full Page Architecture & Section-by-Section Wireframe Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│ 0. EXCLUSIVITY BAR (Private Technical Atelier // Capacity: 1 Slot Open)│
├────────────────────────────────────────────────────────────────────────┤
│ 1. HEADER (AURAWORKS Brand, Navigation Links, Request Admission CTA)   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. HERO CHAPTER (Haute Eyebrow, Cormorant H1, Lead Copy, 4 Lux Metrics)│
├────────────────────────────────────────────────────────────────────────┤
│ 3. SECTION 01: THREE ELITE PHYSICAL DISCIPLINES (Furniture, Finishes)  │
├────────────────────────────────────────────────────────────────────────┤
│ 4. SECTION 02: THE PRIVATE COMMISSION QUOTING SALON (Sliders, Swatches)│
├────────────────────────────────────────────────────────────────────────┤
│ 5. THE LUXURY SHIFT: From Chaotic Inquiries to Private Salon Order     │
├────────────────────────────────────────────────────────────────────────┤
│ 6. SECTION 03: TWO-PHASE COMMERCIAL FRAMEWORK (Phase 1 & Phase 2)      │
├────────────────────────────────────────────────────────────────────────┤
│ 7. SECTION 04: ADMISSION MATRIX (Target Qualifiers vs. Disqualifiers)  │
├────────────────────────────────────────────────────────────────────────┤
│ 8. PRIVATE DISCOVERY INTAKE (Concierge Application Flow)               │
├────────────────────────────────────────────────────────────────────────┤
│ 9. HAUTE MAISON FOOTER (Legal Governance, POPIA Compliance)            │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Section Breakdown Details
1. **Exclusivity Bar:** Champagne gold top bar: `Private Technical Atelier • Strict Capacity: 1–3 Retained Accounts / Month • 1 Private Retainer Slot Remaining for Q4`.
2. **Header:** Features the elegant brandmark *"AURAWORKS Haute Digital Fabrication"*, uppercase tracked navigation links (`Atelier Verticals`, `Quoting Salon`, `Commercials`, `Admission Matrix`), and primary gold action button: `Request Admission`.
3. **Hero Chapter:**
   - Eyebrow: `STRATEGIC TECHNICAL PARTNERSHIP FOR PHYSICAL PRODUCT MAISONS`
   - Headline: *"Bespoke digital architecture for master physical craft houses."* (with italic gold emphasis on *"master physical craft houses"*).
   - Lead: How Auraworks replaces fragmented WhatsApp inquiries with curated dimension quoting salons and direct 50% commitment deposit capture.
   - 4-Card Luxury Metrics Grid:
     * `R15,000+` (Minimum Target Order AOV)
     * `50%` (Automated Web Deposit Capture)
     * `1–3` (Monthly Retained Client Cap)
     * `1 Order` (Covers Entire Monthly Retainer)
4. **Section 01 // Target Client Profile (ICP):**
   - Three luxury discipline cards:
     * *DISCIPLINE 01: Bespoke Architectural Furniture* (timber/steel tables, boardrooms, custom cabinetry).
     * *DISCIPLINE 02: High-End Architectural Finishes* (steel & glass partitions, handcrafted tiles, lighting).
     * *DISCIPLINE 03: Specialized Fabrication & Outfitting* (campers, braais, pergolas, trailers).
   - Each card features a discreet red pain box and an illuminated gold solution box.
5. **Section 02 // Commission Quoting Salon:**
   - Left: Parametric sliders for Length and Width with rare material grade buttons (French Oak Prime, American Walnut Flitch, Patinated Brass & Steel).
   - Right: Formal Commission Statement card displaying footprint area in $m^2$, production window, calculated price (`R52,500`), and gold 50% deposit callout (`R26,250`).
6. **Section 03 // Commercial Framework:**
   - Two gold-bordered package cards:
     * **Phase 01 // Bespoke Build:** `R45,000 – R75,000 once-off` (Featured gold glow: High-converting showcase, dimension quoting engine, internal pipeline dashboard).
     * **Phase 02 // Ongoing Growth:** `R10,000 – R18,000 / month` (Technical SEO, AI search visibility in ChatGPT/Google AI, lead flow auditing, speed assurance).
7. **Section 04 // Admission Matrix:**
   - Side-by-side cards: `Target Qualifiers (Book Call)` in champagne gold vs. `Immediate Disqualifiers (Do Not Book)` in muted red.
8. **Haute Maison Footer:** Archival typography, studio contact details, capacity notices, and legal compliance metadata.

---

## 5. Design System Tokens & Micro-Interactions

### 5.1 Color Tokens
| Token Name | Hex Code | Semantic Role |
|---|---|---|
| `--bg-velvet` | `#050507` | Deepest velvet black root canvas |
| `--bg-salon` | `#0b0c10` | Private salon container surface |
| `--bg-card` | `#101217` | Elevated card surfaces |
| `--gold-champagne`| `#dfba73` | Primary luxury gold accent & headings |
| `--gold-deep` | `#b38938` | Button gradient start & active borders |
| `--gold-glow` | `rgba(223, 186, 115, 0.15)`| Ambient radial illumination & shadow glow |
| `--border-gold` | `rgba(223, 186, 115, 0.22)`| Delicate metallic hairline borders |
| `--border-dark` | `#1b1e26` | Secondary structural dividers |
| `--text-silk` | `#fcfbfa` | High-contrast silk white headings |
| `--text-muted` | `#a3a9b6` | Explanatory copy & descriptions |
| `--text-dim` | `#646b7a` | Footnotes & dimension metadata |

### 5.2 Typography System
* **Display & Headings:** `Cormorant Garamond` (Google Fonts: 500, 600, 700 with italics)
  - Hero H1: `clamp(42px, 6vw, 76px)`, weight: `600`, line-height: `1.1`, tracking: `-0.01em`
  - Section H2: `clamp(32px, 4.5vw, 50px)`, weight: `600`, line-height: `1.2`, tracking: `-0.01em`
  - Card Titles: `26px to 28px`, weight: `600`
  - Quote Price: `38px to 42px`, weight: `600`
* **Subheaders & Labels:** `Montserrat` (Google Fonts: 400, 500, 600)
  - Subheaders & Tags: `10.5px to 11.5px`, uppercase, tracking: `0.15em` to `0.25em`
* **Body Copy:** `Inter` (Google Fonts: 300, 400, 500)
  - Lead Body: `18px`, line-height: `1.7`, weight: `300`
  - Standard Body: `14px to 15px`, line-height: `1.6`

### 5.3 Micro-Interactions & Animation Specs
1. **Metallic Border Shimmer:** Hovering over luxury cards transitions the hairline border from `rgba(223, 186, 115, 0.22)` to a glowing champagne gold with soft elevation (`box-shadow: 0 12px 30px rgba(223, 186, 115, 0.1)`).
2. **Gold Button Elevation:** Smooth 2px vertical lift with golden drop shadow on hover.
3. **Fluid Slider Scrub:** Delicate gold slider thumb tracking smoothly across dark channels, recalculating the formal Commission Statement in real time.

---

## 6. Implementation Readiness Checklist

- [ ] **Velvet Black & Champagne Gold Harmony:** Precise contrast between `#050507` velvet black and `#dfba73` champagne gold.
- [ ] **Cormorant Garamond Typography Rendering:** Perfect CSS font smoothing (`-webkit-font-smoothing: antialiased`) for elegant serif ligatures.
- [ ] **Salon Mathematical Engine:** JavaScript event listeners calculating area, material multipliers, and 50% deposit with zero jitter.
- [ ] **Hairline Metallic Borders:** Sub-pixel clean rendering on retina and 4K displays.
- [ ] **Fluid Responsive Breakpoints:** Flawless scaling from widescreen luxury displays (1440px+) to mobile viewports (375px).
