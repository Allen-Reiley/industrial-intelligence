import { Metadata } from 'next';
import SupportPage from "@/components/sections/support/customer-support";

export const metadata: Metadata = {
  title: 'Customer Support Desk',
  description: 'Submit technical inquiries regarding tracking script integration, CORS boundaries, or API webhook feeds.',
  alternates: {
    canonical: '/customer-support',
  },
  openGraph: {
    title: 'Customer Support Desk | AuraWorks',
    description: 'Submit technical inquiries regarding tracking script integration, CORS boundaries, or API webhook feeds.',
    url: 'https://auraworks.co.za/customer-support',
  },
};

export default function CustomerSupport() {
  return <SupportPage />;
}
