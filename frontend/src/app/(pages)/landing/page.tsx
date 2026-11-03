import { Metadata } from 'next';
import IndustrialLanding from '@/components/landing/industrial-landing';

export const metadata: Metadata = {
  title: {
    absolute: 'Industrial Web Development, B2B SEO & Sales Intelligence | AuraWorks',
  },
  description: 'Custom industrial digital solutions. High-performance Next.js platforms, technical SEO, Generative Engine Optimization (GEO), and real-time juristic visitor de-anonymization.',
  alternates: {
    canonical: '/landing',
  },
  openGraph: {
    title: 'Industrial Web Development, B2B SEO & Sales Intelligence | AuraWorks',
    description: 'Custom industrial digital solutions. High-performance Next.js platforms, technical SEO, Generative Engine Optimization (GEO), and real-time juristic visitor de-anonymization.',
    url: 'https://www.auraworks.co.za/landing',
    type: 'website',
  },
};

export default function LandingPage() {
  return <IndustrialLanding />;
}
