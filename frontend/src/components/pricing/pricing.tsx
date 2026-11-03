'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
    Check, 
    ArrowRight, 
    Calculator, 
    ShieldCheck, 
    Zap, 
    Building2, 
    TrendingUp, 
    Layers, 
    ChevronDown, 
    HelpCircle,
    CheckCircle2,
    Code2,
    Globe2,
    Sparkles,
    Cpu,
    Wrench
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroHeader } from '../header/header'
import Footer from '../footer/footer'
import { TextEffect } from '../ui/text-effect'

interface ScopeRow {
    feature: string
    scope: string
    enterpriseAddon?: string
}

interface ScopeCategory {
    category: string
    rows: ScopeRow[]
}

const customScopeMatrix: ScopeCategory[] = [
    {
        category: '1. High-Performance Web Development & Platform Architecture',
        rows: [
            {
                feature: 'Modern Framework Architecture',
                scope: 'Custom Next.js 15 edge web application or existing platform acceleration',
                enterpriseAddon: 'Multi-region edge cluster & custom subdomain routing'
            },
            {
                feature: 'Performance & Speed Guarantee',
                scope: 'Sub-300ms Time-to-First-Byte (TTFB) and 100/100 Core Web Vitals targets',
                enterpriseAddon: 'Dedicated CDN optimization & asset streaming'
            },
            {
                feature: 'Industrial Document & CAD Asset Delivery',
                scope: 'Fast, secure viewing and download tracking for technical spec-sheets, drawings & PDFs',
                enterpriseAddon: 'Gated drawing vaults & role-based procurement downloads'
            },
            {
                feature: 'Security & Edge Protection',
                scope: 'Cloudflare enterprise WAF, DDoS protection, and SSL encryption',
                enterpriseAddon: 'Custom IP access controls & network isolation'
            }
        ]
    },
    {
        category: '2. Technical SEO & Generative Engine Optimization (GEO)',
        rows: [
            {
                feature: 'B2B Search Keyword Dominance',
                scope: 'Targeted high-intent keyword mapping tailored to your equipment, materials & services',
                enterpriseAddon: 'Unlimited pan-African & cross-border SADC keyword indexing'
            },
            {
                feature: 'Generative Engine Optimization (GEO)',
                scope: 'Authoritative schema knowledge graphs built for ChatGPT Search, Perplexity AI & Google AI',
                enterpriseAddon: 'Continuous citation tuning and multi-model brand verification'
            },
            {
                feature: 'Local & Regional SADC Targeting',
                scope: 'Dominance across primary industrial hubs (Gauteng, Mpumalanga, Vaal, Durban Corridor)',
                enterpriseAddon: 'Multi-territory hreflang architecture (Copperbelt, Mozambique, Namibia)'
            },
            {
                feature: 'Search Console & Crawl Health',
                scope: 'Proactive indexation management, sitemap orchestration, and broken link mitigation',
                enterpriseAddon: 'Automated search index anomaly alerting'
            }
        ]
    },
    {
        category: '3. aura.js Juristic De-Anonymization & Visitor Forensics',
        rows: [
            {
                feature: 'Corporate Account De-Anonymization',
                scope: 'Deterministic juristic identification of companies, mining houses & contractors visiting your site',
                enterpriseAddon: 'Uncapped volume with multi-subsidiary identification'
            },
            {
                feature: 'POPIA Compliance Guarantee',
                scope: 'Strict Chapter 3 juristic-only ASN and network resolution without consumer personal tracking',
                enterpriseAddon: 'Full contractual compliance indemnification documentation'
            },
            {
                feature: 'Weekly Executive Lead Digest',
                scope: 'Curated Monday morning PDF/email report summarizing high-intent accounts and visited specs',
                enterpriseAddon: 'Automated real-time instant alerts via Slack, Teams, or Webhooks'
            },
            {
                feature: 'CRM & Pipeline Integration',
                scope: 'Direct export pipelines compatible with HubSpot, Salesforce, Zoho, or custom ERPs',
                enterpriseAddon: 'Bidirectional sync & custom REST API data feeds'
            }
        ]
    },
    {
        category: '4. Bespoke Industrial Tools & Custom Solutions',
        rows: [
            {
                feature: 'Custom B2B Calculators & Estimators',
                scope: 'Interactive sizing, load calculation, or tonnage estimators built to engineering specifications',
                enterpriseAddon: 'Complex multi-variable engineering logic & proposal generators'
            },
            {
                feature: 'Customer & Distributor Portals',
                scope: 'Tailored client dashboards, order status trackers, or specification libraries',
                enterpriseAddon: 'SSO authentication & legacy ERP database connectivity'
            },
            {
                feature: 'Custom Workflow Automation',
                scope: 'Automated RFQ routing, spec verification forms, and internal notifications',
                enterpriseAddon: 'Custom webhook pipelines to internal industrial software'
            }
        ]
    },
    {
        category: '5. Governance, Engineering Support & SLAs',
        rows: [
            {
                feature: 'Dedicated Solutions Engineer',
                scope: 'Senior solutions engineer and web architect assigned directly to your account',
                enterpriseAddon: 'Dedicated Slack/Teams communication channel'
            },
            {
                feature: 'Technical Support SLA',
                scope: 'Direct email support via contact@auraworks.co.za with 24-hour response during business hours',
                enterpriseAddon: 'Priority 4-hour critical response SLA'
            },
            {
                feature: 'Review & Optimization Rhythm',
                scope: 'Structured monthly or bi-weekly technical sprint reviews and search analytics reports',
                enterpriseAddon: 'Executive quarterly board-ready intelligence briefings'
            }
        ]
    }
]

