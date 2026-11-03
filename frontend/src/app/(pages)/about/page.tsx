import { Metadata } from 'next';
import { AboutHero } from "@/components/sections/about/about-hero";
import { FounderProfile } from "@/components/sections/about/founder-profile";
import { ValuesSection } from "@/components/sections/about/values";
import { AboutCTA } from "@/components/sections/about/about-cta";
import { HeroHeader } from "@/components/header/header";
import Footer from "@/components/footer/footer";

export const metadata: Metadata = {
  title: {
    absolute: 'About AuraWorks | Industrial Sales Intelligence',
  },
  description: 'Headquartered in Gauteng, AuraWorks engineers high-performance web systems and Generative Engine Optimization for SADC enterprises. Partner with us.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About AuraWorks | Industrial Sales Intelligence',
    description: 'Headquartered in Gauteng, AuraWorks engineers high-performance web systems and Generative Engine Optimization for SADC enterprises. Partner with us.',
    url: 'https://www.auraworks.co.za/about',
    type: 'website',
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
