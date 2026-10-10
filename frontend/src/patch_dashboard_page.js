const fs = require('fs');
const file = 'app/(authenticated)/aurahq/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add useSession and useRouter if missing
if (!content.includes('import { useSession }')) {
  content = content.replace(
    "import Link from 'next/link';",
    "import Link from 'next/link';\nimport { useSession } from '@/lib/auth-client';\nimport { useRouter } from 'next/navigation';"
  );
}

const hookStr = `
  const router = useRouter();
  const { data: session, isPending } = useSession();
  
  useEffect(() => {
    if (!isPending) {
      const role = (session?.user as any)?.role || "sales";
      if (role !== "admin") {
        router.replace("/aurahq/sales");
      }
    }
  }, [session, isPending, router]);

  if (isPending || ((session?.user as any)?.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Activity className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }
`;

content = content.replace(
  'export default function Dashboard() {',
  'export default function Dashboard() {\n' + hookStr
);

fs.writeFileSync(file, content);
