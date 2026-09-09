import React from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { HeroHeader } from '../header/header'
{/* 
import { Spotify } from '@/components/ui/svgs/spotify'
import { SupabaseFull } from '@/components/ui/svgs/supabase'
import { Hulu } from '@/components/ui/svgs/hulu'
import { Bolt } from '@/components/ui/svgs/bolt'
import { FirebaseFull } from '@/components/ui/svgs/firebase'
import { Beacon } from '@/components/ui/svgs/beacon'
import { Claude } from '@/components/ui/svgs/claude'
import { VercelFull } from '@/components/ui/svgs/vercel'
*/}

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

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <div className="overflow-hidden">
                <div
                    aria-hidden
                    className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block">
                    <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    {/* FIXED: Specific padding to align with the background radial mask */}
                    <div className="relative pt-24 pb-0 px-0 md:pt-48">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring',
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="mask-b-from-35% mask-b-to-90% absolute inset-0 top-56 -z-20 lg:top-32">
                        </AnimatedGroup>

                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
                        />

                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href="/features"
                                        className="hover:bg-background bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300">
                                        <span className="text-foreground text-sm">Industrial Identity Resolution</span>
                                        <span className="block h-4 w-0.5 border-l bg-white"></span>

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </AnimatedGroup>

                                <TextEffect
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    as="h1"
                                    className="mx-auto mt-8 max-w-4xl text-balance text-5xl font-bold md:text-7xl lg:mt-16 xl:text-[4rem] tracking-tight">
                                    Identify Your Corporate Visitors So You Can Sell To Them
                                </TextEffect>
                                <TextEffect
                                    per="line"
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    delay={0.5}
                                    as="p"
                                    className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
                                    Increase conversations. Lower sales costs. Boost net revenue.
                                </TextEffect>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-4 md:flex-row">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="rounded-xl px-8 text-base shadow-xl shadow-primary/20">
                                        <Link href="/book-demo">
                                            <span className="text-nowrap">Book Demo</span>
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="rounded-xl px-8 text-base">
                                        <Link href="/vsl">
                                            <span className="text-nowrap">Watch Video</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="mask-b-from-55% relative mr-0 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">

                                <div className="inset-shadow-2xs ring-background bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-2xl shadow-zinc-950/20 ring-1">
                                    <Image
                                        className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border"
                                        src="/mail2-light.webp"
                                        alt="industrial lead report dashboard"
                                        width="2700"
                                        height="1440"
                                        priority
                                    />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>

                {/* Social Proof Section 
                <section className="bg-background pb-16 pt-24 md:pb-32">
                    <div className="group relative m-auto max-w-5xl px-6">
                        <div className="group-hover:blur-xs **:fill-muted-foreground mx-auto grid max-w-2xl grid-cols-3 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14 md:grid-cols-4">
                            <Bolt className="mx-auto h-5 w-full" />
                            <VercelFull className="mx-auto h-4 w-full" />
                            <SupabaseFull className="mx-auto h-6" />
                            <Hulu className="mx-auto h-4 w-full" />
                            <Spotify className="mx-auto h-6 w-full" />
                            <FirebaseFull className="mx-auto h-6 w-full" />
                            <Beacon className="mx-auto h-4 w-full" />
                            <Claude className="mx-auto h-5 w-full" />
                        </div>
                    </div>
                </section>
                */}
            </div>
        </>
    )
}