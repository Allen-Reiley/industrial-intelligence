import { Search, Cpu, Zap } from 'lucide-react'
import Image from 'next/image'

export default function ContentSection2() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">The Three Pillars of Industrial Discoverability.</h2>
                <div className="relative">
                    <div className="relative z-10 space-y-4 md:w-1/2">
                        <p>
                            Modern B2B procurement doesn&apos;t happen through a single channel. <span className="font-medium">AuraWorks integrates traditional search, AI recommendation, and proprietary account conversion</span> into one unified growth engine.
                        </p>
                        <p className="text-muted-foreground text-sm">
                            We position your technical authority where procurement teams investigate, ensure conversational AI engines cite your capabilities, and unmask visiting firms.
                        </p>

                        <div className="space-y-3 pt-4"> 
                            <div className="flex items-start gap-3">
                                <Search className="size-4 mt-0.5 text-primary shrink-0" />
                                <div>
                                    <h3 className="text-sm font-medium">1. Traditional & Local SEO</h3>
                                    <p className="text-muted-foreground text-xs leading-relaxed">Dominant Google rankings across South Africa and SADC industrial hubs for high-value technical keywords.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Cpu className="size-4 mt-0.5 text-primary shrink-0" />
                                <div>
                                    <h3 className="text-sm font-medium">2. Generative Engine Optimization (GEO)</h3>
                                    <p className="text-muted-foreground text-xs leading-relaxed">Entity schemas and semantic content engineered so ChatGPT, Perplexity, Gemini, and Google AI Overviews cite and recommend your firm.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Zap className="size-4 mt-0.5 text-primary shrink-0" />
                                <div>
                                    <h3 className="text-sm font-medium">3. Conversion & Intelligence Engine</h3>
                                    <p className="text-muted-foreground text-xs leading-relaxed">De-anonymizing visiting corporate accounts and tracking spec-sheet downloads to deliver verified pipeline to your sales desk.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:mask-l-from-35% md:mask-l-to-55% mt-12 h-fit md:absolute md:-inset-y-12 md:inset-x-0 md:mt-0">
                        <div className="border-border/50 relative rounded-2xl border border-dotted p-2">
                            <Image
                                src="/charts-light.webp"
                                className="rounded-[12px] shadow"
                                alt="AuraWorks B2B search rankings, AI citability benchmarks, and buyer intent analytics"
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
