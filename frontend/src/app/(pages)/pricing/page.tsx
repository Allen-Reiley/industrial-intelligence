import { Metadata } from 'next';
import Pricing from '@/components/pricing/pricing';

export const metadata: Metadata = {
  title: {
    absolute: 'Custom Industrial Web Development, SEO & Intelligence | AuraWorks',
  },
  description: 'Consolidated custom solutions for industrial enterprises. High-performance Next.js web platforms, technical SEO, Generative Engine Optimization (GEO), and real-time visitor de-anonymization.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Custom Industrial Web Development, SEO & Intelligence | AuraWorks',
    description: 'Consolidated custom solutions for industrial enterprises. High-performance Next.js web platforms, technical SEO, Generative Engine Optimization (GEO), and real-time visitor de-anonymization.',
    url: 'https://www.auraworks.co.za/pricing',
    type: 'website',
  },
};

export default function PricingPage() {
  return <Pricing />;
}
