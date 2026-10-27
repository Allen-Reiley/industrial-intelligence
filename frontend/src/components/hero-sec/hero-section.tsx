'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { HeroHeader } from '../header/header'
import { motion, AnimatePresence } from 'framer-motion'
import { trackIntent } from '@/lib/api'

const DEFAULT_CLIENT_ID = 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0'
const IMAGEKIT_VIDEO_URL = 'https://ik.imagekit.io/lcpi94xy3/final-demo.mp4'

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
    const router = useRouter()
    const [isPlaying, setIsPlaying] = useState(false)
    const [isEnded, setIsEnded] = useState(false)
    const [clientId, setClientId] = useState(DEFAULT_CLIENT_ID)
    const [auraId, setAuraId] = useState('anonymous-hero-visitor')

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const videoContainerRef = useRef<HTMLDivElement | null>(null)
    const sentMilestones = useRef<Set<number>>(new Set())
    const abandonmentTimer = useRef<NodeJS.Timeout | null>(null)
    const ctaClicked = useRef(false)

    useEffect(() => {
        const envClientId = process.env.NEXT_PUBLIC_WAITLIST_API_KEY
        if (envClientId) {
            setClientId(envClientId)
        }

        const savedAuraId = localStorage.getItem('aura_uid')
        if (savedAuraId) {
            setAuraId(savedAuraId)
        }
    }, [])

    const handlePlayPause = () => {
        if (!videoRef.current) return
        if (isPlaying) {
            videoRef.current.pause()
        } else {
            videoRef.current.play().catch((err) => {
                console.error('Failed to play video:', err)
            })
        }
    }

    const handleRestart = () => {
        if (!videoRef.current) return
        videoRef.current.currentTime = 0
        setIsEnded(false)
        sentMilestones.current.clear()
        ctaClicked.current = false
        if (abandonmentTimer.current) {
            clearTimeout(abandonmentTimer.current)
        }
        videoRef.current.play().catch((err) => {
            console.error('Failed to play video:', err)
        })
    }

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    const onTimeUpdate = () => {
        if (!videoRef.current) return
        const { currentTime, duration } = videoRef.current
        if (!duration || isNaN(duration)) return

        const percentage = Math.floor((currentTime / duration) * 100)
        const milestones = [25, 50, 75, 100]

        milestones.forEach((milestone) => {
            if (percentage >= milestone && !sentMilestones.current.has(milestone)) {
                sentMilestones.current.add(milestone)
                trackIntent({
                    client_id: clientId,
                    aura_id: auraId,
                    vsl_completion_percentage: milestone,
                }).catch((err) => {
                    console.error(`Failed to track milestone ${milestone}%:`, err)
                })
            }
        })
    }

    const onEnded = () => {
        setIsPlaying(false)
        setIsEnded(true)

        if (!sentMilestones.current.has(100)) {
            sentMilestones.current.add(100)
            trackIntent({
                client_id: clientId,
                aura_id: auraId,
                vsl_completion_percentage: 100,
            }).catch((err) => {
                console.error('Failed to track 100% completion milestone:', err)
            })
        }

        // Warm abandonment tracking: 10 seconds timeout
        abandonmentTimer.current = setTimeout(() => {
            if (!ctaClicked.current) {
                trackIntent({
                    client_id: clientId,
                    aura_id: auraId,
                    vsl_completion_percentage: 100,
                    vsl_abandoned: true,
                }).catch((err) => {
                    console.error('Failed to track warm abandonment:', err)
                })
            }
        }, 10000)
    }

    const handleCtaClick = () => {
        ctaClicked.current = true
        if (abandonmentTimer.current) {
            clearTimeout(abandonmentTimer.current)
        }

        trackIntent({
            client_id: clientId,
            aura_id: auraId,
            vsl_completion_percentage: 100,
            vsl_abandoned: false,
        })
            .catch((err) => {
                console.error('Failed to clear abandonment flag:', err)
            })
            .finally(() => {
                router.push('/book-demo')
            })
    }

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
                                        href="/solution"
                                        className="hover:bg-background bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300">
                                        <span className="text-foreground text-sm">Industrial Web Development, SEO & Lead Intelligence</span>
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
                                    Make Your Business Impossible to Miss.
                                </TextEffect>
                                <TextEffect
                                    per="line"
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    delay={0.5}
                                    as="p"
                                    className="mx-auto mt-8 max-w-3xl text-balance text-lg text-muted-foreground">
                                    Custom Next.js web platforms, top-tier Google rankings, generative AI citability across ChatGPT and Perplexity, and proprietary juristic visitor de-anonymization for industrial leaders.
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
                                            <span className="text-nowrap">Request Custom Quote</span>
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="rounded-xl px-8 text-base">
                                        <Link href="/book-call">
                                            <span className="text-nowrap">Schedule Strategy Call</span>
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
                                <div 
                                    ref={videoContainerRef}
                                    className="inset-shadow-2xs ring-background bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-2 sm:p-4 shadow-2xl shadow-zinc-950/20 ring-1 group">
                                    
                                    <div className="aspect-15/8 md:aspect-16/9 w-full relative bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center">
                                        <video
                                            ref={videoRef}
                                            src={IMAGEKIT_VIDEO_URL}
                                            poster="/mail2-light.webp"
                                            onClick={handlePlayPause}
                                            onPlay={onPlay}
                                            onPause={onPause}
                                            onTimeUpdate={onTimeUpdate}
                                            onEnded={onEnded}
                                            className="w-full h-full object-cover rounded-lg cursor-pointer"
                                            playsInline
                                            controls={isPlaying && !isEnded}
                                            preload="metadata"
                                        />

                                        {/* Play Overlay (when video is not playing and has not ended) */}
                                        {!isPlaying && !isEnded && (
                                          <div
                                            onClick={handlePlayPause}
                                            className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:bg-black/45 group/btn"
                                          >
                                            <div className="flex items-center gap-3.5 px-6 py-3.5 rounded-full bg-zinc-900/90 hover:bg-zinc-900 border border-white/20 text-white shadow-2xl backdrop-blur-md transition-all duration-300 transform group-hover/btn:scale-105">
                                              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                                                <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
                                              </div>
                                              <div className="text-left pr-2">
                                                <p className="text-sm font-semibold text-white leading-tight">Watch Platform Walkthrough</p>
                                                <p className="text-xs text-zinc-400">See how AuraWorks captures pipeline (2 min)</p>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* End of video CTA Card Overlay */}
                                        <AnimatePresence>
                                          {isEnded && (
                                            <motion.div
                                              initial={{ opacity: 0, scale: 0.95 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              exit={{ opacity: 0, scale: 0.95 }}
                                              transition={{ duration: 0.3 }}
                                              className="absolute inset-0 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10"
                                            >
                                              <div className="max-w-md space-y-4">
                                                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                                  Platform Walkthrough Complete
                                                </span>
                                                <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                                                  Ready to de-anonymize your website traffic?
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                  Schedule your 15-minute operational audit and live platform demo.
                                                </p>
                                                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                                                  <Button
                                                    onClick={handleCtaClick}
                                                    size="lg"
                                                    className="w-full sm:w-auto rounded-xl px-8 font-semibold shadow-xl shadow-primary/20 cursor-pointer"
                                                  >
                                                    Request Custom Quote
                                                  </Button>
                                                  <Button
                                                    onClick={handleRestart}
                                                    variant="outline"
                                                    size="lg"
                                                    className="w-full sm:w-auto rounded-xl px-6 flex items-center justify-center gap-2 cursor-pointer"
                                                  >
                                                    <RotateCcw className="w-4 h-4" />
                                                    <span>Replay</span>
                                                  </Button>
                                                </div>
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
            </div>
        </>
    )
}