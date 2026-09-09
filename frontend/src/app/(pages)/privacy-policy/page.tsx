import { Metadata } from 'next';
import PrivacyPolicyPage from "@/components/sections/privacy/privacy-policy";

export const metadata: Metadata = {
  title: 'Privacy Policy & Personal Data Safety',
  description: 'How we process, encrypt, and secure juristic entity and natural person data in strict alignment with POPIA and international data protection directives.',
  alternates: {
    canonical: '/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy & Personal Data Safety | AuraWorks',
    description: 'How we process, encrypt, and secure data in strict alignment with POPIA.',
    url: 'https://auraworks.co.za/privacy-policy',
  },
};

export default function PrivacyPolicy() {
    return <PrivacyPolicyPage />
}
