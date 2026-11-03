// @/components/sections/about/values.tsx
export function ValuesSection() {
    const values = [
        { label: "01", title: "Discoverability With Purpose", desc: "We combine dominant Google search positioning with Generative Engine Optimization (GEO) so your business is cited when buyers query AI models." },
        { label: "02", title: "Proprietary Conversion Engine", desc: "Traffic without capture is lost pipeline. Our intelligence engine de-anonymizes visiting accounts and tracks technical intent, turning presence into revenue." },
        { label: "03", title: "Juristic-First Compliance", desc: "We operate exclusively on corporate entity identification, ensuring your commercial team conducts outbound prospecting in 100% compliance with South African POPIA." }
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