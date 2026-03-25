// @/app/privacy/page.tsx
'use client'

import React from 'react'
import { 
    ShieldCheck, Eye, Lock, FileText, 
    ArrowLeft, Mail, Scale, Database, Globe 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
    const lastUpdated = "March 2026"

    return (
        <main className="relative min-h-screen bg-background px-6 py-20 overflow-hidden font-sans">
            {/* Ambient Background */}
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
                            Compliance Framework
                        </span>
                        <span className="h-[1px] w-12 bg-primary/20"></span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Effective: {lastUpdated}
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tighter italic mb-6">Privacy Architecture</h1>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                        AuraWorks (Pty) Ltd operates under a POPIA-first mandate. We prioritize industrial intelligence without compromising individual privacy.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
                    {[
                        { icon: <Eye className="h-5 w-5" />, title: "Collection", desc: "Corporate ID & Consent-led personal data." },
                        { icon: <Scale className="h-5 w-5" />, title: "Usage", desc: "B2B Lead Enrichment & Contractual delivery." },
                        { icon: <Lock className="h-5 w-5" />, title: "Your Rights", desc: "Access, Correction, and Right to be Forgotten." }
                    ].map((card, i) => (
                        <div key={i} className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm">
                            <div className="text-primary mb-3">{card.icon}</div>
                            <h3 className="font-bold text-sm uppercase tracking-wider mb-2">{card.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Policy Content */}
                <div className="space-y-16 prose prose-invert max-w-none">
                    
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                            <ShieldCheck className="text-primary h-6 w-6" /> 01. The Responsible Party
                        </h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-relaxed border-l border-primary/20 pl-6">
                            <p>
                                AuraWorks (Pty) Ltd acts as the <strong>Responsible Party</strong> for data collected via our primary digital touchpoints and as a <strong>Data Processor</strong> when resolving intent data for our institutional clients.
                            </p>
                            <p>
                                Our scope encompasses the <strong>AuraWorks Intent Engine</strong> and the <strong>Consent-Led Identity Bridge</strong>. Our guiding principle is "Privacy by Design"—minimizing collection to only what is necessary for high-value B2B industrial commerce.
                            </p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                            <Database className="text-primary h-6 w-6" /> 02. Data Enrichment & Intelligence
                        </h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-relaxed border-l border-primary/20 pl-6">
                            <p>Our system distinguishes between Personal Information and Corporate Intelligence:</p>
                            <ul className="list-disc space-y-2 pl-4">
                                <li><strong>Standard Data:</strong> Identities provided explicitly via the "Digital Receptionist" or contact infrastructure.</li>
                                <li><strong>Technical Data:</strong> Network identifiers including IP addresses and referral sources.</li>
                                <li><strong>Corporate Resolution:</strong> We resolve technical identifiers into <strong>Corporate Identities</strong> (identifying the firm visiting the site, rather than a private individual) unless specific consent is granted.</li>
                            </ul>
                            <p className="italic text-xs">We use trusted third-party providers via secure FastAPI tunnels to verify corporate data. We never trade your data to third-party brokers.</p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                            <Globe className="text-primary h-6 w-6" /> 03. Legal Basis for Processing
                        </h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-relaxed border-l border-primary/20 pl-6">
                            <p>Under Section 11 of POPIA, we process data based on:</p>
                            <ul className="list-disc space-y-2 pl-4">
                                <li><strong>Consent:</strong> Explicitly obtained via Digital Receptionist interfaces.</li>
                                <li><strong>Legitimate Interest:</strong> Facilitating commerce between industrial suppliers and procurement entities.</li>
                                <li><strong>Contractual Necessity:</strong> To deliver Weekly Hot Lead Reports and active subscription services.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                            <FileText className="text-primary h-6 w-6" /> 04. The "Big Eight" Rights
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            {[
                                "Access to Data", "Correction of Info", "Deletion of Records", "Object to Processing",
                                "Restrict Processing", "Data Portability", "Automated Decision Objection", "File a Complaint"
                            ].map((right, i) => (
                                <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-white/5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    {right}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                            <Mail className="text-primary h-6 w-6" /> 05. Communication Protocols
                        </h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-relaxed border-l border-primary/20 pl-6">
                            <p>
                                All automated nurture sequences include a <strong>one-click unsubscribe</strong> mechanism. We adhere strictly to Section 69 of POPIA regarding electronic marketing.
                            </p>
                            <div className="p-6 mt-8 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                                <p className="text-[10px] uppercase tracking-widest font-bold mb-2">Privacy Officer Contact</p>
                                <a href="mailto:privacy@auraworks.co.za" className="text-primary font-bold hover:underline">
                                    privacy@auraworks.co.za
                                </a>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer Signature */}
                <div className="mt-32 pt-8 border-t border-primary/10 flex flex-col items-center gap-4">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground/40">
                        AuraWorks (Pty) Ltd — Systems Architect
                    </div>
                </div>
            </div>
        </main>
    )
}