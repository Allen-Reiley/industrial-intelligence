import { Cpu, Zap } from 'lucide-react'
import Image from 'next/image'

export default function ContentSection2() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">Equip your sales team with actionable intent.</h2>
                <div className="relative">
                    <div className="relative z-10 space-y-4 md:w-1/2">
                        <p>
                            Identifying the company is only the beginning. <span className="font-medium">AuraWorks provides the contact enrichment and deep intent data</span> required to turn an anonymous visitor into a warm sales conversation.
                        </p>
                        <p>Our intelligence reports give your sales team a clear, direct path to key decision-makers, bypassing traditional gatekeepers.</p>

                        <div className="grid grid-cols-2 gap-3 pt-6 sm:gap-4"> 
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Zap className="size-4" />
                                    <h3 className="text-sm font-medium">Real-Time</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">Monitor high-value interest the instant a prospect lands on your technical pages.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Cpu className="size-4" />
                                    <h3 className="text-sm font-medium">Direct Paths</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">Gain verified corporate emails, department contacts, and switchboard numbers.</p>
                            </div>
                        </div>
                    </div>
                    <div className="md:mask-l-from-35% md:mask-l-to-55% mt-12 h-fit md:absolute md:-inset-y-12 md:inset-x-0 md:mt-0">
                        <div className="border-border/50 relative rounded-2xl border border-dotted p-2">
                            <Image
                                src="/charts.png"
                                className="hidden rounded-[12px] dark:block"
                                alt="payments illustration dark"
                                width={1207}
                                height={929}
                            />
                            <Image
                                src="/charts-light.webp"
                                className="rounded-[12px] shadow dark:hidden"
                                alt="payments illustration light"
                                width={1207}
                                height={929}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
