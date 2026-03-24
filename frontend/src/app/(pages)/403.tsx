// @/pages/403.tsx
import React from 'react'
import { ShieldAlert, Lock, ArrowLeft, Home, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Forbidden403() {
    return (
        <main className="relative min-h-screen flex items-center justify-center bg-background px-6 py-12 overflow-hidden font-sans">
            {/* Background Atmosphere - Subtly more "restricted" (slightly darker/redder hue if desired, or keep your primary) */}
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-full opacity-15 [background:radial-gradient(50%_50%_at_50%_50%_var(--color-primary)_0%,transparent_100%)] blur-3xl" />
            </div>

            <div className="w-full max-w-md text-center">
                {/* Visual Indicator - Shield/Lock Combo */}
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
                    <div className="relative z-10 flex items-center justify-center w-20 h-20 rounded-3xl border bg-card/50 backdrop-blur-sm shadow-2xl">
                        <Lock className="h-9 w-9 text-primary" />
                    </div>
                </div>

                {/* Typography Block */}
                <div className="space-y-4 mb-10">
                    <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold text-primary/60">
                            Protocol 403
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight italic">Access Restricted</h1>
                    <p className="text-muted-foreground text-sm max-w-[300px] mx-auto leading-relaxed">
                        Your current credentials do not have the required clearance to access this sector of the lead generation engine.
                    </p>
                </div>

                {/* Action Interface */}
                <div className="flex flex-col gap-3">
                    <Button 
                        asChild
                        variant="default" 
                        className="rounded-xl font-bold py-6 shadow-xl shadow-primary/10 transition-all hover:scale-[1.02]"
                    >
                        <Link href="/get-started">
                            <Key className="mr-2 h-4 w-4" /> Request Elevated Access
                        </Link>
                    </Button>

                    <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground rounded-xl">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Perimeter
                        </Link>
                    </Button>
                </div>

                {/* Technical Security Footer */}
                <div className="mt-16 flex flex-col items-center gap-2 opacity-30">
                    <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" /> Identity Bridge Active
                        </div>
                        <span className="opacity-20">|</span>
                        <div>Level: Restricted</div>
                    </div>
                    <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">
                        Node ID: {Math.random().toString(36).substring(7).toUpperCase()}
                    </p>
                </div>
            </div>
        </main>
    )
}