import { Metadata } from 'next';
import BookCallPage from "@/components/book-call/call-page";

export const metadata: Metadata = {
  title: 'Book a Forensic Demo Call',
  description: 'Book a session with our engineering integration experts for a complete live demonstration of our identity resolution platform.',
  alternates: {
    canonical: '/book-call',
  },
  openGraph: {
    title: 'Book a Forensic Demo Call | AuraWorks',
    description: 'Book a session with our engineering integration experts for a complete live demonstration of our identity resolution platform.',
    url: 'https://auraworks.co.za/book-call',
  },
};

export default function BookCall() {
  return <BookCallPage />;
}
