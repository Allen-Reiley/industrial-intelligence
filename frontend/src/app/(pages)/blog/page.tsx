import { Metadata } from 'next';
import Link from 'next/link';
import { HeroHeader } from '@/components/header/header';
import Footer from '@/components/footer/footer';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  ShieldCheck, 
  ArrowRight, 
  BellRing, 
  Cpu, 
  Building2, 
  Layers, 
  Network, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { TextEffect } from '@/components/ui/text-effect';
import NewsletterSignup from './newsletter-signup';

export const metadata: Metadata = {
  title: {
    absolute: 'Industrial Discoverability & GEO Insights | AuraWorks',
  },
  description: 'Actionable guides on Generative Engine Optimization, POPIA-compliant IP tracking, and heavy industry technical search dominance. Read the guides.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Industrial Discoverability & GEO Insights | AuraWorks',
    description: 'Actionable guides on Generative Engine Optimization, POPIA-compliant IP tracking, and heavy industry technical search dominance. Read the guides.',
    url: 'https://www.auraworks.co.za/blog',
    type: 'website',
  },
};

const pillarGuides = [
  {
    slug: 'industrial-discoverability-playbook-2026',
    category: 'Industrial SEO & Strategy',
    targetKeyword: 'industrial marketing south africa',
    title: 'The 2026 Industrial Discoverability Playbook: Dominating Search, AI & Procurement in SADC',
    desc: 'An exhaustive engineering playbook covering the 4-stage SADC procurement lifecycle, empirical Core Web Vitals benchmarks across JSE-listed industrials, and Next.js 15 edge performance architectures.',
    readTime: '14 min read',
    wordCount: '2,450 words',
    date: 'March 2026',
    icon: Network,
    badge: 'Flagship Pillar Guide',
  },
  {
    slug: 'de-anonymizing-b2b-website-traffic-popia',
    category: 'Compliance & Telemetry',
    targetKeyword: 'b2b lead generation south africa',
    title: 'De-Anonymizing B2B Website Traffic: The Technical & POPIA Compliance Architecture',
    desc: 'A comprehensive technical and legal guide explaining how deterministic ASN mapping and juristic-first entity resolution unmask corporate buyers while strictly adhering to POPIA Chapter 3.',
    readTime: '11 min read',
    wordCount: '1,950 words',
    date: 'March 2026',
    icon: ShieldCheck,
    badge: 'Legal & Tech Architecture',
  },
  {
    slug: 'generative-engine-optimization-geo-vs-seo',
    category: 'AI Search Engineering',
    targetKeyword: 'b2b marketing agency south africa',
    title: 'Generative Engine Optimization (GEO) vs SEO: How AI Overviews Are Changing B2B Sales',
    desc: 'Why traditional agency keyword stuffing fails in generative search, and how South African manufacturers can achieve persistent citation across ChatGPT Search, Perplexity AI, and Google AI Overviews.',
    readTime: '12 min read',
    wordCount: '2,150 words',
    date: 'March 2026',
    icon: Cpu,
    badge: 'GEO Citation Playbook',
  },
];

