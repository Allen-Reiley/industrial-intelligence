import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Console',
  description: 'AuraWorks Industrial Intelligence OS Internal Lead Ledger.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
