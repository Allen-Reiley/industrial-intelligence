import { Metadata } from 'next';
import FeaturesHero from "@/components/sections/features/features-hero";
import { IdentityBridge } from "@/components/sections/features/identity-bridge";
import { FeatureGrid } from "@/components/sections/features/feature-grid";
import { FeaturesCTA } from "@/components/sections/features/features-cta";
import Footer from "@/components/footer/footer";
import { HeroHeader } from "@/components/header/header";

export const metadata: Metadata = {
  title: 'Organic Discoverability, AI Citability & Lead Capture Features',
  description: 'Explore AuraWorks capabilities: technical SEO dominance, Generative Engine Optimization (GEO) for AI search engines, and our proprietary visitor intelligence engine.',
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    title: 'Organic Discoverability, AI Citability & Lead Capture Features | AuraWorks',
    description: 'Technical SEO, Generative Engine Optimization (GEO) structured data, and proprietary visitor de-anonymization for industrial B2B leaders.',
    url: 'https://auraworks.co.za/features',
  },
};

export default function FeaturesPage() {
  return (
    <div>
      <HeroHeader />
      <FeaturesHero />
      <IdentityBridge />
      <FeatureGrid />
      <FeaturesCTA /> 
      <Footer />
    </div>
  );
}
