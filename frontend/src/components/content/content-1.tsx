import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function ContentSection1({ className }: { className?: string }) {
    return (
        <section className={cn("py-16 md:py-32", className)}>
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">Your highest-value pipeline is visiting you in secret.</h2>
                <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
                    <div className="relative mb-6 sm:mb-0">
                        <div className="bg-linear-to-b aspect-76/59 relative rounded-2xl from-zinc-300 to-transparent p-px">
                            <Image
                                src="/payments-light.webp"
                                className="rounded-[15px] shadow"
                                alt="AuraWorks B2B website visitor identification telemetry for industrial firms"
                                width={1207}
                                height={929}
                            />
                        </div>
                    </div>

                    <div className="relative space-y-4">
                        <p className="text-muted-foreground">
                            Every day, decision-makers from major mining houses, manufacturing giants, and logistics firms visit your website. They inspect your spec sheets, review your capacities, and leave without filling out a form. Because they remain anonymous, you lose the opportunity to influence the deal before a tender is issued.
                        </p>
                        <p className="text-muted-foreground">AuraWorks unmasks these corporate entities in real time. We filter out consumer and residential noise to deliver only <span className="text-accent-foreground font-bold">high-intent juristic prospects</span> directly to your sales pipeline.</p>

                        <div className="pt-6">
                            <blockquote className="border-l-4 pl-4 border-primary/20">
                                <p className="italic text-muted-foreground">&quot;Every day, key decision-makers from major industrial firms study your technical specifications, then leave without a trace. AuraWorks uncovers these high-value opportunities before the RFP is even published.&quot;</p>

                                <div className="mt-6 space-y-4">
                                    <cite className="block font-medium text-foreground">Reitumetse Sethabela, Founder</cite>
                                    
                                    {/* SVG Image Space */}
                                    <div className="relative h-10 w-29">
                                        <Image
                                            src="/logo.svg" // Replace with your client's light SVG
                                            alt="AuraWorks Industrial Intelligence"
                                            fill
                                            className="object-contain object-left"
                                        />
                                    </div>
                                </div>
                            </blockquote>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}