// @/components/sections/features/feature-grid.tsx
import { Mail, Globe, Users, BarChart3 } from 'lucide-react'

const detailFeatures = [
    { title: "Weekly Lead Digests", desc: "No dashboard fatigue. We deliver a curated PDF and CSV of your hottest leads directly to your inbox every Monday morning.", icon: Mail },
    { title: "South African Industrial Focus", desc: "Optimized specifically for the SADC region, recognizing local mining houses and logistics firms.", icon: Globe },
    { title: "Contact Enrichment", desc: "Not just company names. We find the relevant LinkedIn profiles and public emails for key decision-makers.", icon: Users },
    { title: "Spec-Sheet Tracking", desc: "Know exactly which technical drawings or pricing sheets were downloaded and by which firm.", icon: BarChart3 }
]

export function FeatureGrid() {
    return (
        <section className="py-24">
            <div className="mx-auto max-w-5xl px-6 text-center mb-16">
                <h2 className="text-3xl font-bold">Everything needed to shorten the sales cycle.</h2>
            </div>
            <div className="mx-auto max-w-5xl px-6 grid gap-px bg-border overflow-hidden rounded-3xl border md:grid-cols-2">
                {detailFeatures.map((f, i) => (
                    <div key={i} className="bg-background p-10 space-y-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <f.icon className="size-5 text-muted-foreground" />
                        <h3 className="font-bold text-lg">{f.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}