import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function ContentSection1({ className }: { className?: string }) {
    return (
        <section className={cn("py-16 md:py-32", className)}>
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">Your highest-value pipeline is researching in secret.</h2>
                <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
                    <div className="relative mb-6 sm:mb-0">
                        <div className="bg-linear-to-b aspect-76/59 relative rounded-2xl from-zinc-300 to-transparent p-px">
                            <Image
                                src="/payments-light.webp"
                                className="rounded-[15px] shadow"
                                alt="AuraWorks B2B website organic discoverability and visitor intelligence telemetry for industrial firms"
                                width={1207}
                                height={929}
                            />
                        </div>
                    </div>

                    <div className="relative space-y-4">
                        <p className="text-muted-foreground">
                            In the industrial sector, procurement officers and engineering directors evaluate technical specifications, capacity tables, and OEM credentials long before an RFP goes public. If your website lacks organic search authority and Generative Engine Optimization (GEO), you lose these deals before you even know they exist.
                        </p>
                        <p className="text-muted-foreground">
                            When these decision-makers do land on your site, 98% leave without filling out a contact form. AuraWorks bridges both gaps: we maximize your discoverability across Google and AI search engines, then deploy our proprietary AuraWorks Intelligence Engine to unmask visiting corporate accounts in real time—delivering <span className="text-accent-foreground font-bold">qualified pipeline directly to your commercial team</span>.
                        </p>

                        <div className="pt-6">
                            <blockquote className="border-l-4 pl-4 border-primary/20">
                                <p className="italic text-muted-foreground">&quot;Industrial contracts aren&apos;t won when the tender is published—they are won during the silent specification phase. AuraWorks ensures your company is found, cited by AI, and equipped to convert every anonymous corporate visit into active pipeline.&quot;</p>

                                <div className="mt-6 space-y-4">
                                    <cite className="block font-medium text-foreground">Reitumetse Sethabela, Founder & Systems Architect</cite>
                                    
                                    {/* SVG Image Space */}
                                    <div className="relative h-10 w-29">
                                        <Image
                                            src="/logo.svg" // Replace with your client's light SVG
                                            alt="AuraWorks Organic Discoverability & Lead Intelligence"
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