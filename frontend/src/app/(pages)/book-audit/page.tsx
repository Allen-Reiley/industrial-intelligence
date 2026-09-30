import { Metadata } from 'next';
import BookAuditView from '@/components/audit/book-audit-view';

export const metadata: Metadata = {
  title: 'Executive SEO & GEO Audit | AuraWorks',
  description: 'Request a precise, boardroom-ready 9-page audit evaluating your domain across Google Search Console, Google Trends, OpenSEO, and Google Gemini 2.0 AI citability.',
  alternates: {
    canonical: '/book-audit',
  },
  openGraph: {
    title: 'Executive SEO & GEO Audit | AuraWorks',
    description: 'Request a precise, boardroom-ready 9-page audit evaluating your domain across Google Search Console, Google Trends, OpenSEO, and Google Gemini 2.0 AI citability.',
    url: 'https://auraworks.co.za/book-audit',
  },
};

export default function BookAuditPage() {
  return <BookAuditView />;
}
