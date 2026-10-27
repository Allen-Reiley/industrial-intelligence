'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
    ArrowRight, 
    Check, 
    CheckCircle2, 
    ShieldCheck, 
    Zap, 
    Globe2, 
    Code2, 
    Cpu, 
    Wrench, 
    Building2, 
    TrendingUp, 
    Layers, 
    Calculator, 
    ChevronDown, 
    Lock, 
    Factory, 
    Truck, 
    Mail, 
    Sparkles,
    FileText,
    ArrowDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import HeroSection from '@/components/hero-sec/hero-section'
import Footer from '@/components/footer/footer'

export default function IndustrialLanding() {
    // Interactive ROI Simulator State
    const [monthlyVisitors, setMonthlyVisitors] = useState<number>(2500)
    const [avgDealSize, setAvgDealSize] = useState<number>(180000)
    const [opportunityRate, setOpportunityRate] = useState<number>(8)
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

    const unmaskedAccountsPerMonth = Math.round(monthlyVisitors * 0.12)
    const qualifiedOpportunitiesPerMonth = Math.max(1, Math.round(unmaskedAccountsPerMonth * (opportunityRate / 100)))
    const monthlyPipelineUnlocked = qualifiedOpportunitiesPerMonth * avgDealSize
    const annualPipelineUnlocked = monthlyPipelineUnlocked * 12

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index)
    }

    const industrialPillars = [
        {
            icon: <Code2 className="size-6 text-primary" />,
            title: "1. High-Performance Web Engineering",
            subtitle: "Custom Next.js 15 Platform",
            desc: "Custom-architected edge web applications engineered for heavy engineering catalogs. Sub-300ms response times, 100/100 Core Web Vitals, interactive CAD asset delivery, and edge security.",
            highlights: [
                "Full Next.js 15 platform build or existing CMS acceleration",
                "Sub-second TTFB across SA and SADC mobile networks",
                "Fast, secure PDF and CAD drawing delivery pipelines"
            ]
        },
        {
            icon: <Globe2 className="size-6 text-primary" />,
            title: "2. Technical SEO & Generative AI (GEO)",
            subtitle: "Google SERP & AI Engine Citations",
            desc: "Dominance on traditional Google search result pages paired with authoritative Schema.org knowledge graphs so ChatGPT, Perplexity, and Gemini cite your products as preferred answers.",
            highlights: [
                "Targeted high-intent B2B keyword architecture",
                "Generative Engine Optimization (GEO) knowledge graphs",
                "Regional hub targeting (Gauteng, Vaal, Mpumalanga, SADC)"
            ]
        },
        {
            icon: <Zap className="size-6 text-primary" />,
            title: "3. aura.js Juristic De-Anonymization",
            subtitle: "Real-Time Pipeline Telemetry",
            desc: "Unmask visiting mining houses, tier-1 contractors, and plant engineers in real time. We deterministically resolve corporate ASNs under strict Chapter 3 POPIA compliance.",
            highlights: [
                "Deterministic juristic company identification",
                "CAD spec-sheet and PDF download intent tracking",
                "Weekly Monday morning executive lead digest delivery"
            ]
        },
        {
            icon: <Wrench className="size-6 text-primary" />,
            title: "4. Custom Industrial Tools & Integrations",
            subtitle: "Tailored to Your Operations",
            desc: "We build whatever tools your business needs—from metallurgical sizing calculators and pump curve selectors to custom client portals and automated CRM/ERP webhook pipelines.",
            highlights: [
                "Bespoke engineering calculators & proposal generators",
                "Customer documentation portals & drawing vaults",
                "Direct sync into HubSpot, Salesforce, Teams, or custom ERPs"
            ]
        }
    ]

    const industrialSectors = [
        {
            title: "Mining & Mineral Processing",
            focus: "Slurry Pumps, Conveyors & Reagents",
            icon: <Factory className="size-5 text-primary" />,
            desc: "Targeting engineering managers, mine procurement officers, and maintenance planners reviewing technical specs before tenders are issued.",
            deliverables: "CAD Discoverability • Mining House Telemetry • Spec Intent Tracking"
        },
        {
            title: "Heavy Engineering & Manufacturing",
            focus: "Hydraulics, Valves & Fabrication",
            icon: <Cpu className="size-5 text-primary" />,
            desc: "Ensuring generative AI engines cite your metallurgical standards and ISO certifications when plant engineers research replacement components.",
            deliverables: "GEO Citation Graphs • SABS/ISO Schemas • Monday Lead Dispatches"
        },
        {
            title: "Bulk Logistics & SADC Corridors",
            focus: "Industrial Freight & Materials Handling",
            icon: <Truck className="size-5 text-primary" />,
            desc: "Capturing cross-border commodity shippers and corporate logistics directors researching freight corridors across South Africa and SADC.",
            deliverables: "Corridor Hreflang SEO • Corporate Shipper Unmasking • Route Tools"
        }
    ]

    const faqs = [
        {
            q: "How does AuraWorks differ from a standard digital marketing agency?",
            a: "Traditional marketing agencies focus on consumer social media, opaque billable hours, and vanity impressions. AuraWorks is an industrial engineering and intelligence partner. We consolidate full-stack web development on Next.js 15, technical B2B search dominance, generative AI (GEO) citability, and proprietary juristic visitor de-anonymization. We deliver verified commercial pipeline directly to your sales desk."
        },
        {
            q: "How does the custom quote and scoping process work?",
            a: "Instead of forcing your enterprise into rigid, generic tiers with arbitrary limitations, we review your current website, equipment catalog, target market corridors, and CRM requirements during an initial discovery call. We then provide a clear, tailored proposal covering deployment milestones and ongoing retainer support engineered specifically for your operations."
        },
        {
            q: "Is aura.js visitor de-anonymization compliant with South African POPIA law?",
            a: "Yes, 100%. AuraWorks operates on a strict 'Juristic-First' resolution architecture under Chapter 3 of the Protection of Personal Information Act (POPIA). We identify corporate registered entities, mining houses, and commercial business networks—never scraping or tracking private personal consumer data without consent. All telemetry is encrypted via AES-256 protocols."
        },
        {
            q: "Can you upgrade or accelerate our existing corporate website without a full rebuild?",
            a: "Yes. While our custom Next.js builds deliver the ultimate edge speed and 100/100 Core Web Vitals, our technical SEO retrofits, GEO schema injection pipelines, and aura.js intelligence engine can be deployed directly onto existing WordPress, Drupal, or custom platforms within 48 business hours."
        },
        {
            q: "What custom industrial tools can AuraWorks build for our company?",
            a: "Our engineering team regularly develops bespoke tools tailored to industrial workflows—including interactive product sizing calculators, digital pump curve selectors, gated CAD drawing vaults, RFQ automation systems, and real-time webhook bridges into HubSpot, Salesforce, Microsoft Teams, or legacy ERP databases."
        }
    ]

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            {/* 1. Hero Section with Platform Video Walkthrough */}
            <HeroSection />

            {/* 2. Industrial Trust & Standards Corridor Bar */}
            <section className="border-y border-border/60 bg-muted/20 py-8">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active Regional Industrial Corridors:</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-foreground/80">
                            <span className="hover:text-primary transition-colors">Gauteng Manufacturing</span>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="hover:text-primary transition-colors">Mpumalanga Mining</span>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="hover:text-primary transition-colors">Vaal Triangle Heavy Industry</span>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="hover:text-primary transition-colors">Durban Logistics Hub</span>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="hover:text-primary transition-colors">SADC Cross-Border</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. The Consolidated 4-Pillar Architecture */}
            <section id="solutions" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        <Sparkles className="size-3.5" />
                        <span>Single Consolidated Industrial Solution</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                        Web Engineering, Search & AI Dominance, and Account Forensics
                    </h2>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                        One cohesive system built for industrial enterprises. We consolidate modern web development, search engine rankings, generative AI citability, and corporate visitor unmasking into a single tailored partnership.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {industrialPillars.map((pillar, idx) => (
                        <div 
                            key={idx}
                            className="relative rounded-3xl border border-border/80 bg-card/60 p-8 sm:p-10 shadow-lg backdrop-blur-sm flex flex-col justify-between hover:border-primary/40 transition-all duration-300"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                                        {pillar.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">{pillar.title}</h3>
                                        <span className="text-xs font-mono text-primary font-semibold">{pillar.subtitle}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {pillar.desc}
                                </p>
                                <div className="pt-2 space-y-2 border-t border-border/50">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground block">
                                        Core Deliverables:
                                    </span>
                                    <ul className="space-y-2">
                                        {pillar.highlights.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-xs text-foreground/90">
                                                <Check className="size-4 text-primary shrink-0 mt-0.5" />
                                                <span className="leading-snug">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                                <span className="text-[11px] font-mono text-muted-foreground">Tailored to your sector</span>
                                <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-primary hover:text-primary">
                                    <Link href="/book-demo">Request Scope <ArrowRight className="ml-1.5 size-3.5" /></Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Central Quote CTA Banner */}
                <div className="mt-12 rounded-3xl border-2 border-primary/20 bg-card/90 p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
                    <div className="max-w-2xl mx-auto space-y-4">
                        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Need Custom Tools, Calculators, or an Existing Site Acceleration?
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Every industrial supplier has unique equipment and procurement cycles. We scope custom web platforms, search architectures, and visitor forensics to your exact business specifications.
                        </p>
                        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                            <Button asChild size="lg" className="rounded-xl px-8 font-bold shadow-xl shadow-primary/20">
                                <Link href="/book-demo">
                                    Book a Quote Consultation <ArrowRight className="ml-2 size-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="rounded-xl px-8 font-semibold">
                                <Link href="/pricing">
                                    View Capabilities & Pricing Scope
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Live Telemetry & Forensics Visual Showcase */}
            <section className="py-24 bg-muted/20 border-y border-border/60">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-5 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                <Cpu className="size-3.5" />
                                <span>Real-Time Corporate Discovery</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                Turn Anonymous Industrial Traffic Into Verified Pipeline
                            </h2>
                            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                                In heavy industry, plant engineers, metallurgists, and procurement specialists research technical specs months before issuing tenders. Over 95% leave websites without filling in contact forms.
                            </p>
                            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                                The <strong className="text-foreground">AuraWorks Intelligence Engine</strong> matches corporate network blocks and ASNs to registered South African enterprises—alerting your commercial team the moment a tier-1 mining house or contractor inspects your drawings.
                            </p>

                            <div className="pt-2 flex items-center gap-6 text-xs text-muted-foreground font-mono">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="size-4 text-primary" />
                                    <span>100% Juristic POPIA</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Lock className="size-4 text-primary" />
                                    <span>AES-256 Encrypted</span>
                                </div>
                            </div>
                        </div>

                        {/* Simulated Live Alert Card */}
                        <div className="lg:col-span-7">
                            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                                <div className="flex items-center justify-between pb-4 border-b border-border/60 text-xs font-mono">
                                    <div className="flex items-center gap-2 text-primary font-bold">
                                        <span className="size-2 rounded-full bg-primary animate-pulse" />
                                        <span>[REAL-TIME ALERT] Juristic Account Unmasked</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground uppercase">(Simulated Format)</span>
                                </div>

                                <div className="mt-6 space-y-4 font-mono text-xs">
                                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <span className="text-muted-foreground">Corporate Entity:</span>
                                        <span className="font-bold text-foreground sm:text-right">Regional Mining & Concentrator Group</span>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <span className="text-muted-foreground">Network / ASN:</span>
                                        <span className="text-foreground sm:text-right">AS37153 • Commercial Mining Telemetry</span>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <span className="text-muted-foreground">Referral Vector:</span>
                                        <span className="text-primary font-semibold sm:text-right">ChatGPT Search &quot;heavy slurry pump suppliers SABS&quot;</span>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <span className="text-muted-foreground">Evaluated Assets:</span>
                                        <span className="text-foreground sm:text-right">/specs/slurry-400-cad.pdf (Downloaded)</span>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-primary">
                                        <span className="font-bold">Dispatch Destination:</span>
                                        <span className="font-bold sm:text-right">Monday Executive Digest + Slack Procurement Alert</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Intent Score: <strong className="text-emerald-500">94/100 (High Procurement Intent)</strong></span>
                                    <Button asChild size="sm" variant="ghost" className="text-xs text-primary font-semibold">
                                        <Link href="/book-demo">Test Your Domain <ArrowRight className="ml-1 size-3" /></Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Industrial Sectors We Serve */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        <Factory className="size-3.5" />
                        <span>Industrial Vertical Focus</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                        Built for South Africa & SADC Heavy Industry
                    </h2>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                        We don&apos;t do consumer lifestyle marketing. We build digital discoverability and sales intelligence for enterprises navigating high-stakes, multi-month procurement cycles.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {industrialSectors.map((sector, idx) => (
                        <div 
                            key={idx}
                            className="rounded-3xl border border-border bg-card/60 p-8 shadow-md flex flex-col justify-between hover:border-primary/40 transition-colors"
                        >
                            <div className="space-y-4">
                                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 w-fit">
                                    {sector.icon}
                                </div>
                                <div>
                                    <span className="text-xs font-mono text-primary font-semibold block">{sector.focus}</span>
                                    <h3 className="text-xl font-bold text-foreground mt-1">{sector.title}</h3>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    {sector.desc}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-border/50 text-[11px] font-mono text-primary font-medium">
                                {sector.deliverables}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. Interactive Pipeline & ROI Simulator */}
            <section className="py-24 bg-card/50 border-y border-border/60">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                            <Calculator className="size-3.5" />
                            <span>Interactive Pipeline Simulator</span>
                        </div>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Simulate the Commercial Value of Unmasking 12% of Corporate Traffic
                        </h2>
                        <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                            Adjust the sliders below to estimate the active pipeline unlocked when anonymous corporate visitors are de-anonymized and delivered directly to your sales engineers.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Sliders */}
                        <div className="lg:col-span-6 space-y-6 bg-muted/20 p-6 sm:p-8 rounded-3xl border border-border/60">
                            <div>
                                <div className="flex justify-between items-center text-sm font-semibold">
                                    <label htmlFor="landing-visitors" className="text-foreground">
                                        Monthly Corporate Website Visitors
                                    </label>
                                    <span className="text-primary font-bold text-base">
                                        {monthlyVisitors.toLocaleString('en-ZA')} visits
                                    </span>
                                </div>
                                <input
                                    id="landing-visitors"
                                    type="range"
                                    min={300}
                                    max={15000}
                                    step={100}
                                    value={monthlyVisitors}
                                    onChange={(e) => setMonthlyVisitors(Number(e.target.value))}
                                    className="mt-3 w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-[11px] text-muted-foreground mt-1 font-mono">
                                    <span>300</span>
                                    <span>7,500</span>
                                    <span>15,000+</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center text-sm font-semibold">
                                    <label htmlFor="landing-deal" className="text-foreground">
                                        Average Purchase Order / Contract Size
                                    </label>
                                    <span className="text-primary font-bold text-base">
                                        R {avgDealSize.toLocaleString('en-ZA')}
                                    </span>
                                </div>
                                <input
                                    id="landing-deal"
                                    type="range"
                                    min={25000}
                                    max={1500000}
                                    step={25000}
                                    value={avgDealSize}
                                    onChange={(e) => setAvgDealSize(Number(e.target.value))}
                                    className="mt-3 w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-[11px] text-muted-foreground mt-1 font-mono">
                                    <span>R25k</span>
                                    <span>R750k</span>
                                    <span>R1.5M+</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center text-sm font-semibold">
                                    <label htmlFor="landing-rate" className="text-foreground">
                                        Qualified Opportunity Conversion Rate
                                    </label>
                                    <span className="text-primary font-bold text-base">
                                        {opportunityRate}%
                                    </span>
                                </div>
                                <input
                                    id="landing-rate"
                                    type="range"
                                    min={2}
                                    max={20}
                                    step={1}
                                    value={opportunityRate}
                                    onChange={(e) => setOpportunityRate(Number(e.target.value))}
                                    className="mt-3 w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-[11px] text-muted-foreground mt-1 font-mono">
                                    <span>2% (Conservative)</span>
                                    <span>8% (Average)</span>
                                    <span>20% (High-Touch)</span>
                                </div>
                            </div>
                        </div>

                        {/* Calculated Output Cards */}
                        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                                    <Building2 className="size-4 text-primary" />
                                    <span>Unmasked Accounts</span>
                                </div>
                                <div className="mt-2 text-3xl font-extrabold text-foreground">
                                    {unmaskedAccountsPerMonth} <span className="text-sm font-normal text-muted-foreground">/ mo</span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Corporate entities unmasked deterministically from visiting network traffic.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                                    <TrendingUp className="size-4 text-primary" />
                                    <span>Monthly Pipeline</span>
                                </div>
                                <div className="mt-2 text-3xl font-extrabold text-foreground">
                                    R {(monthlyPipelineUnlocked / 1000000).toFixed(2)}M
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Commercial opportunity value identified from previously invisible visits.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm sm:col-span-2">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-primary">
                                    <Layers className="size-4 text-primary" />
                                    <span>Projected Annual Pipeline Unlocked</span>
                                </div>
                                <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-primary">
                                    R {(annualPipelineUnlocked / 1000000).toFixed(1)}M
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Cumulative 12-month commercial pipeline unmasked across target industrial sectors.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-muted-foreground">
                        <span>* Based on empirical B2B industrial telemetry. Individual conversion rates vary with sales cycles.</span>
                        <Button asChild size="sm" className="font-semibold">
                            <Link href="/book-demo">Request Custom Pipeline Audit</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* 7. How It Works: 3-Step Modernization Blueprint */}
            <section className="py-24 max-w-6xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        <CheckCircle2 className="size-3.5" />
                        <span>Implementation Protocol</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        The 3-Step Industrial Modernization Blueprint
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        From initial domain audit to live search dominance and real-time lead capture, our engineering team manages the complete rollout.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-3xl border border-border bg-card/60 relative space-y-4">
                        <div className="text-3xl font-mono font-bold text-primary">01</div>
                        <h3 className="text-xl font-bold text-foreground">Discovery & Technical Scoping</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            We audit your current Google search rankings, benchmark your AI citability across ChatGPT and Perplexity, and map your equipment catalog to high-intent buyer keywords.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl border border-border bg-card/60 relative space-y-4">
                        <div className="text-3xl font-mono font-bold text-primary">02</div>
                        <h3 className="text-xl font-bold text-foreground">Platform Engineering & GEO Schemas</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            We deploy your high-speed Next.js edge platform (or accelerate your existing site) and inject authoritative Schema.org knowledge graphs so AI search engines cite your brand.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl border border-border bg-card/60 relative space-y-4">
                        <div className="text-3xl font-mono font-bold text-primary">03</div>
                        <h3 className="text-xl font-bold text-foreground">Live Telemetry & Lead Delivery</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            We activate aura.js juristic unmasking, delivering enriched executive lead digests to your inbox every Monday and streaming live webhooks directly to your sales team.
                        </p>
                    </div>
                </div>
            </section>

            {/* 8. FAQs Section */}
            <section className="py-24 bg-muted/20 border-y border-border/60">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center space-y-3">
                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">Frequently Asked Questions</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Commercial & Technical Inquiries
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                            Direct answers regarding our custom industrial scopes, POPIA compliance, and technical onboarding.
                        </p>
                    </div>

                    <div className="mt-12 space-y-4">
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaqIndex === idx

                            return (
                                <div
                                    key={idx}
                                    className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200">
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full flex items-center justify-between p-6 text-left font-semibold text-foreground hover:bg-muted/20 transition-colors focus:outline-none">
                                        <span className="text-sm sm:text-base pr-4">
                                            {faq.q}
                                        </span>
                                        <ChevronDown
                                            className={`size-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                                                isOpen ? 'transform rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* 9. Final High-Impact Conversion CTA */}
            <section className="py-24 max-w-6xl mx-auto px-6">
                <div className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                            Ready to Dominate Search, AI & Pipeline in Your Industrial Sector?
                        </h2>
                        <p className="text-base sm:text-lg text-primary-foreground/90 leading-relaxed">
                            Schedule a 30-minute discovery consultation. We will evaluate your search rankings, benchmark your AI citability, and deliver a custom quote tailored to your business operations.
                        </p>
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                asChild
                                size="lg"
                                variant="secondary"
                                className="w-full sm:w-auto font-bold px-8 py-6 text-base shadow-lg">
                                <Link href="/book-demo">
                                    Book a Quote Consultation
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto font-semibold px-8 py-6 text-base bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
                                <Link href="/book-call">
                                    Schedule Strategy Call
                                </Link>
                            </Button>
                        </div>
                        <div className="pt-4 text-xs text-primary-foreground/70 font-mono">
                            Direct Support & Questions: <a href="mailto:contact@auraworks.co.za" className="underline hover:text-white">contact@auraworks.co.za</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    )
}
