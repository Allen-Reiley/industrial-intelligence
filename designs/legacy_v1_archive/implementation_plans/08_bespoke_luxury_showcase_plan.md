# Implementation Plan: Design 08 — Bespoke Luxury Showcase
**Target File:** `designs/08_bespoke_luxury_showcase.html`  
**Specification Reference:** `designs/specifications/08_bespoke_luxury_showcase.md`  
**Design Code:** `AW-DSGN-08-MAISON`  
**Archetype:** Private Client Salon, Champagne Gold & Haute Horlogerie Luxury  
**Target Audience:** Haute bespoke furniture houses, luxury architectural finish ateliers, private commission studios (AOV R45,000 to R450,000+).

---

## 1. Executive Strategy & Technical Architecture Overview

The purpose of this document is to specify the complete, self-contained implementation architecture for `08_bespoke_luxury_showcase.html`. This page represents the pinnacle of private client salon luxury, museum-grade aesthetic restraint, and white-glove provenance. It speaks to world-class physical craft houses whose high-ticket clientele (UHNWIs, luxury architects, five-star hoteliers) demand an online presence that rivals Swiss haute horlogerie. It proves that custom web software does not cheapen luxury pricing power—it protects exclusivity, eliminates 20+ hours of manual founder intake, and captures 50% commitment deposits upfront.

### 1.1 Technical Constraints & Standards
* **Self-Contained File:** Single HTML5 document containing all markup, custom CSS properties, responsive media queries, and vanilla JavaScript calculation logic. Zero external runtime dependencies or CSS frameworks.
* **Typography:** Preconnected Google Fonts:
  - `Cormorant Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600` (Classical, commanding luxury serif headings with italic emphasis)
  - `Montserrat:wght@400;500;600` (Uppercase, tracked architectural labels and badges, `0.15em` to `0.25em` letter spacing)
  - `Inter:wght@300;400;500` (Clean, refined, understated body text)
* **Color System & Haute Salon Aesthetics:**
  - Deep velvet black: `--bg-velvet: #050507`
  - Private salon surface: `--bg-salon: #0b0c10`
  - Elevated card surface: `--bg-card: #101217`
  - Primary champagne gold: `--gold-champagne: #dfba73`
  - Deep burnished gold: `--gold-deep: #b38938`
  - Champagne gold glow: `--gold-glow: rgba(223, 186, 115, 0.15)`
  - Delicate hairline border: `--border-gold: rgba(223, 186, 115, 0.22)`
  - Secondary dark border: `--border-dark: #1b1e26`
  - Silk white headings: `--text-silk: `#fcfbfa`
  - Muted luxury text: `--text-muted: #a3a9b6`
  - Footnote metadata: `--text-dim: #646b7a`
* **Core Interactive Modules:**
  - Private Commission Quoting Salon with delicate gold slider scrubbers, rare substrate buttons, live square meter calculation, and 50% deposit lock.
  - Private Client Provenance & Milestone Portal preview.
  - Concierge-level Admission Intake Modal with strict qualification gating.

---

## 2. Granular Task Checklist

### Phase 1: Document Foundation & Haute Luxury Styling Tokens
- [ ] **1.1 HTML5 Skeleton & Maison Metadata:**
  - Semantic `<head>` with viewport meta, charset UTF-8, title: `Auraworks Haute Maison | Private Client Commission Quoting Salons & Digital Architecture`.
  - OpenGraph meta tags, robots meta (`index, follow`), Google Fonts preconnect for `Cormorant Garamond`, `Montserrat`, and `Inter`.
- [ ] **1.2 CSS Root Variables & Champagne Gold Tokens:**
  - Declare velvet black canvas and salon card surfaces (`--bg-velvet`, `--bg-salon`, `--bg-card`, `--border-gold`, `--border-dark`).
  - Declare champagne gold accents (`--gold-champagne`, `--gold-deep`, `--gold-glow`).
  - Declare fluid typography clamp formulas (`--fs-hero`, `--fs-h2`, `--fs-h3`, `--fs-salon-quote`).
