// frontend/src/app/(authenticated)/aurahq/admin/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Users, 
  Code, 
  ShieldAlert, 
  Activity, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  Save, 
  LogOut, 
  TrendingUp, 
  DollarSign, 
  Link as LinkIcon, 
  Sparkles,
  Lock,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Loader2
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
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

interface Personnel {
  id: string;
  name: string;
  email: string;
  role: "admin" | "sales";
  is_active: boolean;
  image?: string;
  total_links_generated: number;
  paid_conversions: number;
  created_at?: string;
}

interface OverviewMetrics {
  active_clients: number;
  trial_clients: number;
  total_clients: number;
  total_links_generated: number;
  total_conversions: number;
  conversion_rate_percentage: number;
  total_mrr_cents: number;
  total_mrr_zar: number;
  active_sales_reps: number;
}

interface ScriptItem {
  client_id: string;
  company_name: string;
  subscription_status: string;
  whitelisted_domains: string[];
  contact_email?: string;
  snippet: string;
}

export default function AdminConsole() {

  const router = useRouter();
  const { data: session, isPending } = useSession();
  
  useEffect(() => {
    if (!isPending) {
      const role = (session?.user as any)?.role || "sales";
      if (role !== "admin") {
        router.replace("/aurahq/sales");
      }
    }
  }, [session, isPending, router]);

  if (isPending || ((session?.user as any)?.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }


  const [activeTab, setActiveTab] = useState<"overview" | "personnel" | "vault">("overview");
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [searchPersonnel, setSearchPersonnel] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // SWR Queries
  const { 
    data: overviewMetrics, 
    mutate: mutateOverview 
  } = useSWR<OverviewMetrics>(
    `${cleanApiBase}/api/v1/admin/overview-metrics`,
    fetcher
  );

  const { 
    data: personnel, 
    mutate: mutatePersonnel 
  } = useSWR<Personnel[]>(
    `${cleanApiBase}/api/v1/admin/users`,
    fetcher
  );

  const { 
    data: scripts, 
    mutate: mutateScripts 
  } = useSWR<ScriptItem[]>(
    `${cleanApiBase}/api/v1/scripts/`,
    fetcher
  );

  const handleRoleChange = async (userId: string, newRole: "admin" | "sales") => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`${cleanApiBase}/api/v1/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      if (isPostHogConfigured) {
        posthog.capture("admin_user_role_updated", { role: newRole });
      }
      mutatePersonnel();
    } catch (err) {
      alert("Error updating user role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`${cleanApiBase}/api/v1/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_active: !currentActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      if (isPostHogConfigured) {
        posthog.capture("admin_user_status_updated", { is_active: !currentActive });
      }
      mutatePersonnel();
    } catch (err) {
      alert("Error updating user status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action is irreversible.`)) return;

    try {
      const res = await fetch(`${cleanApiBase}/api/v1/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      if (isPostHogConfigured) {
        posthog.capture("admin_user_deleted");
      }
      mutatePersonnel();
    } catch (err) {
      alert("Error deleting user profile");
    }
  };

  const copyScript = (snippet: string, clientId: string) => {
    navigator.clipboard.writeText(snippet);
    if (isPostHogConfigured) {
      posthog.capture("admin_script_copied");
    }
    setCopiedSnippetId(clientId);
    setTimeout(() => setCopiedSnippetId(null), 2500);
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

  const filteredPersonnel = (personnel || []).filter((p) =>
    `${p.name} ${p.email} ${p.role}`.toLowerCase().includes(searchPersonnel.toLowerCase())
  );

  return (
    <div>
      {/* Astryx Top Navigation */}
      

      <PageBreadcrumb pageTitle="Admin Command" />
      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-px">
          {[
            { id: "overview", icon: Activity, label: "Global Overview" },
            { id: "personnel", icon: Users, label: "Personnel Management" },
            { id: "registration", icon: Users, label: "User Registration" },
            { id: "vault", icon: Code, label: "Script Vault (Gated)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-brand-500 dark:border-brand-400 text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-t-xl"
                  : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: GLOBAL OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Total Pipeline MRR</span>
                  <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-500/20 text-brand-500 dark:text-brand-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-gray-800 dark:text-white/90">
                  R{(overviewMetrics?.total_mrr_zar ?? 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">Active + Trial Subscriptions</span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Total Conversions</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-emerald-400">
                  {overviewMetrics?.total_conversions ?? 0}
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">Paid Checkout Sessions</span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Global Conversion Rate</span>
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-gray-800 dark:text-white/90">
                  {overviewMetrics?.conversion_rate_percentage ?? 0}%
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                  {overviewMetrics?.total_conversions ?? 0} / {overviewMetrics?.total_links_generated ?? 0} Links Closed
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Active Personnel</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-gray-800 dark:text-white/90">
                  {overviewMetrics?.active_sales_reps ?? 0}
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">Attributed Sales Representatives</span>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: PERSONNEL MANAGEMENT */}
        {activeTab === "personnel" && (
          <section className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-500 dark:text-brand-400" /> Sales Representatives & Role Management
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Configure role assignments (admin / sales), active gating, and review individual attribution performance.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search personnel..."
                  value={searchPersonnel}
                  onChange={(e) => setSearchPersonnel(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-xs text-gray-700 dark:text-gray-200 focus:border-brand-500 dark:border-brand-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-gray-300 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Permissions</th>
                    <th className="px-6 py-3.5">Links Gen</th>
                    <th className="px-6 py-3.5">Paid Closed</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredPersonnel.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:bg-gray-800 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800 dark:text-white/90">{user.name}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{user.email}</div>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          disabled={updatingUserId === user.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                          className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs font-mono capitalize focus:border-brand-500 dark:border-brand-400 focus:outline-none cursor-pointer"
                        >
                          <option value="sales">Sales</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(user.id, user.is_active)}
                          disabled={updatingUserId === user.id}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                            user.is_active
                              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {["Analytics", "Sales", "Vault"].map(page => (
                            <label key={page} className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                              <input type="checkbox" className="rounded border-gray-300" defaultChecked={user.role === 'admin' || page !== 'Vault'} />
                              {page}
                            </label>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300 font-semibold">
                        {user.total_links_generated}
                      </td>

                      <td className="px-6 py-4 font-mono text-emerald-400 font-semibold">
                        {user.paid_conversions}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          title="Delete User"
                          className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-red-950/50 border border-gray-300 dark:border-gray-600 hover:border-red-800 text-gray-500 dark:text-gray-400 hover:text-red-300 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPersonnel.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 text-xs">
                        No personnel profiles match the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}


        {/* TAB: USER REGISTRATION */}
        {activeTab === "registration" && (
          <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white/90">Register New User</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create a new personnel profile with specific access levels.</p>
            </div>
            <form className="space-y-4 max-w-xl" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                const res = await fetch(`${cleanApiBase}/api/v1/admin/users`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify(Object.fromEntries(formData))
                });
                if (!res.ok) throw new Error('Failed to register user');
                alert('User registered successfully');
                e.currentTarget.reset();
                mutatePersonnel();
              } catch (err) {
                alert(err.message);
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input name="name" required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input name="email" type="email" required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temporary Password</label>
                <input name="password" type="password" required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select name="role" required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent">
                  <option value="sales">Sales Rep</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <button type="submit" className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-medium">
                Register User
              </button>
            </form>
          </section>
        )}

        {/* TAB 3: SCRIPT VAULT (GATED) */}
        {activeTab === "vault" && (
          <section className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-500 dark:text-brand-400" /> Admin Script Vault
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Gated JavaScript tracking tags. Only generated for clients who have successfully completed checkout (ACTIVE / TRIAL).
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase font-bold">
                Admin Privilege
              </span>
            </div>

            <div className="space-y-4">
              {scripts && scripts.length > 0 ? (
                scripts.map((item) => (
                  <div
                    key={item.client_id}
                    className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-4 hover:border-gray-300 dark:border-gray-600 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-gray-800 dark:text-white/90">{item.company_name}</h3>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                          Domains: {item.whitelisted_domains.join(", ") || "Unrestricted"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                          {item.subscription_status}
                        </span>
                        <button
                          onClick={() => copyScript(item.snippet, item.client_id)}
                          className="px-3 py-1.5 rounded-lg bg-brand-600 dark:bg-brand-500 hover:bg-brand-500 dark:hover:bg-brand-400 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedSnippetId === item.client_id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copy Script Tag
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl font-mono text-xs text-gray-600 dark:text-gray-300 break-all select-all">
                      {item.snippet}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 dark:text-gray-500 text-xs border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-900">
                  No active or trial clients found in the registry. Scripts are unlocked automatically once a client completes checkout.
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
