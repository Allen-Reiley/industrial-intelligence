// @/components/sections/about/about-hero.tsx
'use client'
import { TextEffect } from '@/components/ui/text-effect'

export function AboutHero() {
    return (
        <section className="relative pt-32 pb-16 md:pt-48">
            <div className="mx-auto max-w-5xl px-6">
                <div className="max-w-3xl">
                    <span className="text-primary text-sm font-semibold tracking-widest uppercase italic">The Mission</span>
                    <h1 className="mt-8 text-balance text-5xl font-bold tracking-tight md:text-7xl">
                        <TextEffect preset="fade-in-blur" speedSegment={0.3}>
                            Where Presence Meets Performance.
                        </TextEffect>
                    </h1>
                    <p className="mt-10 text-xl text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-8">
                        AuraWorks (Pty) Ltd was founded to solve a critical industrial disconnect: B2B firms build premium digital specs, yet lose 98% of potential buyers to anonymous bounces. We build the systems that bridge the gap between digital presence and raw sales performance.
                    </p>
                </div>
            </div>
        </section>
    )
}