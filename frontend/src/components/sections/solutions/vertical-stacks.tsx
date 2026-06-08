// @/components/sections/solutions/vertical-stacks.tsx
import { cn } from '@/lib/utils'

const verticals = [
    {
        title: "Mining & Resource Extraction",
        problem: "Waiting for procurement officers from Tier-1 mining houses to submit a contact form—only to discover they have already drafted their RFP specifications with a competitor.",
        solution: "Intercept the specific mining site or regional HQ while they are window-shopping your technical specifications, allowing your team to shape the requirements before the tender goes public.",
        stats: "Ideal for: Drill rigs, safety gear, and processing plant OEMs."
    },
    {
        title: "Industrial Manufacturing",
        problem: "Losing visibility when engineers download CAD drawings and load capacities anonymously, leaving your sales team blind to active factory expansion projects.",
        solution: "De-anonymize the manufacturing firms downloading your technical documentation to gauge their project timeline and capacity needs before your competitors do.",
        stats: "Ideal for: Precision tooling, automation systems, and raw material suppliers."
    },
    {
        title: "Logistics & Infrastructure",
        problem: "Hoping fleet and facility directors reach out via your contact page while they secretly compare your routes, cold-chain capacities, and logistics rates.",
        solution: "Unmask the logistics entities researching your infrastructure, allowing your sales team to initiate targeted outreach to expanding firms.",
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