import { Metadata } from 'next';
import PAIAManualPage from "@/components/sections/popia-manual/popia-manula";

export const metadata: Metadata = {
  title: 'POPIA Compliance & PAIA Manual',
  description: 'Access the official POPIA compliance guidelines, PAIA manuals, and personal data management policies for AuraWorks.',
  alternates: {
    canonical: '/popia-manual',
  },
  openGraph: {
    title: 'POPIA Compliance & PAIA Manual | AuraWorks',
    description: 'Official POPIA compliance guidelines and PAIA manual for AuraWorks.',
    url: 'https://auraworks.co.za/popia-manual',
  },
};

export default function PAIAManual() {
    return <PAIAManualPage />
}
