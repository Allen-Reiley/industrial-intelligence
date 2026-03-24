// @/app/thank-you/page.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircle2, Share2, ArrowRight, LinkedIn, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ThankYouPage() {
    // Custom share text for LinkedIn
    const shareText = encodeURIComponent(
        "I just joined the waitlist for AuraWorks. They're building an Identity Bridge for B2B industrial sales. Check it out: https://auraworks.co.za"
    );

    return (
        <main className="relative min-h-screen flex items-center justify-center bg-background px-6 py-12">
            {/* Background Decorations */}
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full opacity-20 [background:radial-gradient(50%_50%_at_50%_50%,var(--color-primary)_0%,transparent_100%)] blur-3xl" />
            </div>

            <div className="w-full max-w-2xl text-center">
                {/* Success Icon */}
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                    <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Application Received.
                </h1>
                
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                    Thank you for applying to the AuraWorks Beta. We are currently vetting 
                    applications to ensure every partner in our <strong>initial 100-client cohort</strong> 
                    receives maximum ROI from the Identity Bridge.
                </p>

                <div className="mt-12 grid gap-6 sm:grid-cols-2">
                    {/* Status Card */}
                    <div className="rounded-2xl border bg-muted/30 p-6 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Current Status</span>
                        <h3 className="mt-2 text-xl font-semibold">Vetting in Progress</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            You will receive a confirmation email once your domain has been cleared for the pilot.
                        </p>
                    </div>

                    {/* Action Card */}
                    <div className="rounded-2xl border bg-muted/30 p-6 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Priority Access</span>
                        <h3 className="mt-2 text-xl font-semibold">Jump the Queue</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Sharing your interest helps us prioritize industries with the highest demand.
                        </p>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button 
                        asChild
                        size="lg" 
                        className="rounded-xl px-8 shadow-xl shadow-primary/20 w-full sm:w-auto"
                    >
                        <Link 
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=https://auraworks.co.za&text=${shareText}`}
                            target="_blank"
                        >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share on LinkedIn
                        </Link>
                    </Button>

                    <Button 
                        variant="ghost" 
                        asChild 
                        size="lg" 
                        className="rounded-xl px-8 w-full sm:w-auto"
                    >
                        <Link href="/">
                            Return to Site
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <p className="mt-12 text-xs text-muted-foreground font-medium uppercase tracking-widest">
                    AuraWorks (Pty) Ltd — Systems Architect
                </p>
            </div>
        </main>
    )
}