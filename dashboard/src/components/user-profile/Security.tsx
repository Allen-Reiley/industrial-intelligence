"use client";

import React, { useState } from "react";
import { useModal } from "@/hooks/useModal";
import { authClient } from "@/lib/auth-client";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { LockIcon } from "@/icons";

export default function Security() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleOpenModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setSuccessMessage("");
    openModal();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (typeof (authClient as any)?.changePassword === "function") {
        const { error } = await (authClient as any).changePassword({
          newPassword,
          currentPassword,
          revokeOtherSessions: true,
        });

        if (error) {
          throw new Error(error.message || "Failed to update password");
        }
      } else {
        const res = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            currentPassword,
            newPassword,
            revokeOtherSessions: true,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || data.detail || "Failed to update password");
        }
      }

      setSuccessMessage("Password successfully changed.");
      setTimeout(() => {
        closeModal();
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
          Security & Access Credentials
        </h4>
        <div>
          {/* Change Password row */}
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 py-4 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-center dark:border-gray-800">
            <div>
              <span className="mb-1 block text-base font-medium text-gray-800 dark:text-white/90">
                Change Password
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update your account password regularly to keep your credentials secure.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={handleOpenModal}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 cursor-pointer"
              >
                <LockIcon className="size-4" />
                Change Password
              </button>
            </div>
          </div>

          {/* 2FA Toggle row */}
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 py-4 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-center dark:border-gray-800">
            <div>
              <span className="block text-base font-medium text-gray-800 dark:text-white/90">
                Two-Factor Authentication (2FA)
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enforce TOTP authenticator app verification upon sign in.
              </p>
            </div>
            <div>
              <label
                htmlFor="toggle-2fa"
                className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-700 select-none dark:text-gray-400"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    id="toggle-2fa"
                    className="sr-only"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  />
                  <div
                    className={`block h-5 w-9 rounded-full duration-200 ${
                      twoFactorEnabled
                        ? "bg-brand-500 dark:bg-brand-500"
                        : "bg-gray-200 dark:bg-white/10"
                    }`}
                  ></div>
                  <div
                    className={`absolute top-0.5 start-0.5 h-4 w-4 rounded-full bg-white shadow-theme-sm duration-200 ease-linear ${
                      twoFactorEnabled
                        ? "translate-x-full rtl:-translate-x-full"
                        : "translate-x-0"
                    }`}
                  ></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[500px]">
        <div className="w-full rounded-2xl bg-white p-6 lg:p-8 dark:bg-gray-900">
          <h4 className="mb-1 text-xl font-bold text-gray-800 dark:text-white/90">
            Update Password
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Enter your current password and choose a new secure password.
          </p>

          {errorMessage && (
            <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-lg bg-success-50 p-3 text-sm text-success-600 dark:bg-success-500/15 dark:text-success-400">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password *</Label>
              <Input
                id="current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="new-password">New Password *</Label>
              <Input
                id="new-password"
                type="password"
                required
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm New Password *</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
