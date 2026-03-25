// @/app/license/page.tsx
'use client'

import React from 'react'
import { 
    Key, ShieldCheck, Zap, Lock, 
    RefreshCcw, AlertTriangle, ArrowLeft, Terminal, Gavel
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CommercialLicensePage() {
    const effectiveYear = "2026"

    return (
        <main className="relative min-h-screen bg-background px-6 py-20 overflow-hidden font-sans">
            {/* Ambient Background - Industrial Steel/Cyan Gradient */}
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 [background:radial-gradient(circle_at_20%_20%,var(--color-primary)_0%,transparent_50%)]" />
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-16 border-b border-primary/10 pb-12">
                    <Button variant="ghost" asChild className="-ml-2 mb-8 text-muted-foreground hover:text-foreground">
                        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Operations</Link>
                    </Button>
                    <div className="flex items-center gap-3 mb-4 text-primary">
                        <Key className="h-4 w-4" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold">
                            Commercial SaaS License
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tighter italic mb-6">Software Licensing</h1>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                        AuraWorks (Pty) Ltd grants a high-performance commercial license for the use of the Identity Bridge and Intent Engine infrastructure.
                    </p>
                </div>

                {/* License Content */}
                <div className="space-y-16">
                    
                    {/* Section 1: The Grant */}
                    <section>
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest border-l-2 border-primary pl-4">
                            01. Grant of License
                        </h2>
                        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pl-6">
                            <p>
                                AuraWorks (Pty) Ltd hereby grants the Client a <strong>non-exclusive, non-transferable, and revocable</strong> license to access the AuraWorks Dashboard and utilize the Identity Bridge for internal business intelligence purposes only.
                            </p>
                            <div className="p-6 rounded-2xl bg-card border flex items-start gap-4 italic text-xs">
                                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                                <span>This license is strictly limited to the Client&apos;s direct employees and authorized contractors. Sub-licensing or the redistribution of raw data to third-party entities is strictly prohibited.</span>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Bridge Specifics */}
                    <section>
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest border-l-2 border-primary pl-4">
                            02. The &quot;Identity Bridge&quot; Assets
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6">
                            <div className="space-y-2">
                                <h4 className="font-bold text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Lead Ownership</h4>
                                <p className="text-xs text-muted-foreground">Upon generation of a &quot;Hot Lead Report,&quot; the specific lead data is owned by the Client for CRM integration and direct sales outreach.</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-sm flex items-center gap-2"><Terminal className="h-4 w-4 text-primary" /> Algorithm IP</h4>
                                <p className="text-xs text-muted-foreground">The underlying logic used to resolve anonymous IP signals into corporate identities remains the sole intellectual property of AuraWorks.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Guardrails */}
                    <section className="bg-muted/30 p-8 rounded-3xl border">
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest">
                            <AlertTriangle className="text-primary h-6 w-6" /> 03. Usage Restrictions
                        </h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-muted-foreground">
                            <li className="flex gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                                <span><strong>No Reverse Engineering:</strong> Decompiling or copying the Identity Bridge tracker script is a material breach of this license.</span>
                            </li>
                            <li className="flex gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                                <span><strong>Anti-Scraping:</strong> Automated bots are prohibited from scraping dashboard data or FastAPI endpoints.</span>
                            </li>
                            <li className="flex gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                                <span><strong>Sector Integrity:</strong> Intelligence must not be used for activities violating South African industrial competition laws.</span>
                            </li>
                            <li className="flex gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                                <span><strong>API Integrity:</strong> Stress-testing infrastructure without written authorization is prohibited.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 4 & 5: Cycle & Suspension */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pl-6">
                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><RefreshCcw className="h-5 w-5 text-primary" /> License Term</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Licenses operate on a <strong>365-day cycle</strong> from the deployment date. Renewal is automatic at the then-current rate unless cancelled in writing 30 days prior to the anniversary.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Access Suspension</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                AuraWorks reserves the right to suspend the Identity Bridge for non-payment exceeding 7 days or suspected account compromise to protect the wider ecosystem.
                            </p>
                        </div>
                    </section>

                    {/* Section 6: Audit Rights */}
                    <section className="border-t border-primary/10 pt-12 pl-6">
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-6 uppercase tracking-widest">
                            <Gavel className="text-primary h-5 w-5" /> 06. Right to Audit
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">
                            AuraWorks reserves the right to monitor usage patterns within the dashboard to ensure compliance with seat count, data volume limits, and the specific terms defined in the Service Order.
                        </p>
                    </section>

                </div>

                {/* Footer Signature */}
                <div className="mt-32 pt-8 border-t border-primary/10 flex flex-col items-center gap-4 text-center">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground/30">
                        AuraWorks (Pty) Ltd — Systems Architect <br/> 
                        <span className="opacity-60 text-[8px]">SAAS LICENSE INFRASTRUCTURE © {effectiveYear}</span>
                    </div>
                </div>
            </div>
        </main>
    )
}