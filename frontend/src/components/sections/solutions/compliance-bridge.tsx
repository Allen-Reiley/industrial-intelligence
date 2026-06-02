// @/components/sections/solutions/compliance-bridge.tsx
export function ComplianceBridge() {
    return (
        <section className="py-24 bg-zinc-50/50 dark:bg-zinc-950/20 border-y">
            <div className="mx-auto max-w-5xl px-6">
                <div className="max-w-2xl">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">POPIA-Compliant Lead Capture</h2>
                    <p className="mt-6 text-muted-foreground leading-relaxed">
                        Data privacy is not a hurdle; it&apos;s a structural requirement. AuraWorks operates on a &quot;Juristic-First&quot; model. We resolve business entities, not individual consumers, ensuring your sales team remains compliant with South African data protection laws while maintaining a high-performance outbound strategy.
                    </p>
                    <div className="mt-8 grid grid-cols-2 gap-8 border-t pt-8">
                        <div>
                            <h4 className="font-semibold text-sm">Legal Firewall</h4>
                            <p className="text-xs text-muted-foreground mt-2">Built-in consent triggers for first-party data enrichment.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">Transparency Mode</h4>
                            <p className="text-xs text-muted-foreground mt-2">Automated opt-out and data management for all identified leads.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}