import { Metadata } from 'next';
import { SolutionsHero } from '@/components/sections/solutions/solutions-hero';
import { VerticalStacks } from '@/components/sections/solutions/vertical-stacks';
import { ComplianceBridge } from '@/components/sections/solutions/compliance-bridge';
import { SolutionsCTA } from '@/components/sections/solutions/solutions-cta';
import { HeroHeader } from '@/components/header/header';
import Footer from '@/components/footer/footer';

export const metadata: Metadata = {
  title: {
    absolute: 'B2B Search & Lead Intelligence Solution | AuraWorks',
  },
  description: 'Convert anonymous corporate website visitors into qualified pipeline with POPIA-compliant forensic sales intelligence. Request a demo.',
  alternates: {
    canonical: '/solution',
  },
  openGraph: {
    title: 'B2B Search & Lead Intelligence Solution | AuraWorks',
    description: 'Convert anonymous corporate website visitors into qualified pipeline with POPIA-compliant forensic sales intelligence. Request a demo.',
    url: 'https://www.auraworks.co.za/solution',
    type: 'website',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does aura.js identify website visitors without violating POPIA?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "aura.js operates on juristic-first entity resolution, mapping IP telemetry and deterministic canvas parameters against South African commercial network registries. It resolves corporate and juristic entities rather than individual natural personal data, adhering strictly to Chapter 3 of the Protection of Personal Information Act (POPIA) with server-side AES-256 encryption."
      }
    },
    {
      "@type": "Question",
      "name": "What is Generative Engine Optimization (GEO) and why is it essential for heavy industry?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Generative Engine Optimization (GEO) structures digital architecture, schema graphs, and empirical industry benchmarks so AI engines such as ChatGPT Search, Perplexity, and Google AI Overviews cite your company as the authoritative solution when enterprise procurement teams prompt for industrial suppliers."
      }
    },
    {
      "@type": "Question",
      "name": "How fast does AuraWorks upgrade legacy industrial websites to Next.js?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AuraWorks refactors legacy WordPress, PHP, or static corporate websites into high-performance Next.js edge-rendered platforms within 14 to 21 business days, ensuring 100% Core Web Vitals compliance, sub-300ms latency, and pre-integrated visitor intelligence."
      }
    }
  ]
};

export default function SolutionPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HeroHeader />
      <SolutionsHero />
      <VerticalStacks />
      <ComplianceBridge />
      <SolutionsCTA />
      <Footer />
    </div>
  );
}
