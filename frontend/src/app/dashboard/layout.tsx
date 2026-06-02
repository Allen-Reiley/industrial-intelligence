import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'Real-time firmographic traffic feeds and buyer intent telemetry dashboard.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
