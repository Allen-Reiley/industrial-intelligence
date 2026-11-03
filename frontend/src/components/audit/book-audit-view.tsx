'use client'

import React, { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { 
    Building2, Mail, User, Briefcase, ArrowLeft, 
    Globe, BarChart3, Database, Loader2, 
    Lock, ArrowRight, CheckCircle, ChevronDown,
    Cpu, Search, TrendingUp, Bot, FileText,
    ShieldCheck, Sparkles, Target, Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { submitToProspects } from '@/lib/api'
import { HeroHeader } from '@/components/header/header'
import Footer from '@/components/footer/footer'
import { TextEffect } from '@/components/ui/text-effect'
import posthog from 'posthog-js'

const isPostHogConfigured = Boolean(
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
)

const MCP_ENGINES = [
    {
        name: 'Google Search Console MCP',
        tag: 'Telemetry & Indexing',
        icon: Search,
        description: 'Extracts verified first-party search telemetry, crawl logs, indexation status, impression trajectories, and actual procurement queries.'
    },
    {
        name: 'Google Trends MCP',
        tag: 'Market Demand Velocity',
        icon: TrendingUp,
        description: 'Analyzes longitudinal search demand patterns, emerging commercial keyword clusters, and regional buyer interest concentrations.'
    },
    {
        name: 'OpenSEO MCP',
        tag: 'Technical Site Audit',
        icon: Cpu,
        description: 'Executes comprehensive crawl inventories evaluating canonical hygiene, heading hierarchy skips, metadata, and Schema.org structured entities.'
    },
    {
        name: 'Google Gemini MCP',
        tag: 'GEO & Citability Engine',
        icon: Bot,
        description: 'Evaluates Generative Engine Optimization (GEO) citability across ChatGPT, Perplexity, Gemini, and Google AI Overviews using Knowledge Graph mapping.'
    }
]

const AUDIT_CHAPTERS = [
    { num: '01', title: 'Executive Cover & Profile', desc: 'Target website parameters, enterprise profile, audit engine telemetry, and market classification.' },
    { num: '02', title: '4-Box Health Scorecard', desc: 'Technical Base, Content/On-Page, Schema/Entities, and GEO AI Readiness empirical scorecard.' },
    { num: '03', title: 'Service Architecture', desc: 'Core service pillar analysis mapped directly to commercial high-intent buyer query clusters.' },
    { num: '04', title: 'OpenSEO Technical Crawl', desc: 'Full URL crawl inventory, canonical hygiene audit, and top 5 prioritized remediation fixes.' },
    { num: '05', title: 'GSC & Analytics Diagnostic', desc: 'First-party query telemetry, GA4 integration verification, and 4-step onboarding protocol.' },
    { num: '06', title: 'Market Keyword Demand', desc: 'Structured commercial keyword tables with local search volume, KD, and CPC in ZAR/USD.' },
    { num: '07', title: 'Competitor Landscape', desc: 'SERP competitor matrix, strategic whitespace moats, and 12-month commercial traffic capture model.' },
    { num: '08', title: 'Dual-Channel Strategy', desc: 'Traditional search architecture de-clustering combined with Generative AI entity citability.' },
    { num: '09', title: '90-Day Sprint Roadmap', desc: 'Phases 1-3 implementation sprints: Quick Wins, Architecture De-Clustering, and Market Dominance.' }
]

export default function BookAuditView() {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        industry: '',
        website: '',
        traffic: '',
        primary_competitor: '',
        target_focus: '',
        gsc_status: ''
    })

    const handleNext = (e: FormEvent) => {
        e.preventDefault()
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid work email address.')
            return
        }
        if (isPostHogConfigured) {
            posthog.capture('audit_request_step_completed', {
                industry: formData.industry,
            })
        }
        setStep(2)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const aura_id = typeof window !== 'undefined' ? localStorage.getItem('aura_uid') : null
            await submitToProspects({
                ...formData,
                source: 'executive_audit_request',
                audit_type: 'mcp_executive_9_page_audit',
                aura_id: aura_id
            })
            if (isPostHogConfigured) {
                posthog.capture('audit_request_submitted', {
                    industry: formData.industry,
                    traffic_range: formData.traffic,
                    gsc_status: formData.gsc_status,
                })
            }
            setIsSuccess(true)
        } catch (error: unknown) {
            console.error('Audit Request Error:', error)
            alert('System Update: We encountered a synchronization delay. Please try again in a moment.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <HeroHeader />

            <main className="flex-1 pt-28 pb-20 md:pt-40 md:pb-28">
                {/* Background Ambient Glow matching site design */}
                <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 opacity-25 [background:radial-gradient(50%_50%_at_50%_50%,var(--color-primary)_0%,transparent_100%)] blur-3xl" />
                </div>

                <div className="max-w-5xl mx-auto px-6">
                    {/* Header Block */}
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                            <ShieldCheck className="size-3.5" />
                            <span>AuraWorks Executive SEO & GEO Audit</span>
                        </div>

                        <TextEffect
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            as="h1"
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                            Empirical Search Dominance & AI Citability Audit
                        </TextEffect>

                        <TextEffect
                            preset="fade-in-blur"
                            per="line"
                            delay={0.4}
                            speedSegment={0.3}
                            as="p"
                            className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                            We execute a multi-agent Model Context Protocol (MCP) crawl across Google Search Console, Google Trends, OpenSEO, and Google Gemini to produce a boardroom-ready 9-page analytical report.
                        </TextEffect>
                    </div>

                    {/* Form Section */}
                    <div id="audit-form" className="mt-14 relative overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur-sm shadow-2xl p-6 sm:p-10 md:p-12">
                        {/* Phase Header */}
                        <div className="mb-8 flex items-center justify-between border-b pb-6">
                            <div>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                                    Phase 0{step} of 02
                                </span>
                                <h2 className="text-2xl font-bold tracking-tight mt-1">
                                    {step === 1 ? 'Corporate Identity' : 'Telemetry Scope & Domain'}
                                </h2>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className={cn("h-1.5 w-6 rounded-full transition-all duration-500", step === 1 ? "bg-primary" : "bg-muted")} />
                                    <div className={cn("h-1.5 w-6 rounded-full transition-all duration-500", step === 2 ? "bg-primary" : "bg-muted")} />
                                </div>
                            </div>
                        </div>

                        {isSuccess ? (
                            <div className="py-12 text-center animate-in fade-in zoom-in duration-500 space-y-6">
                                <div className="mb-6 flex justify-center">
                                    <div className="rounded-full bg-primary/10 p-3">
                                        <CheckCircle className="h-12 w-12 text-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold tracking-tight">Executive Audit Initialized</h3>
                                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                                        Our MCP intelligence engine has queued diagnostic telemetry for <strong className="text-foreground">{formData.website || 'your domain'}</strong>.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/40 border max-w-md mx-auto text-left text-xs space-y-2 font-mono">
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span>Target Website:</span>
                                        <span className="text-foreground font-bold">{formData.website}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span>Work Email:</span>
                                        <span className="text-foreground">{formData.email}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span>Deliverable:</span>
                                        <span className="text-foreground font-bold">9-Page Boardroom PDF Report</span>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                    We will compile your 9-page findings and send a calendar link to review the strategic scorecard.
                                </p>

                                <Button asChild variant="outline" className="mt-4 rounded-xl">
                                    <Link href="/">Return to Home</Link>
                                </Button>
                            </div>
                        ) : (
                            <div>
                                {step === 1 ? (
                                    <form onSubmit={handleNext} className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input 
                                                        id="name"
                                                        required 
                                                        value={formData.name} 
                                                        onChange={e => setFormData({...formData, name: e.target.value})} 
                                                        placeholder="Executive Name" 
                                                        className="pl-10 rounded-xl bg-muted/30" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Work Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input 
                                                        id="email"
                                                        required 
                                                        type="email" 
                                                        value={formData.email} 
                                                        onChange={e => setFormData({...formData, email: e.target.value})} 
                                                        placeholder="executive@mining.co.za" 
                                                        className="pl-10 rounded-xl bg-muted/30" 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="company">Company / Enterprise Name</Label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input 
                                                        id="company"
                                                        required 
                                                        value={formData.company} 
                                                        onChange={e => setFormData({...formData, company: e.target.value})} 
                                                        placeholder="e.g. Rand Industrial Holdings" 
                                                        className="pl-10 rounded-xl bg-muted/30" 
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="industry">Industry Vertical</Label>
                                                <div className="relative">
                                                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <select 
                                                        id="industry"
                                                        required 
                                                        value={formData.industry} 
                                                        onChange={e => setFormData({...formData, industry: e.target.value})} 
                                                        className="flex h-10 w-full rounded-xl border border-input bg-muted/30 pl-10 pr-3 py-2 text-sm outline-none appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Select industry vertical...</option>
                                                        <option value="mining">Mining & Resources</option>
                                                        <option value="manufacturing">Heavy Manufacturing</option>
                                                        <option value="logistics">Bulk Logistics & Freight</option>
                                                        <option value="construction">Heavy Construction & Infrastructure</option>
                                                        <option value="engineering">Engineering & Industrial Tech</option>
                                                        <option value="other">Other High-Value B2B</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <Button type="submit" size="lg" className="w-full mt-4 rounded-xl font-bold group shadow-xl shadow-primary/20">
                                            Continue to Telemetry Scope <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="website">Target Website URL</Label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input 
                                                    id="website"
                                                    required 
                                                    value={formData.website} 
                                                    onChange={e => setFormData({...formData, website: e.target.value})} 
                                                    placeholder="https://www.yourfirm.co.za" 
                                                    className="pl-10 rounded-xl bg-muted/30 font-mono text-sm" 
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="traffic">Estimated Monthly Traffic</Label>
                                                <div className="relative">
                                                    <BarChart3 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <select 
                                                        id="traffic"
                                                        required 
                                                        value={formData.traffic} 
                                                        onChange={e => setFormData({...formData, traffic: e.target.value})} 
                                                        className="flex h-10 w-full rounded-xl border border-input bg-muted/30 pl-10 pr-3 py-2 text-sm outline-none appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Select range...</option>
                                                        <option value="0-1k">0 - 1,000</option>
                                                        <option value="1k-5k">1,000 - 5,000</option>
                                                        <option value="5k-20k">5,000 - 20,000</option>
                                                        <option value="20k+">20,000+</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="gsc_status">GSC / Telemetry Status</Label>
                                                <div className="relative">
                                                    <Database className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <select 
                                                        id="gsc_status"
                                                        required 
                                                        value={formData.gsc_status} 
                                                        onChange={e => setFormData({...formData, gsc_status: e.target.value})} 
                                                        className="flex h-10 w-full rounded-xl border border-input bg-muted/30 pl-10 pr-3 py-2 text-sm outline-none appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Select status...</option>
                                                        <option value="active">Google Search Console Active</option>
                                                        <option value="ga4_only">GA4 Active (Need GSC Linking)</option>
                                                        <option value="unverified">Not Verified / Need Full Setup</option>
                                                        <option value="unsure">Unsure / Need Audit to Determine</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="competitor">Primary Competitor (Optional)</Label>
                                                <Input 
                                                    id="competitor"
                                                    value={formData.primary_competitor} 
                                                    onChange={e => setFormData({...formData, primary_competitor: e.target.value})} 
                                                    placeholder="e.g. competitor.co.za" 
                                                    className="rounded-xl bg-muted/30 text-sm" 
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="target_focus">Priority Service / Keyword</Label>
                                                <Input 
                                                    id="target_focus"
                                                    value={formData.target_focus} 
                                                    onChange={e => setFormData({...formData, target_focus: e.target.value})} 
                                                    placeholder="e.g. Slurry Valves" 
                                                    className="rounded-xl bg-muted/30 text-sm" 
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-2 flex items-center gap-3">
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                onClick={() => setStep(1)} 
                                                className="rounded-xl"
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4" /> Previous Step
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                disabled={isLoading} 
                                                size="lg" 
                                                className="flex-1 rounded-xl font-bold shadow-xl shadow-primary/20"
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Deploying MCP Telemetry...
                                                    </span>
                                                ) : (
                                                    "Request 9-Page Audit Report"
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60">
                            <div className="flex items-center gap-1.5">
                                <Lock className="h-3 w-3" />
                                <span>POPIA & PAIA Juristic Standard</span>
                            </div>
                            <span>Zero Fluff • Maximum Density</span>
                        </div>
                    </div>

                    {/* Section: 4-Engine MCP Intelligence Stack (Bento Grid) */}
                    <section className="mt-28">
                        <div className="max-w-3xl mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                <Cpu className="size-3.5" />
                                <span>Live Multi-Agent Pipeline</span>
                            </div>
                            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                The 4-Engine MCP Intelligence Stack
                            </h2>
                            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                                Our platform establishes automated Model Context Protocol connections across search analytics, demand velocity, technical crawls, and generative AI engines to audit your domain with precision.
                            </p>
                        </div>

                        <div className="grid gap-px bg-border overflow-hidden rounded-3xl border md:grid-cols-2">
                            {MCP_ENGINES.map((engine, idx) => {
                                const Icon = engine.icon
                                return (
                                    <div key={idx} className="bg-card p-8 md:p-10 space-y-4 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                                <Icon className="size-5" />
                                            </div>
                                            <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-muted border text-muted-foreground">
                                                {engine.tag}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-foreground">{engine.name}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{engine.description}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {/* Section: 4-Box Health Scorecard Matrix */}
                    <section className="mt-28 p-8 md:p-12 rounded-3xl bg-card border border-border shadow-xl relative overflow-hidden">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                <Target className="size-3.5" />
                                <span>Empirical Health Matrix</span>
                            </div>
                            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                The 4-Box Executive Scorecard
                            </h2>
                            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                                Every audit evaluates your site across four key operational dimensions to surface technical blockers and generative AI citation gaps.
                            </p>
                        </div>

                        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-2">
                                <div className="text-xs font-semibold uppercase text-muted-foreground">Vector 01</div>
                                <div className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono">84%</div>
                                <div className="font-bold text-sm text-foreground">Technical Base</div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Sub-300ms TTFB speed, HTTP/3, mobile responsiveness & core web vitals.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-2">
                                <div className="text-xs font-semibold uppercase text-muted-foreground">Vector 02</div>
                                <div className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono">35%</div>
                                <div className="font-bold text-sm text-foreground">Content & On-Page</div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    De-clustering analysis, thin content detection, and commercial keyword depth.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-2">
                                <div className="text-xs font-semibold uppercase text-muted-foreground">Vector 03</div>
                                <div className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono">0%</div>
                                <div className="font-bold text-sm text-foreground">Schema & Entities</div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Structured data validation, Organization entity graph, and sameAs links.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-2">
                                <div className="text-xs font-semibold uppercase text-muted-foreground">Vector 04</div>
                                <div className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono">18%</div>
                                <div className="font-bold text-sm text-foreground">GEO / AI Readiness</div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Citability across ChatGPT, Perplexity, Gemini, and Google AI Overviews.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section: 9-Page Chapter Flow */}
                    <section className="mt-28">
                        <div className="max-w-3xl mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                <Layers className="size-3.5" />
                                <span>Report Architecture</span>
                            </div>
                            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                The 9-Page Boardroom Deliverable
                            </h2>
                            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                                Formatted in standard A4 portrait and compiled via WeasyPrint. Every chapter delivers dense empirical findings and actionable next steps.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {AUDIT_CHAPTERS.map((chapter) => (
                                <div 
                                    key={chapter.num}
                                    className="p-5 rounded-2xl border border-border bg-card hover:bg-muted/20 transition-colors space-y-2 flex flex-col justify-between"
                                >
                                    <div>
                                        <span className="text-xs font-mono font-bold text-primary">
                                            Page {chapter.num}
                                        </span>
                                        <h3 className="text-sm font-bold text-foreground mt-1">
                                            {chapter.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                            {chapter.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Final Bottom Banner */}
                    <section className="mt-28 text-center p-8 md:p-12 rounded-3xl bg-muted/30 border border-border">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Ready to uncover your website&apos;s true pipeline capacity?
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
                            Submit your domain above for our automated MCP diagnostic pipeline. Our advisory practice will return a completed 9-page executive audit.
                        </p>
                        <div className="mt-6">
                            <Button 
                                size="lg" 
                                onClick={() => {
                                    document.getElementById('audit-form')?.scrollIntoView({ behavior: 'smooth' })
                                }}
                                className="rounded-xl px-8 font-bold shadow-xl shadow-primary/20 cursor-pointer"
                            >
                                Request Audit Report
                            </Button>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
