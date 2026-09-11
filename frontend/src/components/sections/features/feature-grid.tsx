// @/components/sections/features/feature-grid.tsx
import { Mail, Globe, Network, BarChart3 } from 'lucide-react'

const detailFeatures = [
    { title: "Generative Engine Optimization (GEO)", desc: "We engineer structured semantic data and entity graphs that ensure ChatGPT, Perplexity, Gemini, and Google AI Overviews cite and recommend your industrial solutions.", icon: Network },
    { title: "Industrial Technical SEO", desc: "Built specifically for B2B search intent in South Africa and SADC, capturing high-value procurement terms for mining, heavy engineering, and manufacturing.", icon: Globe },
    { title: "Proprietary Intelligence Engine", desc: "Built into your new site or integrated into your existing web presence to unmask visiting corporate accounts and monitor technical CAD and spec-sheet intent.", icon: BarChart3 },
    { title: "Automated Monday Inbox Delivery", desc: "No complicated software to learn. We deliver an enriched, executive-ready digest of unmasked corporate leads directly to your commercial team every Monday morning.", icon: Mail }
]

export function FeatureGrid() {
    return (
        <section className="py-24">
            <div className="mx-auto max-w-5xl px-6 text-center mb-16">
                <h2 className="text-3xl font-bold">Everything your enterprise needs to be found, cited, and chosen.</h2>
            </div>
            <div className="mx-auto max-w-5xl px-6 grid gap-px bg-border overflow-hidden rounded-3xl border md:grid-cols-2">
                {detailFeatures.map((f, i) => (
                    <div key={i} className="bg-background p-10 space-y-4 hover:bg-zinc-50/50 transition-colors">
                        <f.icon className="size-5 text-muted-foreground" />
                        <h3 className="font-bold text-lg">{f.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}