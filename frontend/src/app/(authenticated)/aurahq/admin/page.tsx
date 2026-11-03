// frontend/src/app/(authenticated)/aurahq/admin/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Activity,
  Users,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Search,
  Trash2,
  Copy,
  Check,
  UserPlus,
  Loader2,
  KeyRound,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import posthog from "posthog-js";

import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Alert from "@/components/ui/alert/Alert";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { authFetch, apiFetcher, cleanApiBase } from "@/lib/api";

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

export interface Personnel {
  id: string;
  name: string;
  email: string;
  role: "admin" | "sales";
  job_title?: string | null;
  permissions?: string[];
  is_active: boolean;
  image?: string | null;
  total_links_generated: number;
  paid_conversions: number;
  created_at?: string | null;
}

export interface OverviewMetrics {
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

export interface ScriptItem {
  client_id: string;
  company_name: string;
  subscription_status: string;
  whitelisted_domains: string[];
  contact_email?: string;
  snippet: string;
}

const AVAILABLE_PERMISSIONS = [
  { key: "analytics", label: "Analytics" },
  { key: "sales", label: "Sales" },
  { key: "calendar", label: "Calendar" },
  { key: "tasks", label: "Tasks" },
];

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

  const [activeTab, setActiveTab] = useState<"overview" | "personnel" | "vault">("overview");
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [searchPersonnel, setSearchPersonnel] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [actionAlert, setActionAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // User registration modal state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerAlert, setRegisterAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    job_title: "",
    password: "",
    role: "sales" as "admin" | "sales",
    permissions: ["analytics", "sales"],
  });

  // Delete confirmation modal state
  const [deleteModalUser, setDeleteModalUser] = useState<Personnel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // SWR Queries: Guarded by isReady to prevent premature unauthenticated 401 fetches
  const isReady = !isPending && (session?.user as any)?.role === "admin";

  const { data: overviewMetrics } = useSWR<OverviewMetrics>(
    isReady ? `${cleanApiBase}/api/v1/admin/overview-metrics` : null,
    apiFetcher
  );

  const { data: personnel, mutate: mutatePersonnel } = useSWR<Personnel[]>(
    isReady ? `${cleanApiBase}/api/v1/admin/users` : null,
    apiFetcher
  );

  const { data: scripts } = useSWR<ScriptItem[]>(
    isReady ? `${cleanApiBase}/api/v1/scripts/` : null,
    apiFetcher
  );

  if (isPending || ((session?.user as any)?.role !== "admin")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const handleRoleChange = async (userId: string, newRole: "admin" | "sales") => {
    setUpdatingUserId(userId);
    const previousData = personnel;
    mutatePersonnel(
      (prev) =>
        prev
          ? prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
          : [],
      false
    );

    try {
      const res = await authFetch(`${cleanApiBase}/api/v1/admin/users/${userId}`, {
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
      setActionAlert({ type: "success", message: "Role updated successfully." });
    } catch (err) {
      mutatePersonnel(previousData, false);
      setActionAlert({ type: "error", message: "Error updating user role." });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    setUpdatingUserId(userId);
    const nextActive = !currentActive;
    const previousData = personnel;
    mutatePersonnel(
      (prev) =>
        prev
          ? prev.map((u) => (u.id === userId ? { ...u, is_active: nextActive } : u))
          : [],
      false
    );

    try {
      const res = await authFetch(`${cleanApiBase}/api/v1/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_active: nextActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      if (isPostHogConfigured) {
        posthog.capture("admin_user_status_updated", { is_active: nextActive });
      }
      mutatePersonnel();
      setActionAlert({
        type: "success",
        message: `Personnel marked as ${nextActive ? "Active" : "Inactive"}.`,
      });
    } catch (err) {
      mutatePersonnel(previousData, false);
      setActionAlert({ type: "error", message: "Error updating user status." });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleTogglePermission = async (
    userId: string,
    permissionKey: string,
    currentPermissions: string[] = ["analytics", "sales"]
  ) => {
    const updated = currentPermissions.includes(permissionKey)
      ? currentPermissions.filter((p) => p !== permissionKey)
      : [...currentPermissions, permissionKey];

    const previousData = personnel;
    mutatePersonnel(
      (prev) =>
        prev
          ? prev.map((u) => (u.id === userId ? { ...u, permissions: updated } : u))
          : [],
      false
    );

    try {
      const res = await authFetch(`${cleanApiBase}/api/v1/admin/users/${userId}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ permissions: updated }),
      });
      if (!res.ok) throw new Error("Failed to update permissions");
      mutatePersonnel();
      setActionAlert({ type: "success", message: "Permissions updated successfully." });
    } catch (err) {
      mutatePersonnel(previousData, false);
      setActionAlert({ type: "error", message: "Failed to update route permissions." });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRegisterAlert(null);

    try {
      const res = await authFetch(`${cleanApiBase}/api/v1/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: registerForm.name.trim(),
          email: registerForm.email.trim(),
          job_title: registerForm.job_title.trim() || undefined,
          password: registerForm.password,
          role: registerForm.role,
          permissions: registerForm.permissions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to register personnel");
      }

      setRegisterAlert({
        type: "success",
        message: `Personnel "${registerForm.name}" registered successfully.`,
      });
      mutatePersonnel();
      setRegisterForm({
        name: "",
        email: "",
        job_title: "",
        password: "",
        role: "sales",
        permissions: ["analytics", "sales"],
      });

      setTimeout(() => {
        setIsRegisterModalOpen(false);
        setRegisterAlert(null);
      }, 1200);
    } catch (err: any) {
      setRegisterAlert({
        type: "error",
        message: err.message || "Failed to register personnel",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalUser) return;
    setIsDeleting(true);

    try {
      const res = await authFetch(`${cleanApiBase}/api/v1/admin/users/${deleteModalUser.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      if (isPostHogConfigured) {
        posthog.capture("admin_user_deleted");
      }
      mutatePersonnel();
      setActionAlert({
        type: "success",
        message: `Personnel ${deleteModalUser.name} deleted successfully.`,
      });
      setDeleteModalUser(null);
    } catch (err: any) {
      setActionAlert({
        type: "error",
        message: err.message || "Error deleting user profile",
      });
    } finally {
      setIsDeleting(false);
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

  const filteredPersonnel = (personnel || []).filter((p) =>
    `${p.name} ${p.email} ${p.role} ${p.job_title || ""}`
      .toLowerCase()
      .includes(searchPersonnel.toLowerCase())
  );

  return (
    <div>
      <PageBreadcrumb pageTitle="Admin Command" />

      <main className="mx-auto max-w-7xl w-full space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {[
            { id: "overview", icon: Activity, label: "Global Overview" },
            { id: "personnel", icon: Users, label: "Personnel Management" },
            { id: "vault", icon: ShieldCheck, label: "Script Vault (Gated)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setActionAlert(null);
              }}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Global Action Alerts */}
        {actionAlert && (
          <Alert
            variant={actionAlert.type}
            title={actionAlert.type === "success" ? "Success" : "Attention"}
            message={actionAlert.message}
          />
        )}

        {/* TAB 1: GLOBAL OVERVIEW */}
        {activeTab === "overview" && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
            {/* Metric 1 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <span className="text-theme-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Total Pipeline MRR
                  </span>
                  <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
                    R{(overviewMetrics?.total_mrr_zar ?? 0).toLocaleString()}
                  </h4>
                </div>
                <Badge size="sm" color="primary">Active Pipeline</Badge>
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
                    Total Conversions
                  </span>
                  <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
                    {overviewMetrics?.total_conversions ?? 0}
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
                    {overviewMetrics?.conversion_rate_percentage ?? 0}%
                  </h4>
                </div>
                <Badge size="sm" color="info">
                  {overviewMetrics?.total_links_generated ?? 0} Links
                </Badge>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <span className="text-theme-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Active Personnel
                  </span>
                  <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
                    {overviewMetrics?.active_sales_reps ?? 0}
                  </h4>
                </div>
                <Badge size="sm" color="primary">Reps Assigned</Badge>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: PERSONNEL MANAGEMENT */}
        {activeTab === "personnel" && (
          <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  Personnel Directory & Role RBAC
                </h3>
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                  Manage active personnel, grant route permissions, and review sales conversion attribution.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search personnel..."
                    value={searchPersonnel}
                    onChange={(e) => setSearchPersonnel(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 text-theme-xs text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                <Button
                  size="sm"
                  startIcon={<UserPlus className="h-4 w-4" />}
                  onClick={() => {
                    setRegisterAlert(null);
                    setIsRegisterModalOpen(true);
                  }}
                >
                  Register User
                </Button>
              </div>
            </div>

            {/* TailAdmin Personnel Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                      >
                        Personnel
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                      >
                        Role
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
                        Route Permissions
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                      >
                        Links Gen
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                      >
                        Paid Closed
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
                    {filteredPersonnel.map((user) => (
                      <TableRow key={user.id}>
                        {/* Personnel Column */}
                        <TableCell className="px-5 py-4 text-start sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                {user.name}
                              </span>
                              <span className="block font-mono text-theme-xs text-gray-500 dark:text-gray-400">
                                {user.email}
                              </span>
                              {user.job_title && (
                                <span className="block text-theme-xs text-gray-400 dark:text-gray-500">
                                  {user.job_title}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Role Column */}
                        <TableCell className="px-5 py-4 text-start">
                          <select
                            aria-label={`Role for ${user.name}`}
                            value={user.role}
                            disabled={updatingUserId === user.id}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value as "admin" | "sales")
                            }
                            className="h-8 rounded-lg border border-gray-300 bg-white px-2.5 text-theme-xs font-medium text-gray-700 capitalize focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer disabled:opacity-50"
                          >
                            <option value="sales">Sales</option>
                            <option value="admin">Admin</option>
                          </select>
                        </TableCell>

                        {/* Status Column */}
                        <TableCell className="px-5 py-4 text-start">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                            disabled={updatingUserId === user.id}
                            className="cursor-pointer transition-transform hover:scale-105 disabled:opacity-50"
                            title={`Click to mark ${user.is_active ? "inactive" : "active"}`}
                          >
                            <Badge
                              size="sm"
                              color={user.is_active ? "success" : "error"}
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </button>
                        </TableCell>

                        {/* Route Permissions Column */}
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex flex-wrap items-center gap-2">
                            {AVAILABLE_PERMISSIONS.map((perm) => {
                              const userPerms = user.permissions || ["analytics", "sales"];
                              const isChecked = userPerms.includes(perm.key);
                              return (
                                <label
                                  key={perm.key}
                                  className="inline-flex items-center gap-1.5 text-theme-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                                >
                                  <input
                                    type="checkbox"
                                    aria-label={`${perm.label} permission for ${user.name}`}
                                    checked={isChecked}
                                    onChange={() =>
                                      handleTogglePermission(user.id, perm.key, userPerms)
                                    }
                                    className="h-3.5 w-3.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800"
                                  />
                                  <span>{perm.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </TableCell>

                        {/* Links Gen Column */}
                        <TableCell className="px-5 py-4 text-start font-mono text-theme-sm font-semibold text-gray-700 dark:text-gray-300">
                          {user.total_links_generated ?? 0}
                        </TableCell>

                        {/* Paid Closed Column */}
                        <TableCell className="px-5 py-4 text-start font-mono text-theme-sm font-semibold text-success-600 dark:text-success-400">
                          {user.paid_conversions ?? 0}
                        </TableCell>

                        {/* Actions Column */}
                        <TableCell className="px-5 py-4 text-end">
                          <button
                            type="button"
                            onClick={() => setDeleteModalUser(user)}
                            title={`Delete ${user.name}`}
                            aria-label={`Delete ${user.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:border-error-300 hover:bg-error-50 hover:text-error-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-error-500/30 dark:hover:bg-error-500/15 dark:hover:text-error-400 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredPersonnel.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="px-5 py-12 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                        >
                          No personnel profiles match the search criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: SCRIPT VAULT (GATED) */}
        {activeTab === "vault" && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-brand-500 dark:text-brand-400" />
                  Admin Script Vault
                </h3>
                <p className="text-theme-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Gated JavaScript tracking tags. Automatically generated for clients who have successfully completed checkout (ACTIVE / TRIAL).
                </p>
              </div>
              <Badge size="sm" color="success">
                Admin Privilege
              </Badge>
            </div>

            <div className="space-y-4">
              {scripts && scripts.length > 0 ? (
                scripts.map((item) => (
                  <div
                    key={item.client_id}
                    className="rounded-xl border border-gray-200 bg-white p-5 space-y-4 dark:border-gray-800 dark:bg-white/3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-theme-sm font-bold text-gray-800 dark:text-white/90">
                          {item.company_name}
                        </h4>
                        <p className="font-mono text-theme-xs text-gray-500 dark:text-gray-400">
                          Domains: {item.whitelisted_domains.join(", ") || "Unrestricted"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge size="sm" color="success">
                          {item.subscription_status}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => copyScript(item.snippet, item.client_id)}
                          startIcon={
                            copiedSnippetId === item.client_id ? (
                              <Check className="h-3.5 w-3.5 text-white" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )
                          }
                        >
                          {copiedSnippetId === item.client_id ? "Copied!" : "Copy Script Tag"}
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3.5 font-mono text-theme-xs text-gray-700 break-all select-all dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-300">
                      {item.snippet}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-theme-sm text-gray-500 dark:border-gray-800 dark:bg-white/3 dark:text-gray-400">
                  No active or trial clients found in the registry. Scripts are unlocked automatically once a client completes checkout.
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* MODAL: REGISTER PERSONNEL */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsRegisterModalOpen(false);
            setRegisterAlert(null);
          }
        }}
        className="max-w-[560px] p-6 sm:p-8"
      >
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
            Register New Personnel
          </h3>
          <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
            Provision a new staff account with credentials and specific route permissions.
          </p>

          {registerAlert && (
            <div className="mt-4">
              <Alert
                variant={registerAlert.type}
                title={registerAlert.type === "success" ? "Success" : "Error"}
                message={registerAlert.message}
              />
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-4">
            <div>
              <Label htmlFor="reg-name">Full Name</Label>
              <Input
                id="reg-name"
                name="name"
                placeholder="e.g. Jane Doe"
                required
                value={registerForm.name}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="reg-email">Email Address</Label>
              <Input
                id="reg-email"
                type="email"
                name="email"
                placeholder="jane@auraworks.co.za"
                required
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="reg-job-title">Job Title (Optional)</Label>
              <Input
                id="reg-job-title"
                name="job_title"
                placeholder="e.g. Enterprise Account Executive"
                value={registerForm.job_title}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, job_title: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="reg-password">Temporary Password</Label>
              <Input
                id="reg-password"
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="reg-role">Role</Label>
              <select
                id="reg-role"
                name="role"
                value={registerForm.role}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    role: e.target.value as "sales" | "admin",
                  })
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="sales">Sales Representative</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <Label>Initial Route Access</Label>
              <div className="grid grid-cols-2 gap-3 pt-1">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <label
                    key={perm.key}
                    className="flex items-center gap-2 text-theme-xs text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={registerForm.permissions.includes(perm.key)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setRegisterForm({
                          ...registerForm,
                          permissions: checked
                            ? [...registerForm.permissions, perm.key]
                            : registerForm.permissions.filter((p) => p !== perm.key),
                        });
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800"
                    />
                    <span>{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setIsRegisterModalOpen(false);
                  setRegisterAlert(null);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register Personnel"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={!!deleteModalUser}
        onClose={() => {
          if (!isDeleting) setDeleteModalUser(null);
        }}
        className="max-w-[480px] p-6 sm:p-8"
      >
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
            Delete Personnel Profile
          </h3>
          <p className="mt-2 text-theme-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-gray-800 dark:text-white">
              {deleteModalUser?.name}
            </span>{" "}
            ({deleteModalUser?.email})? This action cannot be undone.
          </p>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleteModalUser(null)}
            >
              Cancel
            </Button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-error-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-error-600 disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
