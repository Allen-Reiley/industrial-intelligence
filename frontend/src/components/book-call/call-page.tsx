// @/app/book-call/page.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextEffect } from '@/components/ui/text-effect'

const benefits = [
    {
        title: "15-Minute Technical Discovery",
        desc: "An architectural overview of your search rankings, AI citability potential, and corporate traffic resolution.",
        icon: <Clock className="h-5 w-5 text-primary" />
    },
    {
        title: "Discoverability & Pipeline Audit",
        desc: "We analyze your web assets to evaluate organic demand, competitor positioning, and visitor capture readiness.",
        icon: <Zap className="h-5 w-5 text-primary" />
    },
    {
        title: "Privacy & POPIA First",
        desc: "A walkthrough of our juristic-only data resolution architecture under South African privacy law.",
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
                    <TextEffect
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        as="h1"
                        className="text-4xl font-bold tracking-tight sm:text-5xl">
                        Schedule a Strategy Session
                    </TextEffect>
                    <TextEffect
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.5}
                        as="p"
                        className="mt-6 text-lg text-muted-foreground leading-relaxed">
                        {"Let's discuss how AuraWorks can position your business across Google and AI search engines, while converting anonymous corporate visitors into qualified pipeline."}
                    </TextEffect>

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
                            className="bg-white"
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