const commercialFaqs = [
    {
        question: 'How does AuraWorks structure pricing without rigid, generic tiers?',
        answer: 'Every industrial enterprise has distinct technical requirements—ranging from high-speed Next.js web application engineering and catalog refactoring to localized SADC search dominance and bespoke de-anonymization pipelines. Instead of forcing you into a rigid tier with arbitrary feature limits, we evaluate your current infrastructure, target market, and operational goals during a technical discovery session. We then provide a transparent, consolidated quotation covering both deployment and ongoing retainer support tailored exactly to your business.'
    },
    {
        question: 'What is included in the consolidated service offering?',
        answer: 'Our single unified offering brings together all critical digital capabilities for modern industrial suppliers: (1) High-Performance Web Development engineered with Next.js 15 for sub-second speeds and interactive spec sheets; (2) Technical SEO & Generative Engine Optimization (GEO) ensuring your brand ranks #1 on Google and is cited as the primary authority in AI engines like ChatGPT, Perplexity, and Gemini; (3) aura.js juristic visitor de-anonymization that identifies visiting corporate accounts in real-time under POPIA; and (4) Custom Industrial Tools tailored to your operations, such as engineering calculators, client portals, and CRM/ERP integrations.'
    },
    {
        question: 'How does AuraWorks protect and indemnify our business under POPIA regulations?',
        answer: 'AuraWorks operates on a strict juristic-first entity resolution architecture. Under Chapter 3 of South Africa\'s Protection of Personal Information Act (POPIA), juristic persons (such as registered corporate entities, mining houses, and engineering firms) are distinct from natural personal records. aura.js deterministically resolves autonomous system numbers (ASNs), corporate IP telemetry, and commercial network blocks back to corporate entities—never scraping, tracking, or harvesting private natural individual identities without consent. All telemetry is encrypted with AES-256 protocols.'
    },
    {
        question: 'What is the typical deployment timeline for a custom industrial solution?',
        answer: 'For clients commissioning a full custom Next.js web platform with built-in SEO and telemetry, deployment typically takes 14 to 28 business days depending on catalog size and bespoke tool requirements. For clients wishing to accelerate and de-anonymize an existing website, our aura.js tracking script and edge proxy can be integrated via Google Tag Manager or direct code injection within 48 business hours.'
    },
    {
        question: 'Can you build custom tools, calculators, or integrate with our legacy ERP?',
        answer: 'Yes. Beyond standard web development and SEO, our engineering team regularly builds specialized tools for industrial clients—such as metallurgical sizing calculators, interactive pump curve selectors, customer documentation vaults, and automated webhook pipelines into HubSpot, Salesforce, Microsoft Dynamics, or on-premise industrial ERPs.'
    },
    {
        question: 'How do we get started and receive a quote?',
        answer: 'Schedule a 30-minute discovery call or submit our quote request form. We will review your current website, assess your search and AI visibility, identify your target industrial sectors, and deliver a detailed scope of work and quotation within 2 business days.'
    }
]

