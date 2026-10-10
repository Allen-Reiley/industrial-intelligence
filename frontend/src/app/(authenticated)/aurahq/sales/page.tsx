// frontend/src/app/(authenticated)/aurahq/sales/page.tsx
"use client";

import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { 
  Building2, 
  TrendingUp, 
  Link as LinkIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  Plus, 
  Loader2, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  LogOut,
  ExternalLink,
  Users
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);
const cleanApiBase = API_BASE.replace(/\/$/, "");

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch data.");
  }
  return res.json();
};

interface CheckoutSessionItem {
  session_id: string;
  client_id: string;
  sales_rep_id: string;
  business_name: string;
  contact_email: string;
  contact_phone?: string;
  plan: string;
  amount: number;
  amount_zar: number;
  status: "pending" | "paid" | "expired";
  expires_at: string;
  created_at: string;
  is_expired: boolean;
}

interface SalesMetrics {
  sales_rep_id: string;
  sales_rep_name: string;
  total_links_generated: number;
  successful_conversions: number;
  pending_links: number;
  conversion_rate_percentage: number;
  active_pipeline_cents: number;
  active_pipeline_zar: number;
}

const PLAN_OPTIONS = [
  { id: "growth-foundation", name: "Growth Foundation", priceZar: 10000, cents: 1000000 },
  { id: "category-leader", name: "Industrial Category Leader", priceZar: 18500, cents: 1850000 },
  { id: "enterprise-corridor", name: "Enterprise SADC Corridor", priceZar: 32000, cents: 3200000 },
  { id: "custom", name: "Custom Enterprise Plan", priceZar: 15000, cents: 1500000 },
];

