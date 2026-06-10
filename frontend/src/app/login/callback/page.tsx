"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function GoogleCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState('initializing'); // 'initializing' | 'authenticating' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      setStatus('error');
      setErrorMsg('Missing authorization code or state parameters from Google.');
      return;
    }

    const exchangeToken = async () => {
      setStatus('authenticating');
      try {
        const redirectUri = `${window.location.origin}/login/callback`;
        const callbackUrl = `${API_BASE.replace(/\/$/, '')}/api/v1/auth/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        
        // credentials: "include" is CRITICAL so the backend's HttpOnly cookie is saved in the browser.
        const res = await fetch(callbackUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Backend failed to verify the Google OAuth state handshake.');
        }

        // FastAPI-Users sets cookie on successful callback.
        localStorage.setItem('admin_token', 'session_cookie_active');
        localStorage.setItem('admin_refresh_token', 'session_cookie_active');

        setStatus('success');
        
        // Smooth transition to dashboard
        setTimeout(() => {
          router.push('/aurahq/dashboard');
        }, 1000);
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'Authentication handshake failed.');
      }
    };

    exchangeToken();
  }, [searchParams, router, API_BASE]);

  if (status === 'error') {
    return (
      <div className="bg-[#0c0c0e]/80 border border-zinc-850 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative overflow-hidden group max-w-md w-full">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500/40" />
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-100">Handshake Failed</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">{errorMsg}</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-all"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="bg-[#0c0c0e]/80 border border-zinc-850 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative overflow-hidden group max-w-md w-full">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-indigo-500/40" />
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-100">Handshake Completed</h2>
          <p className="text-xs text-zinc-400">Redirecting to AuraHQ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0c0c0e]/80 border border-zinc-850 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative overflow-hidden group max-w-md w-full">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="h-10 w-10 border-2 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-100">Handshake in Progress</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Verifying credentials with Google...</p>
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
