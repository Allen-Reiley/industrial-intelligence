// @/app/disclaimer/page.tsx
'use client'

import React from 'react'
import { 
    ShieldAlert, Target, Database, Gavel, 
    Globe, Cpu, ArrowLeft, AlertCircle 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ProfessionalDisclaimerPage() {
    return (
        <main className="relative min-h-screen bg-background px-6 py-20 overflow-hidden font-sans">
            {/* Ambient Background - Warning/Neutral Amber Tint */}
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-5 [background:radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)]" />
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-16 border-b border-primary/10 pb-12">
                    <Button variant="ghost" asChild className="-ml-2 mb-8 text-muted-foreground hover:text-foreground">
                        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Operations</Link>
                    </Button>
                    <div className="flex items-center gap-3 mb-4 text-primary">
                        <ShieldAlert className="h-4 w-4" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold">
                            Operational Safeguards
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tighter italic mb-6">Professional Disclaimer</h1>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                        AuraWorks (Pty) Ltd provides specialized B2B intelligence. The following constraints define the boundaries of our professional liability.
                    </p>
                </div>

                {/* Disclaimer Sections */}
                <div className="space-y-16">
                    
                    {/* Section 1: Sales & Revenue */}
                    <section>
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest border-l-2 border-primary pl-4">
                            01. Outcomes & Guarantees
                        </h2>
                        <div className="p-8 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden">
                            <Target className="absolute -right-4 -top-4 h-24 w-24 opacity-5" />
                            <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
                                AuraWorks provides lead intelligence and identity resolution services. We <strong>do not guarantee</strong> specific sales outcomes, revenue increases, or the successful closing of contracts. The &quot;Industrial Growth Engine&quot; is a sophisticated tool designed to assist professional sales teams; the final conversion of any identified lead remains the <strong>sole responsibility</strong> of the Client.
                            </p>
                        </div>
                    </section>

                    {/* Section 2: Data Accuracy */}
                    <section>
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest border-l-2 border-primary pl-4">
                            02. Identity Bridge Accuracy
                        </h2>
                        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pl-6">
                            <div className="flex gap-4 items-start">
                                <Database className="h-5 w-5 text-primary shrink-0 mt-1" />
                                <p>
                                    While our Identity Bridge utilizes advanced heuristics to resolve anonymous traffic, all data is provided on an <strong>&quot;as-is&quot;</strong> and <strong>&quot;as-available&quot;</strong> basis. 
                                </p>
                            </div>
                            <p className="pl-9">
                                AuraWorks does not warrant that every visitor identity will be resolved with 100% accuracy. Corporate mapping is subject to the inherent limitations of public record availability, VPN usage, and network metadata fluctuations.
                            </p>
                        </div>
                    </section>

                    {/* Section 3: Legal & POPIA */}
                    <section>
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest border-l-2 border-primary pl-4">
                            03. Regulatory Responsibility
                        </h2>
                        <div className="p-8 rounded-2xl bg-card border space-y-4">
                            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                <Gavel className="h-4 w-4" /> Legal Status
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                AuraWorks is a technical service provider, <strong>not a legal consultancy</strong>. While we provide tools to facilitate POPIA-compliant data gathering, the Client is exclusively responsible for ensuring their internal sales and marketing processes—including cold outreach—adhere to the <strong>Protection of Personal Information Act (POPIA)</strong> and the <strong>Consumer Protection Act (CPA)</strong> of South Africa.
                            </p>
                        </div>
                    </section>

                    {/* Section 4: Enrichment Providers */}
                    <section>
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest border-l-2 border-primary pl-4">
                            04. Third-Party Intelligence
                        </h2>
                        <div className="flex gap-4 items-start pl-6">
                            <Globe className="h-5 w-5 text-primary shrink-0 mt-1" />
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                AuraWorks may utilize third-party APIs and external datasets for profile enrichment. We are not liable for inaccuracies, data deletions, or service interruptions originating from these third-party providers (e.g., LinkedIn, Apollo, or cloud infrastructure partners).
                            </p>
                        </div>
                    </section>

                    {/* Section 5: Technical Shield */}
                    <section>
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest border-l-2 border-primary pl-4">
                            05. Systems Liability
                        </h2>
                        <div className="bg-muted/30 p-8 rounded-2xl border flex gap-4 items-start">
                            <Cpu className="h-6 w-6 text-primary shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed italic">
                                AuraWorks (Pty) Ltd shall not be held liable for technical interruptions, server downtimes, or loss of data resulting from browser updates, firewall restrictions on the Client&apos;s digital property, or third-party hosting failures beyond our immediate architectural control.
                            </p>
                        </div>
                    </section>

                </div>

                {/* Footer Signature */}
                <div className="mt-32 pt-8 border-t border-primary/10 flex flex-col items-center gap-4 text-center">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground/30">
                        AuraWorks (Pty) Ltd — Risk Management <br/> 
                        <span className="opacity-60 text-[8px]">PROFESSIONAL DISCLAIMER © 2026</span>
                    </div>
                </div>
            </div>
        </main>
    )
}