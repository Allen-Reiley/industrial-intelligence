// @/components/sections/solutions/vertical-stacks.tsx
import { cn } from '@/lib/utils'

const verticals = [
    {
        title: "High-Performance Website Builds",
        problem: "Traditional agency websites are built as static digital brochures. They lack deep technical SEO architecture, remain invisible to generative AI engines, and leak 98% of visiting industrial buyers because there is no built-in conversion technology.",
        solution: "We engineer a high-speed web presence from the ground up with built-in technical SEO, Generative Engine Optimization (GEO) structured data, and the AuraWorks Intelligence Engine embedded as a native conversion layer—transforming your website into an active pipeline asset.",
        stats: "Includes: Modern web engineering, GEO entity architecture, built-in visitor intelligence."
    },
    {
        title: "Existing Website Upgrades",
        problem: "Your enterprise has an established brand and existing web traffic, but your company is unreferenced in AI engine recommendations (ChatGPT, Perplexity, Gemini) and your sales reps have zero visibility into which corporate accounts are reviewing your technical specifications.",
        solution: "We retrofit your existing site with enterprise-grade technical SEO, inject Generative Engine Optimization (GEO) semantic graphs, and plug in the AuraWorks Intelligence Engine to unmask high-intent corporate visitors without requiring a rebuild.",
        stats: "Includes: Technical SEO retrofit, GEO citability schemas, standalone intelligence integration."
    },
    {
        title: "SADC Industrial & Heavy Procurement",
        problem: "Multi-million Rand sales cycles in mining, manufacturing, and logistics mean buyers compare specifications months before publishing tenders—leaving your commercial team blind during the critical specification window.",
        solution: "We establish search category dominance across South African and SADC industrial hubs, ensure AI models cite your products as preferred answers, and alert your sales team the moment an industrial account investigates your capacity tables.",
        stats: "Corridors: Mining (Gauteng, Mpumalanga, Limpopo), Heavy Manufacturing, Bulk Logistics."
    }
]

export function VerticalStacks() {
    return (
        <section className="py-24">
            <div className="mx-auto max-w-5xl px-6 space-y-24">
                {verticals.map((v, i) => (
                    <div key={i} className={cn("grid gap-12 md:grid-cols-2 items-start", i % 2 !== 0 && "md:flex-row-reverse")}>
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
                        <div className="bg-zinc-100 aspect-video rounded-2xl border flex items-center justify-center overflow-hidden">
                             {/* Placeholder for vertical-specific UI/Screenshot */}
                             <span className="text-[10px] text-muted-foreground uppercase tracking-widest">[ Vertical Intent Dashboard ]</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}