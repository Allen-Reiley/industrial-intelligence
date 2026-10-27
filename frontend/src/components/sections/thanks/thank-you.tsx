// @/app/thank-you/page.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react' 
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
                    Thank you for contacting AuraWorks. Our technical solutions team is reviewing your requirements 
                    to prepare your tailored industrial discoverability and de-anonymization scope.
                </p>

                <div className="mt-12 grid gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-muted/30 p-6 text-left border-primary/10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Current Status</span>
                        <h3 className="mt-2 text-xl font-semibold">Review in Progress</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            A solutions engineer will reach out within 1 business day.
                        </p>
                    </div>

                    <div className="rounded-2xl border bg-muted/30 p-6 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Next Step</span>
                        <h3 className="mt-2 text-xl font-semibold">Technical Discovery</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            We review your search visibility, CAD assets, and telemetry fit.
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
                            <svg className="mr-2 h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"></path>
                            </svg>
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