import { Metadata } from 'next';
import SupportPage from "@/components/sections/support/customer-support";

export const metadata: Metadata = {
  title: 'Customer Support & Integration Desk',
  description: 'Technical support for SEO infrastructure, structured data verification, edge tracking script integration, and lead delivery.',
  alternates: {
    canonical: '/customer-support',
  },
  openGraph: {
    title: 'Customer Support & Integration Desk | AuraWorks',
    description: 'Technical support for SEO infrastructure, structured data verification, edge tracking script integration, and lead delivery.',
    url: 'https://auraworks.co.za/customer-support',
  },
};

export default function CustomerSupport() {
  return <SupportPage />;
}
