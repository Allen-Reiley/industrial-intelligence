# Implementation Plan: Design 02 — Haute Luxury Editorial Monograph
**Target File:** `designs/02_luxury_editorial_monograph.html`  
**Specification Reference:** `designs/specifications/02_luxury_editorial_monograph.md`  
**Design Code:** `AW-ARCH-LUXURY-MONOGRAPH`  
**Archetype:** Museum-Grade Editorial Art Monograph & Private Salon Dossier  
**Target Audience:** Haute bespoke furniture houses, architectural bronze & stone ateliers, private commission studios (AOV R45,000 to R450,000+).

---

## 1. Executive Strategy & Technical Architecture Overview

`02_luxury_editorial_monograph.html` is designed as a museum-grade architectural art publication and private client salon. It completely abandons standard SaaS and ecommerce landing page wireframes in favor of an asymmetric, book-like editorial structure inspired by Bottega Veneta, Rimowa, and Hermès. It proves that custom software elevates luxury pricing power by introducing white-glove digital provenance and capturing mandatory 50% deposits before valuable timber flitches or cast bronze plates are cut.

### 1.1 Technical Constraints & Standards
* **Self-Contained File:** Single HTML5 document with embedded CSS custom properties, responsive editorial typography clamp formulas, and vanilla JavaScript for the Private Commission Salon Dossier and Certificate of Provenance generator. Zero external runtime dependencies.
* **Typography:** Preconnected Google Fonts:
  - `Cormorant Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600` (Classical luxury display serifs with italic accents)
  - `Montserrat:wght@400;500;600` (Uppercase tracked architectural labels, `0.18em` to `0.25em` letter spacing)
  - `Inter:wght@300;400;500` (Light, refined editorial body copy)
* **Color System:**
  - Velvet black canvas: `--bg-velvet: #050507`
  - Salon charcoal: `--bg-salon: #0d0e12`
  - Card surfaces: `--bg-card: #12141a`
  - Champagne bronze: `--gold-champagne: #dfba73`
  - Deep burnished gold: `--gold-deep: #b38938`
  - Hairline gold: `--border-gold: rgba(223, 186, 115, 0.22)`
  - Silk white: `--text-silk: #fcfbfa`
  - Muted taupe: `--text-muted: #8c92a0`

---

## 2. Granular Task Checklist

### Phase 1: Document Foundation & Monograph Styling Tokens
- [ ] **1.1 HTML5 Skeleton & Monograph Metadata:**
  - Semantic `<head>` with viewport meta, charset UTF-8, title: `Auraworks Haute Maison | Private Client Commission Quoting Salons & Digital Architecture`.
  - OpenGraph meta tags, robots meta (`index, follow`), Google Fonts preconnect for `Cormorant Garamond`, `Montserrat`, and `Inter`.
- [ ] **1.2 CSS Root Variables & Editorial Typography Formulas:**
  - Declare velvet black canvas and salon card surfaces (`--bg-velvet`, `--bg-salon`, `--bg-card`, `--border-gold`, `--gold-champagne`).
  - Declare fluid typography clamp formulas (`--fs-hero`, `--fs-h2`, `--fs-chapter-title`, `--fs-quote`).
- [ ] **1.3 Ambient Lighting & Editorial Resets:**
  - Ambient radial illumination (`radial-gradient(ellipse 65% 35% at 50% -10%, rgba(223, 186, 115, 0.10), transparent 70%)`).
  - Custom luxury scrollbar with velvet black track and champagne gold hairline thumb.

### Phase 2: Top Exclusivity Bar & Salon Header
- [ ] **2.1 Exclusivity Bar (Top Strip):**
  - High-density dark header bar: `PRIVATE TECHNICAL ATELIER • STRICT CAPACITY: 1–3 RETAINED ACCOUNTS / MONTH • 1 RETAINER SLOT REMAINING FOR Q4`.
  - Pulsing champagne gold status beacon.
- [ ] **2.2 Salon Navigation Header:**
  - Wordmark: `"AURAWORKS HAUTE MAISON"` in tracked uppercase Montserrat (`0.2em` tracking).
  - Chapter anchors: `#manifesto`, `#salon-dossier`, `#disciplines`, `#commercials`, `#admission`.
  - CTA Button: Champagne gold hairline button: `Request Admission`.

### Phase 3: Chapter I // The Monograph Cover & Manifesto
- [ ] **3.1 Editorial Cover Layout:**
  - Volume index: `VOLUME IV // PRIVATE ARCHITECTURAL COMMISSIONS`.
  - H1 Display: `"Bespoke digital architecture for *master physical craft houses*."` (Cormorant Garamond, with italic gold emphasis on craft houses).
  - Quiet, wide-margin single-column luxury lead narrative on protecting luxury pricing power and eliminating WhatsApp friction.
