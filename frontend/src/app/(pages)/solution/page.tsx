import { Metadata } from 'next';
import { SolutionsHero } from '@/components/sections/solutions/solutions-hero';
import { VerticalStacks } from '@/components/sections/solutions/vertical-stacks';
import { ComplianceBridge } from '@/components/sections/solutions/compliance-bridge';
import { SolutionsCTA } from '@/components/sections/solutions/solutions-cta';
import { HeroHeader } from '@/components/header/header';
import Footer from '@/components/footer/footer';

export const metadata: Metadata = {
  title: 'Industrial Sales Intelligence & B2B Solutions',
  description: 'Bridge the gap between anonymous website traffic and high-value contracts. Learn how AuraWorks unmasks mining, manufacturing, and logistics companies visiting your site.',
  alternates: {
    canonical: '/solution',
  },
  openGraph: {
    title: 'Industrial Sales Intelligence & B2B Solutions | AuraWorks',
    description: 'Bridge the gap between anonymous website traffic and high-value contracts for South African heavy industries.',
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
