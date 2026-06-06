import { Metadata } from 'next';
import VSLFunnel from '@/components/vsl/vsl-funnel';

export const metadata: Metadata = {
  title: 'Watch Core VSL — AuraWorks',
  description: 'Learn how AuraWorks de-anonymizes network traffic into verified B2B prospects in South Africa.',
};

export default function VSLPage() {
  return <VSLFunnel />;
}
