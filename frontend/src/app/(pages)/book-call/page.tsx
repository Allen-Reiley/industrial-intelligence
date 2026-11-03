import { Metadata } from 'next';
import BookCallPage from "@/components/book-call/call-page";

export const metadata: Metadata = {
  title: 'Book a Technical Discovery Call',
  description: 'Schedule a 15-minute discovery session with our solutions architects to evaluate SEO, GEO, and visitor intelligence fit.',
  alternates: {
    canonical: '/book-call',
  },
  openGraph: {
    title: 'Book a Technical Discovery Call | AuraWorks',
    description: 'Schedule a 15-minute discovery session with our solutions architects to evaluate SEO, GEO, and visitor intelligence fit.',
    url: 'https://auraworks.co.za/book-call',
  },
};

export default function BookCall() {
  return <BookCallPage />;
}
