// frontend/src/components/LinkGenerator.tsx
"use client";

import React, { useState } from "react";
import {
  Check,
  Copy,
  Plus,
  Loader2,
  Sparkles,
  Link as LinkIcon,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import posthog from "posthog-js";
import { useSession } from "@/lib/auth-client";

import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { authFetch, cleanApiBase } from "@/lib/api";

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

const PLAN_OPTIONS = [
  { id: "growth-foundation", name: "Growth Foundation", priceZar: 10000, cents: 1000000 },
  { id: "category-leader", name: "Industrial Category Leader", priceZar: 18500, cents: 1850000 },
  { id: "enterprise-corridor", name: "Enterprise SADC Corridor", priceZar: 32000, cents: 3200000 },
  { id: "custom", name: "Custom Enterprise Plan", priceZar: 15000, cents: 1500000 },
];

const DESTINATIONS = [
  { path: "/", label: "Home Page (/)" },
  { path: "/solution", label: "Solution Overview (/solution)" },
  { path: "/features", label: "Product Features (/features)" },
  { path: "/pricing", label: "Pricing Table (/pricing)" },
  { path: "/book-demo", label: "Book a Demo (/book-demo)" },
  { path: "/vsl", label: "Video Sales Letter (/vsl)" },
  { path: "custom", label: "Custom Path..." },
];

interface LinkGeneratorProps {
  onSuccess?: () => void;
}

export default function LinkGenerator({ onSuccess }: LinkGeneratorProps) {
  const { data: session } = useSession();
  const salesRepId = session?.user?.id || "rep-1";

  // Mode: "checkout" | "affiliate"
  const [activeMode, setActiveMode] = useState<"checkout" | "affiliate">("checkout");

  // Mode 1: Checkout Session Form States
  const [businessName, setBusinessName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("growth-foundation");
  const [priceInput, setPriceInput] = useState("10000");
  const [domain, setDomain] = useState("");
  const [generating, setGenerating] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [generatedCheckout, setGeneratedCheckout] = useState<{
    url: string;
    sessionId: string;
    businessName: string;
  } | null>(null);
  const [copiedCheckout, setCopiedCheckout] = useState(false);

  // Mode 2: Marketing / Affiliate Form States
  const [destinationPath, setDestinationPath] = useState("/");
  const [customPath, setCustomPath] = useState("");
  const [campaign, setCampaign] = useState("outreach");
  const [medium, setMedium] = useState("referral");
  const [source, setSource] = useState("sales");
  const [copiedAffiliate, setCopiedAffiliate] = useState(false);

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
    const found = PLAN_OPTIONS.find((p) => p.id === planId);
    if (found) {
      setPriceInput(found.priceZar.toString());
    }
  };

  const copyCheckoutToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCheckout(true);
    setTimeout(() => setCopiedCheckout(false), 2500);
  };

  const copyAffiliateToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAffiliate(true);
    setTimeout(() => setCopiedAffiliate(false), 2500);
  };

  const handleGenerateCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");
    setGenerating(true);

    const parsedPrice = parseFloat(priceInput);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setCheckoutError("Please enter a valid monthly price in ZAR.");
      setGenerating(false);
      return;
    }

    try {
      const res = await authFetch(`${cleanApiBase}/api/v1/checkout/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          business_name: businessName.trim(),
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim() || null,
          selected_plan: selectedPlan,
          custom_pricing: Math.round(parsedPrice * 100), // in cents
          domain: domain.trim() || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to generate checkout session.");
      }

      const data = await res.json();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const fullCheckoutUrl = `${origin}${data.checkout_url}`;
      setGeneratedCheckout({
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
      setCheckoutError(err.message || "An unexpected error occurred.");
    } finally {
      setGenerating(false);
    }
  };

  // Build the live affiliate URL
  const origin = typeof window !== "undefined" ? window.location.origin : "https://auraworks.co.za";
  const chosenPath = destinationPath === "custom"
    ? (customPath.startsWith("/") ? customPath : `/${customPath}`)
    : destinationPath;

  const affiliateParams = new URLSearchParams();
  if (salesRepId) affiliateParams.set("ref", salesRepId);
  if (source) affiliateParams.set("utm_source", source);
  if (medium) affiliateParams.set("utm_medium", medium);
  if (campaign) affiliateParams.set("utm_campaign", campaign);

  const queryString = affiliateParams.toString();
  const fullAffiliateUrl = `${origin}${chosenPath}${queryString ? `?${queryString}` : ""}`;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 dark:border-gray-800 dark:bg-white/3 space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-500 dark:text-brand-400" />
            Dynamic Link Generator
          </h2>
          <p className="text-theme-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Create either a 24-hour instant checkout session or a trackable marketing attribution link.
          </p>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex items-center rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setActiveMode("checkout")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeMode === "checkout"
                ? "bg-white text-gray-800 shadow-theme-xs dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            Instant Checkout (24h)
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("affiliate")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeMode === "affiliate"
                ? "bg-white text-gray-800 shadow-theme-xs dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            Marketing Affiliate
          </button>
        </div>
      </div>

      {/* MODE 1: INSTANT 24H CHECKOUT */}
      {activeMode === "checkout" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-theme-xs font-medium text-gray-500 dark:text-gray-400">
              Generate a short-lived checkout link assigned strictly to your sales rep ID.
            </span>
            <Badge size="sm" color="info">24h Session TTL</Badge>
          </div>

          {checkoutError && (
            <Alert
              variant="error"
              title="Error Generating Checkout"
              message={checkoutError}
            />
          )}

          {generatedCheckout && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-500/30 dark:bg-brand-500/10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-theme-xs font-bold text-brand-600 dark:text-brand-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> Active Checkout Link for {generatedCheckout.businessName}
                </span>
                <span className="font-mono text-theme-xs text-brand-500 dark:text-brand-400">Valid for 24 Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedCheckout.url}
                  className="h-10 w-full rounded-lg border border-brand-300 bg-white px-3.5 font-mono text-theme-xs text-gray-800 select-all focus:outline-hidden dark:border-brand-500/30 dark:bg-gray-900 dark:text-white"
                />
                <Button
                  size="sm"
                  onClick={() => copyCheckoutToClipboard(generatedCheckout.url)}
                  startIcon={copiedCheckout ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                >
                  {copiedCheckout ? "Copied!" : "Copy Link"}
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleGenerateCheckout} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <Label htmlFor="checkout-business-name">Client Business Name *</Label>
                <Input
                  id="checkout-business-name"
                  required
                  placeholder="e.g. Rand Mining Technologies"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="checkout-contact-email">Contact Email *</Label>
                <Input
                  id="checkout-contact-email"
                  type="email"
                  required
                  placeholder="director@miningtech.co.za"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="checkout-contact-phone">Contact Phone (Optional)</Label>
                <Input
                  id="checkout-contact-phone"
                  type="tel"
                  placeholder="+27 82 123 4567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <Label htmlFor="checkout-plan-tier">Plan Tier</Label>
                <select
                  id="checkout-plan-tier"
                  value={selectedPlan}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (R{p.priceZar.toLocaleString()}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="checkout-custom-price">Custom Monthly Fee (ZAR)</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                    R
                  </span>
                  <input
                    id="checkout-custom-price"
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-8 pr-3.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="checkout-domain">Client Website Domain (Optional)</Label>
                <Input
                  id="checkout-domain"
                  placeholder="miningtech.co.za"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={generating}
              startIcon={generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            >
              {generating ? "Generating Session..." : "Create 24h Checkout Link"}
            </Button>
          </form>
        </div>
      )}

      {/* MODE 2: MARKETING / AFFILIATE TRACKING */}
      {activeMode === "affiliate" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-theme-xs font-medium text-gray-500 dark:text-gray-400">
              Generate a persistent trackable marketing link to any AuraWorks page with UTM parameters.
            </span>
            <Badge size="sm" color="success">Affiliate Token</Badge>
          </div>

          {/* Generated Affiliate Box */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-theme-xs font-bold text-gray-800 dark:text-white/90 flex items-center gap-1.5">
                <LinkIcon className="h-4 w-4 text-brand-500" /> Live Trackable Link Preview
              </span>
              <span className="font-mono text-theme-xs text-gray-500 dark:text-gray-400">
                Ref: {salesRepId}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={fullAffiliateUrl}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 font-mono text-theme-xs text-gray-800 select-all focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <Button
                size="sm"
                onClick={() => copyAffiliateToClipboard(fullAffiliateUrl)}
                startIcon={copiedAffiliate ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
              >
                {copiedAffiliate ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="affiliate-dest">Landing Destination Page</Label>
                <select
                  id="affiliate-dest"
                  value={destinationPath}
                  onChange={(e) => setDestinationPath(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  {DESTINATIONS.map((d) => (
                    <option key={d.path} value={d.path}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {destinationPath === "custom" ? (
                <div>
                  <Label htmlFor="affiliate-custom-path">Custom URL Path</Label>
                  <Input
                    id="affiliate-custom-path"
                    placeholder="/blog/industrial-discoverability-playbook-2026"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="affiliate-campaign">Campaign Identifier (utm_campaign)</Label>
                  <Input
                    id="affiliate-campaign"
                    placeholder="e.g. mining-conference-q3"
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {destinationPath === "custom" && (
                <div>
                  <Label htmlFor="affiliate-campaign-custom">Campaign Identifier</Label>
                  <Input
                    id="affiliate-campaign-custom"
                    placeholder="e.g. executive-outreach"
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="affiliate-medium">Marketing Medium (utm_medium)</Label>
                <select
                  id="affiliate-medium"
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="referral">Referral (Direct Rep)</option>
                  <option value="email">Email Outreach</option>
                  <option value="social">Social / LinkedIn</option>
                  <option value="direct">Direct Message</option>
                </select>
              </div>

              <div>
                <Label htmlFor="affiliate-source">Traffic Source (utm_source)</Label>
                <Input
                  id="affiliate-source"
                  placeholder="sales"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="affiliate-rep-id">Attributed Rep Identifier (ref)</Label>
                <Input
                  id="affiliate-rep-id"
                  disabled
                  value={salesRepId}
                  className="font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
