import { Search, Cpu, Zap } from 'lucide-react'
import Image from 'next/image'

export default function ContentSection2() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">The Three Pillars of Full-Cycle Business Growth.</h2>
                <div className="relative">
                    <div className="relative z-10 space-y-4 md:w-1/2">
                        <p>
                            Sustainable commercial growth requires synchronizing demand, transactions, and workshop fulfillment. <span className="font-medium">AuraWorks connects organic discoverability, custom customer-facing storefronts, and internal operational tooling</span> into one unified growth engine.
                        </p>
                        <p className="text-muted-foreground text-sm">
                            We position your capabilities where buyers search, convert inbound interest into immediate working capital, and give your production team tailored tools that lower the cost of operations.
                        </p>

                        <div className="space-y-3 pt-4"> 
                            <div className="flex items-start gap-3">
                                <Search className="size-4 mt-0.5 text-primary shrink-0" />
                                <div>
                                    <h3 className="text-sm font-medium">1. Discovery & Buyer Intelligence (SEO + GEO)</h3>
                                    <p className="text-muted-foreground text-xs leading-relaxed">Dominant Google rankings across regional hubs and semantic entity architecture engineered for ChatGPT, Perplexity, and Gemini citations—paired with corporate visitor de-anonymization.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Cpu className="size-4 mt-0.5 text-primary shrink-0" />
                                <div>
                                    <h3 className="text-sm font-medium">2. Conversion & Cashflow (Custom Commerce)</h3>
                                    <p className="text-muted-foreground text-xs leading-relaxed">High-conversion digital storefronts, quote builders, and direct payment flows engineered to capture client commitments and generate predictable cashflow.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Zap className="size-4 mt-0.5 text-primary shrink-0" />
                                <div>
                                    <h3 className="text-sm font-medium">3. Operational Tools & Cost Reduction</h3>
                                    <p className="text-muted-foreground text-xs leading-relaxed">Custom factory and workshop management dashboards, automated bill-of-materials, and order fulfillment queues built to eliminate costly manual errors and reduce operational overhead.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:mask-l-from-35% md:mask-l-to-55% mt-12 h-fit md:absolute md:-inset-y-12 md:inset-x-0 md:mt-0">
                        <div className="border-border/50 relative rounded-2xl border border-dotted p-2">
                            <Image
                                src="/charts-light.webp"
                                className="rounded-[12px] shadow"
                                alt="AuraWorks business systems telemetry, operational tracking, and buyer intent analytics"
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
