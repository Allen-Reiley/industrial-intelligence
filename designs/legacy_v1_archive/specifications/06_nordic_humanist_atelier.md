# Design Specification 06: Nordic Humanist Atelier (Modern Scandinavian Studio)
**Design Code:** `AW-DSGN-06-NORDIC`  
**Target Sub-Sectors:** Boutique Architectural Joinery, Scandinavian Timber Studios, Custom Cabinetry Ateliers, Handcrafted Acoustic Panels  
**Strategic Archetype:** Nordic Modernism, Organic Pill Geometry & Calming Operational Order  
**Primary Psychological Objective:** Operational serenity, humane craftsmanship, eliminating administrative anxiety, and high-trust transparency.

---

## 1. Executive Persona & Trust Thesis

### 1.1 The Prospective Client Profile
* **Target Decision Maker:** Founder, Studio Principal, or Creative Director of an established bespoke woodworking studio, architectural cabinetry workshop, or Nordic-inspired physical design atelier.
* **Economic Reality:**
  - Average Order Value (AOV) is **R15,000 to R140,000+** per project (custom modular boardroom tables, minimalist Scandinavian timber dining sets, bespoke architectural cabinetry, custom acoustic slatted timber walls).
  - High focus on sustainably harvested timber, natural plant-based oil finishes, and clean humanist aesthetics.
* **The Emotional & Tactical Reality:**
  - They value balance, intentionality, and thoughtful craftsmanship. They started their business to build beautiful physical objects with their hands.
  - **Their Daily Nightmare:** Their actual day is filled with chaotic, stress-inducing administrative friction: frantic WhatsApp messages at 9 PM from anxious interior designers, unformatted emails asking for minor dimension tweaks, lost PDF quote attachments, and chaotic shop floor rescheduling.
  - They feel trapped in administrative overwhelm, which pulls them away from the workshop bench and robs them of peace of mind.
  - **What They Need to See:** When they land on the Auraworks site, they need to feel an instant sense of **calm, orderly relief**. The design must communicate: *"We eliminate the administrative chaos and replace it with a serene, beautifully engineered digital machine that protects your time and respects your craft."*

### 1.2 The Trust Architecture: Why They Trust Auraworks Instantly
1. **Visual Serenity & Clean Breathing Room:** Set on a soft porcelain canvas (`#fbfaf8`) with graphite charcoal (`#1c2127`), soothing eucalyptus/sage green (`#2d6a4f`), soft rounded pill containers (`border-radius: 20px`), and generous whitespace, the interface immediately lowers cortisol and signals sophisticated Scandinavian taste.
2. **Humane, Thoughtful Digital Flow:** No abrasive popups, loud flashing tickers, or aggressive countdown timers. The platform demonstrates that high-ticket B2B software can be gentle, humane, and deeply respectful while remaining commercially formidable.
3. **Automated Client Reassurance:** Proves how automated milestone notifications eliminate anxious customer WhatsApp messages before they happen, giving the craftsman their mental peace back.

---

## 2. Bespoke Ecommerce Architecture (Nordic Storefront Standard)

### 2.1 Visual Atmosphere & Art Direction
* **Canvas Geometry:** Warm porcelain root (`#fbfaf8`), pure card surfaces (`#ffffff`), soft oat structural panels (`#f3f1ec`), and delicate neutral borders (`#e7e4dc`).
* **Organic Curvature:** Gentle pill geometry (`border-radius: 20px` to `24px` on cards, `999px` on buttons and filter toggles) creating an approachable, tactile humanist feel.
* **Typography:**
  - Headings: *Urbanist* (Google Fonts: 600, 700, 800) — a clean, geometric humanist typeface with smooth circular curves and open counters.
  - Body & Explanations: *Inter* (Google Fonts: 400, 500, 600) for effortless legibility.

### 2.2 The Studio Quoting Prototype
The client-facing configurator replaces dense technical tables with an intuitive, serene **Studio Quoting Experience**:
* **Soft Pill Material Toggles:**
  - *French Oak Solid Slab:* Pale honey grain, organic matte oil ($1.00\times$ base).
  - *American Walnut Core:* Rich espresso tone, silky tactile finish ($1.35\times$ base).
  - *Brushed Steel & Glass Base:* Clean architectural lines ($1.20\times$ base).
* **Calibrated Dimensional Sliders:**
  - Length Slider: 1,800 mm to 4,200 mm (100 mm steps)
  - Width Slider: 800 mm to 1,500 mm (50 mm steps)
  - Smooth slider track with a soothing sage green thumb (`#2d6a4f`) that updates the surface area footprint ($m^2$) without DOM stutter.
