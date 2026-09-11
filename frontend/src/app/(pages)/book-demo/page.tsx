import { Metadata } from 'next';
import BookDemoPage from "@/components/sections/form/book-demo";

export const metadata: Metadata = {
  title: 'Book Strategy Demo & Discoverability Audit',
  description: 'Schedule a strategy demo and discoverability audit. Learn how AuraWorks unlocks Google search rankings, AI recommendations, and verified corporate leads.',
  alternates: {
    canonical: '/book-demo',
  },
  openGraph: {
    title: 'Book Strategy Demo & Discoverability Audit | AuraWorks',
    description: 'Schedule a strategy demo and discoverability audit. Learn how AuraWorks unlocks Google search rankings, AI recommendations, and verified corporate leads.',
    url: 'https://auraworks.co.za/book-demo',
  },
};

export default function BookDemo() {
  return <BookDemoPage />;
}
