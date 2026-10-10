import re

filepath = "frontend/src/layout/AppSidebar.tsx"
with open(filepath, 'r') as f:
    content = f.read()

# Add useSession to AppSidebar
if "import { useSession" not in content:
    content = re.sub(
        r'import \{ useTranslations \} from "next-intl";',
        r'import { useTranslations } from "next-intl";\nimport { useSession } from "@/lib/auth-client";',
        content
    )

# Get the role
if "const { data: session } = useSession();" not in content:
    content = re.sub(
        r'const t = useTranslations\("sidebar"\);',
        r'const t = useTranslations("sidebar");\n  const { data: session } = useSession();\n  const userRole = (session?.user as any)?.role || "sales";',
        content
    )

# Filter items based on role
filter_logic = """
  const filteredNavItems = userRole === "admin" ? navItems : navItems.filter(nav => 
    ["dashboard", "analytics", "sales", "calendar", "userProfile"].includes(nav.key)
  );
  
  const filteredOthersItems = userRole === "admin" ? othersItems : [];
"""
if "filteredNavItems" not in content:
    content = re.sub(
        r'const renderMenuItems = \(',
        filter_logic + '\n  const renderMenuItems = (',
        content
    )

# Use filtered items
content = content.replace(
    'const items = menuType === "main" ? navItems : othersItems;',
    'const items = menuType === "main" ? filteredNavItems : filteredOthersItems;'
)
content = content.replace(
    '{renderMenuItems(navItems, "main")}',
    '{renderMenuItems(filteredNavItems, "main")}'
)
content = content.replace(
    '{renderMenuItems(othersItems, "others")}',
    '{userRole === "admin" && renderMenuItems(filteredOthersItems, "others")}'
)

with open(filepath, 'w') as f:
    f.write(content)

print("Patched AppSidebar RBAC.")
