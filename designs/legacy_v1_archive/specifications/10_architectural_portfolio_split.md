# Design Specification 10: Architectural Editorial Split (Monograph & Asymmetric Index)
**Design Code:** `AW-DSGN-10-SPLIT`  
**Target Sub-Sectors:** Architectural Joinery Practices, Custom Architectural Finish Manufacturers, Design Studios Working with Architects  
**Strategic Archetype:** Asymmetric 40/60 Split-Screen Monograph, Sticky Index & Deep Chapter Stream  
**Primary Psychological Objective:** Architectural peer status, editorial authority, systematic chapter indexation, and effortless navigation.

---

## 1. Executive Persona & Trust Thesis

### 1.1 The Prospective Client Profile
* **Target Decision Maker:** Studio Principal, Architectural Director, or Managing Director of an established bespoke joinery atelier, architectural metalwork manufacturer, or high-end physical finish studio.
* **Economic Reality:**
  - Average Order Value (AOV) is **R30,000 to R300,000+** per architectural specification contract.
  - They work closely with leading architectural firms, commercial space planners, luxury property developers, and interior designers on high-value residential and commercial building schedules.
* **The Emotional & Tactical Reality:**
  - They think in floor plans, spatial sections, architectural elevations, and project chapters. They read international monographs (*El Croquis*, *Detail*, *Phaidon*).
  - Standard marketing landing pages with full-width centered rows feel generic, commercialized, and unsophisticated to their trained architectural eyes.
  - **Their Operational Bottleneck:**
    - Architects need quick access to product dimensions, material tolerances, and structural specs to include them in tender drawings.
    - Because the manufacturer's website lacks an architectural index or parametric quoting tool, architects send vague email inquiries with large PDF drawings attached.
    - The studio spends weeks performing unpaid drawing takeoffs and exchanging 15+ emails, only for the developer to value-engineer the project or stall before a deposit is paid.
  - **What They Need to See:** A digital monograph that mirrors architectural editorial layout: a fixed left-hand index providing immediate orientation, paired with a right-hand analytical stream that guides architects from specification to a structured 50% deposit commitment.

### 1.2 The Trust Architecture: Why They Trust Auraworks Instantly
1. **Asymmetric 40/60 Split-Screen Layout:** Anchors a fixed left sidebar (`420px` width) containing the brand manifesto, capacity indicator, and persistent chapter index, while the right pane (`max-width: 900px`) smoothly scrolls through deep technical chapters.
2. **Editorial Monograph Tone:** Basalt charcoal (`#0f1217`), warm architectural linen (`#161b24`), deep bronze accents (`#c28c58`), and clean structural dividers (`#222938`) convey immediate architectural peer-level authority.
3. **Structured Case Study Chapters:** Organizes the commercial brief into discrete analytical chapters with before/after operational case studies.

---

## 2. Bespoke Ecommerce Architecture (Monograph Storefront Standard)

### 2.1 Visual Atmosphere & Art Direction
* **Canvas Architecture:** Deep basalt charcoal (`#0f1217`) paired with a darker editorial sidebar (`#090b0e`), hairline structural borders (`#222938`), and warm architectural bronze typography (`#c28c58`).
* **Spatial Layout:** Sticky left column (100vh on desktop) providing permanent context and navigation; dynamic scrolling right column providing deep, immersive content.
* **Typography:**
  - Headings & Chapter Titles: *Space Grotesk* (Google Fonts: 500, 600, 700) — geometric, architectural, and structurally grounded.
  - Analytical Copy & Tables: *Inter* (Google Fonts: 300, 400, 500, 600) — clean, neutral, and highly readable.

### 2.2 The Architectural Dimension Engine (Chapter 03)
Embedded inside Chapter 03 is an interactive **Architectural Dimension Configurator**:
* **Parametric Controls:**
  - Piece Length Slider: 1,800 mm to 4,200 mm (100 mm steps) with live bronze numeral readout.
  - Piece Width Slider: 800 mm to 1,500 mm (50 mm steps).
* **Material Substrate Swatches:**
  - *French Oak Prime:* Sustainably harvested, dry-jointed monolithic slabs ($1.00\times$).
  - *American Walnut:* Silky hand-rubbed oil finish ($1.35\times$).
  - *Structural Steel Base Frame:* Architectural box section ($1.25\times$).
* **Quoting Summary Receipt:**
  - Live calculation of footprint: `Surface Footprint: 3.30 m²`.
  - Production lead window: `4–6 Weeks`.
  - Calculated custom order value: `R51,000`.
