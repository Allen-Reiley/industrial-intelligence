// @/app/terms/page.tsx
'use client'

import React from 'react'
import { 
    Scale, Zap, CreditCard, ShieldAlert, 
    Lock, Construction, ArrowLeft, Terminal, FileCheck 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TermsOfServicePage() {
    const effectiveDate = "March 2026"

    return (
        <main className="relative min-h-screen bg-background px-6 py-20 overflow-hidden font-sans">
            {/* Ambient Background - Subtle Industrial Blue/Steel */}
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-10 [background:radial-gradient(50%_50%_at_50%_10%,var(--color-primary)_0%,transparent_100%)] blur-3xl" />
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-16">
                    <Button variant="ghost" asChild className="-ml-2 mb-8 text-muted-foreground hover:text-foreground">
                        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Operations</Link>
                    </Button>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold text-primary">
                            Service Agreement
                        </span>
                        <span className="h-[1px] w-12 bg-primary/20"></span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            v1.1 — {effectiveDate}
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tighter italic mb-6">Terms of Service</h1>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                        This agreement governs the use of the AuraWorks Intent Engine. By engaging our infrastructure, you agree to these operational protocols.
                    </p>
                </div>

                {/* Terms Sections */}
                <div className="space-y-16 prose prose-invert max-w-none">
                    
                    {/* Section 1: The Engine */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Zap className="text-primary h-6 w-6" /> 01. The Annual Intent Engine
                        </h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-relaxed border-l border-primary/20 pl-6">
                            <p>
                                AuraWorks (Pty) Ltd grants the Client a non-exclusive, non-transferable license to access the <strong>AuraWorks Identity Bridge</strong> for a period of one (1) year.
                            </p>
                            <p>
                                <strong>Scope of Service:</strong> The "Engine" includes real-time identity resolution of website traffic, weekly lead enrichment reporting, and access to the proprietary B2B dashboard. Clients are strictly responsible for the security of their unique API keys and dashboard credentials.
                            </p>
                        </div>
                    </section>

                    {/* Section 2: Financials */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <CreditCard className="text-primary h-6 w-6" /> 02. Fees & Commitment
                        </h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-relaxed border-l border-primary/20 pl-6">
                            <p>
                                <strong>Annual Commitment:</strong> The Founding Member rate (R120,000/yr) is a full annual commitment. Failure to meet payment schedules will result in immediate suspension of the Identity Bridge within 14 days of the overdue date.
                            </p>
                            <p>
                                <strong>Refund Policy:</strong> Due to the proprietary nature of the data and the intensive "Systems Architect" setup required for deployment, all fees are non-refundable once the bridge is integrated into the Client&apos;s digital infrastructure.
                            </p>
                        </div>
                    </section>

                    {/* Section 3: Intellectual Property */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Terminal className="text-primary h-6 w-6" /> 03. Proprietary Rights
                        </h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-relaxed border-l border-primary/20 pl-6">
                            <p>
                                <strong>AuraWorks Property:</strong> All algorithms, FastAPI architecture, "Identity Bridge" logic, and UI designs remain the sole property of AuraWorks (Pty) Ltd.
                            </p>
                            <p>
                                <strong>Data Ownership:</strong> Clients retain full ownership of all leads exported during an active subscription. Upon termination, access to the engine is revoked, but exported data remains with the Client.
                            </p>
                        </div>
                    </section>

                    {/* Section 4: Acceptable Use */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <ShieldAlert className="text-primary h-6 w-6" /> 04. Operational Constraints
                        </h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-relaxed border-l border-primary/20 pl-6">
                            <p>Clients are strictly prohibited from:</p>
                            <ul className="list-disc space-y-2 pl-4">
                                <li>Stress-testing or reverse-engineering FastAPI endpoints.</li>
                                <li>Utilizing AuraWorks data to construct a competing identity resolution product.</li>
                                <li>Engaging in non-POPIA compliant outreach using leads generated by the engine.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 5: Limitation of Liability */}
                    <section className="p-8 rounded-2xl bg-primary/5 border border-primary/10">
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Lock className="text-primary h-6 w-6" /> 05. Liability Shield
                        </h2>
                        <div className="text-muted-foreground space-y-4 text-xs leading-relaxed uppercase tracking-wider">
                            <p>
                                TO THE MAXIMUM EXTENT PERMITTED BY SOUTH AFRICAN LAW, AURAWORKS&apos; TOTAL LIABILITY IS LIMITED TO THE ACTUAL FEES PAID BY THE CLIENT IN THE 12 MONTHS PRECEDING A CLAIM. 
                            </p>
                            <p>
                                AURAWORKS IS NOT LIABLE FOR CONSEQUENTIAL DAMAGES, INCLUDING BUT NOT LIMITED TO, LOSS OF PROFITS, INDUSTRIAL DOWNTIME, OR MISSED CONTRACTUAL OPPORTUNITIES RESULTING FROM SYSTEM UNAVAILABILITY.
                            </p>
                        </div>
                    </section>

                    {/* Section 6: Maintenance & Support */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Construction className="text-primary h-6 w-6" /> 06. Service Levels
                        </h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-relaxed border-l border-primary/20 pl-6">
                            <p>
                                <strong>Uptime:</strong> AuraWorks maintains a 99.9% uptime target. Scheduled maintenance for "Bridge Updates" will be performed during off-peak hours and does not constitute downtime.
                            </p>
                            <p>
                                <strong>Support:</strong> Founding members receive priority technical support via email with a guaranteed 24-hour response time during standard business hours (SAST).
                            </p>
                        </div>
                    </section>

                    {/* Section 7: Termination */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <FileCheck className="text-primary h-6 w-6" /> 07. Termination Protocols
                        </h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-relaxed border-l border-primary/20 pl-6">
                            <p>
                                Either party may terminate for cause if a material breach remains uncured for 30 days. Survival clauses regarding Limitation of Liability, Confidentiality, and Proprietary Rights remain in effect post-termination.
                            </p>
                        </div>
                    </section>

                </div>

                {/* Footer Signature */}
                <div className="mt-32 pt-8 border-t border-primary/10 flex flex-col items-center gap-4">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground/40">
                        AuraWorks (Pty) Ltd — Legal Operations
                    </div>
                </div>
            </div>
        </main>
    )
}