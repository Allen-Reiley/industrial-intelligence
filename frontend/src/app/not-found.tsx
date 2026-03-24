// @/app/not-found.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <main className="relative min-h-screen flex items-center justify-center bg-background px-6">
            {/* Background Radial Glow - Matching your Hero theme */}
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full opacity-20 [background:radial-gradient(50%_50%_at_50%_50%,var(--color-primary)_0%,transparent_100%)] blur-3xl" />
            </div>

            <div className="text-center">
                {/* 404 Visual */}
                <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl border bg-muted/30 shadow-inner">
                    <Search className="h-10 w-10 text-muted-foreground/50" />
                    <span className="absolute -right-2 -top-2 flex h-8 w-12 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-lg">
                        404
                    </span>
                </div>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Page Not Found
                </h1>
                
                <p className="mx-auto mt-6 max-w-md text-balance text-muted-foreground">
                    The intelligence report you're looking for doesn't exist or has been moved to a different sector.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button asChild size="lg" className="rounded-xl px-8 shadow-xl shadow-primary/20">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Return Home
                        </Link>
                    </Button>
                    
                    <Button variant="ghost" asChild size="lg" className="rounded-xl px-8">
                        <Link href="/customer-support">
                            <span>Contact Support</span>
                        </Link>
                    </Button>
                </div>

                {/* Subtle breadcrumb/footer style text */}
                <div className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground/60">
                    <span className="h-px w-8 bg-border" />
                    <span>AuraWorks (Pty) Ltd — Systems Architect</span>
                    <span className="h-px w-8 bg-border" />
                </div>
            </div>
        </main>
    )
}