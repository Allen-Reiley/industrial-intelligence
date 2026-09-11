import { Metadata } from 'next';
import FeaturesHero from "@/components/sections/features/features-hero";
import { IdentityBridge } from "@/components/sections/features/identity-bridge";
import { FeatureGrid } from "@/components/sections/features/feature-grid";
import { FeaturesCTA } from "@/components/sections/features/features-cta";
import Footer from "@/components/footer/footer";
import { HeroHeader } from "@/components/header/header";

export const metadata: Metadata = {
  title: {
    absolute: 'B2B Industrial Features & Visitor Tracking | AuraWorks',
  },
  description: 'Explore aura.js de-anonymization, sub-second Next.js edge performance, and dual-channel Google and LLM search optimization. Discover features.',
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    title: 'B2B Industrial Features & Visitor Tracking | AuraWorks',
    description: 'Explore aura.js de-anonymization, sub-second Next.js edge performance, and dual-channel Google and LLM search optimization. Discover features.',
    url: 'https://www.auraworks.co.za/features',
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

export default function FeaturesPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HeroHeader />
      <FeaturesHero />
      <IdentityBridge />
      <FeatureGrid />
      <FeaturesCTA /> 
      <Footer />
    </div>
  );
}
