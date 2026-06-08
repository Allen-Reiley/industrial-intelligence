// @/components/sections/solutions/solutions-hero.tsx
'use client'

import { TextEffect } from '@/components/ui/text-effect'

export function SolutionsHero() {
    return (
        <section className="relative pt-32 pb-16 overflow-hidden md:pt-48">
             <div
                aria-hidden
                className="absolute inset-0 -z-10 size-full [background:radial-gradient(120%_120%_at_50%_0%,transparent_0%,var(--color-background)_85%)]"
            />
            <div className="mx-auto max-w-5xl px-6">
                <div className="max-w-3xl">
                    <span className="text-primary text-sm font-semibold tracking-widest uppercase">Industrial B2B</span>
                    <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight md:text-7xl">
                        <TextEffect preset="fade-in-blur" speedSegment={0.3}>
                            Built for Heavy Industry.
                        </TextEffect>
                    </h1>
                    <p className="mt-8 text-lg text-muted-foreground md:text-xl leading-relaxed">
                        Generic sales and marketing tools fail in the industrial sector. AuraWorks is built specifically for enterprise firms where sales cycles are measured in months, procurement is heavy, and contracts are valued in millions.
                    </p>
                </div>
            </div>
        </section>
    )
}