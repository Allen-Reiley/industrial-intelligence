// @/app/support/page.tsx
'use client'

import React, { useState } from 'react'
import { 
    LifeBuoy, MessageSquare, Mail, ShieldCheck, 
    ArrowLeft, Send, Loader2, Clock, Globe 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

export default function SupportPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSupportSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        // Logic for PostgreSQL or Support Ticket API
        setTimeout(() => {
            setIsSubmitting(false)
            alert("Uplink established. A technical lead will respond shortly.")
        }, 1500)
    }

    return (
        <main className="relative min-h-screen flex items-center justify-center bg-background px-6 py-12 overflow-hidden">
            {/* Ambient Background */}
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-full max-w-3xl h-full opacity-20 [background:radial-gradient(50%_50%_at_80%_20%_var(--color-primary)_0%,transparent_100%)] blur-3xl" />
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Left Column: Context & Status */}
                <div className="space-y-8">
                    <div>
                        <Button variant="ghost" asChild className="-ml-2 mb-6 text-muted-foreground hover:text-foreground">
                            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Operations</Link>
                        </Button>
                        <h1 className="text-5xl font-bold tracking-tighter mb-4 italic">Support Uplink</h1>
                        <p className="text-muted-foreground leading-relaxed max-w-sm">
                            Direct access to our technical infrastructure team. Priority response for 100-partner cohort members.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <div className="flex items-start gap-4 p-4 rounded-2xl border bg-card/50 backdrop-blur-sm">
                            <Clock className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-wider">Response Latency</h3>
                                <p className="text-xs text-muted-foreground italic">Current Average: &lt; 120 Minutes</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl border bg-card/50 backdrop-blur-sm">
                            <Globe className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-wider">Global Nodes</h3>
                                <p className="text-xs text-muted-foreground italic">Support active in Gauteng / East Rand</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Transmission Form */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-transparent rounded-[2rem] blur opacity-25" />
                    <div className="relative border bg-card/80 backdrop-blur-md rounded-[2rem] p-8 md:p-10 shadow-2xl">
                        <form onSubmit={handleSupportSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Identity</Label>
                                <Input required placeholder="Your Name" className="rounded-xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Terminal Email</Label>
                                <Input required type="email" placeholder="name@company.co.za" className="rounded-xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Transmission Brief</Label>
                                <Textarea 
                                    required 
                                    placeholder="Describe the technical requirement..." 
                                    className="min-h-[120px] rounded-xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 resize-none" 
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

                            <div className="pt-4 flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest font-bold text-muted-foreground/40">
                                <ShieldCheck className="h-3 w-3" /> End-to-End Encrypted Tunnel
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    )
}