- [ ] **3.2 Four Editorial Fiduciary Metrics:**
  - R15,000+ AOV Minimum Threshold.
  - 50% Private Bank Deposit Gate.
  - 1–3 Retained Accounts Capacity Ceiling.
  - 1 Closed Deal Retainer Amortization.

### Phase 4: Chapter II // The Private Commission Salon Dossier
- [ ] **4.1 Curated Step-by-Step Commission Flow:**
  - Step 1: Rare Specimen Selection (French Oak Prime Slab, Bookmatched American Walnut Flitch, Hand-Patinated Brass & Steel, African Kiaat).
  - Step 2: Parametric Millimeter Span Sliders with champagne gold scrubbers.
  - Step 3: Formal Acquisition Statement displaying surface area ($m^2$), mass, 4–6 week workshop bench reservation.
  - Step 4: High-impact **50% Private Commission Deposit Gate**:
    `50% UPFRONT COMMITMENT: R XX,XXX`.
    *"Confirms raw flitch reserve, issues formal Certificate of Provenance, and locks atelier bench calendar."*
- [ ] **4.2 Certificate of Provenance Interactive Preview:**
  - Archival preview showing log harvest location, artisan signature, timber moisture content, and serial number.

### Phase 5: Chapter III // Three Atelier Disciplines (Editorial Spreads)
- [ ] **5.1 Three Luxury Discipline Spreads:**
  - *Spread 01: Bespoke Architectural Furniture* (French oak monoliths, executive boardroom suites).
  - *Spread 02: High-End Architectural Finishes* (Cast bronze pivot doors, acoustic wall paneling).
  - *Spread 03: Specialized Fabrication & Outfitting* (Overland camper conversions, luxury pergola modules).
  - Each with a discreet red friction callout and an illuminated gold solution box.

### Phase 6: Chapter IV // The Maison Commercial Framework
- [ ] **6.1 Two Luxury Commercial Packages:**
  - **Phase 01: Private Salon & Quoting Dossier Build** (R45,000 – R75,000 once-off).
  - **Phase 02: Growth & Infrastructure Retainer** (R10,000 – R18,000/month for Technical SEO & GEO citations in ChatGPT, Perplexity, and Google AI Overviews).
  - Single-Order Fiduciary Payback Proof.

### Phase 7: Chapter V // Concierge Admission Modal & Archival Footer
- [ ] **7.1 Concierge Admission Modal:**
  - Velvet black dialog with champagne gold hairline border and close button.
  - Principal Name, Maison Name, Corporate Email, Direct Phone, AOV bracket, Objective.
  - Pre-populated snapshot from the Commission Salon Dossier.
  - Client-side validation and confirmation screen.
- [ ] **7.2 Archival Colophon Footer:**
  - Archival typography, studio contact details, capacity notices, POPIA compliance, and mutual NDA terms.

---

## 3. Responsive Breakpoint Specification

| Breakpoint | Target Display | Layout Adjustments |
|---|---|---|
| **> 1200px** | High-Res Luxury Displays (1440p / 4K) | Generous 1200px container, 2-column Commission Salon (sliders left, statement right), wide margins. |
| **992px – 1199px** | Laptops | Stacked Commission Salon with sticky statement panel, 2-column metrics. |
| **< 768px** | Mobile Devices | Single-column editorial layout, touch-friendly material switches, full-screen concierge modal. |

---

## 4. Verification & Quality Assurance Protocol

Before marking the implementation of Design 02 as complete, the following tests will be performed:
- [ ] **Velvet Black & Champagne Gold Contrast:** Verify WCAG AAA contrast between `#fcfbfa` silk white text and `#050507` velvet black.
- [ ] **Cormorant Garamond Typography Antialiasing:** Ensure smooth rendering of classical serif ligatures.
- [ ] **Commission Salon Mathematical Accuracy:**
  * Verify `2400 mm × 1000 mm` ($2.4 m^2$) in French Oak base = R32,400. 50% deposit = R16,200.
  * Verify `3600 mm × 1200 mm` ($4.32 m^2$) in Walnut Flitch ($1.35\times$) = $(4.32 \times 13,500) \times 1.35 = \text{R}78,732$. 50% deposit = R39,366.
- [ ] **Modal State Integrity:** Ensure modal opens with pre-set dimensions from the salon and enforces AOV qualification logic.
