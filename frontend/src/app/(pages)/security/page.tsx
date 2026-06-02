import { Metadata } from 'next';
import SecurityPage from "@/components/sections/security/security";

export const metadata: Metadata = {
  title: 'Military-Grade Security & AES-256 Encryption',
  description: 'How we protect sensitive natural person data with AES-256-GCM field-level encryption, multi-tenant row-level security (RLS), and isolated database connections.',
};

export default function Security() {
    return <SecurityPage />
}