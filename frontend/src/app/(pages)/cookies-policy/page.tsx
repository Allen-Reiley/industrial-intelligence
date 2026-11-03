import { Metadata } from 'next';
import CookieConsentPage from "@/components/sections/cookies/cookie-policy";

export const metadata: Metadata = {
  title: 'Cookies & Forensic Telemetry Policy',
  description: 'Details on how persistent cookies and LocalStorage metrics are synchronized for POPIA-compliant B2B auditing.',
  alternates: {
    canonical: '/cookies-policy',
  },
  openGraph: {
    title: 'Cookies & Forensic Telemetry Policy | AuraWorks',
    description: 'Details on how persistent cookies and LocalStorage metrics are synchronized for POPIA-compliant B2B auditing.',
    url: 'https://auraworks.co.za/cookies-policy',
  },
};

export default function CookiePolicy() {
    return <CookieConsentPage />
}
