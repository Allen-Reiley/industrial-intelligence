"use client";

import { useClickOutside } from "@/hooks/useClickOutside";
import Link from "next/link";
import { ChevronDownIcon } from "@/icons";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleLogout = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiBase}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    document.cookie = "aurahq_auth=; path=/; max-age=0; SameSite=Lax; Secure";
    document.cookie = "admin_access_token=; path=/; max-age=0; SameSite=Lax; Secure";
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    router.push('/login');
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 text-gray-700 dark:text-gray-400"
      >
        <span className="flex items-center gap-2">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              U
            </span>
          </span>
          <span className="hidden xl:block">
            <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              User
            </span>
            <span className="block text-xs">Admin</span>
          </span>
        </span>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800"
      >
        <DropdownItem
          onItemClick={closeDropdown}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Link href="/aurahq/profile" className="flex w-full items-center gap-2">
            Profile
          </Link>
        </DropdownItem>

        <DropdownItem
          onItemClick={() => {
            closeDropdown();
            handleLogout();
          }}
          className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </DropdownItem>
      </Dropdown>
    </div>
  );
}