- [ ] **1.3 Ambient Spotlight & Silk Typography Resets:**
  - Box-sizing border-box reset, font-smoothing antialiased.
  - Ambient radial illumination at top of page (`radial-gradient(ellipse 65% 35% at 50% -10%, rgba(223, 186, 115, 0.10), transparent 70%)`).
  - Custom luxury scrollbar with velvet black track and champagne gold hairline thumb.

### Phase 2: Exclusivity Top Bar & Salon Navigation Header
- [ ] **2.1 Exclusivity Bar (Top Rule):**
  - High-density dark header bar: `Private Technical Atelier • Strict Capacity: 1–3 Retained Accounts / Month • 1 Private Retainer Slot Remaining for Q4`.
  - Delicate pulsing gold status beacon.
- [ ] **2.2 Salon Navigation Header:**
  - Wordmark: `"AURAWORKS HAUTE FABRICATION"` in tracked uppercase Montserrat (`0.2em` tracking).
  - Navigation anchors: `#disciplines`, `#quoting-salon`, `#luxury-shift`, `#commercials`, `#admission`.
  - CTA Button: Champagne gold hairline button: `Request Admission`.

### Phase 3: Hero Chapter & Classical Luxury Value Proposition
- [ ] **3.1 Classical Hero Typography & Narrative:**
  - Eyebrow badge: `STRATEGIC TECHNICAL PARTNERSHIP FOR PHYSICAL PRODUCT MAISONS`.
  - H1 Display: `"Bespoke digital architecture for *master physical craft houses*."` (Cormorant Garamond, with italic gold emphasis on craft houses).
  - Subtitle: Articulate how Auraworks replaces fragmented WhatsApp inquiries and unformatted PDF quotes with curated dimension quoting salons and direct 50% commitment deposit capture.
- [ ] **3.2 Primary Action Buttons:**
  - Primary button: `[ Enter Quoting Salon ]` (champagne gold gradient with dark velvet text).
  - Secondary button: `[ Review Maison Commercials ]` (hairline gold border with silk white text).
- [ ] **3.3 Four-Card Luxury Metric Grid:**
  - Card 1: `R15,000+` — Minimum Target Order AOV for viable client payback.
  - Card 2: `50% Lock` — Automated Web Deposit Capture preserving working capital.
  - Card 3: `1–3 Accounts` — Monthly Retained Client Cap ensuring white-glove focus.
  - Card 4: `1 Closed Deal` — Exactly 1 bespoke commission covers the entire monthly retainer.

### Phase 4: Section 01 // Target Client Profile (ICP Disciplines)
- [ ] **4.1 Three-Column Luxury Discipline Grid:**
  - Elegant salon cards (`#101217`) with delicate metallic hairline borders (`rgba(223, 186, 115, 0.22)`).
- [ ] **4.2 Discipline 01: Bespoke Architectural Furniture:**
  - *Offerings:* Custom solid French oak dining suites, executive boardroom tables, custom architectural cabinetry.
  - *The Friction (Muted Red Box):* Founders wasting 20+ hours weekly giving unvetted showroom tours to indecisive tire-kickers.
  - *The Maison Solution (Illuminated Gold Box):* Private quoting salon allowing remote interior designers to configure dimensions and place 50% deposits online.
- [ ] **4.3 Discipline 02: High-End Architectural Finishes:**
  - *Offerings:* Artisan patinated brass door hardware, custom acoustic bronze screens, architectural lighting.
  - *The Friction (Muted Red Box):* Architects waiting weeks for custom finish quotes over endless unread email chains.
  - *The Maison Solution (Illuminated Gold Box):* Specifier finish portal with downloadable specification sheets and instant finish multipliers.
- [ ] **4.4 Discipline 03: Specialized Fabrication & Outfitting:**
  - *Offerings:* Bespoke overland expedition vehicles, custom commercial braai units, luxury pergolas.
  - *The Friction (Muted Red Box):* Uncontrolled verbal scope changes during 8–12 week production runs causing cash-flow strain.
  - *The Maison Solution (Illuminated Gold Box):* Modular add-on selection with phased milestone deposit gating and live build diary updates.

