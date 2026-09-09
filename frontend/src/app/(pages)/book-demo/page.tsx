import { Metadata } from 'next';
import BookDemoPage from "@/components/sections/form/book-demo";

export const metadata: Metadata = {
  title: 'Book Onboarding Demo',
  description: 'Book an onboarding demo, register your corporate profile, and start resolving anonymous industrial traffic in under 5 minutes.',
  alternates: {
    canonical: '/book-demo',
  },
  openGraph: {
    title: 'Book Onboarding Demo | AuraWorks',
    description: 'Book an onboarding demo, register your corporate profile, and start resolving anonymous industrial traffic in under 5 minutes.',
    url: 'https://auraworks.co.za/book-demo',
  },
};

export default function BookDemo() {
  return <BookDemoPage />;
}
