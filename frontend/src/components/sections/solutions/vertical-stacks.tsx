// @/components/sections/solutions/vertical-stacks.tsx
import { cn } from '@/lib/utils'
import { Activity, Cpu, ShieldCheck } from 'lucide-react'

const verticals = [
    {
        title: "High-Performance Website Builds",
        problem: "Traditional agency websites are built as static digital brochures. They lack deep technical SEO architecture, remain invisible to generative AI engines, and leak 98% of visiting industrial buyers because there is no built-in conversion technology.",
        solution: "We engineer a high-speed web presence from the ground up with built-in technical SEO, Generative Engine Optimization (GEO) structured data, and the AuraWorks Intelligence Engine embedded as a native conversion layer—transforming your website into an active pipeline asset.",
        stats: "Includes: Modern web engineering, GEO entity architecture, built-in visitor intelligence.",
        previewTitle: "Next.js Edge Platform Architecture",
        previewDetail: "Sub-300ms TTFB • 100/100 Core Web Vitals • Spec Schema Graphs"
    },
    {
        title: "Existing Website Upgrades",
        problem: "Your enterprise has an established brand and existing web traffic, but your company is unreferenced in AI engine recommendations (ChatGPT, Perplexity, Gemini) and your sales reps have zero visibility into which corporate accounts are reviewing your technical specifications.",
        solution: "We retrofit your existing site with enterprise-grade technical SEO, inject Generative Engine Optimization (GEO) semantic graphs, and plug in the AuraWorks Intelligence Engine to unmask high-intent corporate visitors without requiring a rebuild.",
        stats: "Includes: Technical SEO retrofit, GEO citability schemas, standalone intelligence integration.",
        previewTitle: "Edge Proxy & Telemetry Integration",
        previewDetail: "Google Tag Manager Deploy • 48-Hour Rollout • Juristic Resolution"
    },
    {
        title: "SADC Industrial & Heavy Procurement",
        problem: "Multi-million Rand sales cycles in mining, manufacturing, and logistics mean buyers compare specifications months before publishing tenders—leaving your commercial team blind during the critical specification window.",
        solution: "We establish search category dominance across South African and SADC industrial hubs, ensure AI models cite your products as preferred answers, and alert your sales team the moment an industrial account investigates your capacity tables.",
        stats: "Corridors: Mining (Gauteng, Mpumalanga, Limpopo), Heavy Manufacturing, Bulk Logistics.",
        previewTitle: "Pan-African & SADC Corridor Engine",
        previewDetail: "Cross-Border Hreflang • Mining House Telemetry • Monday Lead Dispatches"
    }
]

export function VerticalStacks() {
    return (
        <section className="py-24">
            <div className="mx-auto max-w-5xl px-6 space-y-24">
                {verticals.map((v, i) => (
                    <div key={i} className={cn("grid gap-12 md:grid-cols-2 items-center", i % 2 !== 0 && "md:flex-row-reverse")}>
                        <div className="space-y-6">
                            <h2 className="text-3xl font-medium tracking-tight">{v.title}</h2>
                            <div className="space-y-4 border-l-2 border-primary/10 pl-6">
                                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">The Challenge</p>
                                <p className="text-muted-foreground italic">&quot;{v.problem}&quot;</p>
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">The AuraWorks Edge</p>
                                <p className="leading-relaxed">{v.solution}</p>
                            </div>
                            <p className="text-xs font-mono text-primary/70 bg-primary/5 w-fit px-3 py-1 rounded-full uppercase">{v.stats}</p>
                        </div>
                        <div className="bg-card/60 aspect-video rounded-2xl border border-border/80 flex flex-col items-center justify-center p-6 text-center space-y-3 backdrop-blur-sm shadow-xl">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <Cpu className="size-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-foreground">{v.previewTitle}</h3>
                                <p className="text-xs text-muted-foreground mt-1 font-mono">{v.previewDetail}</p>
                            </div>
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-primary/80 bg-primary/5 px-2.5 py-1 rounded-full">
                                <Activity className="size-3 text-primary" /> Active Industrial Telemetry
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
