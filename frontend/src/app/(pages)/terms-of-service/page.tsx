import { Metadata } from 'next';
import TermsOfServicePage from "@/components/sections/terms-of-service/terms-of-service";

export const metadata: Metadata = {
  title: 'Terms of Service & Licensing SLA',
  description: 'Terms of service, licensing specifications, and SLA boundaries governing the AuraWorks industrial sales intelligence platform.',
  alternates: {
    canonical: '/terms-of-service',
  },
  openGraph: {
    title: 'Terms of Service & Licensing SLA | AuraWorks',
    description: 'Terms of service, licensing specifications, and SLA boundaries governing AuraWorks.',
    url: 'https://auraworks.co.za/terms-of-service',
  },
};

export default function TermsOfService() {
    return <TermsOfServicePage />
}
