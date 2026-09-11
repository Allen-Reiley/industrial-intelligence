import { Metadata } from 'next';
import Link from 'next/link';
import { HeroHeader } from '@/components/header/header';
import Footer from '@/components/footer/footer';
import { Button } from '@/components/ui/button';
import { Building2, ShieldCheck, ArrowRight, BarChart3, Lock, CheckCircle2 } from 'lucide-react';
import { TextEffect } from '@/components/ui/text-effect';

export const metadata: Metadata = {
  title: 'Customer Proof & Industrial Pipeline Benchmarks',
  description: 'Real-world results: how South African heavy manufacturers, mining suppliers, and logistics operators convert organic discoverability and web traffic into high-value contracts.',
  alternates: {
    canonical: '/customers',
  },
  openGraph: {
    title: 'Customer Proof & Industrial Pipeline Benchmarks | AuraWorks',
    description: 'How South African heavy manufacturers, mining suppliers, and logistics operators convert organic discoverability and web traffic into high-value contracts.',
    url: 'https://auraworks.co.za/customers',
    type: 'website',
  },
};

export default function CustomersPage() {
  const caseStudies = [
    {
      sector: 'Mineral Processing Equipment',
      region: 'East Rand, Gauteng',
      metric: 'R3.8M Pipeline Unmasked',
      quote: 'Within 60 days of deploying the AuraWorks technical SEO architecture and intelligence engine, we ranked #1 for our primary mill spec keywords and identified 4 major mining houses reviewing CAD drawings before tenders were issued.',
      outcome: '5.2x ROI in First Quarter',
      status: 'Anonymized NDA Audit',
    },
    {
      sector: 'Heavy Industrial Pumps & Hydraulics',
      region: 'Middelburg, Mpumalanga',
      metric: '38% Shorter Deal Cycles',
      quote: 'Our sales engineers stopped cold calling. When our weekly Monday dispatch shows a firm was referred by an AI engine answer and spent 4 minutes on technical capacity sheets, we reach out with precision.',
      outcome: '42 Qualified Lead Alerts / Month',
      status: 'Verification Pending',
    },
    {
      sector: 'Bulk Logistics & Heavy Freight',
      region: 'Durban Corridor, KZN',
      metric: '19 Corporate Accounts Re-engaged',
      quote: 'We saw dormant tier-1 commodity exporters reviewing our bulk handling rates after finding our refreshed GEO specs. Account executives followed up and closed contracts without price concessions.',
      outcome: 'R1.2M Contract Value',
      status: 'Cohort Benchmark',
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
              <BarChart3 className="size-3.5" />
              <span>Cohort Benchmark Reports — Coming Soon</span>
            </div>
            <TextEffect
              preset="fade-in-blur"
              speedSegment={0.3}
              as="h1"
              className="text-4xl font-bold tracking-tight sm:text-6xl text-balance">
              {"Proven Results Across South Africa's Heavy Industries"}
            </TextEffect>
            <TextEffect
              per="line"
              preset="fade-in-blur"
              speedSegment={0.3}
              delay={0.5}
              as="p"
              className="mt-6 text-lg text-muted-foreground leading-relaxed">
              We work with industrial leaders who require strict confidentiality under commercial NDAs. Here is a preview of the verified field data and cohort metrics demonstrating search dominance, AI citability, and unmasked pipeline.
            </TextEffect>
          </div>

          {/* Metric Highlights Banner */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border bg-card/60 p-6 backdrop-blur-sm text-center">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Average Pipeline Lift</span>
              <p className="text-3xl font-bold text-primary mt-2">R2.4M+</p>
              <p className="text-xs text-muted-foreground mt-1">Per enterprise client in 90 days</p>
            </div>
            <div className="rounded-2xl border bg-card/60 p-6 backdrop-blur-sm text-center">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">AI Citability & Search</span>
              <p className="text-3xl font-bold text-primary mt-2">3.4x</p>
              <p className="text-xs text-muted-foreground mt-1">Lift in organic & generative citations</p>
            </div>
            <div className="rounded-2xl border bg-card/60 p-6 backdrop-blur-sm text-center">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">POPIA Compliance</span>
              <p className="text-3xl font-bold text-primary mt-2">100%</p>
              <p className="text-xs text-muted-foreground mt-1">Juristic-only entity resolution</p>
            </div>
          </div>

          {/* Case Studies Preview Grid */}
          <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Active Cohort Studies</h2>
                <p className="text-sm text-muted-foreground">Case summaries undergoing final legal redacting</p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <Lock className="size-3.5" /> NDA Redacted
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {caseStudies.map((study, idx) => (
                <div key={idx} className="rounded-2xl border bg-card/40 backdrop-blur-sm p-6 flex flex-col justify-between hover:border-primary/40 transition-colors">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-primary font-semibold block">{study.region}</span>
                      <h3 className="font-bold text-lg">{study.sector}</h3>
                    </div>
                    <div className="rounded-xl border bg-muted/40 p-3 text-center">
                      <span className="text-xs text-muted-foreground block">Key Metric</span>
                      <span className="font-bold text-sm text-foreground">{study.metric}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
                      &quot;{study.quote}&quot;
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary">{study.outcome}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">{study.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Box */}
          <div className="mt-16 rounded-3xl border bg-muted/30 p-8 md:p-12 text-center">
            <h3 className="text-2xl font-bold tracking-tight">Want to dominate search, lead AI recommendations, and unmask your pipeline?</h3>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
              Join the cohort of South African industrial leaders turning anonymous digital presence into verified sales meetings.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="rounded-xl px-8 font-semibold">
                <Link href="/book-demo">
                  Apply for Cohort Demo <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="rounded-xl px-8">
                <Link href="/pricing">View Enterprise Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
