// @/app/support/page.tsx
'use client'

import React, { useState } from 'react'
import { 
    Clock, Globe, ShieldCheck, ArrowLeft, Send, Loader2 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TextEffect } from '@/components/ui/text-effect'
import Link from 'next/link'

export default function SupportPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSupportSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setTimeout(() => {
            setIsSubmitting(false)
            alert("Uplink established. A technical lead will respond shortly.")
        }, 1500)
    }

    return (
        <main className="relative min-h-screen bg-background px-6 py-20 overflow-hidden font-sans">
            {/* Ambient Background */}
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-full max-w-5xl h-full opacity-10 [background:radial-gradient(50%_50%_at_80%_20%,var(--color-primary)_0%,transparent_100%)] blur-3xl" />
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-16 border-b border-primary/10 pb-12">
                    <Button variant="ghost" asChild className="-ml-2 mb-8 text-muted-foreground hover:text-foreground">
                        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Operations</Link>
                    </Button>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold text-primary">
                            Support Architecture
                        </span>
                        <span className="h-[1px] w-12 bg-primary/20"></span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Client Technical Desk
                        </span>
                    </div>
                    <TextEffect
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        as="h1"
                        className="text-5xl font-bold tracking-tighter italic mb-6">
                        Support Uplink
                    </TextEffect>
                    <TextEffect
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.5}
                        as="p"
                        className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                        Direct access to our technical infrastructure team for search indexing health, structured entity schemas, edge tracking script integration, and Monday lead delivery.
                    </TextEffect>
                </div>

                {/* Status / Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
                    {[
                        { icon: <Clock className="h-5 w-5" />, title: "Response Latency", desc: "Current average response under 120 minutes during business hours." },
                        { icon: <Globe className="h-5 w-5" />, title: "Regional Coverage", desc: "Active support for Gauteng, Mpumalanga, KZN, and SADC corridors." },
                        { icon: <ShieldCheck className="h-5 w-5" />, title: "Data Security", desc: "End-to-end encrypted telemetry and POPIA-compliant communications." }
                    ].map((card, i) => (
                        <div key={i} className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm">
                            <div className="text-primary mb-3">{card.icon}</div>
                            <h3 className="font-bold text-sm uppercase tracking-wider mb-2">{card.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Transmission Form Section */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-3 mb-8 uppercase tracking-widest border-l-2 border-primary pl-4">
                        01. Open Technical Transmission
                    </h2>
                    <div className="p-8 md:p-10 rounded-2xl border bg-card/50 backdrop-blur-sm shadow-xl">
                        <form onSubmit={handleSupportSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Identity</Label>
                                    <Input required placeholder="Your Name" className="rounded-xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Terminal Email</Label>
                                    <Input required type="email" placeholder="name@company.co.za" className="rounded-xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Transmission Brief</Label>
                                <Textarea 
                                    required 
                                    placeholder="Describe the technical requirement (e.g., structured data verification, edge script telemetry, CRM sync)..." 
                                    className="min-h-[140px] rounded-xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 resize-none" 
                                />
                            </div>

                            <Button 
                                disabled={isSubmitting} 
                                className="w-full rounded-xl py-6 font-bold shadow-xl shadow-primary/10 group"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <>
                                        Establish Connection <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </Button>

                            <div className="pt-2 flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest font-bold text-muted-foreground/40">
                                <ShieldCheck className="h-3 w-3" /> End-to-End Encrypted Tunnel
                            </div>
                        </form>
                    </div>
                </section>

                {/* Footer Signature */}
                <div className="mt-32 pt-8 border-t border-primary/10 flex flex-col items-center gap-4 text-center">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground/30">
                        AuraWorks (Pty) Ltd — Systems Architect <br/> 
                        <span className="opacity-60 text-[8px]">TECHNICAL OPERATIONS & CLIENT DESK © 2026</span>
                    </div>
                </div>
            </div>
        </main>
    )
}