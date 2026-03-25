// @/app/cookies/page.tsx
'use client'

import React from 'react'
import { 
    Cookie, ShieldCheck, Fingerprint, BarChart3, 
    Settings2, ArrowLeft, Info, Globe, ShieldQuestion 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CookieConsentPage() {
    return (
        <main className="relative min-h-screen bg-background px-6 py-20 overflow-hidden font-sans">
            {/* Ambient Background */}
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-full max-w-5xl h-full opacity-10 [background:radial-gradient(50%_50%_at_80%_20%,var(--color-primary)_0%,transparent_100%)] blur-3xl" />
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-16">
                    <Button variant="ghost" asChild className="-ml-2 mb-8 text-muted-foreground hover:text-foreground">
                        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Operations</Link>
                    </Button>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold text-primary">
                            Data Infrastructure
                        </span>
                        <span className="h-[1px] w-12 bg-primary/20"></span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Cookie & Consent Framework
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tighter italic mb-6">Tracking Protocols</h1>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                        AuraWorks utilizes specialized beacons to bridge the gap between anonymous traffic and industrial sales intelligence.
                    </p>
                </div>

                {/* Section 1: The Why */}
                <section className="mb-20">
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-8 uppercase tracking-tight">
                        <Info className="text-primary h-6 w-6" /> 01. Purpose of Tracking
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl border bg-card/50">
                            <ShieldCheck className="h-5 w-5 text-primary mb-4" />
                            <h3 className="font-bold text-sm mb-2">Operational Necessity</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">Maintains secure sessions and authentication states within the AuraWorks Dashboard.</p>
                        </div>
                        <div className="p-6 rounded-2xl border bg-card/50">
                            <Fingerprint className="h-5 w-5 text-primary mb-4" />
                            <h3 className="font-bold text-sm mb-2">Identity Resolution</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">Resolves anonymous corporate signals into actionable high-intent sales intelligence.</p>
                        </div>
                        <div className="p-6 rounded-2xl border bg-card/50">
                            <BarChart3 className="h-5 w-5 text-primary mb-4" />
                            <h3 className="font-bold text-sm mb-2">Sector Analytics</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">Measures engagement from specific industrial sectors like Mining and Construction.</p>
                        </div>
                    </div>
                </section>

                {/* Section 2: Technical Categorization */}
                <section className="mb-20">
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-8 uppercase tracking-tight">
                        <Settings2 className="text-primary h-6 w-6" /> 02. Technical Categorization
                    </h2>
                    <div className="overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-4 font-bold uppercase tracking-widest text-[10px]">Category</th>
                                    <th className="p-4 font-bold uppercase tracking-widest text-[10px]">Function</th>
                                    <th className="p-4 font-bold uppercase tracking-widest text-[10px]">Lifespan</th>
                                </tr>
                            </thead>
                            <tbody className="text-muted-foreground">
                                <tr className="border-b border-white/5">
                                    <td className="p-4 font-bold text-foreground">Essential</td>
                                    <td className="p-4">Required for secure logging and infrastructure integrity.</td>
                                    <td className="p-4">Session</td>
                                </tr>
                                <tr className="border-b border-white/5">
                                    <td className="p-4 font-bold text-foreground">Functional</td>
                                    <td className="p-4">Persistence for Digital Receptionist states.</td>
                                    <td className="p-4">30 Days</td>
                                </tr>
                                <tr className="border-b border-white/5">
                                    <td className="p-4 font-bold text-foreground">Intelligence</td>
                                    <td className="p-4">AuraWorks Tracker. Maps IP signals to Identity Bridge.</td>
                                    <td className="p-4">1 Year</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold text-foreground">Analytics</td>
                                    <td className="p-4">GA4 integration for macro traffic patterns.</td>
                                    <td className="p-4">2 Years</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Section 3: Identity Bridge Compliance */}
                <section className="mb-20 p-8 rounded-3xl border bg-primary/5 border-primary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Fingerprint className="h-24 w-24" />
                    </div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 uppercase tracking-tight relative z-10">
                        <ShieldQuestion className="text-primary h-6 w-6" /> 03. Consent-Led Resolution
                    </h2>
                    <div className="space-y-6 text-sm text-muted-foreground relative z-10 max-w-2xl leading-relaxed">
                        <p>
                            The <strong>AuraWorks Identity Bridge</strong> operates on a dual-layer logic to ensure POPIA compliance:
                        </p>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span><strong>Anonymous Firmographics:</strong> We process technical metadata (IP, User Agent) to identify the visiting <em>Firm</em>. This is non-personal corporate identification.</span>
                            </li>
                            <li className="flex gap-3">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span><strong>Personal Resolution:</strong> Individual professional data (LinkedIn/Email) is only resolved if the visitor interacts with a consent-gathering element, such as our Digital Receptionist or &quot;Request Access&quot; button.</span>
                            </li>
                        </ul>
                        <p className="italic text-xs pt-4 border-t border-primary/10">
                            We respect &quot;Do Not Track&quot; (DNT) browser signals. If active, the Identity Bridge will default to restricted mode.
                        </p>
                    </div>
                </section>

                {/* Section 4: Beacons & Control */}
                <section className="space-y-16">
                    <div>
                        <h2 className="text-xl font-bold mb-4 uppercase tracking-tight">Third-Party Beacons</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl border-l border-primary/20 pl-6">
                            AuraWorks utilizes trusted partners including Vercel and Google Analytics to verify professional data. These entities may deploy their own cookies to monitor professional interests within the B2B industrial ecosystem.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-4 uppercase tracking-tight">Managing Your Preferences</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold">Browser Control</h4>
                                <p className="text-xs text-muted-foreground">You can reset or block cookies via your browser settings (Chrome, Edge, Safari). Disabling essential cookies may result in platform instability.</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold">AuraWorks Global Opt-Out</h4>
                                <Button variant="outline" className="w-full rounded-xl text-xs uppercase tracking-widest font-bold border-primary/20 hover:bg-primary/5">
                                    Trigger No-Track Cookie
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Signature */}
                <div className="mt-32 pt-8 border-t border-primary/10 flex flex-col items-center gap-4">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground/40 text-center">
                        AuraWorks (Pty) Ltd — Systems Architect <br/> 
                        <span className="opacity-50">Identity Bridge Protocol v2.0</span>
                    </div>
                </div>
            </div>
        </main>
    )
}