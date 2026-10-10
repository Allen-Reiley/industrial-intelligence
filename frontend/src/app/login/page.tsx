// frontend/src/app/login/page.tsx
"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Shield, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  Lock, 
  AlertCircle,
  Mail,
  User,
  KeyRound,
  CheckCircle2
} from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const redirectUrl = searchParams.get("from") || "/aurahq/sales";

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setSocialLoading(provider);
    setError("");
    try {
      await signIn.social({
        provider,
        callbackURL: redirectUrl,
      });
    } catch (err: any) {
      setError(err?.message || `Failed to initialize ${provider} authentication.`);
      setSocialLoading(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (authMode === "signup") {
        if (!name.trim()) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters long.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }

        const res = await signUp.email({
          email: email.trim(),
          password,
          name: name.trim(),
          callbackURL: redirectUrl,
        });

        if (res?.error) {
          throw new Error(res.error.message || "Failed to create account.");
        }

        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000);
      } else {
        const res = await signIn.email({
          email: email.trim(),
          password,
          callbackURL: redirectUrl,
        });

        if (res?.error) {
          throw new Error(res.error.message || "Invalid email or password.");
        }

        router.push(redirectUrl);
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Astryx Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 text-indigo-400 mb-4 shadow-xl shadow-indigo-500/5">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            AuraHQ Operations Portal
          </h1>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.25em] font-semibold mt-1">
            Industrial Intelligence OS
          </p>
        </div>

        {/* Astryx Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-2xl space-y-6">
          {/* Auth Mode Tabs */}
          <div className="flex bg-zinc-950/70 border border-zinc-850 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setError("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                authMode === "signin"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setError("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                authMode === "signup"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="space-y-1.5 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono uppercase tracking-widest font-semibold">
              <Sparkles className="w-3 h-3" /> Multi-Method Auth
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed pt-1">
              {authMode === "signin"
                ? "Sign in with Google, GitHub, or your email & password."
                : "Register a new sales or management account with any email."}
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Social OAuth Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => handleSocialSignIn("google")}
              disabled={Boolean(socialLoading) || loading}
              className="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {socialLoading === "google" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Connecting Google...</span>
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
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSocialSignIn("github")}
              disabled={Boolean(socialLoading) || loading}
              className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {socialLoading === "github" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
                  <span>Connecting GitHub...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 fill-current text-zinc-200" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>Continue with GitHub</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-zinc-900 px-3 text-[10px] uppercase font-mono tracking-widest text-zinc-500 absolute">
              or with email
            </span>
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {authMode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Belfort"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Corporate Email *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.co.za"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Password *</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {authMode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Confirm Password *</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || Boolean(socialLoading)}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{authMode === "signin" ? "Authenticating..." : "Creating Account..."}</span>
                </>
              ) : (
                <>
                  <span>{authMode === "signin" ? "Sign In with Email" : "Register Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Metadata */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-zinc-500" /> RBAC Protected
            </span>
            <span>Better Auth v2.0</span>
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
