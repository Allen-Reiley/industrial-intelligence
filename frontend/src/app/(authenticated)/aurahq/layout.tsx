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
import { SWRConfig } from 'swr';

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
      if (typeof document !== 'undefined') {
        document.cookie = `user_role=${role}; path=/; max-age=604800; SameSite=Lax`;
      }

      // Cache session token for cross-subdomain Bearer authorization header injection
      const token =
        (session as any)?.session?.token ||
        (session as any)?.token ||
        (session as any)?.sessionToken;
      if (token && typeof window !== 'undefined') {
        try {
          localStorage.setItem("better-auth.session_token", token);
          document.cookie = `aura_session_token=${token}; path=/; max-age=604800; SameSite=Lax`;
        } catch {}
      }
      if (role !== "admin") {
        const allowedPaths = [
          "/aurahq",
          "/aurahq/sales",
          "/aurahq/analytics",
          "/aurahq/calendar",
          "/aurahq/tasks",
          "/aurahq/profile"
        ];
        if (!allowedPaths.some(p => pathname === p || pathname.startsWith(p + "/"))) {
          router.push("/aurahq/sales");
        }
      }
    }
  }, [session, pathname, router]);


  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <SWRConfig
        value={{
          onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
            // Never retry on 401 (Unauthorized) or 403 (Forbidden) to eliminate runaway retry storms
            if (error?.status === 401 || error?.status === 403) return;
            // Cap transient error retries at 3 attempts
            if (retryCount >= 3) return;
            // Exponential backoff for network/500 errors
            setTimeout(() => revalidate({ retryCount }), Math.min(1000 * 2 ** retryCount, 30000));
          },
          revalidateOnFocus: false,
        }}
      >
        <ThemeProvider>
          <SidebarProvider>
            <AdminLayoutInner>{children}</AdminLayoutInner>
          </SidebarProvider>
        </ThemeProvider>
      </SWRConfig>
    </NextIntlClientProvider>
  );
}
