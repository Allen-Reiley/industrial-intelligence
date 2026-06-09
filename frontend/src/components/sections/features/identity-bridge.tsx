// @/components/sections/features/identity-bridge.tsx

export function IdentityBridge() {
    return (
        <section className="py-24 border-y bg-zinc-50/30">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-16 md:grid-cols-2 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">The Identity Resolution Protocol</h2>
                        <p className="text-muted-foreground">
                            Standard web analytics only show you anonymous traffic spikes. AuraWorks identifies the exact corporate entities behind the visits.
                        </p>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">01</div>
                                <div>
                                    <h4 className="font-medium">Corporate Identification</h4>
                                    <p className="text-sm text-muted-foreground">We match anonymous traffic patterns against live B2B registration databases to extract company names, industries, and headquarters locations.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">02</div>
                                <div>
                                    <h4 className="font-medium">Intent Prioritization</h4>
                                    <p className="text-sm text-muted-foreground">Our tracking monitors spec-sheet downloads and technical page visits, separating passing curiosity from active procurement research.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative aspect-square rounded-3xl border bg-background p-4 shadow-2xl">
                        {/* Placeholder for the "Bridge" Architecture Diagram */}
                        <div className="flex items-center justify-center h-full w-full bg-muted/50 rounded-2xl border border-dashed">
                             <span className="text-xs text-muted-foreground uppercase tracking-widest">[ Identity Bridge Schema Diagram ]</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}