// 
'use client'

import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { ShieldCheck, Database, Zap } from 'lucide-react'

export default function FeaturesHero() {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden md:pt-48">
            <div className="mx-auto max-w-5xl px-6">
                <div className="max-w-3xl">
                    <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
                        <TextEffect preset="fade-in-blur" speedSegment={0.3}>
                            De-anonymize Your Industrial Traffic.
                        </TextEffect>
                    </h1>
                    <p className="mt-8 text-lg text-muted-foreground md:text-xl">
                        The AuraWorks Engine isn't just a tracker. It is a proprietary Identity Bridge that resolves anonymous IP strings into high-intent corporate entities within the South African industrial sector.
                    </p>
                </div>

                <AnimatedGroup 
                    className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
                    variants={{
                        container: { visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } } },
                        item: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
                    }}
                >
                    {[
                        { icon: ShieldCheck, title: "POPIA Compliant", desc: "First-party consent protocols built directly into the tracking handshake." },
                        { icon: Database, title: "Juristic Resolution", desc: "We map traffic to registered business entities, filtering out 98% of residential noise." },
                        { icon: Zap, title: "Zero Latency", desc: "Our lightweight script adds <20ms to your page load while capturing deep intent data." }
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