* **50% Web Production Deposit:**
  - Highlighted in a clean green callout:
    `50% Web Deposit: R25,500`.
  - Guarantees: *"Locks timber batch allocation, reserves workshop bay schedule, and issues production drawing set upon payment clearance."*

---

## 3. Custom Operational Tool Architecture (Back-of-House Systems)

### 3.1 Architectural Specifier Download Vault & Lead Intelligence
Design 10 is optimized for commercial specifiers and architects:
* **BIM / CAD Asset Vault:** Allows architects to download 2D/3D CAD blocks (.dwg, .dxf) and Revit BIM families with locked standard dimensions.
* **Specifier Telemetry Tracking:** Notifies the workshop founder when a commercial architecture firm downloads drawings for a major building tender, identifying high-value pipeline opportunities before tenders are awarded.

### 3.2 Automated Drawing Set & Cut-List Exporter
* Web-configured parameters automatically generate a standard architectural specification sheet (PDF) with dimensioned orthographic views for contractor sign-off.
* Cuts down the pre-production drawing approval phase from 3 weeks of manual CAD iterations to under 24 hours.

---

## 4. Full Page Architecture & Section-by-Section Wireframe Breakdown

```
┌───────────────────────────────────────┬──────────────────────────────────────────┐
│ FIXED LEFT SIDEBAR (420px Sticky)     │ DYNAMIC RIGHT CONTENT STREAM (900px)     │
├───────────────────────────────────────┼──────────────────────────────────────────┤
│ • AURAWORKS Brand & Tagline           │ CHAPTER 01: STRATEGIC REPOSITIONING      │
│ • Executive Sidebar Thesis            │ • The Shift to High-Margin Partnerships  │
│ • Capacity Status Box (1–3 Accounts)  │ • 3-Scorecard Summary (AOV, Dep, Payback)│
│ • Chapter Anchor Index:               ├──────────────────────────────────────────┤
│   - 01 Context                        │ CHAPTER 02: THE THREE ICP VERTICALS      │
│   - 02 ICP Verticals                  │ • Furniture, Finishes, Specialized Fab   │
│   - 03 Quoting Prototype              │ • Pain Points vs. Auraworks Build        │
│   - 04 Commercials                    ├──────────────────────────────────────────┤
│   - 05 Qualification                  │ CHAPTER 03: QUOTING ENGINE PROTOTYPE     │
│ • CTA: Apply for Discovery Call &rarr;│ • Dimension Sliders, Swatches, Receipt   │
│ • Confidentiality & POPIA Metadata    ├──────────────────────────────────────────┤
│                                       │ CHAPTER 04: COMMERCIAL FRAMEWORK         │
│                                       │ • Phase 1 Build (R45k-R75k) vs Phase 2   │
│                                       ├──────────────────────────────────────────┤
│                                       │ CHAPTER 05: QUALIFICATION MATRIX         │
│                                       │ • Target Qualifiers vs. Disqualifiers    │
│                                       ├──────────────────────────────────────────┤
│                                       │ CHAPTER 06: DISCOVERY APPLICATION FORM   │
│                                       │ • Direct Technical Intake & Consultation │
└───────────────────────────────────────┴──────────────────────────────────────────┘
```

### 4.1 Section Breakdown Details
1. **Fixed Left Sidebar (Permanent Navigation & Orientation):**
   - Brand Header: `AURAWORKS // ARCHITECTURAL PORTFOLIO & PIPELINE INDEX`.
   - Thesis: Concise statement on bespoke technical partnerships for physical manufacturers.
   - Capacity Status Box: Amber pill with green pulsing dot: `Capacity: 1–3 Accounts / Month • 1 Retainer slot available for Q4.`
   - Chapter Anchor Navigation: Clickable links highlighting chapters with bronze numeric tags (`01`, `02`, `03`, `04`, `05`).
   - Action Button: Full-width bronze button: `Apply for Discovery Call &rarr;`.
2. **Right Content Stream — Chapter 01 // Executive Context:**
   - Label: `Chapter 01 // Executive Context`
   - Headline: *"Strategic Repositioning &amp; ICP Target Shift"*
   - Lead Narrative: The transition away from broad development to high-margin technical partnerships delivering clear ROI.
   - 3-Metric Summary Grid: `R15k+ Minimum AOV`, `50% Lock Automated Deposit`, `1 Deal Retainer Break-Even`.
3. **Right Content Stream — Chapter 02 // Ideal Client Profile:**
   - Detailed stack of the three sub-sectors:
     * *Sub-Sector 01: Bespoke &amp; Architectural Furniture*
     * *Sub-Sector 02: High-End Architectural Finishes*
     * *Sub-Sector 03: Specialized Fabrication &amp; Outfitting*
   - Each card features two distinct split boxes: `Bottleneck (Pain)` in soft red and `Auraworks Build (Solution)` in soft green.
