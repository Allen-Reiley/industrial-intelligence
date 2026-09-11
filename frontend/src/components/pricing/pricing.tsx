'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
    Check, 
    X, 
    ArrowRight, 
    Calculator, 
    ShieldCheck, 
    Zap, 
    Building2, 
    TrendingUp, 
    Layers, 
    Cpu, 
    Network, 
    ChevronDown, 
    HelpCircle,
    CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroHeader } from '../header/header'
import Footer from '../footer/footer'
import { TextEffect } from '../ui/text-effect'

interface PricingTier {
    id: string
    name: string
    badge?: string
    popular?: boolean
    monthlyPrice: number
    annualPrice: number
    description: string
    idealFor: string
    highlights: string[]
    ctaText: string
    ctaHref: string
}

const pricingTiers: PricingTier[] = [
    {
        id: 'growth-foundation',
        name: 'Growth Foundation',
        monthlyPrice: 10000,
        annualPrice: 100000,
        description: 'Establish high-velocity organic search visibility, sub-second edge performance, and foundational visitor de-anonymization for single-vertical industrial suppliers.',
        idealFor: 'Mid-sized manufacturers, regional engineering service providers, and specialized distributors looking to outrank legacy competitors in local South African hubs.',
        highlights: [
            'Next.js 15 edge web platform or existing site acceleration',
            'Sub-300ms Time-to-First-Byte (TTFB) and 100/100 Core Web Vitals guarantee',
            'Targeted B2B SEO architecture covering up to 45 high-intent industrial keywords',
            'aura.js juristic visitor identification (up to 500 corporate accounts unmasked/mo)',
            'Weekly Monday morning executive pipeline digest delivered via email',
            'Google Search Console indexing and technical crawl health monitoring',
            'Strict POPIA Chapter 3 juristic-first entity resolution indemnity',
            'Quarterly strategic keyword and competitor discoverability audit'
        ],
        ctaText: 'Deploy Growth Foundation',
        ctaHref: '/book-demo?plan=growth-foundation'
    },
    {
        id: 'category-leader',
        name: 'Industrial Category Leader',
        badge: 'Most Popular for Heavy Industry',
        popular: true,
        monthlyPrice: 18500,
        annualPrice: 185000,
        description: 'Complete organic dominance across traditional Google SERPs and modern generative AI engines (ChatGPT, Perplexity, Gemini) paired with uncapped corporate visitor forensics.',
        idealFor: 'Established mining equipment OEMs, pump & valve manufacturers, commercial logistics operators, and fabrication specialists commanding national market share.',
        highlights: [
            'Next.js enterprise architecture with dedicated dynamic edge routing',
            'Generative Engine Optimization (GEO) knowledge graph and entity schema deployment',
            'Active citation engineering for ChatGPT Search, Perplexity AI, and Google AI Overviews',
            'Uncapped aura.js juristic corporate identification with forensic session playback',
            'Targeted B2B SEO architecture covering up to 120 high-intent technical keywords',
            'Real-time instant webhook push routing into Slack, Microsoft Teams, HubSpot, or Salesforce',
            'Technical spec-sheet, CAD blueprint, and PDF download intent telemetry',
            'Bi-weekly technical SEO sprint reviews with dedicated senior solutions engineer',
            'Priority 4-hour SLA on technical schema updates and catalog expansions'
        ],
        ctaText: 'Scale Category Dominance',
        ctaHref: '/book-demo?plan=category-leader'
    },
    {
        id: 'enterprise-corridor',
        name: 'Enterprise SADC Corridor',
        badge: 'Multi-Region & Cross-Border',
        monthlyPrice: 32000,
        annualPrice: 320000,
        description: 'Unrestricted regional discoverability architecture spanning South Africa and key SADC industrial corridors (Zambia, DRC, Mozambique, Zimbabwe, Namibia) with custom data lake integration.',
        idealFor: 'JSE-listed industrial holdings, multinational engineering groups, bulk commodity logistics, and continental equipment distributors with complex procurement cycles.',
        highlights: [
            'Multi-territory internationalized SEO and hreflang architecture for cross-border SADC hubs',
            'Localized digital landing corridors for Copperbelt, Katanga, Maputo, and Walvis Bay',
            'High-authority SA trade media syndication via Creamer Media, Bizcommunity & MechChem Africa',
            'Uncapped enterprise de-anonymization with multi-tenant CRM and ERP data pipelines',
            'Dedicated real-time streaming into custom data lakes (Snowflake, BigQuery, AWS S3)',
            'Unlimited high-intent keywords across English, French, and Portuguese industrial catalogs',
            'Quarterly board-ready competitive intelligence and procurement share-of-voice reports',
            '24/7 dedicated solutions architect with 1-hour critical response SLA'
        ],
        ctaText: 'Consult Enterprise Solutions',
        ctaHref: '/book-demo?plan=enterprise-corridor'
    }
]

