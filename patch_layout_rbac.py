import re

filepath = "frontend/src/app/(authenticated)/aurahq/layout.tsx"
with open(filepath, 'r') as f:
    content = f.read()

guard_logic = """
  useEffect(() => {
    if (session?.user) {
      const role = (session.user as any).role || "sales";
      if (role !== "admin") {
        const allowedPaths = ["/aurahq", "/aurahq/analytics", "/aurahq/sales", "/aurahq/calendar", "/aurahq/profile"];
        if (!allowedPaths.some(p => pathname === p || pathname.startsWith(p + "/"))) {
          router.push("/aurahq");
        }
      }
    }
  }, [session, pathname, router]);
"""

if "const pathname = usePathname();" not in content:
    content = re.sub(
        r'const identifiedUserId = useRef<string \| null>\(null\);',
        r'const identifiedUserId = useRef<string | null>(null);\n  const pathname = usePathname();\n  const router = useRouter();',
        content
    )
    
if "allowedPaths" not in content:
    content = content.replace(
        "identifiedUserId.current = user.id;\n  }, [session]);",
        "identifiedUserId.current = user.id;\n  }, [session]);\n" + guard_logic
    )

with open(filepath, 'w') as f:
    f.write(content)

print("Patched layout RBAC.")
