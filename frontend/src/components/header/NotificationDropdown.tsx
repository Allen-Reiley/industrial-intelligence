"use client";

import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
  type?: "info" | "success" | "warning";
};

export default function NotificationDropdown({
  initialNotifications = [],
}: {
  initialNotifications?: NotificationItem[];
}) {
  const t = useTranslations("header.notifications");
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        className="dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0 z-10 h-2.5 w-2.5 rounded-full bg-brand-500">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -left-13.5 mt-4.25 flex max-h-120 w-80 sm:w-88 flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-lg xl:right-0 xl:left-auto dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {t("title")}
            </h5>
            {unreadCount > 0 && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 ? (
            <button
              onClick={markAllAsRead}
              className="text-xs font-medium text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
            >
              Mark all read
            </button>
          ) : (
            <button
              onClick={toggleDropdown}
              className="text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
            >
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
              No new notifications
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 max-w-[220px]">
              You are all caught up! Real-time alerts and telemetry updates will appear here.
            </p>
          </div>
        ) : (
          <ul className="custom-scrollbar flex flex-col gap-1 overflow-y-auto">
            {notifications.map((item) => (
              <li key={item.id}>
                <DropdownItem
                  onItemClick={closeDropdown}
                  className={cn(
                    "flex flex-col gap-1 rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-white/5",
                    !item.read && "bg-brand-50/50 dark:bg-brand-500/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-800 dark:text-white/90">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-gray-400">{item.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.message}
                  </p>
                </DropdownItem>
              </li>
            ))}
          </ul>
        )}
      </Dropdown>
    </div>
  );
}
