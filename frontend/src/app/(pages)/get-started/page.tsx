import { Metadata } from 'next';
import GetStartedPage from "@/components/sections/form/get-started";

export const metadata: Metadata = {
  title: 'Deploy the Ingest Tracker',
  description: 'Register your corporate profile, obtain your client-side tracking script data-id, and start receiving leads in under 5 minutes.',
};

export default function GetStarted() {
  return <GetStartedPage />;
}