### Phase 5: Section 02 // The Private Commission Quoting Salon
- [ ] **5.1 Dual-Column Quoting Salon Layout:**
  - Left Column: Parametric dimensional sliders and rare substrate selectors.
  - Right Column: Formal Commission Statement card displaying footprint area in $m^2$, production window, calculated price, and 50% deposit callout.
- [ ] **5.2 Rare Substrate & Finish Matrix:**
  - *French Oak Prime Selection:* Hand-rubbed organic oil, tight straight grain ($1.00\times$ base).
  - *American Black Walnut Flitch:* Bookmatched natural veneer flitches, silky satin finish ($1.35\times$ base).
  - *Hand-Patinated Brass & Steel:* Artisan torch-patinated metal base ($1.30\times$ base).
- [ ] **5.3 Parametric Dimension Controls:**
  - Overall Length: 1,800 mm to 4,200 mm (100 mm increments) with active readout.
  - Overall Width: 800 mm to 1,500 mm (50 mm increments) with active readout.
  - Sliders feature delicate champagne gold circular scrubbers (`#dfba73`).
- [ ] **5.4 Formal Commission Statement & 50% Deposit Gate:**
  - Surface footprint calculation in $m^2$: $\text{Area} = \frac{\text{Length}}{1000} \times \frac{\text{Width}}{1000}$.
  - Base Rate: R13,500 per $m^2$.
  - Price Formula: $\text{Total} = (\text{Area} \times \text{Base Rate}) \times \text{Substrate Multiplier}$.
  - 50% Luxury Deposit Lock:
    `50% Web Deposit Required: R XX,XXX`.
    *Luxury Guarantee: "Confirms raw veneer selection, reserves workshop bench time, and issues your formal Certificate of Provenance upon payment clearance."*
  - Action Button: `[ Reserve Commission & Lock Spec ]` opening the admission modal with locked parameters.

### Phase 6: The Luxury Shift (From Chaotic Inquiries to Private Salon Order)
- [ ] **6.1 Comparative Split Architecture:**
  - Side-by-side contrast between `"Fragmented WhatsApp Friction"` and `"The Curated Private Salon Machine"`.
- [ ] **6.2 Left Column: WhatsApp & Showroom Friction:**
  - Unstructured voice notes and low-res screenshots from indecisive prospects.
  - Founders spending unpaid evenings calculating manual quotes that get ghosted.
  - Invoices sent via delayed email attachments; deposits take weeks to clear.
  - Anxious clients calling repeatedly asking for build status during 8–12 week fabrication cycles.
- [ ] **6.3 Right Column: The Private Client Salon Engine:**
  - Curated web configurator with instant mathematical quote generation.
  - Direct 50% web deposit capture via instant payment rails.
  - Dedicated private gallery link showing weekly workshop photo updates.
  - Archival Certificate of Provenance generated with log harvest location and artisan signature.

### Phase 7: Section 03 // Two-Phase Commercial Framework
- [ ] **7.1 Commercial Presentation Cards:**
  - Two luxury cards with champagne gold hairline borders and glowing elevation on hover.
- [ ] **7.2 Phase 1: Bespoke Build:**
  - Investment: `R45,000 – R75,000` (Once-off milestone payment).
  - Scope: Bespoke high-converting visual showcase, interactive parametric dimension quoting engine, 50% web deposit gateway, automated shop-floor cut-list generation, and legacy asset migration.
  - Timeline: 4–6 weeks execution.
- [ ] **7.3 Phase 2: Ongoing Growth Retainer:**
  - Investment: `R10,000 – R18,000` / month.
  - Scope: Technical SEO & Generative Engine Optimization (GEO) ensuring top AI citations in ChatGPT, Perplexity, and Google AI Overviews; cloud infrastructure maintenance, security monitoring, and continuous quoting engine speed tuning.
- [ ] **7.4 Boardroom Payback Guarantee:**
  - Explicit proof showing that with an AOV of R35,000 and 45% gross margin, exactly **1 single closed order per month** produces R15,750 gross profit—fully covering the retainer while all subsequent orders are pure net profit.

