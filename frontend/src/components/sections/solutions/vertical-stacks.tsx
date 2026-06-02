// @/components/sections/solutions/vertical-stacks.tsx
import { cn } from '@/lib/utils'

const verticals = [
    {
        title: "Mining & Resource Extraction",
        problem: "Procurement officers from Tier-1 mining houses browse your specs months before a tender is issued.",
        solution: "Identify the specific mining site or regional HQ researching your equipment, allowing your reps to engage before the RFP goes public.",
        stats: "Ideal for: Drill rigs, safety gear, and processing plant OEMs."
    },
    {
        title: "Industrial Manufacturing",
        problem: "Engineers are looking for technical CAD files and load capacities, but remain anonymous.",
        solution: "Track which manufacturing firms are downloading your technical documentation to gauge their project timeline and capacity needs.",
        stats: "Ideal for: Precision tooling, automation systems, and raw material suppliers."
    },
    {
        title: "Logistics & Infrastructure",
        problem: "Large-scale fleet and warehouse managers are comparing your rates and coverage areas in secret.",
        solution: "Unmask the logistics directors from corporate entities, focusing your outbound efforts on firms with active expansion intent.",
        stats: "Ideal for: 3PL providers, fleet management, and cold-chain specialists."
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
                        <div className="bg-zinc-100 dark:bg-zinc-900 aspect-video rounded-2xl border flex items-center justify-center overflow-hidden">
                             {/* Placeholder for vertical-specific UI/Screenshot */}
                             <span className="text-[10px] text-muted-foreground uppercase tracking-widest">[ Vertical Intent Dashboard ]</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}