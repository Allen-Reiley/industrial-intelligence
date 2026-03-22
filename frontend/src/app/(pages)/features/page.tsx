import FeaturesHero from "@/components/sections/features/features-hero";
import { IdentityBridge } from "@/components/sections/features/identity-bridge";
import { FeatureGrid } from "@/components/sections/features/feature-grid";
import { FeaturesCTA } from "@/components/sections/features/features-cta";
import CallToAction from "@/components/cta/call-to-action";
import Footer from "@/components/footer/footer";
import { HeroHeader } from "@/components/hero-sec/header/header";

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