const upcomingBriefs = [
  {
    category: 'Mining Procurement Telemetry',
    title: 'De-anonymizing South African Mining Houses: The Hidden Tender Cycle',
    desc: 'How Tier-1 mining operators evaluate industrial valves, crushers, and consumables 4 months before issuing RFPs.',
    icon: Building2,
    readTime: '6 min read',
    status: 'In Editorial Review',
  },
  {
    category: 'Cross-Border SADC Search',
    title: 'Multi-Region Hreflang Architecture for Cross-Border SADC Industrial Export',
    desc: 'Structuring digital catalogs across Zambia, DRC, and Mozambique to capture continental mining tenders.',
    icon: Layers,
    readTime: '8 min read',
    status: 'Peer Review',
  },
  {
    category: 'Edge Web Vitals',
    title: 'Lighthouse 100/100 for Industrial Catalogs: Sub-300ms TTFB in Sub-Saharan Africa',
    desc: 'Edge caching and asset compression strategies for remote mine site connectivity in Mpumalanga and the North West.',
    icon: FileText,
    readTime: '7 min read',
    status: 'Scheduled',
  },
];

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <HeroHeader />

      <main className="flex-1 pt-32 pb-24 md:pt-44">
        {/* Background glow */}
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 opacity-20 [background:radial-gradient(50%_50%_at_50%_50%,var(--color-primary)_0%,transparent_100%)] blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3.5 py-1 text-xs font-medium text-primary mb-6 shadow-sm">
              <BookOpen className="size-3.5" />
              <span>AuraWorks Technical Research & Industrial Intelligence</span>
            </div>
            <TextEffect
              preset="fade-in-blur"
              speedSegment={0.3}
              as="h1"
              className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance">
              Industrial Discoverability & GEO Insights
            </TextEffect>
            <TextEffect
              per="line"
              preset="fade-in-blur"
              speedSegment={0.3}
              delay={0.5}
              as="p"
              className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Engineering-grade research briefings, Generative Engine Optimization (GEO) playbooks, and POPIA-compliant visitor de-anonymization benchmarks for South African and SADC B2B industrial leaders.
            </TextEffect>
          </div>

          {/* Published Cornerstone Pillar Guides Section */}
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Flagship Architectural Publications
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Peer-reviewed technical blueprints and empirical benchmarks for industrial commercial directors
                </p>
              </div>
              <span className="font-mono text-xs text-primary font-semibold hidden sm:inline-block">
                3 Guides Published &bull; 6,500+ Words
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {pillarGuides.map((guide) => (
                <article
                  key={guide.slug}
                  className="group relative rounded-3xl border border-border bg-card p-7 shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold text-primary px-2.5 py-1 rounded-full bg-primary/10">
                        {guide.category}
                      </span>
                      <span className="text-muted-foreground font-mono text-[11px]">{guide.readTime}</span>
                    </div>

                    <div className="pt-2">
                      <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-snug">
                        <Link href={`/blog/${guide.slug}`}>
                          <span className="absolute inset-0 z-10" />
                          {guide.title}
                        </Link>
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-4">
                      {guide.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <guide.icon className="size-4 text-primary" />
                      <span className="font-mono">{guide.wordCount}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:translate-x-1 transition-transform">
                      Read Blueprint <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Email Subscription / Notification Box */}
          <div className="mt-20 rounded-3xl border bg-card/60 backdrop-blur-md p-8 md:p-10 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-2">
                <div className="inline-flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider font-semibold">
                  <BellRing className="size-3.5" /> Weekly Industrial Telemetry Briefing
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Stay Ahead of AI Search & Industrial Buying Signals</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Join 240+ commercial directors, engineering managers, and sales executives receiving our weekly dispatch on South African industrial search shifts, generative AI citation updates, and de-anonymized procurement trends.
                </p>
              </div>

              <div className="lg:col-span-5">
                <NewsletterSignup />
              </div>
            </div>
          </div>

          {/* Editorial Pipeline Preview */}
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8 border-b pb-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Editorial Research Pipeline</h3>
                <p className="text-sm text-muted-foreground">Technical papers currently undergoing data validation and peer review</p>
              </div>
              <span className="font-mono text-xs text-primary font-semibold">Q3 2026 Briefings</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingBriefs.map((brief, idx) => (
                <div key={idx} className="group relative rounded-2xl border bg-card/40 backdrop-blur-sm p-6 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono font-medium text-primary">{brief.category}</span>
                      <span>{brief.readTime}</span>
                    </div>
                    <brief.icon className="size-5 text-primary/80 group-hover:text-primary transition-colors" />
                    <h4 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors">
                      {brief.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {brief.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                      {brief.status}
                    </span>
                    <span>Q3 2026</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action */}
          <div className="mt-20 text-center border rounded-3xl p-8 sm:p-12 bg-muted/20">
            <h3 className="text-2xl font-bold">Ready to Upgrade Your Industrial Discoverability?</h3>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
              Don&apos;t wait for your competitors to capture AI search citations and de-anonymize corporate traffic. AuraWorks delivers high-performance Next.js platforms, top-tier technical SEO, and proprietary juristic visitor telemetry.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="rounded-xl px-8 font-semibold shadow-lg">
                <Link href="/book-demo">
                  Book Technical Architecture Review <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="rounded-xl px-8 font-semibold">
                <Link href="/pricing">View Enterprise Retainer Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
