"use client";

import React, { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function GoogleCallbackHandler() {
  const router = useRouter();

  useEffect(() => {
    // FastAPI-Users has already set the HttpOnly cookie "aurahq_auth" on successful 302 callback.
    // Set dummy localStorage tokens for backward compatibility if components check them.
    localStorage.setItem('admin_token', 'session_cookie_active');
    localStorage.setItem('admin_refresh_token', 'session_cookie_active');

    // Instantly route the user to the dashboard
    router.push('/aurahq/dashboard');
  }, [router]);

  return (
    <div className="bg-[#0c0c0e]/80 border border-zinc-850 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative overflow-hidden group max-w-md w-full">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="h-10 w-10 border-2 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-100">Handshake Completed</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Redirecting to AuraHQ dashboard...</p>
        </div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#070708] text-zinc-100 font-sans px-4 overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[150px]" />
      <Suspense fallback={
        <div className="bg-[#0c0c0e]/80 border border-zinc-850 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative overflow-hidden group max-w-md w-full flex flex-col items-center justify-center">
          <div className="h-8 w-8 border-2 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin" />
        </div>
      }>
        <GoogleCallbackHandler />
      </Suspense>
    </div>
  );
}
