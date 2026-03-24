// @/app/thank-you/page.tsx
'use client'

import React from 'react'
import Link from 'next/link'
// Lucide-react typically uses 'Linkedin' (lowercase 'd') in the latest stable builds
import { CheckCircle2, Linkedin, ArrowRight } from 'lucide-react' 
import { Button } from '@/components/ui/button'

export default function ThankYouPage() {
    const shareText = encodeURIComponent(
        "I just joined the waitlist for AuraWorks. They're building an Identity Bridge for B2B industrial sales. Check it out: https://auraworks.co.za"
    );

    return (
        <main className="relative min-h-screen flex items-center justify-center bg-background px-6 py-12 overflow-hidden">
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full opacity-20 [background:radial-gradient(50%_50%_at_50%_50%,var(--color-primary)_0%,transparent_100%)] blur-3xl" />
            </div>

            <div className="w-full max-w-2xl text-center">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                    <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl italic">
                    Application Received.
                </h1>
                
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                    Thank you for applying to the AuraWorks Beta. We are currently vetting 
                    applications to ensure every partner in our <strong>initial 100-client cohort</strong> 
                    receives maximum ROI from the Identity Bridge.
                </p>

                <div className="mt-12 grid gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-muted/30 p-6 text-left border-primary/10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Current Status</span>
                        <h3 className="mt-2 text-xl font-semibold">Vetting in Progress</h3>
                        <p className="mt-1 text-sm text-muted-foreground italic">
                            Domain verification active.
                        </p>
                    </div>

                    <div className="rounded-2xl border bg-muted/30 p-6 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Priority Access</span>
                        <h3 className="mt-2 text-xl font-semibold">Jump the Queue</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Sharing interest accelerates sector prioritization.
                        </p>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button 
                        asChild
                        size="lg" 
                        className="rounded-xl px-8 shadow-xl shadow-primary/20 w-full sm:w-auto font-bold"
                    >
                        <Link 
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=https://auraworks.co.za&text=${shareText}`}
                            target="_blank"
                        >
                            <Linkedin className="mr-2 h-4 w-4" />
                            Share on LinkedIn
                        </Link>
                    </Button>

                    <Button 
                        variant="ghost" 
                        asChild 
                        size="lg" 
                        className="rounded-xl px-8 w-full sm:w-auto text-muted-foreground hover:text-foreground font-bold"
                    >
                        <Link href="/">
                            Return to Site
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="mt-16 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground/30">
                    AuraWorks (Pty) Ltd <span className="opacity-20">/</span> Systems Architect
                </div>
            </div>
        </main>
    )
}