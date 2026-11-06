# Design Specification 01: The Industrial Atelier (Dark Monolith)
**Design Code:** `AW-DSGN-01-ATELIER`  
**Target Sub-Sectors:** Bespoke & Architectural Furniture, Master Joinery Studios, Luxury Physical Fabricators  
**Strategic Archetype:** Obsidian Monolith & Patina Bronze Ateliers  
**Primary Psychological Objective:** Instant executive trust, sensory respect for physical craft, and undeniable technical competence.

---

## 1. Executive Persona & Trust Thesis

### 1.1 The Prospective Client Profile
* **Target Decision Maker:** Founder, Managing Director, or Head of Sales of an established, privately owned bespoke manufacturing studio or architectural joinery workshop.
* **Economic Reality:** Average Order Value (AOV) is **R15,000 to R150,000+** per commissioned physical piece (custom solid French oak dining tables, executive boardroom suites, luxury architectural cabinetry, custom hospitality installations).
* **The Emotional & Operational Reality:**
  - They take profound, uncompromising pride in their craftsmanship, timber selection, steel welds, and hand-rubbed finishes.
  - However, their sales and intake process is an exhausting bottleneck: inquiries arrive via WhatsApp voice notes, unstructured Instagram DMs, and long email chains with unread attachments.
  - They spend unpaid evenings calculating dimension variations and typing manual PDF quotes for tire-kickers who ghost after 4 days.
  - Production begins on verbal agreements or delayed deposits, introducing severe cash flow exposure.

### 1.2 The Trust Architecture: Why They Trust Auraworks Instantly
1. **Physical Material Respect:** Generic software agencies present SaaS dashboards with cartoonish illustrations and blue buttons. *The Industrial Atelier* treats the web as digital timber and hand-welded steel: deep obsidian canvases (`#06090e`), burnished bronze accents (`#c28445`), warm amber lighting (`#f59e0b`), and razor-sharp hairline borders.
2. **Immediate Proof of Dual Competence:** The design proves within 5 seconds that Auraworks understands **both** the physical realities of the workshop floor (board footage, timber grain movement, CNC routing, 50% milestone deposits) and modern edge web engineering (sub-300ms loading, responsive 3D configurators, Stripe/PayFast gateways).
3. **Scarcity & Exclusivity:** The persistent capacity badge (*"Strictly 1–3 Retained Accounts / Month • 1 Slot Available for This Quarter"*) signals that Auraworks is a boutique engineering atelier that selects partners carefully, matching their own workshop's made-to-order ethos.

---

## 2. Bespoke Ecommerce Architecture (Client-Facing Storefront)

### 2.1 Visual Atmosphere & Art Direction
* **Canvas Ambience:** Deep obsidian black with radial amber illumination (`radial-gradient at 50% -10%`) that creates an intimate, spotlighted showroom atmosphere, reminiscent of walking into a dimly lit, high-end furniture gallery at night.
* **Photography Direction:**
  - Macro close-ups of end-grain French oak, hand-planed walnut chamfers, and clean TIG welds on blackened steel.
  - Workshop photography showing real master craftspeople at work with sawdust, CNC gantries, and oil finishing rags.
* **Component Surface Treatment:** Glassmorphic obsidian cards (`rgba(17, 23, 34, 0.75)` with `backdrop-filter: blur(16px)` and subtle `1px solid rgba(255, 255, 255, 0.08)` borders) that give UI elements physical weight and density.

### 2.2 The Interactive Dimension & Finish Configurator
Rather than forcing clients to buy fixed-size SKU products from a generic cart, the storefront features an interactive **Custom Dimension & Spec Quoting Engine**:
* **Parametric Dimensional Controls:**
  - Length Slider: 1,800 mm to 4,200 mm (100 mm increments)
  - Width Slider: 800 mm to 1,500 mm (50 mm increments)
  - Live dynamic calculation of overall surface footprint in square meters ($m^2$).
* **Timber Species Selector:**
  - *French Oak (Prime Grade)*: Base multiplier $1.00\times$
  - *American Black Walnut (Hand-Selected Flitch)*: Multiplier $1.35\times$
  - *Indigenous African Kiaat (Sustainably Harvested)*: Multiplier $1.15\times$
* **Architectural Base Structure:**
  - *Matte Black Spider Steel Frame* (Included base)
  - *Hand-Brushed Patina Brass Trestles* (+R8,500 modifier)
  - *Solid Monolith Timber Slab Legs* (+R6,200 modifier)
* **Real-Time Mathematical Quoting Engine:**
  $$\text{Total Price} = (\text{Area } m^2 \times \text{Base Timber Rate}) \times \text{Species Multiplier} + \text{Base Frame Modifier}$$
* **Structured 50% Production Deposit Capture:**
  - Instantly computes: `Required 50% Production Deposit: R[Amount]`
  - Emphasizes: *"Locks your timber slab allocation and reserves your 4-week workshop build slot upon clearance."*

---

