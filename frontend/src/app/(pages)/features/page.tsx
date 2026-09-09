import { Metadata } from 'next';
import FeaturesHero from "@/components/sections/features/features-hero";
import { IdentityBridge } from "@/components/sections/features/identity-bridge";
import { FeatureGrid } from "@/components/sections/features/feature-grid";
import { FeaturesCTA } from "@/components/sections/features/features-cta";
import Footer from "@/components/footer/footer";
import { HeroHeader } from "@/components/header/header";

export const metadata: Metadata = {
  title: 'B2B Identity Resolution & Spec-Sheet Tracking Features',
  description: 'Explore the corporate identity resolution capabilities of the AuraWorks Engine. Legally unmask high-value industrial visitors and track spec-sheet downloads.',
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    title: 'B2B Identity Resolution & Spec-Sheet Tracking Features | AuraWorks',
    description: 'Explore the corporate identity resolution capabilities of the AuraWorks Engine. Legally unmask high-value industrial visitors.',
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
