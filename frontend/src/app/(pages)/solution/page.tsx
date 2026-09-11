import { Metadata } from 'next';
import { SolutionsHero } from '@/components/sections/solutions/solutions-hero';
import { VerticalStacks } from '@/components/sections/solutions/vertical-stacks';
import { ComplianceBridge } from '@/components/sections/solutions/compliance-bridge';
import { SolutionsCTA } from '@/components/sections/solutions/solutions-cta';
import { HeroHeader } from '@/components/header/header';
import Footer from '@/components/footer/footer';

export const metadata: Metadata = {
  title: 'Turn key Websites & Existing Site Upgrades for Heavy Industry',
  description: 'Two strategic paths to industrial pipeline: turn key high-performance websites with built-in SEO, GEO, and Intelligence Engine, or existing site upgrades with visitor capture.',
  alternates: {
    canonical: '/solution',
  },
  openGraph: {
    title: 'Turn key Websites & Existing Site Upgrades for Heavy Industry | AuraWorks',
    description: 'Two strategic paths to industrial pipeline: turn key high-performance websites with built-in SEO, GEO, and Intelligence Engine, or existing site upgrades with visitor capture.',
    url: 'https://auraworks.co.za/solution',
  },
};

export default function SolutionPage() {
  return (
    <div>
      <HeroHeader />
      <SolutionsHero />
      <VerticalStacks />
      <ComplianceBridge />
      <SolutionsCTA />
      <Footer />
    </div>
  );
}
