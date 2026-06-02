import { Metadata } from 'next';
import ThankYouPage from "@/components/sections/thanks/thank-you";

export const metadata: Metadata = {
  title: 'Thank You',
  description: 'Thank you for registering your profile. Your workspace provisioning is now processing.',
};

export default function Home() {
  return (
    <main>
      <ThankYouPage />
    </main>
  );
}