* **Transparent Specification Receipt:**
  - Displays calculated custom order value in clear, elegant numerals: `R51,000`.
  - Highlights the 50% commitment deposit in a soft, rounded green pill:
    `50% Upfront Web Deposit: R25,500`.
  - Reassuring micro-copy: *"Secures your timber slab reservation, confirms workshop bench scheduling, and locks your 4–6 week production window upon payment."*

---

## 3. Custom Operational Tool Architecture (Back-of-House Systems)

### 3.1 The Automated Milestone Reassurance Engine
The primary operational tool in Design 06 is designed to eliminate customer anxiety and protect the craftsman's focus:
* **The Automated WhatsApp/Email Trigger:** When a project advances through the internal pipeline, the system automatically sends a beautifully formatted, photo-verified milestone update to the client:
  - *Milestone 1:* "Your French Oak slab has been selected, acclimated, and tagged in our workshop."
  - *Milestone 2:* "CNC precision cutting and dry-fit joinery complete."
  - *Milestone 3:* "Hand-sanded to 400 grit and natural organic oil applied."
  - *Milestone 4:* "Final inspection complete. White-glove delivery scheduled for Thursday."
* **Operational Impact:** Reduces inbound customer status calls and frantic WhatsApp messages by **over 80%**, allowing the workshop to operate with uninterrupted craftsmanship.

### 3.2 Humane Workshop Capacity Balancer
An internal visual calendar that protects the workshop from over-promising:
* Visualizes available workbench hours per craftsperson.
* Enforces the commercial brief's strict capacity limit (**1–3 Retained Accounts / Month**) to preserve uncompromised quality standards.

---

## 4. Full Page Architecture & Section-by-Section Wireframe Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│ 0. TOP NOTICE STRIP (Capacity: 1–3 Retained Accounts // 1 Slot Left)   │
├────────────────────────────────────────────────────────────────────────┤
│ 1. HEADER (Circular Monogram A, Navigation Links, Pill Button Apply)   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. HERO CHAPTER (Hero Eyebrow, Serene H1, Lead Copy, 4 Soft Stat Cards)│
├────────────────────────────────────────────────────────────────────────┤
│ 3. SECTION 01: THREE HIGH-VALUE PHYSICAL VERTICALS (Furniture, Finishes)│
├────────────────────────────────────────────────────────────────────────┤
│ 4. SECTION 02: THE STUDIO QUOTING PROTOTYPE (Sliders, Pills, Receipt)  │
├────────────────────────────────────────────────────────────────────────┤
│ 5. THE OPERATIONAL SHIFT: From Inbox Anxiety to Humane Order           │
├────────────────────────────────────────────────────────────────────────┤
│ 6. SECTION 03: TWO-PHASE COMMERCIAL FRAMEWORK (Phase 1 & Phase 2)      │
├────────────────────────────────────────────────────────────────────────┤
│ 7. SECTION 04: QUALIFICATION MATRIX FOR BOOKING (Green OK vs. Red No)  │
├────────────────────────────────────────────────────────────────────────┤
│ 8. CONSULTATION SCHEDULER (Calm, Frictionless Workshop Intake)         │
├────────────────────────────────────────────────────────────────────────┤
│ 9. NORDIC STUDIO FOOTER (Clean Studio Navigation, Legal Governance)    │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Section Breakdown Details
1. **Top Notice Strip:** Subtle soft oat strip with rounded green pill: `Capacity: 1–3 Retained Accounts / Month | Preserving high-craft technical partnerships. 1 Retainer slot available for this quarter.`
2. **Header:** Features the circular green Auraworks monogram (`A`), clear title *"AURAWORKS Nordic Craft Studio"*, navigation links, and primary pill button: `Apply for Intake &rarr;`.
3. **Hero Chapter:**
   - Pre-heading: `Strategic Technical Partnerships for Physical Product Makers`
   - Headline: *"Custom dimension quoting &amp; pipelines for high-ticket bespoke workshops."*
   - Lead: How Auraworks replaces unstructured WhatsApp voice notes, lost PDF quote attachments, and delayed scheduling with calming, precision-engineered dimension quoting and 50% deposit capture.
   - 4-Card Soft Metrics Grid:
     * `R15,000+` (Minimum Target Order AOV)
     * `50% Lock` (Automated Web Deposit Capture)
     * `1–3 Limit` (Strict Monthly Retained Accounts)
     * `1 Order` (Covers Entire Monthly Retainer)
