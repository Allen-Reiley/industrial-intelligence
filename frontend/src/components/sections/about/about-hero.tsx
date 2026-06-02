// @/components/sections/about/about-hero.tsx
'use client'
import { TextEffect } from '@/components/ui/text-effect'

export function AboutHero() {
    return (
        <section className="relative pt-32 pb-16 md:pt-48">
            <div className="mx-auto max-w-5xl px-6">
                <div className="max-w-3xl">
                    <span className="text-primary text-sm font-semibold tracking-widest uppercase italic">The Philosophy</span>
                    <h1 className="mt-8 text-balance text-5xl font-bold tracking-tight md:text-7xl">
                        <TextEffect preset="fade-in-blur" speedSegment={0.3}>
                            Engineering Growth via Logic.
                        </TextEffect>
                    </h1>
                    <p className="mt-10 text-xl text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-8">
                        AuraWorks (Pty) Ltd was founded on a single premise: Industrial sales shouldn&apos;t be a guessing game. We build the systems that bridge the gap between anonymous interest and signed contracts.
                    </p>
                </div>
            </div>
        </section>
    )
}