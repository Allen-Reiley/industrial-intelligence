// @/components/sections/features/feature-grid.tsx
import { Mail, Globe, Users, BarChart3 } from 'lucide-react'

const detailFeatures = [
    { title: "Automated Inbox Delivery", desc: "No new software or dashboard training required. We deliver a curated CSV and PDF of your hottest corporate prospects directly to your inbox every Monday morning.", icon: Mail },
    { title: "Regional SADC Enrichment", desc: "Optimized specifically for the South African industrial ecosystem, recognizing local mining houses, manufacturers, and logistics giants.", icon: Globe },
    { title: "Direct Contact Paths", desc: "Not just company names. We provide verified department-specific emails, corporate switchboards, and LinkedIn profiles for key decision-makers.", icon: Users },
    { title: "Spec-Sheet Intent Tracking", desc: "Know exactly which technical CAD drawings, capacity tables, or pricing brochures were downloaded and by which firm.", icon: BarChart3 }
]

export function FeatureGrid() {
    return (
        <section className="py-24">
            <div className="mx-auto max-w-5xl px-6 text-center mb-16">
                <h2 className="text-3xl font-bold">Everything your team needs to capture the account.</h2>
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