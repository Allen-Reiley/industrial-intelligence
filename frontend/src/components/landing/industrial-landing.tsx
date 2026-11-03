'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
    Calendar,
    Clock,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    ArrowDown,
    Sparkles,
    Check,
    ChevronDown,
    Mail,
    PhoneCall,
    Layers,
    Wrench,
    TrendingUp,
    Globe2,
    Cpu,
    Zap,
    Lock,
    Building2,
    Factory
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'

export default function IndustrialLanding() {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
    const [quickName, setQuickName] = useState('')
    const [quickEmail, setQuickEmail] = useState('')
    const [quickCompany, setQuickCompany] = useState('')
    const [quickNotes, setQuickNotes] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index)
    }

    const scrollToBooking = () => {
        const el = document.getElementById('book-call')
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const handleQuickSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
    }

    const callAgenda = [
        {
            time: "0:00 – 5:00",
            phase: "Fulfillment & Operations Diagnostic",
            desc: "We analyze your workshop, warehouse, or production handoffs to isolate manual calculation errors, cut-sheet delays, and operational friction that inflate your overhead."
        },
        {
            time: "5:00 – 10:00",
            phase: "Discovery & Cashflow Evaluation",
            desc: "We review how high-margin clients currently find you (Google & AI engines) and evaluate whether your quoting and customer storefront flows convert interest into immediate working capital."
        },
        {
            time: "10:00 – 15:00",
            phase: "Tailored Architecture Roadmap",
            desc: "We map out an actionable systems blueprint combining custom internal tooling with customer-facing storefronts—with clear milestones, costs, and expected ROI."
        }
    ]

    const threePillars = [
        {
            icon: <Wrench className="size-6 text-primary" />,
            pillar: "Operational Tooling",
            title: "Slash Fulfillment & Workshop Overhead",
            points: [
                "Custom job tracking queues built for factory/workshop floor reality",
                "Automated bill-of-materials (BOM) and material cut-sheets",
                "Eliminate costly verbal or paper handoff errors across production bays"
            ]
        },
        {
            icon: <TrendingUp className="size-6 text-primary" />,
            pillar: "Client Storefronts",
            title: "Turn Inquiries into Predictable Cashflow",
            points: [
                "Bespoke digital storefronts and interactive product configurators",
                "Instant pricing and deposit collection that secures cash upfront",
                "Self-service trade and procurement order portals with real-time status"
            ]
        },
        {
            icon: <Globe2 className="size-6 text-primary" />,
            pillar: "Discovery & Intent",
            title: "SEO, GEO & Visitor De-Anonymization",
            points: [
                "Top-tier Google ranking architecture for high-value commercial searches",
                "Generative Engine Optimization (GEO) so ChatGPT & Perplexity cite your firm",
                "Deterministic juristic de-anonymization of visiting corporate accounts"
            ]
        }
    ]

    const faqs = [
        {
            q: "Who will I speak with on this call?",
            a: "You will speak directly with our senior systems architects and engineering leads—not a generic SDR or scripted sales representative. We speak the language of physical manufacturing, operational margins, and software systems."
        },
        {
            q: "Is there any financial commitment required for the call?",
            a: "No. The 15-minute diagnostic call is completely free. We will evaluate your current workflow and provide a transparent perspective on whether custom operational tooling or client storefronts will deliver an asymmetrical return for your business."
        },
        {
            q: "What should I have prepared for the call?",
            a: "A general understanding of your primary operational bottlenecks, typical monthly order volume, and how customers currently discover and place orders with you. No formal presentations or documents are necessary."
        },
        {
            q: "What if our business already runs an ERP or existing website?",
            a: "Our systems are engineered to complement existing infrastructure. We build lightweight, focused operational tools and fast storefronts that connect seamlessly via webhooks, REST APIs, or CSV sync into your current systems."
        },
        {
            q: "How does POPIA compliance apply to your visitor intelligence?",
            a: "AuraWorks operates on a strict juristic-first resolution architecture under Chapter 3 of the Protection of Personal Information Act (POPIA). We identify corporate registered entities and commercial IP blocks—never tracking or harvesting individual natural consumer data."
        }
    ]

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
            {/* 1. Focused Conversion Header */}
            <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <Logo />
                    </Link>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="hidden sm:flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Systems Diagnostic Call</span>
                        </div>
                        <Button 
                            onClick={scrollToBooking}
                            size="sm" 
                            className="rounded-full px-5 font-semibold shadow-md shadow-primary/20 cursor-pointer"
                        >
                            <Calendar className="mr-2 size-3.5" />
                            <span>Select Call Time</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* 2. Hero Section (Singular Focus on Booking a Call) */}
            <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border/40">
                <div
                    aria-hidden
                    className="absolute inset-0 -z-10 size-full [background:radial-gradient(120%_120%_at_50%_0%,transparent_0%,var(--color-background)_80%)]"
                />
                <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

                <div className="mx-auto max-w-4xl px-6 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-muted/60 px-4 py-1.5 text-xs font-semibold text-primary shadow-xs">
                        <Sparkles className="size-3.5" />
                        <span>Private Strategy Session • 1-on-1 with Systems Architects</span>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-balance">
                        Eliminate Operational Bottlenecks. Unlock Predictable Cashflow.
                    </h1>

                    <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed text-balance">
                        Book a 15-minute diagnostic call. We will map out tailored operational tools to slash your fulfillment costs and client storefronts that generate immediate revenue—anchored by search discoverability and buyer intelligence.
                    </p>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button 
                            onClick={scrollToBooking}
                            size="lg" 
                            className="w-full sm:w-auto rounded-xl px-8 py-6 text-base font-bold shadow-xl shadow-primary/20 cursor-pointer"
                        >
                            <Calendar className="mr-2.5 size-5" />
                            <span>Schedule Your Call Below ↓</span>
                        </Button>
                        <Button 
                            asChild
                            variant="outline" 
                            size="lg" 
                            className="w-full sm:w-auto rounded-xl px-6 py-6 text-base font-medium cursor-pointer"
                        >
                            <a href="#agenda">
                                <span>See 15-Minute Agenda →</span>
                            </a>
                        </Button>
                    </div>

                    {/* Trust Signals Under Hero CTA */}
                    <div className="pt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Clock className="size-4 text-primary" />
                            <span>15 Minutes Direct</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-4 text-primary" />
                            <span>No High-Pressure Sales</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-primary" />
                            <span>Actionable Blueprint</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Lock className="size-4 text-primary" />
                            <span>100% Confidential</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. The Three Systems Levers We Analyze on the Call */}
            <section className="py-20 bg-muted/20 border-b border-border/40">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
                        <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                            Strategic Framework
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            The Three Levers We Audit on Your Call
                        </h2>
                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                            Rather than offering isolated agency tactics or bloated generic software, we evaluate your entire operational and commercial cycle.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {threePillars.map((p, idx) => (
                            <div 
                                key={idx}
                                className="relative rounded-3xl border border-border/70 bg-card p-8 shadow-md flex flex-col justify-between hover:border-primary/40 transition-all duration-300"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                                            {p.icon}
                                        </div>
                                        <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold">
                                            {p.pillar}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold leading-snug text-foreground">
                                        {p.title}
                                    </h3>
                                    <ul className="space-y-3 pt-2">
                                        {p.points.map((pt, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                                                <Check className="size-4 text-primary shrink-0 mt-0.5" />
                                                <span>{pt}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="pt-6 mt-6 border-t border-border/50 text-xs font-medium text-foreground/80 flex items-center justify-between">
                                    <span>Analyzed on call</span>
                                    <span className="text-primary font-semibold">Diagnostic ✓</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. The 15-Minute Call Agenda */}
            <section id="agenda" className="py-20 border-b border-border/40">
                <div className="mx-auto max-w-4xl px-6">
                    <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
                        <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                            Structured & Respectful of Your Time
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            What Happens in 15 Minutes
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            We don&apos;t waste your time with canned slide decks. Every minute is focused on your operations.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {callAgenda.map((item, idx) => (
                            <div 
                                key={idx} 
                                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm"
                            >
                                <div className="shrink-0 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 font-mono text-xs font-bold text-primary">
                                    {item.time}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-foreground">
                                        {item.phase}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <Button 
                            onClick={scrollToBooking} 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full px-5 text-xs font-semibold cursor-pointer"
                        >
                            <span>Ready to Reserve a Slot? Scroll to Calendar ↓</span>
                        </Button>
                    </div>
                </div>
            </section>

            {/* 5. Who This Strategy Call Is Built For */}
            <section className="py-16 bg-muted/20 border-b border-border/40">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Who This Diagnostic Is Designed For
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            This call delivers immediate value if your business matches one of these profiles:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-2">
                            <div className="flex items-center gap-2.5 font-bold text-foreground text-sm">
                                <Factory className="size-4 text-primary" />
                                <span>Custom Manufacturers</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Studios, woodworkers, steel fabricators, and made-to-order producers battling manual cut-sheets and workshop bottlenecks.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-2">
                            <div className="flex items-center gap-2.5 font-bold text-foreground text-sm">
                                <Building2 className="size-4 text-primary" />
                                <span>Industrial & Engineering Suppliers</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Firms supplying pumps, valves, piping, or machinery seeking organic discoverability and direct quote automation.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-border/70 bg-card space-y-2">
                            <div className="flex items-center gap-2.5 font-bold text-foreground text-sm">
                                <Layers className="size-4 text-primary" />
                                <span>Commercial Studios & Fabricators</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Growing businesses looking to replace fragile spreadsheets and disconnected apps with unified tools that scale.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Primary Booking Section (Calendar Embed + Fallback) */}
            <section id="book-call" className="py-20 md:py-28 relative overflow-hidden">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-md">
                            <Calendar className="size-3.5" />
                            <span>Step 1: Reserve Your Time</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                            Select a Convenient Slot on Our Live Calendar
                        </h2>
                        <p className="text-base text-muted-foreground">
                            Pick an open time on the scheduler below. You will immediately receive a calendar invitation and direct Google Meet link.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column: Call Preparation & Direct Contact */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-5 shadow-lg">
                                <h3 className="text-lg font-bold text-foreground">
                                    Call Details & Guarantees
                                </h3>

                                <div className="space-y-4 text-xs text-muted-foreground">
                                    <div className="flex items-start gap-3">
                                        <Clock className="size-4 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-foreground block">Duration:</strong>
                                            15 minutes sharp. We respect your schedule.
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <PhoneCall className="size-4 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-foreground block">Format:</strong>
                                            Google Meet video call or direct phone call.
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-foreground block">Led By:</strong>
                                            Reitumetse Sethabela (Founder & Systems Architect).
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-foreground block">Takeaway:</strong>
                                            A documented architectural recommendation for your business.
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border/60">
                                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-2">
                                        Can&apos;t find a suitable time?
                                    </span>
                                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                                        Email our engineering office directly and we will coordinate an alternative time:
                                    </p>
                                    <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold">
                                        <Link href="mailto:contact@auraworks.co.za?subject=Strategy%20Call%20Request">
                                            <Mail className="mr-2 size-3.5" />
                                            contact@auraworks.co.za
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Alternative Quick Form */}
                            <div className="rounded-3xl border border-border/80 bg-muted/40 p-6 space-y-4">
                                <h4 className="text-sm font-bold text-foreground">
                                    Prefer we contact you first?
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Leave your details and a systems architect will reach out within 4 business hours.
                                </p>

                                {submitted ? (
                                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                                        ✓ Request received. We will contact you shortly.
                                    </div>
                                ) : (
                                    <form onSubmit={handleQuickSubmit} className="space-y-3">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Your Name"
                                            value={quickName}
                                            onChange={(e) => setQuickName(e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                                        />
                                        <input
                                            type="email"
                                            required
                                            placeholder="Work Email"
                                            value={quickEmail}
                                            onChange={(e) => setQuickEmail(e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Company Name"
                                            value={quickCompany}
                                            onChange={(e) => setQuickCompany(e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                                        />
                                        <textarea
                                            rows={2}
                                            placeholder="Primary bottleneck or goal (optional)"
                                            value={quickNotes}
                                            onChange={(e) => setQuickNotes(e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                                        />
                                        <Button type="submit" size="sm" className="w-full text-xs font-semibold">
                                            Request Quick Call
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Live Calendly Widget Embed */}
                        <div className="lg:col-span-8">
                            <div className="rounded-3xl border-2 border-primary/30 bg-card p-2 sm:p-4 shadow-2xl overflow-hidden min-h-[680px]">
                                <iframe
                                    src="https://calendly.com/auraworks221/30min"
                                    width="100%"
                                    height="680"
                                    frameBorder="0"
                                    title="Book a Strategy Session with AuraWorks"
                                    className="w-full rounded-2xl bg-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Frequently Asked Questions */}
            <section className="py-20 bg-muted/20 border-t border-border/40">
                <div className="mx-auto max-w-4xl px-6">
                    <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
                        <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                            Common Questions
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index}
                                className="rounded-2xl border border-border/70 bg-card overflow-hidden transition-all duration-200"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="flex w-full items-center justify-between p-6 text-left font-semibold text-foreground text-sm sm:text-base cursor-pointer"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown 
                                        className={`size-4 text-muted-foreground transition-transform duration-200 ${
                                            openFaqIndex === index ? 'rotate-180 text-primary' : ''
                                        }`} 
                                    />
                                </button>
                                {openFaqIndex === index && (
                                    <div className="px-6 pb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. Focused Landing Footer */}
            <footer className="border-t border-border/40 bg-background py-10">
                <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <Logo />
                        <span>•</span>
                        <span>Full-Cycle Business Systems & Discoverability</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span>Johannesburg, South Africa</span>
                        <span>•</span>
                        <span>POPIA Juristic-Compliant</span>
                        <span>•</span>
                        <span>© {new Date().getFullYear()} AuraWorks (Pty) Ltd</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
