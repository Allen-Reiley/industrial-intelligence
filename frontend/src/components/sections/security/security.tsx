// @/app/security/page.tsx
'use client'

import React from 'react'
import { 
    ShieldCheck, Lock, Server, Terminal, 
    Zap, EyeOff, Activity, ShieldAlert, ArrowLeft, Cpu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SecurityPage() {
    return (
        <main className="relative min-h-screen bg-background px-6 py-20 overflow-hidden font-sans">
            {/* Ambient Background - Deep "Safe" Blue Radial */}
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 [background:radial-gradient(circle_at_50%_10%,var(--color-primary)_0%,transparent_80%)] blur-3xl" />
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-16 border-b border-primary/10 pb-12 text-center md:text-left">
                    <Button variant="ghost" asChild className="-ml-2 mb-8 text-muted-foreground hover:text-foreground">
                        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Operations</Link>
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] font-bold text-primary">
                                Enterprise-Grade Security
                            </span>
                        </div>
                        <span className="hidden md:block h-px w-8 bg-muted-foreground/20"></span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                            Infrastructure v1.1
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tighter italic mb-6">Security Architecture</h1>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                        AuraWorks (Pty) Ltd maintains a &quot;Security by Design&quot; mandate. Our infrastructure is built to protect the industrial lead intelligence of the South African B2B ecosystem.
                    </p>
                </div>

                {/* Main Security Grid */}
                <div className="space-y-24">
                    
                    {/* Section 1: Encryption */}
                    <section>
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest border-l-2 border-primary pl-4">
                            01. Data Encryption Standards
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6">
                            <div className="p-6 rounded-2xl border bg-card/50">
                                <Activity className="h-5 w-5 text-primary mb-4" />
                                <h3 className="font-bold text-sm mb-2">In Transit</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    All data moving between the AuraWorks Tracker and our FastAPI backend is encrypted using <strong>TLS 1.3 (SSL)</strong>, ensuring zero-interception of intelligence.
                                </p>
                            </div>
                            <div className="p-6 rounded-2xl border bg-card/50">
                                <Lock className="h-5 w-5 text-primary mb-4" />
                                <h3 className="font-bold text-sm mb-2">At Rest</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Our PostgreSQL databases utilize <strong>AES-256 industrial-grade encryption</strong>. Managed keys ensure that data remains unreadable even if physical storage is compromised.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Hosting & Infrastructure */}
                    <section>
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest border-l-2 border-primary pl-4">
                            02. Global Infrastructure
                        </h2>
                        <div className="bg-muted/30 p-8 rounded-3xl border flex flex-col md:flex-row gap-8 items-start">
                            <Server className="h-8 w-8 text-primary shrink-0" />
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Hosted on <strong>Vercel and AWS</strong> (Cape Town / Dublin regions), leveraging world-class physical security and multi-layered DDoS protection.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {['Isolated Staging', 'Prod-Only Data', 'Automated Backups'].map((tag, i) => (
                                        <span key={i} className="px-3 py-1 rounded-md bg-background border border-white/5 text-[9px] uppercase font-bold tracking-widest text-muted-foreground">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Identity Bridge Logic */}
                    <section>
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest border-l-2 border-primary pl-4">
                            03. The Tracker Protocol
                        </h2>
                        <div className="space-y-6 pl-6">
                            <div className="flex gap-4">
                                <Zap className="h-5 w-5 text-primary shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-sm mb-1">Non-Blocking Performance</h4>
                                    <p className="text-xs text-muted-foreground">The AuraWorks tracker loads asynchronously, ensuring zero impact on the &quot;Core Web Vitals&quot; or page load speed of the client&apos;s site.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <EyeOff className="h-5 w-5 text-primary shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-sm mb-1">Scoped DOM Access</h4>
                                    <p className="text-xs text-muted-foreground">Our script is &quot;Read-Only.&quot; It cannot access passwords, credit card fields, or sensitive PII unless explicitly mapped for the Consent-Led Digital Receptionist.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 4 & 5: Access & Compliance */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pl-6">
                        <div className="p-8 rounded-3xl border border-primary/10 bg-primary/5">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 tracking-tight"><Terminal className="h-5 w-5 text-primary" /> API Security</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Every request to our FastAPI backend is authenticated via a unique <strong>Organization ID</strong> and <strong>CORS Policy</strong>, ensuring only authorized domains can push data to your account.
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl border border-primary/10 bg-primary/5">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 tracking-tight"><ShieldAlert className="h-5 w-5 text-primary" /> POPIA Alignment</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Our security controls are mapped to the Protection of Personal Information Act. We maintain internal audit logs of all administrative access to ensure 100% traceability.
                            </p>
                        </div>
                    </section>

                    {/* Section 6: Vulnerability Management */}
                    <section className="border-t border-primary/10 pt-16">
                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="text-center md:text-left space-y-4">
                                <h2 className="text-xl font-bold uppercase tracking-widest">Continuous Vigilance</h2>
                                <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                                    We perform automated dependency scanning for all Python (FastAPI) and Next.js libraries. In the event of a suspected breach, AuraWorks maintains a <strong>24-hour incident response protocol</strong> as required by POPIA.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                <div className="p-4 rounded-xl border bg-card/20 text-center">
                                    <div className="text-primary font-bold text-lg mb-1 italic">99.9%</div>
                                    <div className="text-[8px] uppercase tracking-widest font-bold">Uptime Target</div>
                                </div>
                                <div className="p-4 rounded-xl border bg-card/20 text-center">
                                    <div className="text-primary font-bold text-lg mb-1 italic">24h</div>
                                    <div className="text-[8px] uppercase tracking-widest font-bold">Response SLO</div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer Signature */}
                <div className="mt-32 pt-8 border-t border-primary/10 flex flex-col items-center gap-4 text-center">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground/40">
                        AuraWorks (Pty) Ltd — Systems Architect <br/> 
                        <span className="opacity-60 text-[8px]">SECURED BY FASTAPI & POSTGRESQL ENCRYPTION</span>
                    </div>
                </div>
            </div>
        </main>
    )
}