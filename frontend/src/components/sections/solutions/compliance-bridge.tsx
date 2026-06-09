// @/components/sections/solutions/compliance-bridge.tsx
export function ComplianceBridge() {
    return (
        <section className="py-24 bg-zinc-50/50 border-y">
            <div className="mx-auto max-w-5xl px-6">
                <div className="max-w-2xl">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">POPIA-Compliant B2B Identification</h2>
                    <p className="mt-6 text-muted-foreground leading-relaxed">
                        Data privacy is a structural requirement. AuraWorks operates on a &quot;Juristic-First&quot; model. We identify registered corporate entities, not individual natural persons, ensuring your outbound sales team remains fully compliant with South African data protection laws while maintaining an active prospecting strategy.
                    </p>
                    <div className="mt-8 grid grid-cols-2 gap-8 border-t pt-8">
                        <div>
                            <h4 className="font-semibold text-sm">Juristic Focus</h4>
                            <p className="text-xs text-muted-foreground mt-2">We resolve corporate domains and business registrations, shielding consumer privacy.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">Outbound Compliance</h4>
                            <p className="text-xs text-muted-foreground mt-2">Identify B2B entities legally, providing a clear path for compliant corporate outreach.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}