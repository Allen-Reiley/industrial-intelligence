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
                            De-anonymize Your B2B Web Traffic.
                        </TextEffect>
                    </h1>
                    <p className="mt-8 text-lg text-muted-foreground md:text-xl">
                        AuraWorks is a proprietary corporate identification system built specifically for the South African industrial sector. We resolve anonymous web traffic into high-intent corporate entities, filtering out consumer noise so your team can focus on real pipeline.
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
                        { icon: ShieldCheck, title: "Juristic Compliance", desc: "Fully POPIA-compliant identity resolution. We identify business entities, not natural persons, keeping your outreach legally secure." },
                        { icon: Database, title: "Corporate Filtering", desc: "We map traffic to registered entities and corporate networks, automatically filtering out home connections and residential noise." },
                        { icon: Zap, title: "Weekly Inbox Delivery", desc: "No dashboards or complex systems to learn. We compile your hottest leads and deliver them directly to your inbox every Monday." }
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