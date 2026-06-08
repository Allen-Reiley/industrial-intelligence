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
                            With a background in engineering, I founded AuraWorks to solve a fundamental challenge: B2B industrial sales teams shouldn&apos;t operate on guesswork or wait passively for forms to be filled.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            We do not deal in superficial marketing metrics like clicks or traffic spikes. We build and deploy robust, juristic-first data infrastructure designed to unmask and enrich enterprise leads for the SADC heavy industry sectors.
                        </p>
                        <div className="pt-4">
                             <blockquote className="italic text-sm text-foreground/80 border-l-2 border-primary pl-4">
                                &quot;The goal is not more traffic. The goal is unmasked revenue.&quot;
                             </blockquote>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}