## 3. Custom Operational Tool Architecture (Back-of-House Systems)

### 3.1 The WhatsApp Chaos vs. Auraworks Pipeline Transition
The website articulates the exact workflow shift that saves the founder 15+ administrative hours per week:
* **The Current Breakdown (WhatsApp Trap):**
  - Potential client asks: *"Roughly how much for a 3-meter table?"*
  - Founder spends 45 minutes measuring timber stock and hand-typing a PDF invoice.
  - Client asks for a wood change, disappears for 2 weeks, then demands rush delivery.
  - Materials ordered before money clears; cash flow suffers.
* **The Auraworks Operational Engine:**
  - Client interacts with the live web configurator, selects exact dimensions and species, and reviews the formal quote on-screen.
  - Client pays the 50% commitment deposit directly via instant web gateway (EFT/Card).
  - Webhook triggers automated generation of an internal shop job card with cut dimensions and timber board-foot requirements.

### 3.2 Workshop Pipeline Telemetry (Internal Dashboard Preview)
The landing page showcases a live preview of the client's internal production dashboard:
* **Stage 1 — Inquiry & Dimensional Spec Locked:** Customer parameters validated mathematically against timber availability.
* **Stage 2 — 50% Milestone Deposit Cleared:** Gateway confirms funds; production slot locked on the workshop calendar.
* **Stage 3 — CNC Milling & Rough Dimensioning:** Cut list dispatched to workshop gantry with zero manual re-entry.
* **Stage 4 — Bench Joinery & Hand Finishing:** Milestone notification automatically sent to the buyer (*"Your slab has entered the oil finishing bay"*), eliminating anxious phone calls.
* **Stage 5 — Final QC & White-Glove Dispatch:** Final balance collected upon delivery confirmation.

---

## 4. Full Page Architecture & Section-by-Section Wireframe Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│ 0. SCARCITY TELEMETRY BANNER (1–3 Retained Accounts / Month)           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. GLOBAL NAVIGATION (Logo, Target Sectors, Quoting Sim, Retainers)   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. HERO CHAPTER (High-Impact Headline, Lead Thesis, 4 Key Metric Cards)│
├────────────────────────────────────────────────────────────────────────┤
│ 3. THE 3 ICP SUB-SECTORS (Furniture, Architectural Finishes, Campers)  │
├────────────────────────────────────────────────────────────────────────┤
│ 4. THE LIVE INTERACTIVE QUOTING SIMULATOR (Sliders, Woods, 50% Deposit)│
├────────────────────────────────────────────────────────────────────────┤
│ 5. THE PIPELINE SHIFT (WhatsApp Chaos vs. Structured Machine)          │
├────────────────────────────────────────────────────────────────────────┤
│ 6. TWO-PHASE COMMERCIAL ARCHITECTURE (Phase 1: R45k-R75k, Phase 2: R10k)│
├────────────────────────────────────────────────────────────────────────┤
│ 7. QUALIFICATION MATRIX (Target Qualifiers vs. Immediate Disqualifiers)│
├────────────────────────────────────────────────────────────────────────┤
│ 8. BOARDROOM PAYBACK CALCULATOR (1 Order Pays for the Entire Month)   │
├────────────────────────────────────────────────────────────────────────┤
│ 9. EXECUTIVE INTAKE MODAL / DISCOVERY APPLICATION (60s Qualification) │
├────────────────────────────────────────────────────────────────────────┤
│ 10. REPUTATION FOOTER (Confidential Brief Alignment, POPIA Compliance) │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Section Breakdown Details
1. **Scarcity Banner:** Amber pill with pulsing emerald indicator: *"Strictly 1–3 Retained Accounts / Month • 1 Account Remaining for Q4."*
2. **Hero Chapter:**
   - Eyebrow: *"STRATEGIC TECHNICAL PARTNERSHIP FOR PHYSICAL PRODUCT MANUFACTURERS"*
   - Headline: *"Custom dimension quoting engines & pipelines for high-ticket bespoke manufacturers."*
   - Lead: Explains transition from unstructured WhatsApp chaos to structured 50% deposit capture and workshop tracking.
   - 4-Scorecard Grid: `R15,000+ AOV Threshold`, `50% Automated Web Deposit`, `1–3 Accounts / Mo`, `1 Order Retainer Payback`.
3. **The Three ICP Verticals:** Three deep cards detailing:
   - *Bespoke Furniture* (dining tables, executive boardrooms, custom cabinetry)
   - *High-End Architectural Finishes* (steel & glass partitions, decorative panels, architectural lighting)
   - *Specialized Fabrication* (off-road camper conversions, commercial stainless braai islands, luxury pergolas)
   - Each card details: **Offerings**, **Common Operational Bottleneck**, and **The Auraworks Solution**.