interface MatrixRow {
    feature: string
    growth: string | boolean
    leader: string | boolean
    enterprise: string | boolean
    tooltip?: string
}

interface MatrixCategory {
    category: string
    rows: MatrixRow[]
}

const comparisonMatrix: MatrixCategory[] = [
    {
        category: 'Technical Architecture & Performance SLA',
        rows: [
            {
                feature: 'Modern Web Framework & Hosting',
                growth: 'Next.js 15 Edge Platform',
                leader: 'Next.js 15 Edge Platform',
                enterprise: 'Multi-Region Edge Cluster'
            },
            {
                feature: 'Time-to-First-Byte (TTFB) Guarantee',
                growth: '< 300ms SLA',
                leader: '< 200ms SLA',
                enterprise: '< 150ms Global SLA'
            },
            {
                feature: 'Google Core Web Vitals SLA',
                growth: '100% Passing Score',
                leader: '100% Passing Score',
                enterprise: '100% Passing Score'
            },
            {
                feature: 'Platform Migration Timeline',
                growth: '21 Business Days',
                leader: '14 Business Days',
                enterprise: '10 Business Days (Dedicated Sprint)'
            },
            {
                feature: 'Existing Website Acceleration Bridge',
                growth: true,
                leader: true,
                enterprise: true
            },
            {
                feature: 'Cloudflare Enterprise WAF & DDoS Shield',
                growth: true,
                leader: true,
                enterprise: true
            }
        ]
    },
    {
        category: 'Search Engine & Generative AI (GEO) Dominance',
        rows: [
            {
                feature: 'High-Intent B2B Tracked Keywords',
                growth: '45 Keywords',
                leader: '120 Keywords',
                enterprise: 'Unlimited Cross-Border'
            },
            {
                feature: 'Generative Engine Optimization (GEO)',
                growth: 'Foundational Schemas',
                leader: 'Active Entity Knowledge Graph',
                enterprise: 'Full Multi-Engine Citability Matrix'
            },
            {
                feature: 'AI Engine Citability (ChatGPT, Perplexity, Gemini)',
                growth: 'Quarterly Audit',
                leader: 'Bi-Weekly Citation Tuning',
                enterprise: 'Continuous Weekly AI Calibration'
            },
            {
                feature: 'Technical Spec-Sheet & CAD PDF SEO',
                growth: 'Up to 25 Documents',
                leader: 'Up to 150 Documents',
                enterprise: 'Unlimited Engineering Documents'
            },
            {
                feature: 'Local Gauteng Hub Authority (JHB, East Rand, Vaal)',
                growth: true,
                leader: true,
                enterprise: true
            },
            {
                feature: 'Cross-Border SADC Internationalized Targeting',
                growth: false,
                leader: 'Optional Add-on',
                enterprise: true
            },
            {
                feature: 'Trade Media Syndication (Creamer Media / Bizcommunity)',
                growth: false,
                leader: 'Semi-Annual Placement',
                enterprise: 'Quarterly Sponsored Features'
            }
        ]
    },
    {
        category: 'aura.js Visitor Intelligence Engine & Forensics',
        rows: [
            {
                feature: 'Monthly Corporate Identification Volume',
                growth: '500 Accounts / mo',
                leader: 'Uncapped Enterprise',
                enterprise: 'Uncapped Enterprise Multi-Tenant'
            },
            {
                feature: 'Juristic Entity Resolution Accuracy',
                growth: 'Deterministic ISP Filtering',
                leader: 'Multi-Factor Canvas & ASN',
                enterprise: 'Enterprise Carrier-Grade Resolution'
            },
            {
                feature: 'POPIA Juristic Indemnity Guarantee',
                growth: true,
                leader: true,
                enterprise: true
            },
            {
                feature: 'Real-Time Webhook Routing (Slack / Teams)',
                growth: false,
                leader: true,
                enterprise: true
            },
            {
                feature: 'Direct CRM Pipeline Sync (HubSpot / Salesforce)',
                growth: false,
                leader: true,
                enterprise: true
            },
            {
                feature: 'Executive Monday Morning Lead Digest',
                growth: true,
                leader: true,
                enterprise: true
            },
            {
                feature: 'Custom Enterprise Data Lake Streaming',
                growth: false,
                leader: false,
                enterprise: true
            }
        ]
    },
    {
        category: 'Governance, Strategy & Engineering Support',
        rows: [
            {
                feature: 'Dedicated Senior Solutions Architect',
                growth: 'Shared Support Desk',
                leader: 'Named Principal Engineer',
                enterprise: 'Dedicated Strategic Lead + Slack Channel'
            },
            {
                feature: 'Strategic Review & Advisory Rhythm',
                growth: 'Quarterly Review',
                leader: 'Bi-Weekly Sprint',
                enterprise: 'Weekly Strategic Sync'
            },
            {
                feature: 'Technical Response Time SLA',
                growth: '24 Hours',
                leader: '4 Hours',
                enterprise: '1 Hour Critical SLA'
            }
        ]
    }
]

