// @/app/paia-manual/page.tsx
'use client'

import React from 'react'
import { 
    FileText, ShieldCheck, HardDrive, Share2, 
    Lock, ArrowLeft, Landmark, UserCheck, Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PAIAManualPage() {
    const lastRevised = "March 2026"

    return (
        <main className="relative min-h-screen bg-background px-6 py-20 overflow-hidden font-sans">
            {/* Ambient Background - Professional Slate/Steel Tone */}
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 [background:linear-gradient(to_bottom,var(--color-primary)_0%,transparent_100%)]" />
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-16 border-b border-primary/10 pb-12">
                    <Button variant="ghost" asChild className="-ml-2 mb-8 text-muted-foreground hover:text-foreground">
                        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Operations</Link>
                    </Button>
                    <div className="flex items-center gap-3 mb-4">
                        <Landmark className="h-4 w-4 text-primary" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold text-primary">
                            Statutory Requirement
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tighter italic mb-6 text-foreground">PAIA & POPIA Manual</h1>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                        Prepared in accordance with Section 51 of the Promotion of Access to Information Act (PAIA) and the Protection of Personal Information Act (POPIA).
                    </p>
                    <p className="text-[10px] uppercase tracking-widest font-bold mt-8 text-muted-foreground/60">
                        AuraWorks (Pty) Ltd — Version 1.2 — Updated {lastRevised}
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-20">
                    
                    {/* Section 1: Official Identification */}
                    <section>
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest border-l-2 border-primary pl-4">
                            01. Company Contact Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card/30 p-8 rounded-2xl border">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-primary tracking-widest">Entity Name</label>
                                    <p className="text-sm font-semibold">AuraWorks (Pty) Ltd.</p>
                                </div>
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-primary tracking-widest">Information Officer</label>
                                    <p className="text-sm font-semibold">Reitumetse Sethabela</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-primary tracking-widest">Regional Jurisdiction</label>
                                    <p className="text-sm font-semibold">East Rand, Gauteng, South Africa</p>
                                </div>
                                <div>
                                    <label className="text-[9px] uppercase font-bold text-primary tracking-widest">Regulatory Liaison</label>
                                    <p className="text-sm font-semibold text-primary">legal@auraworks.co.za</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: PAIA Guide */}
                    <section className="prose prose-invert max-w-none">
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-6 uppercase tracking-widest border-l-2 border-primary pl-4">
                            02. The PAIA Guide
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The South African Human Rights Commission (SAHRC) has compiled a guide in terms of Section 10 of PAIA, containing information for any person who wishes to exercise any right contemplated in PAIA. This guide is available for public inspection at our registered offices or on the Information Regulator’s website.
                        </p>
                    </section>

                    {/* Section 3 & 4: Records Inventory */}
                    <section>
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest border-l-2 border-primary pl-4">
                            03. Record Inventory & Disclosure
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-6 rounded-xl border bg-card/50">
                                <h4 className="font-bold mb-4 flex items-center gap-2"><UserCheck className="h-4 w-4 text-primary" /> Voluntary Disclosure</h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>• Public Website Content</li>
                                    <li>• Industrial Marketing Brochures</li>
                                    <li>• Public Service Descriptions</li>
                                </ul>
                            </div>
                            <div className="p-6 rounded-xl border bg-card/50">
                                <h4 className="font-bold mb-4 flex items-center gap-2"><HardDrive className="h-4 w-4 text-primary" /> Formal Records</h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>• Operational PTY Registration</li>
                                    <li>• SLA & Lead Intelligence Reports</li>
                                    <li>• FastAPI Logs & DB Schemas</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: POPIA Processing */}
                    <section className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest">
                            <ShieldCheck className="text-primary h-6 w-6" /> 04. Processing of Personal Information
                        </h2>
                        <div className="space-y-6 text-sm leading-relaxed">
                            <div>
                                <h4 className="font-bold text-foreground mb-2 italic">Purpose of Processing:</h4>
                                <p className="text-muted-foreground">To provide industrial-sector sales intelligence and identity resolution services for B2B procurement and supply chain optimization.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground mb-2 italic">Trans-border Data Flows:</h4>
                                <p className="text-muted-foreground">Data may be processed on secure infrastructure located in the EU or USA via our hosting partners (Vercel/AWS), governed by standard contractual clauses ensuring POPIA-equivalent protection.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 6: Information Security */}
                    <section>
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest border-l-2 border-primary pl-4">
                            05. Security Architecture
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: <Lock />, text: "SSL/TLS Encryption" },
                                { icon: <Share2 />, text: "Role-Based DB Access" },
                                { icon: <FileText />, text: "FastAPI Security Audits" }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center justify-center p-6 text-center rounded-xl border bg-card/20">
                                    <div className="text-primary mb-3">{item.icon}</div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 7: Access Request */}
                    <section className="border-t border-primary/10 pt-16">
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-6 uppercase tracking-widest border-l-2 border-primary pl-4">
                            06. Requesting Access
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                            Requests for access to records must be made using the prescribed <strong>Form 2</strong>. A request fee may be applicable as determined by the Information Regulator. We will respond to all valid requests within 30 days.
                        </p>
                        <Button variant="outline" className="rounded-xl font-bold tracking-widest text-[10px] uppercase h-12 border-primary/30 hover:bg-primary/5 transition-all">
                            <Mail className="mr-2 h-4 w-4" /> Download Form 2 (Request for Access)
                        </Button>
                    </section>

                </div>

                {/* Footer Signature */}
                <div className="mt-32 pt-8 border-t border-primary/10 flex flex-col items-center gap-4 text-center">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground/30">
                        AuraWorks (Pty) Ltd <br/> 
                        <span className="opacity-60 text-[8px]">Information Officer: Reitumetse Sethabela — East Rand, Gauteng</span>
                    </div>
                </div>
            </div>
        </main>
    )
}