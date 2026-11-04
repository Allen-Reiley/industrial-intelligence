"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { AlertIcon } from "@/icons";
import { authFetch, cleanApiBase } from "@/lib/api";

const purgeAuthCookiesAndStorage = () => {
  if (typeof document === "undefined") return;
  const cookieNames = [
    "better-auth.session_token",
    "__Secure-better-auth.session_token",
    "aura_session_token",
    "aurahq_auth",
    "admin_access_token",
    "user_role",
  ];
  cookieNames.forEach((name) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    document.cookie = `${name}=; path=/; domain=.auraworks.co.za; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  });
  try {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("better-auth.session_token");
    sessionStorage.clear();
  } catch {
    // Ignore storage errors in non-browser envs
  }
};

export default function DangerZone() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLogoutAllDevices = async () => {
    setIsLoggingOut(true);
    try {
      if (typeof window !== "undefined") {
        await authFetch(`${cleanApiBase}/api/v1/auth/logout`, {
          method: "POST",
          credentials: "include",
        }).catch(() => null);
      }
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            purgeAuthCookiesAndStorage();
            router.push("/login");
            window.location.href = "/login?logout=true";
          },
        },
      }).catch(() => null);
    } finally {
      purgeAuthCookiesAndStorage();
      router.push("/login");
      window.location.href = "/login?logout=true";
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="mb-6 rounded-2xl border border-error-200 bg-white p-5 lg:p-6 dark:border-error-500/20 dark:bg-white/[0.03]">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
          Danger Zone
        </h4>
        <div>
          {/* Logout all devices row */}
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 py-4 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-center dark:border-gray-800">
            <div>
              <span className="mb-1 block text-base font-medium text-gray-800 dark:text-white/90">
                Logout all devices
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Invalidate all active session tokens and sign out across all browsers.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 cursor-pointer"
              >
                Logout All Sessions
              </button>
            </div>
          </div>

          {/* Delete account row */}
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 py-4 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-center dark:border-gray-800">
            <div>
              <span className="mb-1 block text-base font-medium text-gray-800 dark:text-white/90">
                Personnel Account Termination
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Corporate personnel deletion requires administrator approval and data archiving.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-error-500 px-4 py-2.5 text-sm font-medium text-error-600 transition-all hover:bg-error-50 dark:border-error-500/30 dark:text-error-400 dark:hover:bg-error-500/10"
              >
                Request Termination
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout All Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        className="m-4 max-w-[450px]"
      >
        <div className="w-full rounded-2xl bg-white p-6 text-center dark:bg-gray-900">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-error-50 text-error-500 dark:bg-error-500/15">
            <AlertIcon className="size-6" />
          </div>
          <h4 className="mb-2 text-xl font-bold text-gray-800 dark:text-white/90">
            Sign Out All Sessions?
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            This will terminate all active Better Auth sessions on all browsers and devices. You will need to log in again.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isLoggingOut}
              onClick={handleLogoutAllDevices}
              className="bg-error-500 hover:bg-error-600"
            >
              {isLoggingOut ? "Signing out..." : "Sign Out Everywhere"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        className="m-4 max-w-[500px]"
      >
        <div className="w-full rounded-2xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-2 text-xl font-bold text-gray-800 dark:text-white/90">
            Account Termination Policy
          </h4>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            AuraWorks accounts are managed by your corporate administrator under enterprise compliance rules.
          </p>
          <div className="mb-6 rounded-lg bg-gray-50 p-4 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <p className="font-semibold text-gray-800 dark:text-white">To delete or offboard this account:</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Admins: Manage and remove accounts via the Personnel Console.</li>
              <li>Sales Reps: Contact your company administrator to revoke access.</li>
              <li>Or email compliance@auraworks.co.za with your workspace ID.</li>
            </ul>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
