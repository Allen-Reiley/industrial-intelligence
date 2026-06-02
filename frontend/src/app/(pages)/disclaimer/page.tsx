import { Metadata } from 'next';
import ProfessionalDisclaimerPage from "@/components/sections/disclaimer/disclaimer";

export const metadata: Metadata = {
  title: 'Juristic Entity Disclaimer',
  description: 'Legal disclaimers regarding juristic entity matching accuracy, firmographic database directories, and data processing bounds.',
};

export default function ProfessionalDisclaimer() {
    return <ProfessionalDisclaimerPage />
}