import { Metadata } from 'next';
import CommercialLicensePage from "@/components/sections/license/license";

export const metadata: Metadata = {
  title: 'Commercial License Agreement',
  description: 'Detailed software and corporate deployment license specifications for the AuraWorks tracking engine and ingestion dashboard APIs.',
  alternates: {
    canonical: '/license',
  },
  openGraph: {
    title: 'Commercial License Agreement | AuraWorks',
    description: 'Software and corporate deployment license specifications for AuraWorks.',
    url: 'https://auraworks.co.za/license',
  },
};

export default function CommercialLicense() {
    return <CommercialLicensePage />
}
