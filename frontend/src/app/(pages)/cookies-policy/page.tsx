import { Metadata } from 'next';
import CookieConsentPage from "@/components/sections/cookies/cookie-policy";

export const metadata: Metadata = {
  title: 'Cookies & Forensic Telemetry Policy',
  description: 'Details on how persistent cookies and LocalStorage metrics are synchronized for POPIA-compliant B2B auditing.',
};

export default function CookiePolicy() {
    return <CookieConsentPage />
}