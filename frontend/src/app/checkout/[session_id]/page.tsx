// frontend/src/app/checkout/[session_id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  Loader2, 
  Check, 
  Clock, 
  AlertOctagon, 
  Building2, 
  Sparkles,
  Lock
} from "lucide-react";
import posthog from "posthog-js";

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

interface CheckoutSessionData {
  session_id: string;
  client_id: string;
  sales_rep_id: string;
  status: "pending" | "paid" | "expired";
  expires_at: string;
  amount: number;
  plan: string;
  business_name: string;
  contact_email?: string;
  contact_phone?: string;
}

export default function DynamicCheckoutPage({
  params,
}: {
  params?: Promise<{ session_id: string }>;
}) {
  const routeParams = useParams();
  const sessionId = (routeParams?.session_id as string) || '';
  const router = useRouter();

  const [sessionData, setSessionData] = useState<CheckoutSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [tcAccepted, setTcAccepted] = useState(false);
  const [ipAddress, setIpAddress] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanApiBase = API_BASE.replace(/\/$/, "");

  // 1. Fetch Client IP for Audit
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setIpAddress(data.ip))
      .catch(() => setIpAddress(""));
  }, []);

  // 2. Fetch Session Data
  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${cleanApiBase}/api/v1/checkout/session/${sessionId}`);
        if (res.status === 410) {
          setIsExpired(true);
          setLoading(false);
          return;
        }
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Unable to retrieve checkout session details.");
        }
        const data: CheckoutSessionData = await res.json();
        setSessionData(data);

        // Check if already expired by date
        const expTime = new Date(data.expires_at).getTime();
        if (expTime <= Date.now() || data.status === "expired") {
          setIsExpired(true);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load checkout session.");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, cleanApiBase]);

  // 3. Live 24-Hour Countdown Timer
  useEffect(() => {
    if (!sessionData?.expires_at || isExpired) return;

    const updateTimer = () => {
      const now = Date.now();
      const exp = new Date(sessionData.expires_at).getTime();
      const diff = exp - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [sessionData, isExpired]);

  // 4. Handle Payment Gateway Handoff
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tcAccepted) {
      setError("You must accept the Terms of Service to start your 14-day trial.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${cleanApiBase}/api/v1/checkout/session/${sessionId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redirect_url: `${window.location.origin}/checkout/${sessionId}?success=true`,
          tc_accepted: tcAccepted,
          tc_accepted_ip: ipAddress || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Payment gateway handoff failed.");
      }

      const data = await res.json();
      if (data.payment_url) {
        if (isPostHogConfigured) {
          posthog.capture("checkout_handoff_started", {
            plan: sessionData?.plan,
            amount_cents: sessionData?.amount,
          });
        }
        try {
          window.location.assign(data.payment_url);
        } catch {
          window.location.href = data.payment_url;
        }
      } else {
        throw new Error("No payment URL received from gateway.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected communication error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const amountZar = sessionData ? (sessionData.amount / 100).toLocaleString("en-ZA", { style: "currency", currency: "ZAR" }) : "R10,000.00";

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-4" />
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-zinc-500">
          Decrypting 24h Checkout Session...
        </p>
      </div>
    );
  }

  // 410 Gone / Expired State
  if (isExpired) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="w-full max-w-lg bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl text-center relative z-10 space-y-6">
          <div className="inline-flex p-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400 animate-pulse">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Checkout Session Expired
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
            This secure checkout session expired after 24 hours to protect pricing terms and attribution integrity.
          </p>
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 text-xs text-zinc-400 font-mono">
            Status Code: <span className="text-red-400 font-bold">410 GONE</span>
          </div>
          <p className="text-xs text-zinc-500">
            Please contact your assigned AuraWorks sales representative to generate a new active checkout link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Astryx Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header with 24-Hour Timer */}
        <div className="flex items-start justify-between border-b border-zinc-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono uppercase tracking-widest font-semibold mb-2">
              <Sparkles className="w-3 h-3" /> Secure Activation Session
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">
              {sessionData?.business_name || "AuraWorks Intelligence"}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Selected Architecture: <span className="text-zinc-200 font-semibold capitalize">{sessionData?.plan?.replace("-", " ")}</span>
            </p>
          </div>

          {/* Countdown Clock */}
          {timeLeft && (
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
              <span className="block text-[9px] text-zinc-500 uppercase tracking-widest mt-1">
                24h Session Window
              </span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Pricing Summary Card */}
        <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-baseline mb-4">
            <div>
              <span className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold">Billing Structure</span>
              <h2 className="text-lg font-bold text-zinc-100 mt-0.5">Enterprise Intelligence Access</h2>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-zinc-100">{amountZar}</span>
              <span className="text-zinc-400 text-xs">/month</span>
            </div>
          </div>

          <div className="space-y-2.5 border-t border-zinc-800/80 pt-4">
            {[
              "14-Day Zero-Risk Free Trial included",
              "Uncapped juristic visitor identity capture",
              "Sub-300ms edge telemetry tracking tag",
              "Cancel online anytime during the 14-day trial",
              "Encrypted iK Pay Vault tokenization (No immediate charge)",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="p-0.5 bg-indigo-500/20 text-indigo-400 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form & T&C Acceptance */}
        <form onSubmit={handleCheckoutSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                data-testid="tc-checkbox"
                checked={tcAccepted}
                onChange={(e) => setTcAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-950 focus:ring-2 cursor-pointer"
              />
              <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
                I accept the{" "}
                <a href="/terms-of-service" target="_blank" className="text-indigo-400 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy-policy" target="_blank" className="text-indigo-400 hover:underline">
                  Privacy Policy
                </a>
                . I understand that after the 14-day trial, my payment method on file will be automatically billed {amountZar}/mo unless cancelled.
              </span>
            </label>
          </div>

          {/* Handoff Button */}
          <button
            type="submit"
            disabled={submitting || !tcAccepted}
            className={`w-full py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-widest text-zinc-100 flex items-center justify-center gap-2 border transition-all duration-300 ${
              submitting || !tcAccepted
                ? "bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed"
                : "bg-indigo-600 border-indigo-500 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
                <span>Connecting to Gateway Vault...</span>
              </>
            ) : (
              <>
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Audit Trail Note */}
          <div className="pt-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
              POPIA Chapter 3 Audited
            </span>
            {ipAddress && <span>IP: {ipAddress}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
