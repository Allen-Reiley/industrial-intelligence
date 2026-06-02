import { Metadata } from 'next';
import TermsOfServicePage from "@/components/sections/terms-of-service/terms-of-service";

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service, licensing specifications, and SLA boundaries governing the AuraWorks sales intelligence platform.',
};

export default function TermsOfService() {
    return <TermsOfServicePage />
}