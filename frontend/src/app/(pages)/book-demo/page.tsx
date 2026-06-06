import { Metadata } from 'next';
import BookDemoPage from "@/components/sections/form/book-demo";

export const metadata: Metadata = {
  title: 'Book Onboarding Demo — AuraWorks',
  description: 'Book a demo, register your corporate profile, and start resolving anonymous traffic in under 5 minutes.',
};

export default function BookDemo() {
  return <BookDemoPage />;
}
