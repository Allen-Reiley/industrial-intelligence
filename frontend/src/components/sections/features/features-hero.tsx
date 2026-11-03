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
                        The Connected Engines of Business Growth.
                    </TextEffect>
                    <TextEffect
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.5}
                        as="p"
                        className="mt-8 text-lg text-muted-foreground md:text-xl leading-relaxed">
                        AuraWorks unites client-facing resources that drive immediate cashflow with operational tooling that slashes internal overhead—all anchored by technical SEO, Generative Engine Optimization (GEO), and visitor de-anonymization to continuously supply verified demand.
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
                        { icon: Globe, title: "Discovery & Intent (SEO + GEO)", desc: "Structured schemas, Core Web Vitals, and entity optimization ensuring Google, ChatGPT, and Perplexity cite your capabilities and identify visiting corporate accounts." },
                        { icon: Cpu, title: "Client-Facing Cashflow Engines", desc: "Bespoke digital storefronts, interactive product configurators, and instant checkout flows engineered to turn incoming demand into predictable revenue." },
                        { icon: ShieldCheck, title: "Operational Tooling & Fulfillment", desc: "Custom factory/workshop dashboards, live job queues, and automated cut-sheets/BOMs that eliminate manual errors and reduce fulfillment overhead." }
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