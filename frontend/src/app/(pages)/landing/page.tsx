import { Metadata } from 'next';
import IndustrialLanding from '@/components/landing/industrial-landing';

export const metadata: Metadata = {
  title: {
    absolute: 'Schedule a 15-Minute Systems Diagnostic Call | AuraWorks',
  },
  description: 'Book a 1-on-1 strategy call with our systems architects. We evaluate your operational bottlenecks, custom storefront opportunities, and organic search discoverability.',
  alternates: {
    canonical: '/landing',
  },
  openGraph: {
    title: 'Schedule a 15-Minute Systems Diagnostic Call | AuraWorks',
    description: 'Book a 1-on-1 strategy call with our systems architects. We evaluate your operational bottlenecks, custom storefront opportunities, and organic search discoverability.',
    url: 'https://www.auraworks.co.za/landing',
    type: 'website',
  },
};

export default function LandingPage() {
  return <IndustrialLanding />;
}
