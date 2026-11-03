import { Metadata } from 'next';
import ProfessionalDisclaimerPage from "@/components/sections/disclaimer/disclaimer";

export const metadata: Metadata = {
  title: 'Juristic Entity Disclaimer',
  description: 'Legal disclaimers regarding juristic entity matching accuracy, firmographic database directories, and data processing bounds.',
  alternates: {
    canonical: '/disclaimer',
  },
  openGraph: {
    title: 'Juristic Entity Disclaimer | AuraWorks',
    description: 'Legal disclaimers regarding juristic entity matching accuracy and data processing bounds.',
    url: 'https://auraworks.co.za/disclaimer',
  },
};

export default function ProfessionalDisclaimer() {
    return <ProfessionalDisclaimerPage />
}
