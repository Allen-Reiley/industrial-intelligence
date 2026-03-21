'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { HeroHeader } from '../hero-sec/header/header'
import { TextEffect } from '../ui/text-effect'
import { AnimatedGroup } from '../ui/animated-group'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
} as const;

export default function Pricing() {
    // 1. Prevents the animation from triggering until the client is ready
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null; // Or a simple non-animated version of the section
    }

    return (
        <>
            <HeroHeader />
            <div className="relative py-16 md:py-32">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
                            <TextEffect preset="fade-in-blur" speedSegment={0.3}>
                                Stop Losing High-Value Industrial Leads
                            </TextEffect>
                        </h2>
                        {/* FIX: Changed <p> to <div> because AnimatedGroup renders a <div>. 
                            HTML doesn't allow <div> inside <p>. */}
                        <div className="text-muted-foreground mt-4 text-lg">
                            <AnimatedGroup variants={transitionVariants}>
                                Turn your anonymous website traffic into a predictable sales pipeline.
                            </AnimatedGroup>
                        </div>
                    </div>

                    <div className="mt-8 md:mt-20">
                        <div className="bg-card relative rounded-3xl border shadow-2xl shadow-zinc-950/5">
                            <div className="grid items-center gap-12 divide-y p-12 md:grid-cols-2 md:divide-x md:divide-y-0">
                                <div className="pb-12 text-center md:pb-0 md:pr-12">
                                    {/* FIX: Changed <h3> to <div> to allow AnimatedGroup nesting */}
                                    <div className="text-2xl font-semibold italic">
                                        <AnimatedGroup variants={transitionVariants}>
                                            AuraWorks Intent Engine
                                        </AnimatedGroup>
                                    </div>

                                    <AnimatedGroup variants={transitionVariants}>
                                        <div className="mt-2 text-sm text-muted-foreground uppercase tracking-widest">
                                            Managed Sales Intelligence
                                        </div>
                                    </AnimatedGroup>

                                    <AnimatedGroup variants={transitionVariants}>
                                        <div className="mb-6 mt-12 inline-block text-6xl font-bold">
                                            <span className="text-4xl font-medium text-foreground">R</span>
                                            10k
                                            <span className="text-lg font-normal text-muted-foreground">/mo</span>
                                        </div>
                                    </AnimatedGroup>

                                    <div className="flex justify-center">
                                        <AnimatedGroup variants={transitionVariants}>
                                            <Button
                                                asChild
                                                size="lg"
                                                className="px-12 py-6 text-lg font-medium">
                                                <Link href="/get-started">Start Identifying Leads</Link>
                                            </Button>
                                        </AnimatedGroup>
                                    </div>

                                    <div className="text-muted-foreground mt-12 text-xs leading-relaxed">
                                        <TextEffect preset="fade-in-blur" speedSegment={0.3}>
                                            Includes: Consent-Led Identity Bridge, POPIA Compliance Layer, Social Enrichment, and Weekly Intent Reports.
                                        </TextEffect>
                                    </div>
                                </div>

                                <div className="relative">
                                    <AnimatedGroup variants={transitionVariants} className="space-y-4">
                                        <ul role="list" className="space-y-4">
                                            {[
                                                'Real-time identity resolution for SA and International traffic',
                                                'Weekly "Hot Lead" reports delivered to your inbox',
                                                'LinkedIn & Corporate Email enrichment',
                                                'POPIA-compliant visitor consent management',
                                                'Industrial-sector automated nurture sequence'
                                            ].map((item, index) => (
                                                <li key={index} className="flex items-center gap-3">
                                                    <Check className="size-4 text-primary" />
                                                    <span className="text-sm font-medium">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="text-muted-foreground mt-8 text-sm leading-relaxed">
                                            Designed specifically for the South African industrial landscape—from Jet Park to Middelburg. We bridge the gap between anonymous ISP traffic and your next big contract.
                                        </div>
                                        <div className="**:fill-foreground mt-12 flex flex-wrap items-center gap-12">
                                            {/* Logo placeholders */}
                                        </div>
                                    </AnimatedGroup>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}