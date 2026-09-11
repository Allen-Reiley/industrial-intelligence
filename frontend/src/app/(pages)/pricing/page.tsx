import { Metadata } from 'next';
import Pricing from '@/components/pricing/pricing';

export const metadata: Metadata = {
  title: {
    absolute: 'B2B SEO & Lead Intelligence Pricing | AuraWorks',
  },
  description: 'Predictable flat-rate B2B discoverability packages. Turn key Next.js web platforms, technical SEO, and real-time visitor intelligence.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'B2B SEO & Lead Intelligence Pricing | AuraWorks',
    description: 'Predictable flat-rate B2B discoverability packages. Turn key Next.js web platforms, technical SEO, and real-time visitor intelligence.',
    url: 'https://www.auraworks.co.za/pricing',
    type: 'website',
  },
};

export default function PricingPage() {
  return <Pricing />;
}