const commercialFaqs = [
    {
        question: 'What is the contractual commitment structure and cancelation policy?',
        answer: 'All AuraWorks enterprise engagements are structured on either a flexible month-to-month retainer or an annual partnership agreement with an upfront 15% rate advantage. Unlike traditional digital marketing agencies that lock clients into multi-year contracts with opaque billable hours, our retainers require a standard 60-day written notice after the initial 90-day technical sprint. The initial 90-day sprint ensures sufficient runway to deploy our Next.js infrastructure, crawl and index proprietary technical schemas, establish generative AI citations, and calibrate the aura.js juristic telemetry engine for your target vertical.'
    },
    {
        question: 'How does AuraWorks indemnify and protect our company under POPIA regulations?',
        answer: 'AuraWorks operates on a strict juristic-first entity resolution architecture. Under Chapter 3 of the Protection of Personal Information Act (POPIA), juristic persons (such as registered private companies, close corporations, state-owned enterprises, and mining houses) are treated separately from natural personal data. aura.js deterministically resolves autonomous system numbers (ASNs), corporate IP telemetry, and commercial network blocks back to corporate entities—never scraping, tracking, or harvesting private natural individual identities without consent. All telemetry is encrypted with server-side AES-256 protocols, and our enterprise contracts include explicit POPIA compliance indemnification clauses.'
    },
    {
        question: 'What is the onboarding timeline and SLA for launching our Next.js platform?',
        answer: 'For clients commissioning a full Next.js web platform, standard deployment requires between 14 and 21 business days from contract execution. During this period, our engineering team extracts and migrates existing content, refactors outdated schemas into high-fidelity JSON-LD knowledge graphs, optimizes technical spec-sheets and CAD assets for sub-second edge delivery, and configures automated 301 redirects to eliminate broken legacy URLs. For clients retaining their existing corporate web infrastructure, our aura.js visitor intelligence snippet and edge proxy can be integrated via Google Tag Manager or direct header injection within 48 business hours.'
    },
    {
        question: 'How does Generative Engine Optimization (GEO) differ from traditional monthly SEO deliverables?',
        answer: 'Traditional SEO focuses strictly on ranking keyword strings on blue-link Google search result pages. While AuraWorks maintains best-in-class technical SEO for search engines, modern procurement engineers and corporate supply chain executives increasingly prompt generative models like ChatGPT Search, Perplexity AI, and Google AI Overviews to evaluate industrial vendors. Generative Engine Optimization (GEO) structures your technical specifications, ISO certifications, and metallurgical ratings using authoritative entity relationships and semantic knowledge graphs. This guarantees that when an AI engine synthesizes recommendations for complex queries—such as "heavy slurry pump manufacturers in Gauteng with SABS compliance"—your brand is cited directly as the trusted primary source.'
    },
    {
        question: 'We already run an established website. Can we partner without doing a full rebuild?',
        answer: 'Yes. While our dedicated Next.js web architecture provides the fastest route to 100/100 Core Web Vitals and edge latency under 200ms, our Industrial Category Leader and Enterprise retainers can be deployed on top of existing corporate WordPress, Drupal, or custom frameworks. In this upgrade configuration, we install a lightweight edge acceleration proxy, deploy our schema injection pipelines, and embed the aura.js tracking script directly. Our solutions engineering team conducts a complimentary technical audit prior to onboarding to verify whether your existing CMS can support the required schema depth.'
    },
    {
        question: 'Which CRM, email, and messaging platforms support real-time lead dispatches?',
        answer: 'The AuraWorks Intelligence Engine integrates out of the box with major enterprise sales workflows. Real-time de-anonymization alerts can be pushed instantly into dedicated internal Slack or Microsoft Teams procurement channels, allowing sales engineers to act within minutes of a tier-1 mining house reviewing equipment specs. Furthermore, aura.js supports bidirectional webhooks compatible with HubSpot, Salesforce, Zoho CRM, and Microsoft Dynamics 365. For custom industrial ERPs and legacy SQL databases, we provide secure REST API endpoints and automated SFTP/CSV pipeline exports.'
    }
]

