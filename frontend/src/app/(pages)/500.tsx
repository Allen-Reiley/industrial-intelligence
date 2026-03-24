// @/pages/500.tsx
import React from 'react'
import { ServerCrash, ArrowLeft, ShieldAlert, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function GlobalError500() {
    return (
        <main className="relative min-h-screen flex items-center justify-center bg-background px-6 py-12 overflow-hidden font-sans">
            {/* Background Atmosphere - Consistent with your Get Started page */}
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-full opacity-20 [background:radial-gradient(50%_50%_at_50%_50%_var(--color-primary)_0%,transparent_100%)] blur-3xl" />
            </div>

            <div className="w-full max-w-md text-center">
                {/* Visual Indicator */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl border bg-card/50 backdrop-blur-sm mb-8 shadow-2xl">
                    <ServerCrash className="h-10 w-10 text-primary animate-pulse" />
                </div>

                {/* Typography Block */}
                <div className="space-y-4 mb-10">
                    <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold text-primary/60">
                            Status Code: 500
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">System Interruption</h1>
                    <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
                        Our infrastructure encountered an unexpected bottleneck. Engineers have been notified to re-establish the pipeline.
                    </p>
                </div>

                {/* Action Interface */}
                <div className="flex flex-col gap-3">
                    <Button 
                        onClick={() => window.location.reload()} 
                        variant="default" 
                        className="rounded-xl font-bold py-6 shadow-xl shadow-primary/10 group"
                    >
                        <RefreshCw className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
                        Re-initialize Connection
                    </Button>

                    <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground rounded-xl">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
                        </Link>
                    </Button>
                </div>

                {/* Technical Footer */}
                <div className="mt-16 flex items-center justify-center gap-4 text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground/30">
                    <div className="flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> AuraWorks Security Protocol
                    </div>
                    <span className="opacity-20">|</span>
                    <div>Nodes: Stable</div>
                </div>
            </div>
        </main>
    )
}