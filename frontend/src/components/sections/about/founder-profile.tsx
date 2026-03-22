// @/components/sections/about/founder-profile.tsx
import Image from 'next/image'

export function FounderProfile() {
    return (
        <section className="py-24 bg-zinc-50/50 dark:bg-zinc-950/20 border-y">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-16 md:grid-cols-2 items-center">
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border bg-muted shadow-2xl">
                        {/* Placeholder for your "Quiet Premium" AI-generated headshot */}
                        <Image 
                            src="/founder-headshot.png" 
                            alt="Reitumetse Sethabela - Founder" 
                            fill 
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        />
                    </div>
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Reitumetse Sethabela</h2>
                            <p className="text-primary font-mono text-sm mt-1 uppercase tracking-widest">Founder & Systems Architect</p>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            With a background in engineering and a relentless focus on specialized cognitive systems, I built AuraWorks to solve the "Expertise Paradox" in sales. 
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            We don't sell "marketing hype." We deploy stable, logic-driven infrastructure—built on high-performance technology like Python and PostgreSQL—to identify and enrich juristic leads for the SADC industrial sector.
                        </p>
                        <div className="pt-4">
                             <blockquote className="italic text-sm text-foreground/80 border-l-2 border-primary pl-4">
                                "The goal isn't more traffic. The goal is unmasked revenue."
                             </blockquote>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}