import { Metadata } from 'next';
import VSLFunnel from '@/components/vsl/vsl-funnel';

export const metadata: Metadata = {
  title: 'Platform Walkthrough: Discoverability & Lead Capture',
  description: 'Watch how AuraWorks pairs organic search dominance and Generative Engine Optimization (GEO) with proprietary visitor intelligence to capture high-value industrial pipeline.',
  alternates: {
    canonical: '/vsl',
  },
  openGraph: {
    title: 'Platform Walkthrough: Discoverability & Lead Capture | AuraWorks',
    description: 'Watch how AuraWorks pairs organic search dominance and Generative Engine Optimization (GEO) with proprietary visitor intelligence to capture high-value industrial pipeline.',
    url: 'https://auraworks.co.za/vsl',
  },
};

export default function VSLPage() {
  return <VSLFunnel />;
}
