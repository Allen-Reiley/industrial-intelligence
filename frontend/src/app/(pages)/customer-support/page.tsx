import { Metadata } from 'next';
import SupportPage from "@/components/sections/support/customer-support";

export const metadata: Metadata = {
  title: 'Customer Support Desk',
  description: 'Submit technical inquiries regarding tracking script integration, CORS boundaries, or API webhook feeds.',
};

export default function CustomerSupport() {
    return <SupportPage />;
}