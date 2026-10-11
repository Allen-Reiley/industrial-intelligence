"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import useSWR from "swr";
import { IKContext, IKUpload } from "imagekitio-react";
import { useSession } from "@/lib/auth-client";
import { useModal } from "@/hooks/useModal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Badge from "@/components/ui/badge/Badge";
import { PencilIcon } from "@/icons";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const cleanApiBase = API_BASE.replace(/\/$/, "");

const urlEndpoint =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/auraworks";
const publicKey =
  process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "mock_public_key";

const authenticator = async () => {
  try {
    const response = await fetch(`${cleanApiBase}/api/v1/auth/imagekit-auth`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("ImageKit auth failed");
    return await response.json();
  } catch (error) {
    console.error("ImageKit auth error:", error);
    throw error;
  }
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load user profile");
  return res.json();
};

export default function UserMetaCard() {
  const { data: session } = useSession();
  const { data: profile, mutate } = useSWR(
    `${cleanApiBase}/api/v1/auth/me`,
    fetcher
  );

  const currentUser = profile || session?.user || {};
  const { isOpen, openModal, closeModal } = useModal();

  const [formName, setFormName] = useState("");
  const [formJobTitle, setFormJobTitle] = useState("");
  const [formImage, setFormImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormName(currentUser.name || "");
      setFormJobTitle(currentUser.job_title || "");
      setFormImage(currentUser.image || "");
    }
  }, [currentUser]);

  const handleOpenEdit = () => {
    setFormName(currentUser.name || "");
    setFormJobTitle(currentUser.job_title || "");
    setFormImage(currentUser.image || "");
    setSaveError("");
    setSaveSuccess(false);
    openModal();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");

    try {
      const res = await fetch(`${cleanApiBase}/api/v1/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formName.trim(),
          job_title: formJobTitle.trim() || null,
          image: formImage.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to update profile");
      }

      await mutate();
      setSaveSuccess(true);
      setTimeout(() => {
        closeModal();
      }, 500);
    } catch (err: any) {
      setSaveError(err.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const userDisplayName = currentUser.name || "AuraWorks User";
  const userEmail = currentUser.email || "user@auraworks.co.za";
  const userRole = (currentUser.role || "sales").toUpperCase();
  const userTitle = currentUser.job_title || (userRole === "ADMIN" ? "Executive Administrator" : "Sales Representative");
  const userAvatar = currentUser.image || "/images/user/owner.png";

  return (
    <>
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-5 sm:flex-row xl:gap-10">
          <div className="flex-1">
            <div className="mb-4 flex flex-col gap-5 sm:flex-row lg:mb-6 xl:items-center xl:justify-between">
              <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center lg:gap-6">
                <div className="relative size-20 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
                  <Image
                    src={userAvatar}
                    width={80}
                    height={80}
                    className="size-20 object-cover"
                    alt={userDisplayName}
                  />
                </div>
                <div className="text-start">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      {userDisplayName}
                    </h4>
                    <Badge
                      size="sm"
                      color={userRole === "ADMIN" ? "error" : "primary"}
                    >
                      {userRole}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-1 sm:gap-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {userTitle}
                    </p>
                    <div className="hidden h-3.5 w-px bg-gray-300 sm:block dark:bg-gray-700"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      AuraWorks Intelligence
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-x-11 xl:gap-y-7">
              <div className="w-full">
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Full Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userDisplayName}
                </p>
              </div>

              <div className="w-full">
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Email Address
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userEmail}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Role
                </p>
                <p className="text-sm font-medium capitalize text-gray-800 dark:text-white/90">
                  {currentUser.role || "sales"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Job Title
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userTitle}
                </p>
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleOpenEdit}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 cursor-pointer"
            >
              <PencilIcon className="size-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[650px]">
        <div className="w-full rounded-2xl bg-white p-6 lg:p-8 dark:bg-gray-900">
          <h4 className="mb-1 text-2xl font-bold text-gray-800 dark:text-white/90">
            Edit Personnel Profile
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Update your name, title, and avatar across AuraWorks systems.
          </p>

          {saveError && (
            <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
              {saveError}
            </div>
          )}

          {saveSuccess && (
            <div className="mb-4 rounded-lg bg-success-50 p-3 text-sm text-success-600 dark:bg-success-500/15 dark:text-success-400">
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            {/* Avatar Section */}
            <div>
              <Label>Avatar Photo</Label>
              <div className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
                  <Image
                    src={formImage || "/images/user/owner.png"}
                    alt="Preview"
                    width={64}
                    height={64}
                    className="size-16 object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <IKContext
                    urlEndpoint={urlEndpoint}
                    publicKey={publicKey}
                    authenticator={authenticator}
                  >
                    <label
                      htmlFor="avatar-upload"
                      className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      Upload New Image
                      <IKUpload
                        id="avatar-upload"
                        fileName="avatar.png"
                        className="hidden"
                        onSuccess={(res: any) => {
                          if (res?.url) {
                            setFormImage(res.url);
                          }
                        }}
                        onError={(err: any) => {
                          console.error("Avatar upload failed:", err);
                        }}
                      />
                    </label>
                  </IKContext>
                  <p className="text-xs text-gray-400">
                    JPG, PNG or GIF up to 5MB. Or enter image URL below.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-avatar-url">Avatar Image URL</Label>
              <Input
                id="edit-avatar-url"
                type="text"
                placeholder="https://..."
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                disabled
                value={userEmail}
                hint="Contact workspace administrator to update corporate email."
              />
            </div>

            <div>
              <Label htmlFor="edit-job-title">Job Title / Designation</Label>
              <Input
                id="edit-job-title"
                type="text"
                placeholder="e.g. Senior Enterprise AE"
                value={formJobTitle}
                onChange={(e) => setFormJobTitle(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
