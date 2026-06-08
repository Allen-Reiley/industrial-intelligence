'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { HeroHeader } from '../header/header'
import { TextEffect } from '../ui/text-effect'
import { AnimatedGroup } from '../ui/animated-group'

const transitionVariants = {
    item: {
        hidden: { opacity: 0, filter: 'blur(12px)', y: 12 },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: { type: 'spring', bounce: 0.3, duration: 1.5 },
        },
    },
} as const;

export default function Pricing() {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        const handle = requestAnimationFrame(() => setHasMounted(true));
        return () => cancelAnimationFrame(handle);
    }, []);

    if (!hasMounted) {
        return <div className="sr-only">AuraWorks Pricing - R120k/yr Annual Engine</div>;
    }

    return (
        <>
            <HeroHeader />
            <div className="relative py-12 md:py-32">
                <div className="mx-auto max-w-5xl px-4 md:px-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl leading-tight">
                            <TextEffect preset="fade-in-blur" speedSegment={0.3}>
                                Deploy Your Industrial Sales Engine
                            </TextEffect>
                        </h2>
                        <div className="text-muted-foreground mt-6 text-base md:text-lg px-2">
                            <AnimatedGroup variants={transitionVariants}>
                                Unmask your website's hidden pipeline. A fractional investment to secure total visibility into the mining, manufacturing, and logistics firms visiting your site—where landing a single contract pays for the engine multiple times over.
                            </AnimatedGroup>
                        </div>
                    </div>

                    <div className="mt-12 md:mt-20">
                        {/* Added overflow-hidden to prevent layout shift */}
                        <div className="bg-card relative rounded-3xl border shadow-2xl shadow-zinc-950/5 overflow-hidden">
                            <div className="grid items-center gap-0 md:gap-12 divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
                                
                                {/* LEFT COLUMN: Pricing & CTA */}
                                <div className="p-8 md:p-12 text-center">
                                    <div className="text-xl md:text-2xl font-semibold italic">
                                        <AnimatedGroup variants={transitionVariants}>
                                            AuraWorks Annual Engine
                                        </AnimatedGroup>
                                    </div>

                                    <AnimatedGroup variants={transitionVariants}>
                                        {/* FIX: break-words and responsive text size */}
                                        <div className="mt-3 text-[10px] md:text-sm text-muted-foreground uppercase tracking-[0.2em] break-words">
                                            Corporate Identity Resolution
                                        </div>
                                    </AnimatedGroup>

                                    <AnimatedGroup variants={transitionVariants}>
                                        {/* FIX: Fluid pricing text to prevent overflow */}
                                        <div className="mb-8 mt-10 inline-flex items-baseline font-bold">
                                            <span className="text-2xl md:text-4xl font-medium text-foreground mr-1">R</span>
                                            <span className="text-5xl md:text-7xl tracking-tighter">120k</span>
                                            <span className="text-base md:text-lg font-normal text-muted-foreground ml-1">/yr</span>
                                        </div>
                                    </AnimatedGroup>

                                    <div className="flex justify-center w-full">
                                        <AnimatedGroup variants={transitionVariants} className="w-full md:w-auto">
                                            <Button
                                                asChild
                                                size="lg"
                                                className="w-full md:w-auto px-10 py-7 text-base md:text-lg font-medium tracking-tight shadow-xl">
                                                <Link href="/book-demo">Request Enterprise Access</Link>
                                            </Button>
                                        </AnimatedGroup>
                                    </div>

                                    <div className="text-muted-foreground mt-10 text-[11px] md:text-xs leading-relaxed max-w-[280px] md:max-w-xs mx-auto">
                                        <TextEffect preset="fade-in-blur" speedSegment={0.3}>
                                            Annual License includes: Custom tracking script, juristic identity resolution database query access, and weekly lead digests.
                                        </TextEffect>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: Features */}
                                <div className="p-8 md:p-12 bg-zinc-50/50 dark:bg-zinc-900/10">
                                    <AnimatedGroup variants={transitionVariants} className="space-y-8">
                                        <ul role="list" className="space-y-5">
                                            {[
                                                'Real-time corporate identity resolution for SADC traffic',
                                                'Weekly unmasked hot lead digests delivered straight to your inbox',
                                                'Direct contact paths (validated department emails & switchboards)',
                                                'POPIA-compliant juristic-first data resolution',
                                                'Spec-sheet download and CAD technical asset tracking'
                                            ].map((item, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <Check className="size-4 text-primary mt-1 shrink-0" />
                                                    <span className="text-sm md:text-base font-medium leading-snug">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="text-muted-foreground text-xs md:text-sm leading-relaxed border-t pt-8 italic">
                                            &quot;A single unmasked contract pays for the annual engine. Designed for firms that measure success in multi-million Rand purchase orders, not clicks.&quot;
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