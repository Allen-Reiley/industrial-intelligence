const fs = require('fs');
const file = 'app/(authenticated)/aurahq/admin/page.tsx';
let content = fs.readFileSync(file, 'utf8');

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
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }
`;

content = content.replace(
  '  const router = useRouter();\n  const { data: session } = useSession();',
  hookStr
);

fs.writeFileSync(file, content);
