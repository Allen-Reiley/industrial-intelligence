"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "@/context/ThemeContext";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
import Alert from "@/components/ui/alert/Alert";
import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { EyeCloseIcon, EyeIcon } from "@/icons";

function SignUpFormInner() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSocialSignUp = async (provider: "google" | "github" | "microsoft") => {
    setSocialLoading(provider);
    setError(null);
    try {
      const res = await signIn.social({
        provider: provider as any,
        callbackURL: "/aurahq/sales",
      });
      if (res?.error) {
        throw new Error(res.error.message || `Failed to sign up with ${provider}`);
      }
    } catch (err: any) {
      setError(err?.message || `Failed to initialize ${provider} signup.`);
      setSocialLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please provide your full name.");
      return;
    }
    if (!trimmedEmail) {
      setError("Please provide your work email address.");
      return;
    }
    if (!password) {
      setError("Please choose a password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy to create an account.");
      return;
    }

    setLoading(true);

    try {
      const res = await signUp.email({
        name: trimmedName,
        email: trimmedEmail,
        password,
        callbackURL: "/aurahq/sales",
      });

      if (res?.error) {
        throw new Error(res.error.message || "Failed to create account. Please verify your details.");
      }

      setSuccessMessage("Account created successfully! Redirecting to your workspace...");
      setTimeout(() => {
        router.push("/aurahq/sales");
      }, 750);
    } catch (err: any) {
      setError(err?.message || "Registration failed. An account with this email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex lg:flex-row w-full min-h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
        {/* Form Container */}
        <div className="flex w-full flex-1 flex-col justify-center lg:w-1/2 px-4 sm:px-8 py-10">
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="lg:hidden mb-6 flex justify-start">
                <Link href="/">
                  <Image
                    src="/images/logo/auraworks-logo.svg"
                    alt="AuraWorks"
                    width={150}
                    height={38}
                    priority
                    style={{ width: "auto", height: "auto" }}
                  />
                </Link>
              </div>
              <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
                Join AuraWorks Sales & Operations
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create your team account to access live visitor signals and industrial sales tooling.
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-5">
                <Alert
                  variant="error"
                  title="Registration Error"
                  message={error}
                />
              </div>
            )}
            {successMessage && (
              <div className="mb-5">
                <Alert
                  variant="success"
                  title="Success"
                  message={successMessage}
                />
              </div>
            )}

            <div>
              {/* OAuth Providers */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialSignUp("google")}
                  disabled={Boolean(socialLoading) || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 disabled:opacity-50 cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z" fill="#4285F4"/>
                    <path d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z" fill="#34A853"/>
                    <path d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z" fill="#FBBC05"/>
                    <path d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z" fill="#EB4335"/>
                  </svg>
                  <span>{socialLoading === "google" ? "..." : "Google"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialSignUp("github")}
                  disabled={Boolean(socialLoading) || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>{socialLoading === "github" ? "..." : "GitHub"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialSignUp("microsoft")}
                  disabled={Boolean(socialLoading) || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 disabled:opacity-50 cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.5 2H2V9.5H9.5V2Z" fill="#F25022"/>
                    <path d="M18 2H10.5V9.5H18V2Z" fill="#7FBA00"/>
                    <path d="M9.5 10.5H2V18H9.5V10.5Z" fill="#00A4EF"/>
                    <path d="M18 10.5H10.5V18H18V10.5Z" fill="#FFB900"/>
                  </svg>
                  <span>{socialLoading === "microsoft" ? "..." : "Microsoft"}</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative py-4 sm:py-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="bg-white px-4 text-gray-400 dark:bg-gray-900">
                    Or register with work email
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">
                      Full Name <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">
                      Work Email <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@company.co.za"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">
                      Password <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Choose a strong password (min 8 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="inset-e-4 absolute top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        role="button"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">
                      Confirm Password <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="inset-e-4 absolute top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        role="button"
                      >
                        {showConfirmPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <Checkbox
                      id="agreeTerms"
                      checked={agreeTerms}
                      onChange={setAgreeTerms}
                    />
                    <label htmlFor="agreeTerms" className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      I agree to the{" "}
                      <Link href="/terms-of-service" className="text-brand-500 hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy-policy" className="text-brand-500 hover:underline">
                        Privacy Policy
                      </Link>.
                    </label>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full"
                      size="sm"
                      disabled={loading || Boolean(socialLoading)}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating Account...
                        </span>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="text-brand-500 font-medium hover:text-brand-600 dark:text-brand-400 cursor-pointer"
                      >
                        Sign In
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side Branding Container (TailAdmin Split-Screen) */}
        <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden relative overflow-hidden">
          <div className="relative items-center justify-center flex z-1 w-full h-full p-12">
            <GridShape />
            <div className="flex flex-col items-center max-w-sm gap-6 relative z-10 text-center">
              <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
                <Image
                  src="/images/logo/auraworks-logo.svg"
                  alt="AuraWorks"
                  width={220}
                  height={56}
                  priority
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Industrial Intelligence OS
                </h2>
                <p className="mt-2 text-sm text-gray-300/80 leading-relaxed">
                  Join the platform to identify high-intent B2B visitors, manage prospects, and close enterprise deals.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Switcher */}
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <ThemeProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        }
      >
        <SignUpFormInner />
      </Suspense>
    </ThemeProvider>
  );
}