export default function Pricing() {
    const [isAnnual, setIsAnnual] = useState(false)
    const [monthlyVisitors, setMonthlyVisitors] = useState<number>(2500)
    const [avgDealSize, setAvgDealSize] = useState<number>(180000)
    const [opportunityRate, setOpportunityRate] = useState<number>(8)
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

    // ROI Calculations based on empirical B2B industrial telemetry
    // 12% average juristic identification rate in industrial verticals
    const unmaskedAccountsPerMonth = Math.round(monthlyVisitors * 0.12)
    // Percentage of unmasked accounts that enter active sales pipeline
    const qualifiedOpportunitiesPerMonth = Math.max(1, Math.round(unmaskedAccountsPerMonth * (opportunityRate / 100)))
    // Total monthly pipeline unlocked
    const monthlyPipelineUnlocked = qualifiedOpportunitiesPerMonth * avgDealSize
    // Annual pipeline unlocked
    const annualPipelineUnlocked = monthlyPipelineUnlocked * 12
    // Assuming conservative 15% win rate on qualified sales pipeline
    const projectedAnnualNewRevenue = Math.round(annualPipelineUnlocked * 0.15)
    // Annual cost of Category Leader tier
    const categoryLeaderAnnualCost = 18500 * 12
    // Calculated ROI multiple
    const calculatedRoiMultiple = (projectedAnnualNewRevenue / categoryLeaderAnnualCost).toFixed(1)

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index)
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <HeroHeader />

            <main className="flex-1 pt-28 pb-20 md:pt-40 md:pb-28">
                {/* Background Ambient Glow */}
                <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 opacity-25 [background:radial-gradient(50%_50%_at_50%_50%,var(--color-primary)_0%,transparent_100%)] blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Block */}
                    <div className="max-w-3xl mx-auto text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                            <ShieldCheck className="size-3.5" />
                            <span>Predictable Industrial Pipeline Infrastructure</span>
                        </div>
                        <TextEffect
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            as="h1"
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                            B2B SEO, Generative AI & Lead Intelligence Retainers
                        </TextEffect>
                        <TextEffect
                            preset="fade-in-blur"
                            per="line"
                            delay={0.4}
                            speedSegment={0.3}
                            as="p"
                            className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                            Stop paying legacy digital agencies for abstract billable hours and vanity impressions. AuraWorks delivers high-performance Next.js edge platforms, top-tier Google rankings, generative AI citability, and proprietary juristic visitor de-anonymization engineered exclusively for South African and SADC heavy industry.
                        </TextEffect>

                        {/* Billing Switcher */}
                        <div className="pt-6 flex items-center justify-center gap-3">
                            <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                                Monthly Retainer
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsAnnual(!isAnnual)}
                                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                    isAnnual ? 'bg-primary' : 'bg-muted'
                                }`}
                                role="switch"
                                aria-checked={isAnnual}>
                                <span
                                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                                        isAnnual ? 'translate-x-7' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                            <span className={`text-sm font-medium inline-flex items-center gap-1.5 ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                                Annual Partnership
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-primary/15 text-primary">
                                    Save ~17% (2 Months Free)
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Tier Cards Grid */}
                    <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                        {pricingTiers.map((tier) => {
                            const currentPrice = isAnnual 
                                ? Math.round(tier.annualPrice / 12) 
                                : tier.monthlyPrice

                            return (
                                <div
                                    key={tier.id}
                                    className={`relative flex flex-col rounded-3xl p-8 transition-all duration-200 ${
                                        tier.popular
                                            ? 'bg-card border-2 border-primary shadow-2xl shadow-primary/10 z-10'
                                            : 'bg-card/70 border border-border shadow-md hover:border-border/80'
                                    }`}>
                                    {tier.badge && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-md">
                                            {tier.badge}
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                                {tier.name}
                                            </h2>
                                        </div>

                                        <p className="mt-3 text-xs md:text-sm text-muted-foreground leading-relaxed min-h-[48px]">
                                            {tier.description}
                                        </p>

                                        {/* Price block */}
                                        <div className="mt-6 pt-6 border-t border-border/60">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-semibold text-muted-foreground">R</span>
                                                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                                                    {currentPrice.toLocaleString('en-ZA')}
                                                </span>
                                                <span className="text-sm font-normal text-muted-foreground">
                                                    / month
                                                </span>
                                            </div>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {isAnnual 
                                                    ? `Billed annually at R${tier.annualPrice.toLocaleString('en-ZA')} ex VAT`
                                                    : 'Flat-rate monthly retainer ex VAT, 60-day terms'}
                                            </div>
                                        </div>

                                        {/* Target Audience Profile */}
                                        <div className="mt-5 p-3.5 rounded-xl bg-muted/40 border border-border/40 text-xs text-muted-foreground leading-relaxed">
                                            <span className="font-semibold text-foreground">Ideal fit: </span>
                                            {tier.idealFor}
                                        </div>

                                        {/* Highlights list */}
                                        <div className="mt-6 space-y-3">
                                            <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
                                                Core Infrastructure Deliverables:
                                            </div>
                                            <ul className="space-y-3">
                                                {tier.highlights.map((highlight, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                                                        <Check className="size-4 text-primary shrink-0 mt-0.5" />
                                                        <span className="text-foreground/90 font-medium leading-snug">
                                                            {highlight}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <div className="mt-8 pt-6 border-t border-border/60">
                                        <Button
                                            asChild
                                            size="lg"
                                            variant={tier.popular ? 'default' : 'outline'}
                                            className="w-full font-semibold text-sm sm:text-base py-6 shadow-sm">
                                            <Link href={tier.ctaHref}>
                                                {tier.ctaText}
                                                <ArrowRight className="ml-2 size-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Section: Interactive ROI Calculator */}
                    <section className="mt-28 p-8 md:p-12 rounded-3xl bg-card border border-border shadow-xl relative overflow-hidden">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                <Calculator className="size-3.5" />
                                <span>Interactive Pipeline Simulator</span>
                            </div>
                            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                Calculate the Value of Unmasking 12% of Corporate Traffic
                            </h2>
                            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                                In heavy industry and B2B procurement, 98% of visiting corporate engineers, procurement specialists, and plant managers abandon websites without filling out contact forms. Adjust the sliders below to calculate the pipeline unlocked by our proprietary juristic de-anonymization engine.
                            </p>
                        </div>

                        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            {/* Controls Column */}
                            <div className="lg:col-span-6 space-y-6 bg-muted/20 p-6 rounded-2xl border border-border/50">
                                <div>
                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <label htmlFor="visitors-input" className="text-foreground">
                                            Monthly Corporate Website Visitors
                                        </label>
                                        <span className="text-primary font-bold text-base">
                                            {monthlyVisitors.toLocaleString('en-ZA')} visits
                                        </span>
                                    </div>
                                    <input
                                        id="visitors-input"
                                        type="range"
                                        min={300}
                                        max={15000}
                                        step={100}
                                        value={monthlyVisitors}
                                        onChange={(e) => setMonthlyVisitors(Number(e.target.value))}
                                        className="mt-3 w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                                        <span>300</span>
                                        <span>7,500</span>
                                        <span>15,000+</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <label htmlFor="deal-input" className="text-foreground">
                                            Average B2B Purchase Order / Contract Size
                                        </label>
                                        <span className="text-primary font-bold text-base">
                                            R {avgDealSize.toLocaleString('en-ZA')}
                                        </span>
                                    </div>
                                    <input
                                        id="deal-input"
                                        type="range"
                                        min={25000}
                                        max={1500000}
                                        step={25000}
                                        value={avgDealSize}
                                        onChange={(e) => setAvgDealSize(Number(e.target.value))}
                                        className="mt-3 w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                                        <span>R25k</span>
                                        <span>R750k</span>
                                        <span>R1.5M+</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <label htmlFor="conversion-input" className="text-foreground">
                                            Sales Qualified Opportunity Conversion Rate
                                        </label>
                                        <span className="text-primary font-bold text-base">
                                            {opportunityRate}%
                                        </span>
                                    </div>
                                    <input
                                        id="conversion-input"
                                        type="range"
                                        min={2}
                                        max={20}
                                        step={1}
                                        value={opportunityRate}
                                        onChange={(e) => setOpportunityRate(Number(e.target.value))}
                                        className="mt-3 w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                                        <span>2% (Conservative)</span>
                                        <span>10% (Average)</span>
                                        <span>20% (High-Touch)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic ROI Metrics Output */}
                            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                                        <Building2 className="size-4 text-primary" />
                                        <span>De-Anonymized Accounts</span>
                                    </div>
                                    <div className="mt-2 text-3xl font-extrabold text-foreground">
                                        {unmaskedAccountsPerMonth} <span className="text-sm font-normal text-muted-foreground">/ month</span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Juristic enterprise entities unmasked deterministically from anonymous IP traffic.
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                                        <TrendingUp className="size-4 text-primary" />
                                        <span>Monthly Pipeline Unlocked</span>
                                    </div>
                                    <div className="mt-2 text-3xl font-extrabold text-foreground">
                                        R {(monthlyPipelineUnlocked / 1000000).toFixed(2)}M
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Active commercial opportunity value generated from previously invisible visitors.
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                                        <Layers className="size-4 text-primary" />
                                        <span>Annual Gross Pipeline</span>
                                    </div>
                                    <div className="mt-2 text-3xl font-extrabold text-foreground">
                                        R {(annualPipelineUnlocked / 1000000).toFixed(1)}M
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Cumulative 12-month commercial pipeline unmasked across target industrial sectors.
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-primary">
                                        <Zap className="size-4 text-primary" />
                                        <span>Projected ROI Multiple</span>
                                    </div>
                                    <div className="mt-2 text-3xl font-extrabold text-primary">
                                        {calculatedRoiMultiple}x
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Estimated annual pipeline ROI multiple measured against our Category Leader retainer.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/60 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <span>
                                * Based on empirical telemetry across South African manufacturing, logistics, and mining equipment websites. Individual contract conversion rates vary by sales cycle length.
                            </span>
                            <Button asChild size="sm" className="shrink-0 font-medium">
                                <Link href="/book-demo">Request Custom Pipeline Audit</Link>
                            </Button>
                        </div>
                    </section>

                    {/* Section: Comprehensive Feature Comparison Matrix */}
                    <section className="mt-28">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                <Network className="size-3.5" />
                                <span>Detailed Technical Specifications</span>
                            </div>
                            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                Full Retainer Infrastructure Comparison Matrix
                            </h2>
                            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                                Review detailed technical specifications, SLAs, Core Web Vitals commitments, and integration scopes across each enterprise partnership level.
                            </p>
                        </div>

                        <div className="mt-10 overflow-x-auto rounded-2xl border border-border bg-card shadow-lg">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        <th className="py-4 px-6 text-sm font-bold text-foreground w-2/5">
                                            Capability & Deliverable
                                        </th>
                                        <th className="py-4 px-6 text-sm font-bold text-foreground w-1/5 text-center">
                                            Growth Foundation
                                            <div className="text-xs font-normal text-muted-foreground">R10,000/mo</div>
                                        </th>
                                        <th className="py-4 px-6 text-sm font-bold text-primary w-1/5 text-center bg-primary/5">
                                            Category Leader
                                            <div className="text-xs font-normal text-primary/80">R18,500/mo</div>
                                        </th>
                                        <th className="py-4 px-6 text-sm font-bold text-foreground w-1/5 text-center">
                                            Enterprise Corridor
                                            <div className="text-xs font-normal text-muted-foreground">R32,000/mo</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonMatrix.map((cat, catIdx) => (
                                        <React.Fragment key={catIdx}>
                                            <tr className="bg-muted/50 border-t border-b border-border">
                                                <td
                                                    colSpan={4}
                                                    className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-foreground">
                                                    {cat.category}
                                                </td>
                                            </tr>
                                            {cat.rows.map((row, rowIdx) => (
                                                <tr
                                                    key={rowIdx}
                                                    className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                                                    <td className="py-3.5 px-6 text-xs sm:text-sm font-medium text-foreground/90">
                                                        {row.feature}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-xs sm:text-sm text-center text-muted-foreground">
                                                        {typeof row.growth === 'boolean' ? (
                                                            row.growth ? (
                                                                <Check className="size-4 text-primary mx-auto" />
                                                            ) : (
                                                                <X className="size-4 text-muted-foreground/40 mx-auto" />
                                                            )
                                                        ) : (
                                                            row.growth
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-xs sm:text-sm text-center font-medium text-foreground bg-primary/5">
                                                        {typeof row.leader === 'boolean' ? (
                                                            row.leader ? (
                                                                <Check className="size-4 text-primary mx-auto" />
                                                            ) : (
                                                                <X className="size-4 text-muted-foreground/40 mx-auto" />
                                                            )
                                                        ) : (
                                                            row.leader
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-xs sm:text-sm text-center text-foreground font-medium">
                                                        {typeof row.enterprise === 'boolean' ? (
                                                            row.enterprise ? (
                                                                <Check className="size-4 text-primary mx-auto" />
                                                            ) : (
                                                                <X className="size-4 text-muted-foreground/40 mx-auto" />
                                                            )
                                                        ) : (
                                                            row.enterprise
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Section: Commercial FAQs */}
                    <section className="mt-28 max-w-4xl mx-auto">
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                <HelpCircle className="size-3.5" />
                                <span>Commercial & Technical FAQs</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                Frequently Asked Commercial & Governance Questions
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                                Clear, binding answers on onboarding timelines, POPIA indemnification, contract structures, and our Next.js technology stack.
                            </p>
                        </div>

                        <div className="mt-12 space-y-4">
                            {commercialFaqs.map((faq, idx) => {
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
                                                {faq.question}
                                            </span>
                                            <ChevronDown
                                                className={`size-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                                                    isOpen ? 'transform rotate-180' : ''
                                                }`}
                                            />
                                        </button>
                                        {isOpen && (
                                            <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {/* Final Bottom CTA Banner */}
                    <section className="mt-28 mb-12 p-8 sm:p-12 md:p-16 rounded-3xl bg-primary text-primary-foreground text-center relative overflow-hidden shadow-2xl">
                        <div className="max-w-2xl mx-auto space-y-6">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                                Ready to Dominate Search & AI in Your Industrial Category?
                            </h2>
                            <p className="text-base sm:text-lg text-primary-foreground/90 leading-relaxed">
                                Schedule a 30-minute technical architecture review. We will audit your current Google SERP rankings, benchmark your generative AI citation probability across ChatGPT and Perplexity, and present an unmasked telemetry demonstration.
                            </p>
                            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    asChild
                                    size="lg"
                                    variant="secondary"
                                    className="w-full sm:w-auto font-semibold px-8 py-6 text-base shadow-lg">
                                    <Link href="/book-demo">
                                        Request Architecture Review & Proposal
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto font-semibold px-8 py-6 text-base bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
                                    <Link href="/solution">
                                        Explore Solution Architecture
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}