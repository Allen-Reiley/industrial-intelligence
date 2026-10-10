"use client";

import React, { useState } from "react";
import { 
  Check, 
  Copy, 
  Plus, 
  Loader2, 
  Sparkles,
  AlertCircle
} from "lucide-react";
import posthog from "posthog-js";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);
const cleanApiBase = API_BASE.replace(/\/$/, "");

const PLAN_OPTIONS = [
  { id: "growth-foundation", name: "Growth Foundation", priceZar: 10000, cents: 1000000 },
  { id: "category-leader", name: "Industrial Category Leader", priceZar: 18500, cents: 1850000 },
  { id: "enterprise-corridor", name: "Enterprise SADC Corridor", priceZar: 32000, cents: 3200000 },
  { id: "custom", name: "Custom Enterprise Plan", priceZar: 15000, cents: 1500000 },
];

interface LinkGeneratorProps {
  onSuccess?: () => void;
}

export default function LinkGenerator({ onSuccess }: LinkGeneratorProps) {
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
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

      setBusinessName("");
      setContactEmail("");
      setContactPhone("");
      setDomain("");

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="bg-white dark:bg-white/3 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" /> Generate Dynamic 24-Hour Checkout Link
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Creates a short-lived checkout session strictly assigned to your sales attribution ID.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono uppercase font-bold">
          24h Session TTL
        </span>
      </div>

      {formError && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {generatedLink && (
        <div className="p-5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Active Checkout Link for {generatedLink.businessName}
            </span>
            <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400">Valid for 24 Hours</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={generatedLink.url}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 font-mono select-all focus:outline-none"
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
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Client Business Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rand Mining Technologies"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Contact Email *</label>
            <input
              type="email"
              required
              placeholder="director@miningtech.co.za"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Contact Phone (Optional)</label>
            <input
              type="tel"
              placeholder="+27 82 123 4567"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Plan Tier</label>
            <select
              value={selectedPlan}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 text-xs focus:border-indigo-500 focus:outline-none"
            >
              {PLAN_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (R{p.priceZar.toLocaleString()}/mo)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Custom Monthly Fee (ZAR)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs font-semibold">R</span>
              <input
                type="number"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Website Domain (Optional)</label>
            <input
              type="text"
              placeholder="miningtech.co.za"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 text-xs focus:border-indigo-500 focus:outline-none"
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
  );
}
