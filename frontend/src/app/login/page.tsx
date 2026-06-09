"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, User, AlertTriangle, ArrowRight } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Invalid administrative credentials.');
        } else {
          throw new Error('Failed to connect to authentication gateway.');
        }
      }

      const data = await res.json();
      
      // Store token in cookie with 24-hour expiry (86400s)
      document.cookie = `admin_access_token=${data.access_token}; path=/; max-age=86400; SameSite=Lax; Secure`;
      
      // Store in localStorage for client-side API requests
      localStorage.setItem('admin_token', data.access_token);
      localStorage.setItem('admin_refresh_token', data.refresh_token);

      const redirectPath = searchParams.get('from') || '/admin';
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#070708] text-zinc-100 font-sans px-4 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[150px]" />
      
      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 shadow-[0_0_30px_rgba(99,102,241,0.15)] mb-4 animate-pulse">
            <Shield className="h-6 w-6 text-indigo-400" />
          </div>
          <h1 className="text-xl font-light tracking-[0.2em] text-center uppercase">AuraWorks OS</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-1.5 font-semibold text-center">Administrative Command Gateway</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0c0c0e]/80 border border-zinc-850 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative overflow-hidden group hover:border-zinc-800/80 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 leading-normal animate-shake">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">System Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input 
                  id="username"
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-850 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none rounded-lg py-3 pl-11 pr-4 text-sm text-zinc-200 placeholder-zinc-700 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input 
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-850 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none rounded-lg py-3 pl-11 pr-4 text-sm text-zinc-200 placeholder-zinc-700 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.2)] disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-[0_0_25px_rgba(79,70,229,0.3)]"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Initialize Console</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-zinc-600 mt-8 leading-normal">
          Authorized administrative access only.<br />
          IP logs and terminal actions are cryptographically ledgered.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#070708] text-zinc-100 font-sans px-4">
        <div className="h-8 w-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
