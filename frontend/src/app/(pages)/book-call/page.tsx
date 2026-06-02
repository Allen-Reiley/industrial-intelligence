import { Metadata } from 'next';
import BookCallPage from "@/components/book-call/call-page";

export const metadata: Metadata = {
  title: 'Book a Forensic Demo Call',
  description: 'Book a session with our engineering integration experts for a complete live demonstration of our identity resolution platform.',
};

export default function BookCall() {
  return <BookCallPage />;
}