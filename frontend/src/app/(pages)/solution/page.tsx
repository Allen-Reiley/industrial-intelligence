import { SolutionsHero } from '@/components/sections/solutions/solutions-hero';
import { VerticalStacks } from '@/components/sections/solutions/vertical-stacks';
import { ComplianceBridge } from '@/components/sections/solutions/compliance-bridge';
import { SolutionsCTA } from '@/components/sections/solutions/solutions-cta';
import { HeroHeader } from '@/components/header/header';
import Footer from '@/components/footer/footer';

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