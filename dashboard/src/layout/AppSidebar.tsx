"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import React, { useCallback } from "react";
import { useSidebar } from "../context/SidebarContext";
import {
  CalenderIcon,
  DollarLineIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PieChartIcon,
  UserCircleIcon,
} from "../icons/index";

export type NavItem = {
  name: string;
  key: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
};

export const navItems: NavItem[] = [
  {
    name: "Admin Console",
    key: "admin",
    icon: <GridIcon />,
    path: "/aurahq/admin",
    adminOnly: true,
  },
  {
    name: "Sales Portal",
    key: "sales",
    icon: <DollarLineIcon />,
    path: "/aurahq/sales",
  },
  {
    name: "Analytics",
    key: "analytics",
    icon: <PieChartIcon />,
    path: "/aurahq/analytics",
  },
  {
    name: "Calendar",
    key: "calendar",
    icon: <CalenderIcon />,
    path: "/aurahq/calendar",
  },
  {
    name: "Tasks",
    key: "tasks",
    icon: <ListIcon />,
    path: "/aurahq/tasks",
  },
  {
    name: "User Profile",
    key: "userProfile",
    icon: <UserCircleIcon />,
    path: "/aurahq/profile",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const t = useTranslations("sidebar");
  const { data: session } = useSession();
  const isSuperAdminEmail = ["reitumetse@auraworks.co.za", "rsethabela@auraworks.co.za"].includes(
    session?.user?.email?.toLowerCase() || ""
  );
  const userRole = isSuperAdminEmail ? "admin" : ((session?.user as any)?.role || "sales").toLowerCase();

  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly && userRole !== "admin") {
      return false;
    }
    return true;
  });

  const isActive = useCallback(
    (path: string) => {
      if (pathname === path) return true;
      if (path !== "/aurahq" && pathname.startsWith(path + "/")) return true;
      return false;
    },
    [pathname]
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out xl:mt-0 rtl:right-0 rtl:left-auto rtl:border-r-0 rtl:border-l dark:border-gray-800 dark:bg-gray-900 ${
        isExpanded || isMobileOpen ? "w-72.5" : isHovered ? "w-72.5" : "w-22.5"
      } ${
        isMobileOpen
          ? "translate-x-0"
          : "-translate-x-full rtl:translate-x-full"
      } xl:translate-x-0 xl:rtl:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Sidebar Navigation"
    >
      <div
        className={`flex py-8 ${
          !isExpanded && !isHovered ? "xl:justify-center" : "justify-start"
        }`}
      >
        <Link href="/aurahq">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/auraworks-logo.svg"
                alt="AuraWorks"
                width={150}
                height={40}
                priority
                style={{ width: "auto", height: "auto" }}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/auraworks-logo.svg"
                alt="AuraWorks"
                width={150}
                height={40}
                priority
                style={{ width: "auto", height: "auto" }}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="AuraWorks"
              width={32}
              height={32}
              priority
              style={{ width: "auto", height: "auto" }}
            />
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 flex text-xs leading-5 text-gray-400 uppercase ${
                  !isExpanded && !isHovered
                    ? "xl:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  t("groups.menu")
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              <ul className="flex flex-col gap-1">
                {visibleNavItems.map((nav) => (
                  <li key={nav.key}>
                    <Link
                      href={nav.path}
                      className={cn(
                        "group menu-item",
                        isActive(nav.path)
                          ? "menu-item-active"
                          : "menu-item-inactive"
                      )}
                    >
                      <span
                        className={cn(
                          isActive(nav.path)
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                        )}
                      >
                        {nav.icon}
                      </span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="menu-item-text">{nav.name}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