4. **Right Content Stream — Chapter 03 // Interactive Quoting Prototype:**
   - Interactive dimension sliders for Length and Width, with material swatch buttons (French Oak, Walnut, Steel Base).
   - Summary receipt showing footprint in $m^2$, calculated value (`R51,000`), and structured 50% deposit callout (`R25,500`).
5. **Right Content Stream — Chapter 04 // Commercial Framework:**
   - Side-by-side package cards:
     * **Phase 01 // Upfront Build:** `R45,000 – R75,000 once-off` (Bronze highlight: Custom storefront, dimension quoting engine, internal pipeline dashboard).
     * **Phase 02 // Monthly Retainer:** `R10,000 – R18,000 / month` (Technical SEO, AI search visibility in ChatGPT/Google AI, lead flow auditing, speed assurance).
6. **Right Content Stream — Chapter 05 // Qualification Matrix:**
   - Side-by-side comparison: `Target Qualifiers (Book Call)` in green vs. `Immediate Disqualifiers (Do Not Book)` in red.
7. **Right Content Stream — Chapter 06 // Discovery Intake Form:**
   - Clean, professional consultation form for scheduling technical discovery sessions.
8. **Monograph Footer:** Archival typography, regional node metadata, and legal compliance notices.

---

## 5. Design System Tokens & Micro-Interactions

### 5.1 Color Tokens
| Token Name | Hex Code | Semantic Role |
|---|---|---|
| `--bg-dark` | `#0f1217` | Root basalt dark canvas |
| `--bg-sidebar` | `#090b0e` | Fixed left sidebar surface |
| `--bg-card` | `#161b24` | Elevated architectural card surfaces |
| `--border-dark` | `#222938` | Structural boundary lines |
| `--border-bright` | `#354157` | Highlighted borders on hover |
| `--bronze-arch` | `#c28c58` | Primary architectural bronze accent |
| `--bronze-glow` | `rgba(194, 140, 88, 0.18)` | Button shadows & glow highlights |
| `--emerald-dot` | `#10b981` | Status dots, 50% deposit badges, qualified tags |
| `--crimson-warn` | `#ef4444` | Bottleneck alerts, disqualified tags |
| `--text-white` | `#f8fafc` | High-contrast display copy |
| `--text-muted` | `#94a3b8` | Explanatory text & specifications |
| `--text-dim` | `#64748b` | Footnotes & dimension metadata |

### 5.2 Typography System
* **Display & Chapter Titles:** `Space Grotesk` (Google Fonts: 500, 600, 700)
  - Hero H1 / Ch Titles: `clamp(30px, 4.5vw, 48px)`, weight: `700`, line-height: `1.15`, tracking: `-0.02em`
  - Sidebar Title: `24px`, weight: `700`, tracking: `0.05em`
  - Card Titles: `22px`, weight: `700`
  - Price Outputs: `30px to 34px`, weight: `700`
* **Analytical Body & Captions:** `Inter` (Google Fonts: 300, 400, 500, 600)
  - Chapter Lead: `17px`, line-height: `1.6`, color: `#94a3b8`
  - Standard Body: `13.5px to 14.5px`, line-height: `1.55`
  - Nav Index: `13.5px`, weight: `600`

### 5.3 Micro-Interactions & Animation Specs
1. **Smooth Anchor Scrolling:** Clicking an index item in the left sidebar triggers a smooth, native scroll animation (`scroll-behavior: smooth`) directly to the target chapter on the right.
2. **Interactive Swatch Toggling:** Clicking material swatches updates the bronze border highlight and dynamically recalculates footprint and 50% deposit.
3. **Sticky Sidebar Persistence:** The left sidebar remains firmly pinned at `top: 0` while the right pane flows smoothly, giving the user continuous context.

---

## 6. Implementation Readiness Checklist

- [ ] **Split-Screen CSS Grid:** Two-column grid (`420px 1fr`) with clean responsive media query collapsing to single-column at `1024px`.
- [ ] **Sticky Positioning:** `position: sticky; top: 0; height: 100vh;` implementation on left sidebar with independent scrollbar where needed.
- [ ] **Smooth Anchor Links:** Hash-based navigation with `scroll-margin-top` to prevent header clipping.
- [ ] **Dynamic Mathematical Calculator:** JavaScript logic computing square meters, prices, and 50% deposits in real time.
- [ ] **Zero-Dependency Code:** Fast loading with no external JavaScript layout frameworks.
