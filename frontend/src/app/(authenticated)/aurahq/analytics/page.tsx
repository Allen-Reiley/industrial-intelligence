// frontend/src/app/(authenticated)/aurahq/analytics/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useSession } from "@/lib/auth-client";
import {
  Building2,
  MapPin,
  Clock,
  Globe,
  ShieldCheck,
  Zap,
  Activity,
  RefreshCcw,
  MousePointer2,
  ChevronRight,
  LayoutGrid,
  List,
  Search,
  Timer,
} from "lucide-react";

import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

// --- DATA CONTRACTS ---
export interface Client {
  id: string;
  company_name: string;
  domain?: string;
  whitelisted_domains: string[];
  subscription_status: "trial" | "active" | "suspended";
  require_consent_banner: boolean;
  collect_personal_data: boolean;
  is_active: boolean;
}

export interface Lead {
  id: string;
  company_name: string | null;
  is_b2b: boolean;
  industry: string | null;
  ip_address: string;
  city: string | null;
  region: string | null;
  country: string | null;
  duration: number | null;
  url: string | null;
  referrer: string | null;
  created_at: string;
  hit_count?: number;
}

export interface GroupedEntity {
  main: Lead;
  totalHits: number;
  totalDuration: number;
  paths: { url: string; duration: number; hits: number }[];
}

import { authFetch } from "@/lib/auth-fetch";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const cleanApiBase = API_BASE.replace(/\/$/, "");

