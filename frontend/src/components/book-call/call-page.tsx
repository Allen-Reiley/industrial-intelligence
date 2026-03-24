// @/app/book-call/page.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroHeader } from '@/components/hero-sec/header/header'

const benefits = [
    {
        title: "15-Minute Discovery",
        desc: "A brief technical overview of how we identify your anonymous traffic.",
        icon: <Clock className="h-5 w-5 text-primary" />
    },
    {
        title: "Systems Review",
        desc: "We analyze your current site traffic to see if you're a fit for the 100-client cohort.",
        icon: <Zap className="h-5 w-5 text-primary" />
    },
    {
        title: "Privacy First",
        desc: "A look at our Identity Bridge and how we stay POPIA compliant.",
        icon: <ShieldCheck className="h-5 w-5 text-primary" />
    }
]

export default function BookCallPage() {
    return <>
        
        <main className="min-h-screen bg-background">
            {/* Minimal Header specifically for this page */}
            <nav className="p-6">
                <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </nav>

            <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 lg:flex lg:gap-x-12 lg:px-8">
                {/* Left Column: Context & Authority */}
                <div className="flex-1 lg:max-w-md">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        Schedule a Strategy Session
                    </h1>
                    <p className="mt-6 text-lg text-muted-foreground">
                        Let's discuss how AuraWorks can bridge the gap between your website visitors and your sales team's inbox.
                    </p>

                    <div className="mt-12 space-y-8">
                        {benefits.map((item, idx) => (
                            <div key={idx} className="flex gap-x-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 rounded-2xl border bg-muted/30 p-6">
                        <div className="flex items-center gap-x-2 text-sm font-medium text-primary">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Current Cohort Status: 12/100 Seats Filled</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: The Scheduler */}
                <div className="mt-16 flex-1 lg:mt-0">
                    <div className="relative h-[650px] w-full overflow-hidden rounded-2xl border bg-card shadow-2xl">
                        {/* REPLACE THE SRC BELOW WITH YOUR CALENDLY OR CAL.COM LINK 
                            Or use a placeholder div if you haven't set one up yet.
                        */}
                        <iframe
                            src="https://calendly.com/auraworks221/30min"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            title="Schedule a Call"
                            className="bg-white dark:bg-zinc-900"
                        ></iframe>
                        
                        {/* Loader Overlay (Optional) */}
                        <div className="absolute inset-0 -z-10 flex items-center justify-center bg-muted">
                            <span className="text-sm text-muted-foreground">Loading Scheduler...</span>
                        </div>
                    </div>
                    
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        Prefer email? <Link href="mailto:reitumetse@auraworks.co.za" className="text-primary hover:underline">reitumetse@auraworks.co.za</Link>
                    </p>
                </div>
            </div>
        </main>
    </>
}