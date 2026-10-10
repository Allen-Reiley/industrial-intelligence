const fs = require('fs');
const file = 'layout/AppSidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add useSession import
content = content.replace(
  'import { useSidebar } from "../context/SidebarContext";',
  'import { useSidebar } from "../context/SidebarContext";\nimport { useSession } from "@/lib/auth-client";'
);

// Add navItems definition dynamically or replace it
const newNavItemsStr = `
const getNavItems = (role: string): NavItem[] => {
  const isSales = role === "sales";
  
  const items: NavItem[] = [];

  if (!isSales) {
    items.push({
      icon: <GridIcon />,
      key: "Dashboard",
      path: "/aurahq/dashboard",
    });
  }

  items.push(
    {
      icon: <PieChartIcon />,
      key: "Sales Analytics",
      path: "/aurahq/sales",
    },
    {
      icon: <CalenderIcon />,
      key: "Calendar",
      path: "/aurahq/calendar",
    },
    {
      icon: <ListIcon />,
      key: "Tasks",
      path: "/aurahq/tasks",
    },
    {
      icon: <UserCircleIcon />,
      key: "User Profile",
      path: "/aurahq/profile",
    }
  );

  if (!isSales) {
    items.push({
      icon: <GroupIcon />,
      key: "Personnel Command",
      path: "/aurahq/admin",
    });
  }

  return items;
};

const getOthersItems = (role: string): NavItem[] => {
  return [
    {
      icon: <PlugInIcon />,
      key: "Authentication",
      subItems: [
        { key: "signIn", path: "/login", pro: false },
        { key: "signUp", path: "/login", pro: false },
      ],
    }
  ];
};
`;

// Remove old navItems and othersItems
content = content.replace(/const navItems: NavItem\[\] = \[[\s\S]*?\];\n/, '');
content = content.replace(/const othersItems: NavItem\[\] = \[[\s\S]*?\];\n/, newNavItemsStr);

// In AppSidebar component, call useSession and getNavItems
content = content.replace(
  'const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();',
  `const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "sales";
  
  const navItems = getNavItems(role);
  const othersItems = getOthersItems(role);`
);

// Replace GroupIcon import
content = content.replace(
  'GridIcon,',
  'GridIcon,\n  GroupIcon,'
);

// Remove translation of keys for now or leave it but update keys
content = content.replace(/\{t\(\`items\.\$\{nav\.key\}\`\)\}/g, '{nav.key}');
content = content.replace(/\{t\(\`items\.\$\{subItem\.key\}\`\)\}/g, '{subItem.key}');

fs.writeFileSync(file, content);
