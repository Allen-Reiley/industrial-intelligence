import { Metadata } from 'next';
import CommercialLicensePage from "@/components/sections/license/license";

export const metadata: Metadata = {
  title: 'Commercial License Agreement',
  description: 'Detailed software and corporate deployment license specifications for the AuraWorks tracking engine and ingestion dashboard APIs.',
};

export default function CommercialLicense() {
    return <CommercialLicensePage />
}