import AuditDashboard from "@/components/sections/audit-page/audit-page";

export const metadata = {
  title: 'Audit System | NexusCore',
  description: 'Manage and review system logs',
};

export default function AuditPage() {
  return (
    <AuditDashboard />
  );
}