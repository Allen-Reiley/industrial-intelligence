"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, User, AlertTriangle, ArrowRight } from 'lucide-react';
import { navigateToUrl } from '@/lib/utils';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const redirectUri = `${window.location.origin}/login/callback`;
      const authorizeUrl = `${API_BASE.replace(/\/$/, '')}/api/v1/auth/google/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      const res = await fetch(authorizeUrl);
      if (!res.ok) {
        throw new Error('Failed to initialize Google authentication handshake.');
      }
      
      const data = await res.json();
      if (data.authorization_url) {
        navigateToUrl(data.authorization_url);
      } else {
        throw new Error('Authorization URL missing in response payload.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred initiating Google login.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Explicitly prevent default form submission at the very beginning to avoid page reloads
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const usernameEl = (
      form.elements.namedItem('username') || 
      form.elements.namedItem('email') || 
      document.getElementById('username') || 
      document.getElementById('email')
    ) as HTMLInputElement | null;
    
    const passwordEl = (
      form.elements.namedItem('password') || 
      document.getElementById('password')
    ) as HTMLInputElement | null;

    const targetUsername = usernameEl ? usernameEl.value : emailOrUsername;
    const targetPassword = passwordEl ? passwordEl.value : password;

    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ username: targetUsername, password: targetPassword }),
      });

      // Strictly await fetch resolution and execute routing only if res.ok or a 204 No Content is returned
      const isSuccess = res.ok || res.status === 204;
      if (isSuccess) {
        // FastAPI-Users login sets HttpOnly cookie "aurahq_auth" on success.
        // Set dummy localStorage tokens for backward compatibility if components check them
        localStorage.setItem('admin_token', 'session_cookie_active');
        localStorage.setItem('admin_refresh_token', 'session_cookie_active');

        const redirectPath = searchParams.get('from') || '/aurahq/dashboard';
        router.push(redirectPath);
      } else {
        let errorMsg = 'Invalid administrative credentials.';
        try {
          const errorData = await res.json();
          console.error("Auth Failure Detail:", errorData.detail);
          if (errorData && errorData.detail) {
            errorMsg = errorData.detail;
          }
        } catch (e) {
          // ignore parsing error, use default
        }
        throw new Error(errorMsg);
      }
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
          <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-880 flex items-center justify-center text-zinc-100 shadow-[0_0_30px_rgba(99,102,241,0.15)] mb-4 animate-pulse">
            <Shield className="h-6 w-6 text-indigo-400" />
          </div>
          <h1 className="text-xl font-light tracking-[0.2em] text-center uppercase">AuraHQ Portal</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-1.5 font-semibold text-center">Administrative Command Gateway</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0c0c0e]/80 border border-zinc-850 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative overflow-hidden group hover:border-zinc-800/80 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
          
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 leading-normal">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-[#0f0f11] hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-zinc-100 font-semibold text-[10px] uppercase tracking-widest py-3.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.83 21.56,11.45 21.35,11.1z" fill="#4285F4" />
                <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.58c-0.9,0.6 -2.07,0.98 -3.3,0.98 -2.34,0 -4.33,-1.58 -5.04,-3.7H2.92v2.66C4.4,18.88 8.02,20.6 12,20.6z" fill="#34A853" />
                <path d="M6.96,13.2c-0.18,-0.54 -0.28,-1.12 -0.28,-1.7c0,-0.58 0.1,-1.16 0.28,-1.7V7.14H2.92C2.3,8.37 2,9.78 2,11.5c0,1.72 0.3,3.13 0.92,4.36L6.96,13.2z" fill="#FBBC05" />
                <path d="M12,5.4c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,2.72 14.43,2 12,2 8.02,2 4.4,3.72 2.92,6.7L6.96,9.36C7.67,7.24 9.66,5.4 12,5.4z" fill="#EA4335" />
              </svg>
              <span>Login with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-850" />
              </div>
              <span className="relative px-3 text-[9px] uppercase tracking-widest text-zinc-650 bg-[#0c0c0e] font-bold">Or continue with credentials</span>
            </div>

            {/* Standard Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-[10px] font-bold uppercase tracking-widest text-zinc-550 block">System Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                  <input 
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="admin"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-zinc-850 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none rounded-lg py-3 pl-11 pr-4 text-sm text-zinc-200 placeholder-zinc-700 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-zinc-550 block">Security Key</label>
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
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-[10px] uppercase tracking-widest py-3.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.2)] disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-[0_0_25px_rgba(79,70,229,0.3)] cursor-pointer"
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
