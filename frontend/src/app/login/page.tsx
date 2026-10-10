// frontend/src/app/login/page.tsx
"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Shield, Sparkles, ArrowRight, Loader2, Lock, AlertCircle } from "lucide-react";
import { signIn } from "@/lib/auth-client";

function LoginForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const redirectUrl = searchParams.get("from") || "/aurahq/sales";
      await signIn.social({
        provider: "google",
        callbackURL: redirectUrl,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to initialize Google OAuth session.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Astryx Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 text-indigo-400 mb-4 shadow-xl shadow-indigo-500/5">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            AuraHQ Operations Portal
          </h1>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.25em] font-semibold mt-2">
            Industrial Intelligence OS
          </p>
        </div>

        {/* Astryx Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono uppercase tracking-widest font-semibold">
              <Sparkles className="w-3 h-3" /> Single Sign-On Verified
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed pt-2">
              Sign in with your corporate Google Workspace identity to access your attributable sales pipeline and telemetry workspace.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 px-5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-white/5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                <span>Redirecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-950" />
              </>
            )}
          </button>

          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-zinc-500" /> RBAC Protected
            </span>
            <span>v2.0 Architecture</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
