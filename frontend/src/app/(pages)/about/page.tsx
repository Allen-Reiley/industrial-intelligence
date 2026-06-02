import { Metadata } from 'next';
import { AboutHero } from "@/components/sections/about/about-hero";
import { FounderProfile } from "@/components/sections/about/founder-profile";
import { ValuesSection } from "@/components/sections/about/values";
import { AboutCTA } from "@/components/sections/about/about-cta";
import { HeroHeader } from "@/components/header/header";
import Footer from "@/components/footer/footer";

export const metadata: Metadata = {
  title: 'Our Mission & Engineering DNA',
  description: 'Discover how AuraWorks was built to bring clinical, POPIA-compliant B2B corporate sales intelligence to South African heavy industries.',
};

export default function AboutPage() {
  return (
  <div>
    <HeroHeader />
    <AboutHero />
    <FounderProfile />
    <ValuesSection />
    <AboutCTA />
    <Footer />
  </div>);
}