import { Metadata } from 'next';
import FeaturesHero from "@/components/sections/features/features-hero";
import { IdentityBridge } from "@/components/sections/features/identity-bridge";
import { FeatureGrid } from "@/components/sections/features/feature-grid";
import { FeaturesCTA } from "@/components/sections/features/features-cta";
import CallToAction from "@/components/cta/call-to-action";
import Footer from "@/components/footer/footer";
import { HeroHeader } from "@/components/header/header";

export const metadata: Metadata = {
  title: 'AuraWorks | B2B Identity Resolution & Spec-Sheet Tracking Features',
  description: 'Explore the corporate identity resolution capabilities of the AuraWorks Engine. Legally unmask high-value industrial visitors and track spec-sheet downloads.',
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