4. **Section 01 // Target Client Profile (ICP):**
   - Three soft rounded cards (`border-radius: 20px`) detailing:
     * *Sub-Sector 01: Bespoke Architectural Furniture* (timber/steel tables, boardrooms, custom cabinetry).
     * *Sub-Sector 02: High-End Architectural Finishes* (steel & glass partitions, handcrafted tiles, lighting).
     * *Sub-Sector 03: Specialized Fabrication & Outfitting* (campers, braais, pergolas, trailers).
   - Each card features a soft red pain box and a soft green solution box.
5. **Section 02 // Studio Quoting Prototype:**
   - Dual-column white container: Left side features clean dimensional sliders and rounded pill selectors; Right side features a porcelain receipt summary with large quote price and 50% deposit pill.
6. **Section 03 // Commercial Framework:**
   - Two rounded package cards:
     * **Phase 01 // Foundation:** `R45,000 – R75,000 once-off` (Featured green border: High-converting visual showcase, dimension quoting engine, internal pipeline dashboard).
     * **Phase 02 // Ongoing:** `R10,000 – R18,000 / month` (Soft oat background: Technical SEO, AI search visibility in ChatGPT/Google AI, lead flow auditing, speed assurance).
7. **Section 04 // Qualification Matrix:**
   - Soft rounded comparison cards: `Target Qualifiers (Book Call)` with green border vs. `Immediate Disqualifiers (Do Not Book)` with soft rose border.
8. **Nordic Studio Footer:** Studio contact details, capacity notices, and legal compliance metadata.

---

## 5. Design System Tokens & Micro-Interactions

### 5.1 Color Tokens
| Token Name | Hex Code | Semantic Role |
|---|---|---|
| `--bg-porcelain` | `#fbfaf8` | Root warm porcelain canvas |
| `--bg-card` | `#ffffff` | Pure white container surfaces |
| `--bg-subtle` | `#f3f1ec` | Soft oat panel backgrounds & top strip |
| `--border-soft` | `#e7e4dc` | Soft neutral borders |
| `--border-focus` | `#c5bfb2` | Active input states |
| `--graphite` | `#1c2127` | Headings & high-contrast typography |
| `--graphite-light`| `#4b535d` | Explanatory copy & secondary descriptions |
| `--sage-dark` | `#2d6a4f` | Primary green accent, buttons, active pills |
| `--sage-mid` | `#40916c` | Hover state for buttons |
| `--sage-light` | `#d8f3dc` | 50% deposit pills, qualified badges |
| `--clay-warm` | `#bc6c25` | Phase 2 retainer highlights |
| `--alert-rose` | `#e63946` | Disqualified tags & pain indicators |
| `--alert-bg` | `#ffebee` | Disqualified container surface |

### 5.2 Typography System
* **Display & Headings:** `Urbanist` (Google Fonts: 600, 700, 800)
  - Hero H1: `clamp(38px, 5vw, 62px)`, weight: `800`, line-height: `1.1`, tracking: `-0.03em`
  - Section H2: `clamp(28px, 3.8vw, 42px)`, weight: `800`, line-height: `1.15`, tracking: `-0.02em`
  - Card Titles: `22px to 24px`, weight: `800`
  - Stat Numbers: `32px to 36px`, weight: `800`
* **Body Text & UI Labels:** `Inter` (Google Fonts: 400, 500, 600)
  - Lead Copy: `18px`, line-height: `1.6`, color: `#4b535d`
  - Standard Body: `14px to 15px`, line-height: `1.55`
  - Pill Labels: `12px to 13px`, weight: `600`

### 5.3 Micro-Interactions & Animation Specs
1. **Gentle Pill Selection:** Clicking a pill selector smoothly animates background color (`transition: all 0.2s ease`) from porcelain to deep sage green (`#2d6a4f`).
2. **Soft Card Elevation:** Cards lift gently by 4px (`transform: translateY(-4px)`) with expanded diffused shadow on hover.
3. **Fluid Slider Track:** Rounded green thumb (`#2d6a4f`) that tracks smoothly along a soft oat channel, recalculating price with zero lag.

---

## 6. Implementation Readiness Checklist

- [ ] **Porcelain & Oat Color Contrast:** Meets WCAG AAA accessibility contrast between `#1c2127` graphite and `#fbfaf8` porcelain.
- [ ] **Organic Pill Curvature:** Universal application of `border-radius: 20px` to `24px` on cards and `999px` on buttons.
- [ ] **Dynamic Odometer Price Output:** JavaScript math engine recalculating footprint and 50% deposit with smooth formatting.
- [ ] **Fluid Responsive Structure:** Clean layout collapse from 3-column desktop to single-column mobile viewports without horizontal scroll.
- [ ] **Lightweight, Zero-Dependency Code:** Fast loading with no bloated external UI frameworks.
