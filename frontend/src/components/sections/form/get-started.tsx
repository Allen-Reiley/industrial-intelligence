// @/app/get-started/page.tsx
'use client'

import React from 'react'
import { Building2, Mail, User, Briefcase, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function GetStartedPage() {
    return (
        <main className="relative min-h-screen flex items-center justify-center bg-background px-6 py-12">
            {/* Background Decorations to match Hero */}
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-30 [background:radial-gradient(50%_50%_at_50%_10%_var(--color-primary)_0%,transparent_100%)] blur-3xl" />
            </div>

            <div className="w-full max-w-xl">
                {/* Back Button */}
                <Button variant="ghost" asChild className="mb-8 -ml-2 text-muted-foreground hover:text-foreground">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>

                <div className="space-y-2 mb-10 text-left">
                    <h1 className="text-4xl font-bold tracking-tight">Join the AuraWorks Beta</h1>
                    <p className="text-muted-foreground">
                        Secure your spot in our initial 100-partner cohort. 
                        No setup fees. Just industrial sales intelligence.
                    </p>
                </div>

                <form className="grid gap-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input id="name" placeholder="John Doe" className="pl-10 rounded-xl bg-muted/30" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Work Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input id="email" type="email" placeholder="john@mining.co.za" className="pl-10 rounded-xl bg-muted/30" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input id="company" placeholder="e.g. Rand Industrial" className="pl-10 rounded-xl bg-muted/30" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="industry">Industry Vertical</Label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <select 
                                id="industry"
                                className="flex h-10 w-full rounded-xl border border-input bg-muted/30 pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">Select industry...</option>
                                <option value="mining">Mining & Resources</option>
                                <option value="manufacturing">Manufacturing</option>
                                <option value="logistics">Logistics</option>
                                <option value="construction">Heavy Construction</option>
                            </select>
                        </div>
                    </div>

                    <Button size="lg" className="mt-4 w-full rounded-xl font-semibold shadow-xl shadow-primary/20">
                        Request Access
                    </Button>
                    
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        By requesting access, you agree to our terms of service and our systems-driven 
                        approach to B2B privacy.
                    </p>
                </form>
            </div>
        </main>
    )
}