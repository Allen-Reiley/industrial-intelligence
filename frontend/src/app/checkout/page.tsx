"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, CreditCard, ArrowRight, Loader2, Check } from "lucide-react";

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const clientId = searchParams ? searchParams.get("client_id") || "" : "";
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [tcAccepted, setTcAccepted] = useState(false);
  const [ipAddress, setIpAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch client IP on mount
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setIpAddress(data.ip))
      .catch(() => {
        // Fallback or leave empty to let backend fallback
        setIpAddress("");
      });
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clientId) {
      setError("Missing Client ID. Please access checkout via the provisioning dashboard.");
      return;
    }

    if (!tcAccepted) {
      setError("You must accept the Terms and Conditions to proceed.");
      return;
    }

    setLoading(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";
      const amount = billingCycle === "monthly" ? 1000000 : 12000000; // R10,000 vs R120,000 in cents
      
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const cleanApiBase = API_BASE.replace(/\/$/, "");

      const response = await fetch(`${cleanApiBase}/api/v1/billing/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          client_id: clientId,
          amount: amount,
          redirect_url: `${window.location.origin}/admin?client_id=${clientId}&checkout=success`,
          billing_cycle: billingCycle,
          tc_accepted: tcAccepted,
          tc_accepted_ip: ipAddress || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to initiate payment gateway connection.");
      }

      const data = await response.json();
      if (data.payment_url) {
        // Redirect to Ikhokha Payment Gateway
        router.push(data.payment_url);
      } else {
        throw new Error("No checkout URL returned from the payment gateway.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const priceFormatted = billingCycle === "monthly" ? "R10,000" : "R120,000";
  const periodText = billingCycle === "monthly" ? "month" : "year";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 mb-4 animate-pulse">
            <CreditCard className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            AuraWorks Billing Activation
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Activate your 14-day free trial. You will not be charged until the trial ends.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-900/50 text-red-300 rounded-xl text-sm flex items-start gap-3">
            <span className="font-bold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCheckout} className="space-y-6">
          {/* Toggle Block */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="block text-sm font-semibold text-zinc-200">Billing Interval</span>
              <span className="text-xs text-zinc-400">Choose plan period</span>
            </div>
            <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 relative">
              <button
                type="button"
                data-testid="toggle-monthly"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 ${
                  billingCycle === "monthly"
                    ? "bg-indigo-600 text-zinc-100 shadow-md"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                data-testid="toggle-annual"
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 ${
                  billingCycle === "annual"
                    ? "bg-indigo-600 text-zinc-100 shadow-md"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          {/* Pricing Details Card */}
          <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-baseline mb-4">
              <div>
                <span className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Selected Plan</span>
                <h2 className="text-xl font-bold text-zinc-100 mt-1">Enterprise Subscription</h2>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-zinc-100">{priceFormatted}</span>
                <span className="text-zinc-400 text-xs">/{periodText}</span>
              </div>
            </div>

            <div className="space-y-3 border-t border-zinc-800/80 pt-4">
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <div className="p-0.5 bg-indigo-500/20 text-indigo-400 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>14-Day Full Access Free Trial included</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <div className="p-0.5 bg-indigo-500/20 text-indigo-400 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Cancel online anytime during the trial</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <div className="p-0.5 bg-indigo-500/20 text-indigo-400 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Encrypted iK Pay Vault card tokenization</span>
              </div>
            </div>
          </div>

          {/* T&C Gate */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                data-testid="tc-checkbox"
                checked={tcAccepted}
                onChange={(e) => setTcAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-950 focus:ring-2"
              />
              <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
                I accept the{" "}
                <a href="/terms" target="_blank" className="text-indigo-400 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" target="_blank" className="text-indigo-400 hover:underline">
                  Privacy Policy
                </a>
                . I understand that after the 14-day trial, my payment method on file will be automatically charged R10,000/mo (or R120,000/yr if annual is selected) unless cancelled.
              </span>
            </label>
          </div>

          {/* Checkout Button */}
          <button
            type="submit"
            disabled={loading || !tcAccepted}
            className={`w-full py-4 px-6 rounded-xl font-bold text-sm text-zinc-100 flex items-center justify-center gap-2 border transition-all duration-300 ${
              loading || !tcAccepted
                ? "bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed"
                : "bg-indigo-600 border-indigo-500 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
                Initializing payment vault...
              </>
            ) : (
              <>
                Start Free 14-Day Trial
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Audit IP footprint indicator */}
          {ipAddress && (
            <div className="text-center text-[10px] text-zinc-500 font-mono flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
              Secure session footprint logged from IP: {ipAddress}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
