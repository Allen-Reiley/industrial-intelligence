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
                            v1.2 — {effectiveDate}
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tighter italic mb-6">Terms of Service</h1>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                        This agreement governs the provision of custom web development, search and generative engine optimization, and the AuraWorks Identity Bridge. By executing a Service Order or engaging our infrastructure, you agree to these operational protocols.
                    </p>
                </div>

                {/* Terms Sections */}
                <div className="space-y-16 prose prose-invert max-w-none">
                    
                    {/* Section 1: The Engine */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Zap className="text-primary h-6 w-6" /> 01. Industrial Intelligence & Services
                        </h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-relaxed border-l border-primary/20 pl-6">
                            <p>
                                AuraWorks (Pty) Ltd provides high-performance web development, technical Search Engine Optimization (SEO), Generative Engine Optimization (GEO), the <strong>AuraWorks Identity Bridge</strong>, and bespoke industrial tools as specified in the applicable Service Order.
                            </p>
                            <p>
                                <strong>Scope of Service:</strong> Deliverables may include custom Next.js web application deployment, semantic entity schema engineering, real-time juristic visitor de-anonymization, weekly lead reporting dispatches, and custom API/CRM integrations. Clients are responsible for maintaining the confidentiality of their account credentials and API access tokens.
                            </p>
                        </div>
                    </section>

                    {/* Section 2: Financials */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <CreditCard className="text-primary h-6 w-6" /> 02. Fees & Commercial Commitment
                        </h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-relaxed border-l border-primary/20 pl-6">
                            <p>
                                <strong>Custom Scope & Quotations:</strong> All service fees, project milestones, and retainer schedules are defined in the Client&apos;s executed Service Order or quotation. Invoices are payable within the agreed terms specified on the invoice. Failure to meet payment schedules may result in temporary suspension of active software services and telemetry pipelines following 14 days written notice.
                            </p>
                            <p>
                                <strong>Refund Policy:</strong> Due to the dedicated engineering hours, bespoke technical schema architecture, and software configurations required for deployment, initial setup and sprint fees are non-refundable once technical work has commenced.
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
                                <strong>AuraWorks Property:</strong> All underlying proprietary algorithms, edge tracking libraries (including aura.js), juristic resolution engines, and backend APIs remain the exclusive intellectual property of AuraWorks (Pty) Ltd.
                            </p>
                            <p>
                                <strong>Client Data Ownership:</strong> The Client retains full and exclusive ownership of all proprietary business content, branding assets, and commercial lead data captured during an active engagement.
                            </p>
                        </div>
                    </section>

                    {/* Section 4: Acceptable Use */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <ShieldAlert className="text-primary h-6 w-6" /> 04. Operational Constraints
                        </h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-relaxed border-l border-primary/20 pl-6">
                            <p>Clients agree to the following operational standards:</p>
                            <ul className="list-disc space-y-2 pl-4">
                                <li>No reverse-engineering, decompiling, or automated scraping of AuraWorks proprietary scripts or endpoints.</li>
                                <li>No utilizing AuraWorks software telemetry to construct a competing identity resolution service.</li>
                                <li>All sales communications and outreach conducted using unmasked corporate entity data must adhere to POPIA and relevant communication regulations.</li>
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
                            <Construction className="text-primary h-6 w-6" /> 06. Service Levels & Support
                        </h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-relaxed border-l border-primary/20 pl-6">
                            <p>
                                <strong>Uptime:</strong> AuraWorks maintains a 99.9% target uptime for hosted edge scripts and telemetry endpoints. Scheduled maintenance windows are communicated in advance and conducted outside of standard business hours.
                            </p>
                            <p>
                                <strong>Support Desk:</strong> Active clients receive direct technical support via email at <a href="mailto:contact@auraworks.co.za" className="text-primary hover:underline">contact@auraworks.co.za</a> with a targeted 24-hour response time during South African standard business hours (SAST).
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
                                Either party may terminate an engagement for cause if a material breach remains uncured for 30 days following written notice. Ongoing retainers may be canceled in accordance with the notice period specified in the signed Service Order. Survival clauses regarding Limitation of Liability, Confidentiality, and Proprietary Rights remain in effect post-termination.
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
