"use client";
import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { useSession } from '@/lib/auth-client';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AppHeader from '@/layout/AppHeader';
import AppSidebar from '@/layout/AppSidebar';
import Backdrop from '@/layout/Backdrop';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '@/messages/en.json';

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="dashboard-layout min-h-screen xl:flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <AppSidebar />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}

export default function AuraHQLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const identifiedUserId = useRef<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const user = session?.user;
    if (!isPostHogConfigured || !user?.id || identifiedUserId.current === user.id) return;

    if (identifiedUserId.current) {
      posthog.reset();
    }

    const role = (user as { role?: string }).role;
    posthog.identify(user.id, {
      ...(user.email ? { email: user.email } : {}),
      ...(user.name ? { name: user.name } : {}),
      ...(role ? { role } : {}),
    });
    identifiedUserId.current = user.id;
  }, [session]);

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


  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <ThemeProvider>
        <SidebarProvider>
          <AdminLayoutInner>{children}</AdminLayoutInner>
        </SidebarProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
