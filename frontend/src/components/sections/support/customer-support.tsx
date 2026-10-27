// @/app/support/page.tsx
'use client'

import React, { useState } from 'react'
import { 
    Clock, Globe, ShieldCheck, ArrowLeft, Mail, Send, CheckCircle2 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TextEffect } from '@/components/ui/text-effect'
import Link from 'next/link'

export default function SupportPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')

    const handleDirectEmail = (e: React.FormEvent) => {
        e.preventDefault()
        const mailtoUrl = `mailto:contact@auraworks.co.za?subject=${encodeURIComponent(
            subject ? `[Support] ${subject}` : 'Support Request - AuraWorks'
        )}&body=${encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        )}`
        window.location.href = mailtoUrl
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
                        Customer & Technical Support
                    </TextEffect>
                    <TextEffect
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.5}
                        as="p"
                        className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                        Direct access to our engineering team for search indexing health, structured entity schemas, web infrastructure, and aura.js lead intelligence telemetry.
                    </TextEffect>
                </div>

                {/* Status / Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
                    {[
                        { 
                            icon: <Clock className="h-5 w-5" />, 
                            title: "Response Time", 
                            desc: "Direct engineering support with response within one business day during standard SAST hours." 
                        },
                        { 
                            icon: <Globe className="h-5 w-5" />, 
                            title: "Industrial Coverage", 
                            desc: "Dedicated support for industrial partners across South Africa and the SADC corridor." 
                        },
                        { 
                            icon: <ShieldCheck className="h-5 w-5" />, 
                            title: "Data Security", 
                            desc: "POPIA-compliant juristic data handling and confidential commercial communications." 
                        }
                    ].map((card, i) => (
                        <div key={i} className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm">
                            <div className="text-primary mb-3">{card.icon}</div>
                            <h3 className="font-bold text-sm uppercase tracking-wider mb-2">{card.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Transmission Form / Direct Mailto Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-3 uppercase tracking-widest border-l-2 border-primary pl-4">
                            01. Direct Communication Channel
                        </h2>
                        <a 
                            href="mailto:contact@auraworks.co.za" 
                            className="text-xs font-mono text-primary hover:underline flex items-center gap-1.5"
                        >
                            <Mail className="h-3.5 w-3.5" />
                            contact@auraworks.co.za
                        </a>
                    </div>

                    <div className="p-8 md:p-10 rounded-2xl border bg-card/50 backdrop-blur-sm shadow-xl">
                        <form onSubmit={handleDirectEmail} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Your Name</Label>
                                    <Input 
                                        required 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Full Name" 
                                        className="rounded-xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Company / Work Email</Label>
                                    <Input 
                                        required 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.co.za" 
                                        className="rounded-xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Subject / Technical Area</Label>
                                <Input 
                                    required 
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Technical SEO, schema update, telemetry integration, custom tool request" 
                                    className="rounded-xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20" 
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Message Brief</Label>
                                <Textarea 
                                    required 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe your technical inquiry or operational requirement..." 
                                    className="min-h-[140px] rounded-xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 resize-none" 
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <Button 
                                    type="submit"
                                    className="flex-1 rounded-xl py-6 font-bold shadow-xl shadow-primary/10 group"
                                >
                                    Open Email Client <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                                <Button 
                                    type="button"
                                    variant="outline"
                                    asChild
                                    className="rounded-xl py-6 font-semibold"
                                >
                                    <a href="mailto:contact@auraworks.co.za">
                                        <Mail className="mr-2 h-4 w-4" />
                                        contact@auraworks.co.za
                                    </a>
                                </Button>
                            </div>

                            <div className="pt-2 flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest font-bold text-muted-foreground/50">
                                <ShieldCheck className="h-3 w-3 text-primary" /> POPIA-Compliant & Confidential
                            </div>
                        </form>
                    </div>
                </section>

                {/* Footer Signature */}
                <div className="mt-32 pt-8 border-t border-primary/10 flex flex-col items-center gap-4 text-center">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground/40">
                        AuraWorks (Pty) Ltd — Systems Architect <br/> 
                        <span className="opacity-70 text-[8px]">TECHNICAL OPERATIONS & CLIENT DESK © 2026</span>
                    </div>
                </div>
            </div>
        </main>
    )
}
