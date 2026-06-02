import { Metadata } from 'next';
import Pricing from '@/components/pricing/pricing';

export const metadata: Metadata = {
  title: 'Pricing Plans',
  description: 'Predictable, contract-ready sales intelligence plans tailored for SADC manufacturing, engineering, and logistics suppliers.',
};

export default function PricingPage() {
  return <Pricing />;
}