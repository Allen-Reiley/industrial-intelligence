// @/components/sections/features/identity-bridge.tsx

export function IdentityBridge() {
    return (
        <section className="py-24 border-y bg-zinc-50/30">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-16 md:grid-cols-2 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">The Discoverability & Conversion Protocol</h2>
                        <p className="text-muted-foreground">
                            Standard web analytics only show anonymous traffic spikes. Traditional SEO agencies stop at search clicks. AuraWorks unites high-intent organic discoverability with forensic account capture.
                        </p>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">01</div>
                                <div>
                                    <h4 className="font-medium">Semantic Authority & AI Citability</h4>
                                    <p className="text-sm text-muted-foreground">We engineer your technical specifications, schema graphs, and content architecture so Google and AI search engines (ChatGPT, Perplexity, Gemini) understand and cite your brand.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">02</div>
                                <div>
                                    <h4 className="font-medium">Corporate De-Anonymization & Intent</h4>
                                    <p className="text-sm text-muted-foreground">The AuraWorks Intelligence Engine matches visiting traffic against registered enterprise databases and monitors CAD/spec-sheet downloads, unmasking active procurement research.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative aspect-square rounded-3xl border bg-background p-4 shadow-2xl">
                        {/* Placeholder for the "Bridge" Architecture Diagram */}
                        <div className="flex items-center justify-center h-full w-full bg-muted/50 rounded-2xl border border-dashed">
                             <span className="text-xs text-muted-foreground uppercase tracking-widest">[ Discoverability & Conversion Schema ]</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}