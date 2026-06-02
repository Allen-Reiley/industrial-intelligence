import { Metadata } from 'next';
import PAIAManualPage from "@/components/sections/popia-manual/popia-manula";

export const metadata: Metadata = {
  title: 'POPIA Compliance & PAIA Manual',
  description: 'Access the official POPIA compliance guidelines, PAIA manuals, and personal data management policies for AuraWorks.',
};

export default function PAIAManual() {
    return <PAIAManualPage />
}