export default function Pricing() {
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
                            <span>Consolidated Industrial Engineering & Intelligence</span>
                        </div>
                        <TextEffect
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            as="h1"
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                            Custom Web Engineering, SEO, GEO & De-Anonymization
                        </TextEffect>
                        <TextEffect
                            preset="fade-in-blur"
                            per="line"
                            delay={0.4}
                            speedSegment={0.3}
                            as="p"
                            className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                            No rigid tiers or generic agency retainers. We unite custom client-facing storefronts, search and AI discoverability, and tailored operational tooling into connected business systems engineered around your operations.
                        </TextEffect>
                    </div>

                    {/* Consolidated Solution Showcase Card */}
                    <div className="mt-16 max-w-5xl mx-auto">
                        <div className="relative rounded-3xl border-2 border-primary/30 bg-card/80 p-8 sm:p-12 shadow-2xl backdrop-blur-sm overflow-hidden">
                            {/* Decorative Corner Badge */}
                            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                            
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-border/60">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground mb-3 shadow-md">
                                        <Sparkles className="size-3.5" />
                                        <span>Full-Cycle Business Systems</span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                                        Connected Digital & Operational Infrastructure
                                    </h2>
                                    <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                                        Custom-architected around your products, commercial fulfillment workflows, and operational team requirements.
                                    </p>
                                </div>
                                <div className="text-left md:text-right shrink-0">
                                    <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground block">Engagement Model</span>
                                    <span className="text-2xl sm:text-3xl font-extrabold text-primary block mt-1">Custom Quote</span>
                                    <span className="text-xs text-muted-foreground">Milestone-Based SOW</span>
                                </div>
                            </div>

                            {/* 4 Core Pillars */}
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                            <Code2 className="size-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-foreground">1. Client-Facing Commerce & Storefronts</h3>
                                            <span className="text-xs text-muted-foreground">Cashflow & Direct Transactions</span>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                        Custom-engineered ecommerce storefronts, interactive product configurators, and instant checkout flows designed to drive immediate client commitment and cashflow.
                                    </p>
                                    <ul className="space-y-1.5 pt-1 text-xs text-foreground/90">
                                        <li className="flex items-center gap-2">
                                            <Check className="size-3.5 text-primary shrink-0" />
                                            <span>Bespoke online catalog and rapid checkout integration</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="size-3.5 text-primary shrink-0" />
                                            <span>Sub-second page speeds and 100/100 Core Web Vitals</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                            <Globe2 className="size-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-foreground">2. Technical SEO & Generative AI (GEO)</h3>
                                            <span className="text-xs text-muted-foreground">Search Engine & AI Citability</span>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                        Dominance on Google SERPs paired with authoritative entity schemas ensuring ChatGPT, Perplexity, and Gemini cite your products as primary industrial answers.
                                    </p>
                                    <ul className="space-y-1.5 pt-1 text-xs text-foreground/90">
                                        <li className="flex items-center gap-2">
                                            <Check className="size-3.5 text-primary shrink-0" />
                                            <span>Comprehensive high-intent B2B keyword architecture</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="size-3.5 text-primary shrink-0" />
                                            <span>Generative Engine Optimization schema graphs</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                            <Zap className="size-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-foreground">3. aura.js Juristic De-Anonymization</h3>
                                            <span className="text-xs text-muted-foreground">Real-Time Lead Intelligence</span>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                        Unmask visiting mining houses, Tier-1 contractors, and plant engineers in real-time using deterministic corporate ASN resolution—100% POPIA compliant.
                                    </p>
                                    <ul className="space-y-1.5 pt-1 text-xs text-foreground/90">
                                        <li className="flex items-center gap-2">
                                            <Check className="size-3.5 text-primary shrink-0" />
                                            <span>Weekly Monday morning executive pipeline dispatches</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="size-3.5 text-primary shrink-0" />
                                            <span>Spec-sheet and CAD drawing download intent tracking</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                            <Wrench className="size-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-foreground">4. Operational Tooling & Workshop Systems</h3>
                                            <span className="text-xs text-muted-foreground">Lower Cost of Operations</span>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                        Custom workshop dashboards, live job queues, automated bill-of-materials, and order fulfillment queues built to eliminate costly manual errors and reduce operational overhead.
                                    </p>
                                    <ul className="space-y-1.5 pt-1 text-xs text-foreground/90">
                                        <li className="flex items-center gap-2">
                                            <Check className="size-3.5 text-primary shrink-0" />
                                            <span>Live factory/workshop order queues & cut-sheet automation</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="size-3.5 text-primary shrink-0" />
                                            <span>Direct CRM, Slack, Microsoft Teams, and ERP sync</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Call to Action Bar */}
                            <div className="mt-10 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="text-sm text-muted-foreground text-center sm:text-left">
                                    <span className="font-semibold text-foreground">Need a custom scope? </span>
                                    We evaluate your website, market footprint, and technical requirements.
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="w-full sm:w-auto font-bold px-8 py-6 text-base shadow-xl shadow-primary/20">
                                        <Link href="/book-demo">
                                            Book a Quote Consultation
                                            <ArrowRight className="ml-2 size-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        className="w-full sm:w-auto font-semibold px-6 py-6 text-base">
                                        <Link href="/book-call">
                                            Schedule Strategy Call
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
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
                                In heavy industry and B2B procurement, over 95% of visiting corporate engineers, procurement specialists, and plant managers leave websites without completing contact forms. Adjust the sliders below to simulate the active pipeline unlocked by our juristic de-anonymization engine.
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
                                        <span>8% (Average)</span>
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
                                        Active commercial opportunity value identified from previously invisible visits.
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-card border border-border shadow-sm sm:col-span-2">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                                        <Layers className="size-4 text-primary" />
                                        <span>Estimated Annual Pipeline Unlocked</span>
                                    </div>
                                    <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-primary">
                                        R {(annualPipelineUnlocked / 1000000).toFixed(1)}M
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Cumulative 12-month commercial pipeline unmasked across target mining, engineering, and industrial sectors.
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

                    {/* Section: Capabilities & Scope Matrix */}
                    <section className="mt-28">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                <Cpu className="size-3.5" />
                                <span>Complete Solution Architecture</span>
                            </div>
                            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                Capabilities & Custom Scope Breakdown
                            </h2>
                            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                                Explore the comprehensive capabilities included in our custom industrial engineering and intelligence engagements.
                            </p>
                        </div>

                        <div className="mt-10 overflow-x-auto rounded-2xl border border-border bg-card shadow-lg">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        <th className="py-4 px-6 text-sm font-bold text-foreground w-1/3">
                                            Capability & Deliverable
                                        </th>
                                        <th className="py-4 px-6 text-sm font-bold text-foreground w-1/3">
                                            Core Industrial Scope
                                        </th>
                                        <th className="py-4 px-6 text-sm font-bold text-primary w-1/3">
                                            Bespoke & Enterprise Add-ons
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customScopeMatrix.map((cat, catIdx) => (
                                        <React.Fragment key={catIdx}>
                                            <tr className="bg-muted/50 border-t border-b border-border">
                                                <td
                                                    colSpan={3}
                                                    className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-foreground">
                                                    {cat.category}
                                                </td>
                                            </tr>
                                            {cat.rows.map((row, rowIdx) => (
                                                <tr
                                                    key={rowIdx}
                                                    className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                                                    <td className="py-3.5 px-6 text-xs sm:text-sm font-medium text-foreground">
                                                        {row.feature}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-xs sm:text-sm text-muted-foreground leading-snug">
                                                        <div className="flex items-start gap-2">
                                                            <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                                                            <span>{row.scope}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-6 text-xs sm:text-sm text-muted-foreground leading-snug">
                                                        {row.enterpriseAddon ? (
                                                            <div className="flex items-start gap-2">
                                                                <CheckCircle2 className="size-3.5 text-primary/80 shrink-0 mt-0.5" />
                                                                <span>{row.enterpriseAddon}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground/40">—</span>
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
                                Clear answers on scoping, quotations, POPIA compliance, onboarding timelines, and custom tool engineering.
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
                                Ready for a Custom Industrial Solution Built for Your Business?
                            </h2>
                            <p className="text-base sm:text-lg text-primary-foreground/90 leading-relaxed">
                                Schedule a 30-minute discovery review. We will evaluate your current Google SERP rankings, assess your AI citability across ChatGPT and Perplexity, and design a custom quotation for your industrial operations.
                            </p>
                            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    asChild
                                    size="lg"
                                    variant="secondary"
                                    className="w-full sm:w-auto font-semibold px-8 py-6 text-base shadow-lg">
                                    <Link href="/book-demo">
                                        Book a Quote Consultation
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
