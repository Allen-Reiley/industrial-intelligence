"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShieldAlert, LogOut, Activity } from 'lucide-react';

export default function AuraHQLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Clear auth cookie and local storage credentials
    document.cookie = "aurahq_auth=; path=/; max-age=0; SameSite=Lax; Secure";
    document.cookie = "admin_access_token=; path=/; max-age=0; SameSite=Lax; Secure";
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    router.push('/login');
  };

  const navItems = [
    {
      name: 'Client Ledger',
      path: '/aurahq/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Admin Controls',
      path: '/aurahq/admin',
      icon: ShieldAlert
    }
  ];

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex flex-col font-sans">
      {/* Shared Navigation Header */}
      <header className="border-b border-zinc-900 bg-[#0c0c0e]/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold tracking-[0.2em] uppercase text-zinc-100">
                Aura<span className="text-indigo-400">HQ</span>
              </span>
            </div>

            {/* Navigation links */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-zinc-900 text-indigo-400 border border-zinc-850'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-950'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-zinc-850 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-red-400 text-[10px] font-bold uppercase tracking-wider transition-all duration-150"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
