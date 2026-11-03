// @/components/sections/about/about-hero.tsx
'use client'
import { TextEffect } from '@/components/ui/text-effect'

export function AboutHero() {
    return (
        <section className="relative pt-32 pb-16 md:pt-48">
            <div className="mx-auto max-w-5xl px-6">
                <div className="max-w-3xl">
                    <span className="text-primary text-sm font-semibold tracking-widest uppercase italic">The Mission</span>
                    <TextEffect
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        as="h1"
                        className="mt-8 text-balance text-5xl font-bold tracking-tight md:text-7xl">
                        Engineering Operational Clarity & Growth.
                    </TextEffect>
                    <TextEffect
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.5}
                        as="p"
                        className="mt-10 text-xl text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-8">
                        AuraWorks was founded to solve a structural failure in business systems: companies possess world-class capabilities, yet remain bottlenecked by disjointed software, manual workshop workflows, and invisible online presences. We bridge top-of-funnel discovery (SEO, GEO & buyer intelligence) with client-facing commerce to capture cashflow and tailored operational tools to lower the cost of operations.
                    </TextEffect>
                </div>
            </div>
        </section>
    )
}