import { Metadata } from 'next';
import ThankYouPage from "@/components/sections/thanks/thank-you";

export const metadata: Metadata = {
  title: 'Thank You — Workspace Provisioning',
  description: 'Thank you for registering your profile. Your workspace provisioning is now processing.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/thank-you',
  },
};

export default function Home() {
  return (
    <main>
      <ThankYouPage />
    </main>
  );
}
