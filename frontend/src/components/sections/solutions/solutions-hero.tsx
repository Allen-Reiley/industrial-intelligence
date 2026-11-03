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
                    <span className="text-primary text-sm font-semibold tracking-widest uppercase">Strategic B2B Solutions</span>
                    <TextEffect
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        as="h1"
                        className="mt-6 text-balance text-5xl font-bold tracking-tight md:text-7xl">
                        Two Strategic Paths to Pipeline Dominance.
                    </TextEffect>
                    <TextEffect
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.5}
                        as="p"
                        className="mt-8 text-lg text-muted-foreground md:text-xl leading-relaxed">
                        Whether engineering a new digital flagship or maximizing your existing web presence, AuraWorks provides two tailored entry points to establish search dominance, Generative Engine Optimization (GEO) citability, and proprietary visitor capture across South Africa and the SADC region.
                    </TextEffect>
                </div>
            </div>
        </section>
    )
}