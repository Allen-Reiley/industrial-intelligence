// @/components/sections/about/values.tsx
export function ValuesSection() {
    const values = [
        { label: "01", title: "Precision Over Volume", desc: "We would rather deliver 5 unmasked enterprise prospects than 5,000 anonymous website clicks." },
        { label: "02", title: "Juristic-First Compliance", desc: "We prioritize clean corporate resolution to ensure your sales team operates fully within South African POPIA regulations." },
        { label: "03", title: "SADC Industrial Focus", desc: "We specialize exclusively in the South African heavy industry sectors, speaking the language of spec-sheets, RFPs, and tenders." }
    ]

    return (
        <section className="py-24 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <h3 className="text-2xl font-semibold mb-16 tracking-tight">The AuraWorks Standard</h3>
                <div className="grid gap-12 md:grid-cols-3">
                    {values.map((v, i) => (
                        <div key={i} className="space-y-4">
                            <span className="text-primary font-mono text-xs">{v.label}</span>
                            <h4 className="font-bold text-lg">{v.title}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}