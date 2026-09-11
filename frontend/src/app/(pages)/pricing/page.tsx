import { Metadata } from 'next';
import Pricing from '@/components/pricing/pricing';

export const metadata: Metadata = {
  title: 'Enterprise Plans & Growth Partnership Pricing',
  description: 'Predictable, high-ROI organic discoverability and pipeline intelligence partnerships tailored for South African and SADC industrial leaders.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Enterprise Plans & Growth Partnership Pricing | AuraWorks',
    description: 'Full-service technical SEO, Generative Engine Optimization (GEO), and proprietary AuraWorks Intelligence Engine integration.',
    url: 'https://auraworks.co.za/pricing',
  },
};

export default function PricingPage() {
  return <Pricing />;
}