export default function ForensicAnalytics() {
  const { data: session } = useSession();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"ledger" | "cards">("ledger");
  const [searchQuery, setSearchQuery] = useState("");

  // --- IDENTITY BRIDGE GROUPING LOGIC ---
  const groupedEntities = useMemo(() => {
    const groups: Record<string, GroupedEntity> = {};

    leads.forEach((lead) => {
      const key = lead.ip_address;
      if (!groups[key]) {
        groups[key] = { main: lead, totalHits: 0, totalDuration: 0, paths: [] };
      }

      const pathIndex = groups[key].paths.findIndex((p) => p.url === lead.url);
      const currentHits = lead.hit_count || 1;
      const currentDuration = lead.duration || 0;

      groups[key].totalHits += currentHits;
      groups[key].totalDuration += currentDuration;

      if (pathIndex > -1) {
        groups[key].paths[pathIndex].duration += currentDuration;
        groups[key].paths[pathIndex].hits += currentHits;
      } else {
        groups[key].paths.push({
          url: lead.url || "/",
          duration: currentDuration,
          hits: currentHits,
        });
      }
    });

    return Object.values(groups).sort(
      (a, b) =>
        new Date(b.main.created_at).getTime() - new Date(a.main.created_at).getTime()
    );
  }, [leads]);

  const filteredEntities = useMemo(() => {
    if (!searchQuery.trim()) return groupedEntities;
    const query = searchQuery.toLowerCase();
    return groupedEntities.filter(({ main }) =>
      `${main.company_name || ""} ${main.ip_address} ${main.city || ""} ${main.industry || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [groupedEntities, searchQuery]);

  // Fetch client profiles using HTTP-only cookies and Bearer auth header
  const fetchClients = async () => {
    try {
      const res = await authFetch(`${cleanApiBase}/api/v1/clients/`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setClients(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setActiveClient(data[0]);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("AuraWorks Clients Retrieval Failure:", err);
      setLoading(false);
    }
  };

  // Fetch leads telemetry for active client using Bearer token authorization bridge
  const fetchData = async (clientId: string) => {
    setIsRefreshing(true);
    try {
      const userRole = (session?.user as any)?.role;
      const userId = session?.user?.id;

      let url = `${cleanApiBase}/api/v1/leads/?client_id=${clientId}`;
      if (userRole !== "admin" && userId) {
        url += `&sales_rep_id=${userId}`;
      }

      const res = await authFetch(url, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("AuraWorks Identity Bridge Failure:", err);
      setLeads([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (activeClient) {
      fetchData(activeClient.id);
      const interval = setInterval(() => fetchData(activeClient.id), 60000);
      return () => clearInterval(interval);
    }
  }, [activeClient]);

  const getPathname = (urlStr: string | null) => {
    if (!urlStr) return "/";
    try {
      const urlObj = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
      return urlObj.pathname;
    } catch {
      return urlStr;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand-500 dark:border-gray-800" />
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Synchronizing Intelligence...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Forensic Analytics" />

      <main className="mx-auto max-w-7xl w-full space-y-6">
        {/* Top Control Bar: Client Switcher, Search, Refresh, View Toggle */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {clients.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-theme-xs font-semibold text-gray-700 dark:text-gray-300">
                  Client:
                </span>
                <select
                  value={activeClient?.id || ""}
                  onChange={(e) => {
                    const found = clients.find((c) => c.id === e.target.value);
                    if (found) setActiveClient(found);
                  }}
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-theme-xs font-medium text-gray-800 shadow-theme-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.subscription_status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => activeClient && fetchData(activeClient.id)}
              disabled={isRefreshing}
              startIcon={<RefreshCcw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
            >
              {isRefreshing ? "Refreshing..." : "Sync Signals"}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search entities, IPs, cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 text-theme-xs text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => setViewMode("ledger")}
                title="Table Ledger View"
                aria-label="Table Ledger View"
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  viewMode === "ledger"
                    ? "bg-white text-gray-800 shadow-theme-xs dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                title="Forensic Cards View"
                aria-label="Forensic Cards View"
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-white text-gray-800 shadow-theme-xs dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {filteredEntities.length > 0 ? (
          viewMode === "ledger" ? (
            /* --- TAILADMIN JURISTIC LEDGER TABLE --- */
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                      >
                        Entity Identity
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                      >
                        Jurisdiction / IP
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                      >
                        Signals
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                      >
                        Total Dwell
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                      >
                        Top Path
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3.5 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                      >
                        Last Attribution
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredEntities.map(({ main: lead, totalHits, totalDuration, paths }) => (
                      <TableRow key={lead.ip_address} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <TableCell className="px-5 py-4 text-start sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              {lead.company_name?.charAt(0) || <Globe className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-theme-sm text-gray-800 dark:text-white/90">
                                  {lead.company_name || "Unresolved Juristic Entity"}
                                </span>
                                {lead.is_b2b && (
                                  <Badge size="sm" color="success">
                                    <ShieldCheck className="h-3 w-3" /> Juristic
                                  </Badge>
                                )}
                              </div>
                              <span className="block font-mono text-theme-xs text-gray-500 dark:text-gray-400">
                                {lead.industry || "Industrial"}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-1.5 text-theme-xs text-gray-700 dark:text-gray-300">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            <span>
                              {lead.city || "Hub"}, {lead.country || "ZAF"}
                            </span>
                          </div>
                          <span className="block font-mono text-theme-xs text-gray-500 dark:text-gray-400">
                            {lead.ip_address}
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-center">
                          <Badge size="sm" color="primary">
                            {totalHits} Events
                          </Badge>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start font-mono text-theme-sm font-semibold text-gray-700 dark:text-gray-300">
                          {totalDuration}s
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start font-mono text-theme-xs text-gray-600 dark:text-gray-400">
                          {paths.length > 0 ? getPathname(paths[0].url) : "/"}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-end font-mono text-theme-xs text-gray-500 dark:text-gray-400">
                          {new Date(lead.created_at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            /* --- TAILADMIN FORENSIC CARD VIEW --- */
            <div className="grid gap-6">
              {filteredEntities.map(({ main: lead, paths, totalHits, totalDuration }) => (
                <div
                  key={lead.ip_address}
                  className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 dark:border-gray-800 dark:bg-white/3 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
                          {lead.company_name || "Unresolved Juristic Entity"}
                        </h4>
                        {lead.is_b2b && (
                          <Badge size="sm" color="success">
                            <ShieldCheck className="h-3 w-3" /> Juristic
                          </Badge>
                        )}
                        <Badge size="sm" color="info">
                          {totalHits} Signals
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-theme-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {lead.city || "Hub"}, {lead.country || "ZAF"}
                        </span>
                        <span className="font-mono rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {lead.ip_address}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Timer className="h-3.5 w-3.5" />
                          {totalDuration}s Total Dwell
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-theme-xs font-medium text-gray-400 uppercase tracking-wider block">
                        Capture Epoch
                      </span>
                      <span className="font-mono text-theme-xs text-gray-600 dark:text-gray-400">
                        {new Date(lead.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Interaction Intelligence Paths */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-theme-xs font-semibold text-gray-700 dark:text-gray-300">
                      <MousePointer2 className="h-3.5 w-3.5 text-brand-500" />
                      <span>Interaction Signal Paths</span>
                    </div>

                    <div className="space-y-2">
                      {paths.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3.5 dark:border-gray-800 dark:bg-gray-800/40"
                        >
                          <div className="flex items-center gap-2.5">
                            <Zap className="h-3.5 w-3.5 text-brand-500" />
                            <span className="font-mono text-theme-xs font-semibold text-gray-800 dark:text-white/90">
                              {getPathname(p.url)}
                            </span>
                          </div>

                          <div className="flex items-center gap-6 font-mono text-theme-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                              Dwell: <strong className="text-gray-800 dark:text-white/90">{p.duration}s</strong>
                            </span>
                            <Badge size="sm" color="primary">
                              {p.hits}x Hits
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 dark:border-gray-800 flex justify-between items-center text-theme-xs text-gray-500 dark:text-gray-400">
                    <span className="italic">
                      Referrer: {lead.referrer || "Direct Ingress"}
                    </span>
                    <span className="font-mono text-theme-xs text-brand-500 dark:text-brand-400">
                      Telemetry Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-16 text-center dark:border-gray-800 dark:bg-white/3">
            <Activity className="h-10 w-10 text-gray-400 dark:text-gray-600 mb-3 mx-auto" />
            <h4 className="text-theme-sm font-bold text-gray-700 dark:text-gray-300">
              No Juristic Signals Attributed
            </h4>
            <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
              Signals will appear in real time once website visitors trigger telemetry tags.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}