### Phase 8: Section 04 // Admission Matrix for Private Clients
- [ ] **8.1 Two-Column Exclusivity Matrix:**
  - Evaluates partner fit and protects workshop capacity.
- [ ] **8.2 Target Qualifiers (Request Private Briefing):**
  - Physical manufacturing workshop, atelier, or showroom in South Africa.
  - Average Order Value strictly R15,000 to R450,000+.
  - Managing Director / Founder directly engaged in commercial transformation.
  - Experiencing significant quotation turnaround bottlenecks and lost manual proposals.
- [ ] **8.3 Immediate Disqualifiers (Do Not Apply):**
  - Pure dropshippers, ecommerce resellers, and third-party importers.
  - Mass low-margin retail products with AOV below R5,000.
  - Solo hobbyists operating from domestic premises without commercial tooling.
  - Unpaid contingency or equity-only proposals.

### Phase 9: Private Discovery Admission Modal
- [ ] **9.1 Concierge Modal Dialog Container:**
  - Velvet black dialog with delicate champagne gold border, subtle backdrop blur, and close button `[ × ]`.
- [ ] **9.2 Qualification Intake Input Fields:**
  - Executive / Proprietor Name & Title.
  - Maison / Studio Brand Name & City.
  - Corporate Email Address & Direct Telephone.
  - Average Order Value Bracket (Dropdown).
  - Primary Operational Bottleneck (Checkboxes).
  - Pre-populated dimension and substrate parameters from Section 02.
- [ ] **9.3 Client-Side Validation & Confirmation Screen:**
  - Validates required fields and business email domain.
  - Confirmation screen: `ADMISSION BRIEFING LOGGED // Auraworks evaluates workshop capacity and will confirm consultation within 24 business hours.`

### Phase 10: Haute Maison Archival Footer
- [ ] **10.1 Structured Archival Footer:**
  - Auraworks Haute Fabrication branding and private salon mandate.
  - Archival typography, studio contact details, capacity notices.
  - Legal & Data Governance: POPIA Compliance Notice, Mutual Non-Disclosure Guarantee.
  - Copyright: `© 2026 Auraworks Maison. Built for South African Luxury Fabricators & Master Artisans.`

---

## 3. Responsive Breakpoint Specification

| Breakpoint | Target Display | Layout Adjustments |
|---|---|---|
| **> 1200px** | High-Res Luxury Displays | Max 1200px container, full 2-column quoting salon (controls left, statement right), 4-column metric grid. |
| **992px – 1199px** | Laptops & Tablets (Landscape) | Stacked quoting salon with sticky statement panel, 2-column metric cards, relaxed padding. |
| **768px – 991px** | Tablets (Portrait) | Single-column discipline layout, touch-friendly substrate buttons (min height 48px), full-width sliders. |
| **< 768px** | Mobile Handhelds (375px – 480px) | Single column throughout, condensed exclusivity bar, vertical commercial cards, full-screen concierge modal. |

---

## 4. Verification & Quality Assurance Protocol

Before marking the implementation of Design 08 as complete, the following tests will be performed:
- [ ] **Velvet Black & Champagne Gold Harmony:** Verify rich contrast between `#050507` velvet black and `#dfba73` champagne gold.
- [ ] **Mathematical Engine Validation:**
  * Verify `2400 mm × 1000 mm` ($2.4 m^2$) in French Oak base = R32,400. 50% deposit = R16,200.
  * Verify `3200 mm × 1100 mm` ($3.52 m^2$) in American Walnut Flitch ($1.35\times$) = $(3.52 \times 13,500) \times 1.35 = \text{R}64,152$. 50% deposit = R32,076.
- [ ] **Typography Antialiasing:** Ensure smooth rendering of `Cormorant Garamond` serif ligatures without blur or clipping.
- [ ] **Modal State Integrity:** Ensure modal opens with pre-set dimensions from the salon and enforces AOV qualification logic.
- [ ] **Hairline Metallic Borders:** Verify `rgba(223, 186, 115, 0.22)` borders render sharply across standard and high-DPI screens.
