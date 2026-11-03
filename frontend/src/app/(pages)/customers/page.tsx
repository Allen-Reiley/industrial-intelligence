import { Metadata } from 'next';
import Link from 'next/link';
import { HeroHeader } from '@/components/header/header';
import Footer from '@/components/footer/footer';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight, Lock, CheckCircle2, Factory, Cpu, Truck } from 'lucide-react';
import { TextEffect } from '@/components/ui/text-effect';

export const metadata: Metadata = {
  title: {
    absolute: 'Client Confidentiality & Industrial Solutions | AuraWorks',
  },
  description: 'How AuraWorks engineers custom search, generative engine optimization, and visitor de-anonymization for South African and SADC industrial leaders under strict commercial NDAs.',
  alternates: {
    canonical: '/customers',
  },
  openGraph: {
    title: 'Client Confidentiality & Industrial Solutions | AuraWorks',
    description: 'How AuraWorks engineers custom search, generative engine optimization, and visitor de-anonymization for South African and SADC industrial leaders under strict commercial NDAs.',
    url: 'https://www.auraworks.co.za/customers',
    type: 'website',
  },
};

export default function CustomersPage() {
  const industrialSectors = [
    {
      sector: 'Mining & Mineral Processing',
      focus: 'Equipment OEMs & Reagent Suppliers',
      icon: <Factory className="size-5 text-primary" />,
      capabilities: [
        'CAD and technical spec-sheet discoverability',
        'Entity schemas for mining house procurement engines',
        'Juristic tracking of tender research & engineering visits',
      ],
      scope: 'Custom Web Dev + Technical SEO & GEO + De-anonymization',
    },
    {
      sector: 'Heavy Engineering & Fabrication',
      focus: 'Pumps, Hydraulics & Precision Machining',
      icon: <Cpu className="size-5 text-primary" />,
      capabilities: [
        'AI engine citability across ChatGPT, Perplexity & Gemini',
        'B2B catalog optimization for metallurgical ratings',
        'Automated lead dispatch directly to technical sales engineers',
      ],
      scope: 'Custom Web Dev + Technical SEO & GEO + De-anonymization',
    },
    {
      sector: 'Bulk Logistics & SADC Corridors',
      focus: 'Industrial Freight & Commodity Transport',
      icon: <Truck className="size-5 text-primary" />,
      capabilities: [
        'Cross-border corridor search & geo-targeting',
        'Corporate shipper & procurement team identification',
        'Custom route calculators & RFP capture workflows',
      ],
      scope: 'Custom Web Dev + Technical SEO & GEO + De-anonymization',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <HeroHeader />

      <main className="flex-1 pt-32 pb-24 md:pt-44">
        {/* Ambient glow */}
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 opacity-20 [background:radial-gradient(50%_50%_at_50%_50%,var(--color-primary)_0%,transparent_100%)] blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3.5 py-1 text-xs font-medium text-primary mb-6 shadow-sm">
              <Lock className="size-3.5" />
              <span>Commercial Non-Disclosure & Verification Standard</span>
            </div>
            <TextEffect
              preset="fade-in-blur"
              speedSegment={0.3}
              as="h1"
              className="text-4xl font-bold tracking-tight sm:text-6xl text-balance">
              {"Client Confidentiality & Industrial Engineering"}
            </TextEffect>
            <TextEffect
              per="line"
              preset="fade-in-blur"
              speedSegment={0.3}
              delay={0.5}
              as="p"
              className="mt-6 text-lg text-muted-foreground leading-relaxed">
              In heavy engineering, mining, and industrial supply chains, strategic search advantage and commercial telemetry are strictly confidential. We protect our partners under rigorous commercial NDAs—delivering live, verifiable demonstrations rather than marketing fluff.
            </TextEffect>
          </div>

          {/* Metric / Standards Banner */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border bg-card/60 p-6 backdrop-blur-sm text-center">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Commercial Integrity</span>
              <p className="text-3xl font-bold text-primary mt-2">100% NDA</p>
              <p className="text-xs text-muted-foreground mt-1">Strict confidentiality across all client data</p>
            </div>
            <div className="rounded-2xl border bg-card/60 p-6 backdrop-blur-sm text-center">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">POPIA Compliance</span>
              <p className="text-3xl font-bold text-primary mt-2">100% Juristic</p>
              <p className="text-xs text-muted-foreground mt-1">Enterprise ASN & network resolution only</p>
            </div>
            <div className="rounded-2xl border bg-card/60 p-6 backdrop-blur-sm text-center">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Architecture Standard</span>
              <p className="text-3xl font-bold text-primary mt-2">Custom</p>
              <p className="text-xs text-muted-foreground mt-1">Next.js edge, SEO/GEO & de-anonymization</p>
            </div>
          </div>

          {/* Industrial Sectors & Capabilities Grid */}
          <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Tailored Industrial Sector Stacks</h2>
                <p className="text-sm text-muted-foreground">Custom-engineered discoverability, lead forensics, and specialized tools</p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <ShieldCheck className="size-3.5 text-primary" /> Verified Standards
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {industrialSectors.map((sector, idx) => (
                <div key={idx} className="rounded-2xl border bg-card/40 backdrop-blur-sm p-6 flex flex-col justify-between hover:border-primary/40 transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                        {sector.icon}
                      </div>
                      <div>
                        <span className="text-xs font-mono text-primary font-semibold block">{sector.focus}</span>
                        <h3 className="font-bold text-lg">{sector.sector}</h3>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Engineered Capabilities:</span>
                      <ul className="space-y-2">
                        {sector.capabilities.map((cap, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-snug">
                            <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/50 text-[11px] font-mono text-muted-foreground">
                    {sector.scope}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification & Live Demo Section */}
          <div className="mt-16 rounded-3xl border bg-card/50 p-8 md:p-12">
            <div className="max-w-2xl">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">Live Technical Verification</span>
              <h3 className="mt-2 text-2xl font-bold tracking-tight">Experience Live De-Anonymization on Your Own Traffic</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Rather than relying on unverified claims, schedule a 30-minute discovery session. We will run an audit on your search presence, evaluate your AI citability across ChatGPT and Perplexity, and demonstrate how our juristic de-anonymization engine unmasks corporate accounts in real-time.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-xl px-8 font-semibold">
                <Link href="/book-demo">
                  Book Strategic Consultation <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="rounded-xl px-8">
                <Link href="/pricing">Request Custom Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
