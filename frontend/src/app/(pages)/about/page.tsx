import { Metadata } from 'next';
import { AboutHero } from "@/components/sections/about/about-hero";
import { FounderProfile } from "@/components/sections/about/founder-profile";
import { ValuesSection } from "@/components/sections/about/values";
import { AboutCTA } from "@/components/sections/about/about-cta";
import { HeroHeader } from "@/components/header/header";
import Footer from "@/components/footer/footer";

export const metadata: Metadata = {
  title: 'Our Mission: Discoverability & Pipeline Conversion',
  description: 'Learn why AuraWorks was founded: bridging the gap between B2B industrial search visibility, AI citability, and qualified sales pipeline across South Africa and SADC.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'Our Mission: Discoverability & Pipeline Conversion | AuraWorks',
    description: 'Engineering-driven organic discoverability, Generative Engine Optimization (GEO), and proprietary visitor intelligence for heavy industry.',
    url: 'https://auraworks.co.za/about',
  },
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