export default function SalesPortal() {
  const router = useRouter();
  const { data: session } = useSession();

  // 1. SWR Real-Time Polling (Every 5 seconds)
  const { 
    data: checkouts, 
    mutate: mutateCheckouts, 
    isLoading: loadingCheckouts 
  } = useSWR<CheckoutSessionItem[]>(
    `${cleanApiBase}/api/v1/sales/checkouts`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const { 
    data: metrics, 
    mutate: mutateMetrics 
  } = useSWR<SalesMetrics>(
    `${cleanApiBase}/api/v1/sales/metrics`,
    fetcher,
    { refreshInterval: 5000 }
  );

  // Form states
  const [businessName, setBusinessName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("growth-foundation");
  const [priceInput, setPriceInput] = useState("10000");
  const [domain, setDomain] = useState("");
  const [generating, setGenerating] = useState(false);
  const [formError, setFormError] = useState("");
  const [generatedLink, setGeneratedLink] = useState<{ url: string; sessionId: string; businessName: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
    const found = PLAN_OPTIONS.find((p) => p.id === planId);
    if (found) {
      setPriceInput(found.priceZar.toString());
    }
  };

  const handleGenerateCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setGenerating(true);

    const parsedPrice = parseFloat(priceInput);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError("Please enter a valid monthly price in ZAR.");
      setGenerating(false);
      return;
    }

    try {
      const res = await fetch(`${cleanApiBase}/api/v1/checkout/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          business_name: businessName,
          contact_email: contactEmail,
          contact_phone: contactPhone || null,
          selected_plan: selectedPlan,
          custom_pricing: Math.round(parsedPrice * 100), // in cents
          domain: domain || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to generate checkout session.");
      }

      const data = await res.json();
      const fullCheckoutUrl = `${window.location.origin}${data.checkout_url}`;
      setGeneratedLink({
        url: fullCheckoutUrl,
        sessionId: data.session_id,
        businessName: data.business_name,
      });
      if (isPostHogConfigured) {
        posthog.capture("checkout_link_generated", {
          plan: selectedPlan,
          monthly_price_zar: parsedPrice,
        });
      }

      // Clear Form
      setBusinessName("");
      setContactEmail("");
      setContactPhone("");
      setDomain("");

      // Trigger immediate SWR refresh
      mutateCheckouts();
      mutateMetrics();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      if (isPostHogConfigured) {
        posthog.reset();
      }
      router.push("/login");
    }
  };

  const userRole = (session?.user as any)?.role || "sales";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Astryx Top Navigation */}
      <nav className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-zinc-100">AuraHQ</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono uppercase font-bold text-indigo-400">
                  Sales Portal
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Attribution & Commission Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {userRole === "admin" && (
              <Link
                href="/aurahq/admin"
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-300 transition-colors flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" /> Admin Console
              </Link>
            )}

            <div className="text-right hidden sm:block">
              <span className="block text-xs font-semibold text-zinc-200">
                {session?.user?.name || "Sales Executive"}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{session?.user?.email}</span>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 hover:bg-zinc-900 rounded-lg border border-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* KPI Metrics Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Links Generated</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <LinkIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-zinc-100">
              {metrics?.total_links_generated ?? 0}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">Active attribution tokens</span>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Paid Conversions</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {metrics?.successful_conversions ?? 0}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">Verified client checkouts</span>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Conversion Rate</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-zinc-100">
              {metrics?.conversion_rate_percentage ?? 0}%
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">Generated vs Closed</span>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Active Pipeline</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-zinc-100">
              R{(metrics?.active_pipeline_zar ?? 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">Attributed monthly revenue</span>
          </div>
        </section>

        {/* Dynamic Link Generator Form */}
        <section className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-8 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" /> Generate Dynamic 24-Hour Checkout Link
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Creates a short-lived checkout session strictly assigned to your sales attribution ID.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono uppercase font-bold">
              24h Session TTL
            </span>
          </div>

          {formError && (
            <div className="p-3.5 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {generatedLink && (
            <div className="p-5 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Active Checkout Link for {generatedLink.businessName}
                </span>
                <span className="text-[10px] font-mono text-indigo-400">Valid for 24 Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink.url}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedLink.url, "modal-link")}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  {copiedId === "modal-link" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleGenerateCheckout} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Client Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rand Mining Technologies"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Contact Email *</label>
                <input
                  type="email"
                  required
                  placeholder="director@miningtech.co.za"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Contact Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="+27 82 123 4567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Plan Tier</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (R{p.priceZar.toLocaleString()}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Custom Monthly Fee (ZAR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-semibold">R</span>
                  <input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Website Domain (Optional)</label>
                <input
                  type="text"
                  placeholder="miningtech.co.za"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs uppercase tracking-widest text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/10 disabled:opacity-50 cursor-pointer"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating Session...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Create 24h Checkout Link
                </>
              )}
            </button>
          </form>
        </section>

        {/* Live Attribution Feed (Polling every 5 seconds) */}
        <section className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-8 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" /> Active Checkout Links Feed
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time attribution telemetry polled every 5 seconds. Automatically updates on payment confirmation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Live Polling (5s)</span>
            </div>
          </div>

          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 text-zinc-400 text-[10px] uppercase font-bold tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5">Business & Contact</th>
                  <th className="px-6 py-3.5">Plan Tier</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {checkouts && checkouts.length > 0 ? (
                  checkouts.map((item, idx) => {
                    const sId = item.session_id || (item as any).id || `sess-${idx}`;
                    const fullUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/checkout/${sId}`;
                    return (
                      <tr key={sId} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-zinc-100">{item.business_name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">{item.contact_email}</div>
                          {item.contact_phone && (
                            <div className="text-[10px] text-zinc-500 font-mono">{item.contact_phone}</div>
                          )}
                        </td>

                        <td className="px-6 py-4 capitalize text-zinc-300 font-medium">
                          {item.plan.replace("-", " ")}
                        </td>

                        <td className="px-6 py-4 font-bold text-zinc-200">
                          R{(item.amount_zar ?? (item.amount ? item.amount / 100 : 0)).toLocaleString()}/mo
                        </td>

                        <td className="px-6 py-4">
                          {item.status === "paid" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                              <CheckCircle2 className="w-3 h-3" /> Payment Confirmed
                            </span>
                          ) : item.is_expired || item.status === "expired" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                              <Clock className="w-3 h-3" /> Expired (24h)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                              <Clock className="w-3 h-3" /> Active Window
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-zinc-500 text-[10px] font-mono">
                          {new Date(item.created_at).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => copyToClipboard(fullUrl, item.session_id)}
                              title="Copy Checkout Link"
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                            >
                              {copiedId === item.session_id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <a
                              href={fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open Checkout Link"
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 text-xs">
                      {loadingCheckouts ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                          <span>Loading active sales links...</span>
                        </div>
                      ) : (
                        "No checkout sessions generated yet. Use the form above to create your first link."
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
