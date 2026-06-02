import { Metadata } from 'next';
import PrivacyPolicyPage from "@/components/sections/privacy/privacy-policy";

export const metadata: Metadata = {
  title: 'Privacy Policy & Personal Data Safety',
  description: 'How we process, encrypt, and secure individual PII data in alignment with SADC and global data protection directives.',
};

export default function PrivacyPolicy() {
    return <PrivacyPolicyPage />
}