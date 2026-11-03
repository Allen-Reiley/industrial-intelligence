// @/components/sections/features/identity-bridge.tsx
import { Globe, Cpu, ArrowDown, Building2, ShieldCheck, FileText } from 'lucide-react'

export function IdentityBridge() {
    return (
        <section className="py-24 border-y bg-card/20">
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
                    <div className="relative aspect-square rounded-3xl border bg-card/60 p-6 shadow-2xl flex flex-col justify-between">
                        {/* Interactive Protocol Diagram */}
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-2">
                                <span className="flex items-center gap-1.5"><Globe className="size-3.5 text-primary" /> Inbound Search & AI Ingestion</span>
                                <span className="text-[10px] text-primary font-bold">Layer 01</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                                <div className="p-2 rounded-lg bg-background/80 border text-center">Google SERP (#1 Spec)</div>
                                <div className="p-2 rounded-lg bg-background/80 border text-center">AI Citations (ChatGPT/Perplexity)</div>
                            </div>
                        </div>

                        <div className="flex justify-center my-1 text-primary">
                            <ArrowDown className="size-4 animate-bounce" />
                        </div>

                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                            <div className="flex items-center justify-between text-xs font-mono text-primary mb-2">
                                <span className="flex items-center gap-1.5"><Cpu className="size-3.5 text-primary" /> AuraWorks Intelligence Engine</span>
                                <span className="text-[10px] font-bold">Layer 02</span>
                            </div>
                            <div className="p-2 rounded-lg bg-background/80 border text-center text-xs font-medium">
                                Deterministic Juristic Resolution (ASN & Telemetry)
                            </div>
                        </div>

                        <div className="flex justify-center my-1 text-primary">
                            <ArrowDown className="size-4 animate-bounce" />
                        </div>

                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-2">
                                <span className="flex items-center gap-1.5"><Building2 className="size-3.5 text-primary" /> Qualified Pipeline Output</span>
                                <span className="text-[10px] text-primary font-bold">Layer 03</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                                <div className="p-2 rounded-lg bg-background/80 border text-center flex items-center justify-center gap-1">
                                    <FileText className="size-3 text-primary" /> Spec Intent
                                </div>
                                <div className="p-2 rounded-lg bg-background/80 border text-center flex items-center justify-center gap-1">
                                    <ShieldCheck className="size-3 text-primary" /> POPIA Validated
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
