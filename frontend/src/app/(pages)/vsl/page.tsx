import { Metadata } from 'next';
import VSLFunnel from '@/components/vsl/vsl-funnel';

export const metadata: Metadata = {
  title: 'Forensic Identity Resolution Video Walkthrough',
  description: 'Learn how AuraWorks de-anonymizes network traffic into verified B2B prospects across South Africa.',
  alternates: {
    canonical: '/vsl',
  },
  openGraph: {
    title: 'Forensic Identity Resolution Video Walkthrough | AuraWorks',
    description: 'Learn how AuraWorks de-anonymizes network traffic into verified B2B prospects across South Africa.',
    url: 'https://auraworks.co.za/vsl',
  },
};

export default function VSLPage() {
  return <VSLFunnel />;
}
