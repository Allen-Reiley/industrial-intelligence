// 
'use client'

import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { Globe, Cpu, ShieldCheck } from 'lucide-react'

export default function FeaturesHero() {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden md:pt-48">
            <div className="mx-auto max-w-5xl px-6">
                <div className="max-w-3xl">
                    <TextEffect
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        as="h1"
                        className="text-5xl font-bold tracking-tight md:text-7xl">
                        Organic Visibility, AI Citability & Lead Capture.
                    </TextEffect>
                    <TextEffect
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.5}
                        as="p"
                        className="mt-8 text-lg text-muted-foreground md:text-xl leading-relaxed">
                        AuraWorks is the organic discoverability and lead-capture partner engineered for South African and SADC heavy industry. We combine dominant technical SEO and Generative Engine Optimization (GEO)—optimizing your web assets so AI search engines (ChatGPT, Perplexity, Gemini, Google AI Overviews) understand, cite, and recommend your firm—with our proprietary AuraWorks Intelligence Engine as a built-in conversion layer.
                    </TextEffect>
                </div>

                <AnimatedGroup 
                    className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
                    variants={{
                        container: { visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } } },
                        item: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
                    }}
                >
                    {[
                        { icon: Globe, title: "Technical & Local SEO", desc: "Architected for heavy industry with structured schema markup, fast Core Web Vitals, and deep keyword dominance across South Africa and SADC." },
                        { icon: Cpu, title: "Generative Engine Optimization (GEO)", desc: "Structured semantic entity graphs that train LLMs to recognize, cite, and recommend your technical specifications in AI Overviews and chat answers." },
                        { icon: ShieldCheck, title: "Proprietary Intelligence Engine", desc: "Built-in visitor de-anonymization that converts high-intent corporate traffic and tracks spec-sheet downloads into weekly Monday inbox dispatches." }
                    ].map((feature, i) => (
                        <div key={i} className="group relative rounded-2xl border p-8 bg-card/50 backdrop-blur-sm transition-colors hover:bg-muted/50">
                            <feature.icon className="size-6 text-primary mb-4" />
                            <h3 className="font-semibold text-lg">{feature.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </AnimatedGroup>
            </div>
        </section>
    )
}