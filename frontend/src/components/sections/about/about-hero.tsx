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
                        Be Found. Be Cited. Be Chosen.
                    </TextEffect>
                    <TextEffect
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.5}
                        as="p"
                        className="mt-10 text-xl text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-8">
                        AuraWorks was founded to solve a structural failure in B2B industrial growth: companies possess world-class technical capabilities, yet remain hidden from Google search, absent in generative AI answers, and blind to the 98% of corporate buyers who inspect their websites anonymously. We bridge the gap between digital discoverability, AI citability, and qualified sales pipeline.
                    </TextEffect>
                </div>
            </div>
        </section>
    )
}