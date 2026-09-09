import { Metadata } from 'next';
import Link from 'next/link';
import { HeroHeader } from '@/components/header/header';
import Footer from '@/components/footer/footer';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, ShieldCheck, ArrowRight, BellRing, Cpu, Building2, FileText } from 'lucide-react';
import NewsletterSignup from './newsletter-signup';

export const metadata: Metadata = {
  title: 'Industrial Sales Intelligence & Lead Gen Insights',
  description: 'Forensic telemetry benchmarks, POPIA compliance directives, and B2B pipeline strategies for South African manufacturing, mining, and engineering firms.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Industrial Sales Intelligence & Lead Gen Insights | AuraWorks',
    description: 'Forensic telemetry benchmarks, POPIA compliance directives, and B2B pipeline strategies for South African industrial firms.',
    url: 'https://auraworks.co.za/blog',
    type: 'website',
  },
};

export default function BlogComingSoonPage() {
  const upcomingBriefs = [
    {
      category: 'Market Intelligence',
      title: 'De-anonymizing South African Mining Houses: The Hidden Tender Cycle',
      desc: 'How Tier-1 mining operators evaluate industrial valves, crushers, and consumables 4 months before issuing RFPs.',
      icon: Building2,
      readTime: '6 min read',
      status: 'In Editorial Review',
    },
    {
      category: 'Legal & Compliance',
      title: 'POPIA-Compliant Corporate Unmasking vs. Illegal Natural Person Tracking',
      desc: 'A technical breakdown of section 1 juristic entity identification versus personal data processing under South African law.',
      icon: ShieldCheck,
      readTime: '8 min read',
      status: 'Peer Review',
    },
    {
      category: 'Pipeline Architecture',
      title: 'The Spec-Sheet Dilemma: Why 98% of Industrial Engineers Never Fill Out Web Forms',
      desc: 'Analyzing 45,000 engineering page visits across Gauteng, Mpumalanga, and KwaZulu-Natal industrial nodes.',
      icon: FileText,
      readTime: '5 min read',
      status: 'Scheduled',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <HeroHeader />

      <main className="flex-1 pt-32 pb-24 md:pt-44">
        {/* Background glow */}
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 opacity-20 [background:radial-gradient(50%_50%_at_50%_50%,var(--color-primary)_0%,transparent_100%)] blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-6">
          {/* Header Section */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3.5 py-1 text-xs font-medium text-primary mb-6 shadow-sm">
              <Sparkles className="size-3.5" />
              <span>AuraWorks Intelligence Dispatch — Coming Soon</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance">
              Industrial Sales Intelligence & B2B Telemetry Research
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              We are finalizing our quarterly benchmark briefings, covering juristic traffic resolution, POPIA-compliant outreach, and sales pipeline optimization across SADC industrial corridors.
            </p>
          </div>

          {/* Email Subscription / Notification Box */}
          <div className="mt-12 rounded-3xl border bg-card/60 backdrop-blur-md p-8 md:p-10 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-2">
                <div className="inline-flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider font-semibold">
                  <BellRing className="size-3.5" /> Priority Dispatch List
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Receive the First Benchmark Briefing</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Join 240+ commercial directors and sales engineers receiving our weekly data reports on South African industrial buying signals.
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
                <h3 className="text-xl font-bold tracking-tight">Editorial Pipeline</h3>
                <p className="text-sm text-muted-foreground">Articles currently in research and peer review</p>
              </div>
              <span className="font-mono text-xs text-primary font-semibold">Q3 2026 Release</span>
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
          <div className="mt-16 text-center border rounded-2xl p-8 bg-muted/20">
            <h3 className="text-lg font-bold">Looking to identify corporate visitors right now?</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              You do not need to wait for our publications. AuraWorks is live and unmasking industrial traffic across South Africa.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Button asChild className="rounded-xl px-6">
                <Link href="/book-demo">
                  Book an Onboarding Demo <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="rounded-xl px-6">
                <Link href="/features">Explore Platform Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
