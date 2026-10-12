// frontend/src/app/(authenticated)/aurahq/sales/page.tsx
"use client";

import React, { useState } from "react";
import useSWR from "swr";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LinkGenerator from "@/components/LinkGenerator";
import {
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Loader2,
  DollarSign,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

import { authFetch, apiFetcher, cleanApiBase } from "@/lib/api";

export interface CheckoutSessionItem {
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

export interface SalesMetrics {
  sales_rep_id: string;
  sales_rep_name: string;
  total_links_generated: number;
  successful_conversions: number;
  pending_links: number;
  conversion_rate_percentage: number;
  active_pipeline_cents: number;
  active_pipeline_zar: number;
}

export default function SalesPortal() {
  const { data: session } = useSession();

  const userRole = (session?.user as any)?.role;
  const userId = session?.user?.id;
  const urlSuffix = userRole !== "admin" && userId ? `?sales_rep_id=${userId}` : "";

  // SWR Real-Time Polling (Every 5 seconds)
  const {
    data: checkouts,
    mutate: mutateCheckouts,
    isLoading: loadingCheckouts,
  } = useSWR<CheckoutSessionItem[]>(
    `${cleanApiBase}/api/v1/sales/checkouts${urlSuffix}`,
    apiFetcher,
    { refreshInterval: 5000 }
  );

  const {
    data: metrics,
    mutate: mutateMetrics,
  } = useSWR<SalesMetrics>(
    `${cleanApiBase}/api/v1/sales/metrics${urlSuffix}`,
    apiFetcher,
    { refreshInterval: 5000 }
  );

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Sales Portal" />

      <main className="mx-auto max-w-7xl w-full space-y-6">
        {/* KPI Metrics Banner */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {/* Metric 1 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
              <LinkIcon className="h-6 w-6" />
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <span className="text-theme-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Links Generated
                </span>
                <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
                  {metrics?.total_links_generated ?? 0}
                </h4>
              </div>
              <Badge size="sm" color="primary">Active Attribution</Badge>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <span className="text-theme-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Paid Conversions
                </span>
                <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
                  {metrics?.successful_conversions ?? 0}
                </h4>
              </div>
              <Badge size="sm" color="success">Paid Closed</Badge>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <span className="text-theme-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Conversion Rate
                </span>
                <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
                  {metrics?.conversion_rate_percentage ?? 0}%
                </h4>
              </div>
              <Badge size="sm" color="info">Gen vs Closed</Badge>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <span className="text-theme-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Active Pipeline
                </span>
                <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
                  R{(metrics?.active_pipeline_zar ?? 0).toLocaleString()}
                </h4>
              </div>
              <Badge size="sm" color="warning">Attributed Monthly</Badge>
            </div>
          </div>
        </section>

        {/* Dynamic Dual-Mode Link Generator Form */}
        <LinkGenerator
          onSuccess={() => {
            mutateCheckouts();
            mutateMetrics();
          }}
        />

        {/* Live Attribution Feed (Polling every 5 seconds) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-500 dark:text-brand-400" />
                Active Checkout Links Feed
              </h3>
              <p className="text-theme-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Real-time attribution telemetry polled every 5 seconds. Automatically updates on payment confirmation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-500"></span>
              </span>
              <span className="font-mono text-theme-xs text-gray-500 dark:text-gray-400 uppercase">
                Live Polling (5s)
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Business & Contact
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Plan Tier
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Monthly Price
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Created
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {checkouts && checkouts.length > 0 ? (
                    checkouts.map((item, idx) => {
                      const sId = item.session_id || (item as any).id || `sess-${idx}`;
                      const fullUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/checkout/${sId}`;
                      return (
                        <TableRow key={sId}>
                          <TableCell className="px-5 py-4 text-start sm:px-6">
                            <div className="font-semibold text-gray-800 dark:text-white/90">
                              {item.business_name}
                            </div>
                            <div className="font-mono text-theme-xs text-gray-500 dark:text-gray-400">
                              {item.contact_email}
                            </div>
                            {item.contact_phone && (
                              <div className="font-mono text-theme-xs text-gray-400 dark:text-gray-500">
                                {item.contact_phone}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="px-5 py-4 text-start capitalize text-gray-700 dark:text-gray-300 font-medium">
                            {item.plan.replace(/-/g, " ")}
                          </TableCell>

                          <TableCell className="px-5 py-4 text-start font-mono text-theme-sm font-semibold text-gray-800 dark:text-white/90">
                            R{(item.amount_zar ?? (item.amount ? item.amount / 100 : 0)).toLocaleString()}/mo
                          </TableCell>

                          <TableCell className="px-5 py-4 text-start">
                            {item.status === "paid" ? (
                              <Badge size="sm" color="success">
                                <CheckCircle2 className="h-3 w-3" /> Payment Confirmed
                              </Badge>
                            ) : item.is_expired || item.status === "expired" ? (
                              <Badge size="sm" color="error">
                                <Clock className="h-3 w-3" /> Expired (24h)
                              </Badge>
                            ) : (
                              <Badge size="sm" color="warning">
                                <Clock className="h-3 w-3" /> Active Window
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="px-5 py-4 text-start font-mono text-theme-xs text-gray-500 dark:text-gray-400">
                            {new Date(item.created_at).toLocaleString()}
                          </TableCell>

                          <TableCell className="px-5 py-4 text-end">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => copyToClipboard(fullUrl, item.session_id)}
                                title="Copy Checkout Link"
                                aria-label="Copy Checkout Link"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                              >
                                {copiedId === item.session_id ? (
                                  <Check className="h-3.5 w-3.5 text-success-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open Checkout Link"
                                aria-label="Open Checkout Link"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="px-5 py-12 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                      >
                        {loadingCheckouts ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                            <span>Loading active sales links...</span>
                          </div>
                        ) : (
                          "No checkout sessions generated yet. Use the form above to create your first link."
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
