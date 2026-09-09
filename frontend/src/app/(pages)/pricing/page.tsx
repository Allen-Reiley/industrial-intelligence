import { Metadata } from 'next';
import Pricing from '@/components/pricing/pricing';

export const metadata: Metadata = {
  title: 'Industrial Sales Engine Pricing & Enterprise Plans',
  description: 'Predictable, contract-ready sales intelligence plans tailored for SADC manufacturing, engineering, and logistics suppliers.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Industrial Sales Engine Pricing & Enterprise Plans | AuraWorks',
    description: 'Predictable, contract-ready sales intelligence plans tailored for SADC manufacturing, engineering, and logistics suppliers.',
    url: 'https://auraworks.co.za/pricing',
  },
};

export default function PricingPage() {
  return <Pricing />;
}
