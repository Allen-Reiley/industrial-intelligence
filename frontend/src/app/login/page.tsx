"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
import { Logo } from "@/components/ui/logo";
import { Loader2 } from "lucide-react";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { EyeCloseIcon, EyeIcon } from "@/icons";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const redirectUrl = searchParams.get("from") || "/aurahq";

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
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
        
        {/* Form Container */}
        <div className="flex w-full flex-1 flex-col justify-center lg:w-1/2">
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
            
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
                {authMode === "signin" ? "Sign In" : "Sign Up"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {authMode === "signin"
                  ? "Enter your email and password to sign in!"
                  : "Enter your details to create an account!"}
              </p>
            </div>
            
            {/* Error & Success Messages */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {successMessage}
              </div>
            )}

            <div>
              {/* Social Login */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
                <button
                  type="button"
                  onClick={() => handleSocialSignIn("google")}
                  disabled={Boolean(socialLoading) || loading}
                  className="inline-flex items-center justify-center gap-3 rounded-lg bg-gray-100 px-7 py-3 text-sm font-normal text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 disabled:opacity-50"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z" fill="#4285F4"/>
                    <path d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z" fill="#34A853"/>
                    <path d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z" fill="#FBBC05"/>
                    <path d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z" fill="#EB4335"/>
                  </svg>
                  {socialLoading === "google" ? "Connecting..." : "Google"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialSignIn("github")}
                  disabled={Boolean(socialLoading) || loading}
                  className="inline-flex items-center justify-center gap-3 rounded-lg bg-gray-100 px-7 py-3 text-sm font-normal text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  {socialLoading === "github" ? "Connecting..." : "GitHub"}
                </button>
              </div>

              <div className="relative py-3 sm:py-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white p-2 text-gray-400 sm:px-5 sm:py-2 dark:bg-gray-900">
                    Or
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailAuth}>
                <div className="space-y-5">
                  
                  {authMode === "signup" && (
                    <div>
                      <Label>Full Name <span className="text-error-500">*</span></Label>
                      <Input 
                        type="text" 
                        placeholder="Jordan Belfort" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <Label>Email <span className="text-error-500">*</span></Label>
                    <Input 
                      type="email" 
                      placeholder="info@company.co.za" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Password <span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="inset-e-4 absolute top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                  </div>

                  {authMode === "signup" && (
                    <div>
                      <Label>Confirm Password <span className="text-error-500">*</span></Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <span
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="inset-e-4 absolute top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                        >
                          {showConfirmPassword ? (
                            <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                          ) : (
                            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {authMode === "signin" && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={isChecked} onChange={setIsChecked} />
                        <span className="block text-theme-sm font-normal text-gray-700 dark:text-gray-400">
                          Keep me logged in
                        </span>
                      </div>
                      <button
                        type="button"
                        className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <div>
                    <Button className="w-full" size="sm" disabled={loading || Boolean(socialLoading)}>
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {authMode === "signin" ? "Signing In..." : "Creating Account..."}
                        </span>
                      ) : (
                        authMode === "signin" ? "Sign In" : "Sign Up"
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              <div className="mt-5">
                <p className="text-center text-sm font-normal text-gray-700 sm:text-start dark:text-gray-400">
                  {authMode === "signin" ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === "signin" ? "signup" : "signin");
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400 cursor-pointer font-medium"
                  >
                    {authMode === "signin" ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Branding */}
        <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
          <div className="relative items-center justify-center flex z-1">
            <GridShape />
            <div className="flex flex-col items-center max-w-xs gap-6">
              {/* Logo Swap applied here */}
              <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                <Logo className="h-12 w-auto" priority />
              </div>
              <p className="text-center text-gray-400 dark:text-white/60">
                Industrial Intelligence OS. Secure operations portal.
              </p>
            </div>
          </div>
        </div>
        
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
