// @/components/sections/about/founder-profile.tsx
import Image from 'next/image'

export function FounderProfile() {
    return (
        <section className="py-24 bg-zinc-50/50 border-y">
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
                            With an engineering systems background, I founded AuraWorks because South Africa&apos;s industrial and B2B leaders deserve growth infrastructure that reflects the technical caliber of their operations.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            The procurement journey has fundamentally shifted. Industrial decision-makers research on Google and query generative AI engines (ChatGPT, Perplexity, Gemini) long before contacting sales. Yet when they review your technical specifications, legacy marketing treats them as anonymous bounces.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            We don&apos;t deal in vanity metrics or empty clicks. We build high-performance organic discoverability systems—uniting technical SEO, Generative Engine Optimization (GEO), and our proprietary AuraWorks Intelligence Engine to deliver verified, actionable pipeline to your commercial team.
                        </p>
                        <div className="pt-4">
                             <blockquote className="italic text-sm text-foreground/80 border-l-2 border-primary pl-4">
                                &quot;The objective isn&apos;t merely more traffic. The objective is category authority, AI citability, and unmasked revenue.&quot;
                             </blockquote>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}