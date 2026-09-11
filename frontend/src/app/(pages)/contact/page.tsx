import { Metadata } from 'next';
import Link from 'next/link';
import { HeroHeader } from '@/components/header/header';
import Footer from '@/components/footer/footer';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, LifeBuoy, ArrowRight, ShieldCheck, Phone, MapPin, Building } from 'lucide-react';
import { TextEffect } from '@/components/ui/text-effect';

export const metadata: Metadata = {
  title: 'Contact Corporate Office & Solutions Architecture Desk',
  description: 'Connect directly with the AuraWorks technical integration engineering team or executive leadership in Johannesburg, South Africa.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Corporate Office & Solutions Architecture Desk | AuraWorks',
    description: 'Connect directly with the AuraWorks technical integration engineering team or executive leadership in Johannesburg, South Africa.',
    url: 'https://auraworks.co.za/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <HeroHeader />

      <main className="flex-1 pt-32 pb-24 md:pt-44">
        {/* Glow */}
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 opacity-20 [background:radial-gradient(50%_50%_at_50%_50%,var(--color-primary)_0%,transparent_100%)] blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-6">
          <div className="max-w-3xl">
            <span className="text-primary font-mono text-xs uppercase tracking-wider font-semibold">Direct Communication Channels</span>
            <TextEffect
              preset="fade-in-blur"
              speedSegment={0.3}
              as="h1"
              className="text-4xl font-bold tracking-tight sm:text-6xl text-balance mt-3">
              Connect With AuraWorks
            </TextEffect>
            <TextEffect
              per="line"
              preset="fade-in-blur"
              speedSegment={0.3}
              delay={0.5}
              as="p"
              className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Whether you are looking to establish dominant Google search rankings, achieve citability across AI engines, or deploy the AuraWorks Intelligence Engine to capture high-intent accounts, our Johannesburg engineering desk is ready.
            </TextEffect>
          </div>

          {/* Contact Cards Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border bg-card/60 backdrop-blur-sm p-8 flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div className="space-y-4">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <LifeBuoy className="size-6" />
                </div>
                <h2 className="text-xl font-bold">Technical Support Desk</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Assistance with technical SEO architecture, structured data schemas, edge tracking script integration, and CRM lead feeds.
                </p>
              </div>
              <div className="mt-8">
                <Button asChild className="w-full rounded-xl">
                  <Link href="/customer-support">
                    Open Support Desk <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border bg-card/60 backdrop-blur-sm p-8 flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div className="space-y-4">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <MessageSquare className="size-6" />
                </div>
                <h2 className="text-xl font-bold">Commercial Sales & Demos</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Speak directly with an enterprise solutions architect about turn key website engineering, existing site upgrades, and visitor capture.
                </p>
              </div>
              <div className="mt-8">
                <Button asChild variant="outline" className="w-full rounded-xl">
                  <Link href="/book-demo">
                    Schedule Live Demo <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border bg-card/60 backdrop-blur-sm p-8 flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div className="space-y-4">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Building className="size-6" />
                </div>
                <h2 className="text-xl font-bold">Executive Office</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Inquiries for enterprise growth partnerships, strategic collaborations, and direct communication with founder Reitumetse Sethabela.
                </p>
              </div>
              <div className="mt-8">
                <Button asChild variant="secondary" className="w-full rounded-xl">
                  <Link href="/about">
                    About AuraWorks <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Regional Office Info */}
          <div className="mt-12 rounded-2xl border bg-muted/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 font-semibold">
                <MapPin className="size-4 text-primary" /> Headquartered in Johannesburg, South Africa
              </div>
              <p className="text-xs text-muted-foreground">
                Serving industrial corridors across Gauteng, Mpumalanga, KwaZulu-Natal, and the broader SADC region.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" /> POPIA Registered Entity
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