4. **Live Quoting Simulator:** Working interactive UI with slider inputs, species radio cards, live footprint area calculator, total price, and 50% deposit callout.
5. **The Pipeline Comparison:** Side-by-side contrast between current manual email/WhatsApp friction and Auraworks structured web engineering.
6. **Commercial Packages (Two-Phase Framework):**
   - **Phase 1: Custom Storefront & Pipeline Build** (R45,000 – R75,000 once-off)
     * *Value Proposition:* Eliminates lost inquiries, establishes immediate credibility with high-ticket clients, and structures 50% deposit capture directly on web.
   - **Phase 2: Growth & Infrastructure Retainer** (R10,000 – R18,000 / month)
     * *Value Proposition:* Technical SEO & Generative Engine Optimization (GEO) in ChatGPT, Perplexity, and Google AI; 1 closed deal covers the entire monthly retainer.
7. **Qualification Matrix:**
   - *Target Qualifiers (Book Discovery Call):* AOV R15,000+, physical workshop/showroom footprint, manual intake bottleneck, Founder/MD engagement.
   - *Immediate Disqualifiers (Do Not Book):* Pure resellers/dropshippers, mass retail (AOV < R5,000), solo hobbyists from home, equity deal seekers.
8. **Intake Modal:** Multi-field qualification form collecting: Executive Name & Title, Workshop Brand, Business Email, Typical AOV bracket, and Current primary quoting bottleneck.

---

## 5. Design System Tokens & Micro-Interactions

### 5.1 Color Tokens
| Token Name | Hex Code | Purpose |
|---|---|---|
| `--bg-obsidian` | `#06090e` | Root page background |
| `--bg-surface` | `#0c1017` | Structural containers & navigation background |
| `--bg-card` | `#111722` | Card surface |
| `--bg-card-hover` | `#161e2c` | Interactive elevation state |
| `--border-subtle` | `#1e2638` | Default structural border lines |
| `--border-bright` | `#2d3852` | Highlighted borders on hover |
| `--bronze-craft` | `#c28445` | Primary craft accent & gradient start |
| `--amber-light` | `#f59e0b` | Accent highlights & illuminated typography |
| `--amber-glow` | `rgba(245, 158, 11, 0.15)` | Ambient glow filters & drop shadows |
| `--emerald-status`| `#10b981` | Positive indicators, 50% deposit badges, qualified tags |
| `--crimson-alert` | `#f87171` | Bottlenecks, disqualified tags |
| `--text-pearl` | `#f1f5f9` | Primary headings & high-contrast values |
| `--text-muted` | `#94a3b8` | Body copy & explanations |
| `--text-dim` | `#64748b` | Metadata tags, footnote labels |

### 5.2 Typography System
* **Display & Headings:** `Syne` (Google Fonts: 600, 700, 800)
  - Hero H1: `clamp(38px, 5.5vw, 68px)`, line-height: `1.08`, tracking: `-0.02em`
  - Section H2: `clamp(28px, 4vw, 44px)`, line-height: `1.15`, tracking: `-0.01em`
  - Card H3: `22px to 26px`, font-weight: `700`
* **Body & UI Elements:** `Inter` (Google Fonts: 300, 400, 500, 600, 700)
  - Body Lead: `18px`, line-height: `1.6`, font-weight: `400`
  - Standard Body: `14px to 15px`, line-height: `1.55`
  - Data Tags & Badges: `11px to 12px`, letter-spacing: `0.1em`, uppercase, font-weight: `700`

### 5.3 Micro-Interactions & Animation Specs
1. **Dimension Slider Tracking:** Dynamic real-time calculation with sub-millisecond DOM update; slider thumb features subtle glowing amber halo (`box-shadow: 0 0 10px #f59e0b`).
2. **Active Material Swatch Pulse:** Selecting a timber species triggers a smooth border transition (`border-color: #f59e0b; background: rgba(245, 158, 11, 0.1)`) and re-animates the total price odometer.
3. **Pulsing Live Capacity LED:** Continuous keyframe animation (`pulse 2s infinite`) on the top capacity indicator to maintain active operational presence.
4. **Modal Intake Transition:** Full-screen backdrop blur (`backdrop-filter: blur(8px)`) with scaled modal entry (`cubic-bezier(0.16, 1, 0.3, 1)`).

---

## 6. Implementation Readiness Checklist

- [ ] **Geometry & Grid:** Fluid CSS container (`max-width: 1200px`) with CSS grid and flexbox architecture.
- [ ] **Custom Styling:** Pure modern CSS custom properties (`:root`), glassmorphism overlays, and hairline borders without external CSS framework overhead.
- [ ] **Typography Ingestion:** Google Fonts preconnect and import for `Syne` and `Inter`.
- [ ] **Interactive Dimension Engine:** Vanilla JavaScript event listener recalculating area, species multipliers, base modifiers, and 50% deposit in real time.
- [ ] **Responsive Breakpoints:** Fully tested at desktop (1280px+), tablet landscape (1024px), tablet portrait (768px), and mobile (375px–480px).
- [ ] **Qualification Form Logic:** Interactive validation verifying AOV threshold and workshop profile before confirming submission.
