"use client";

import { useTheme } from "@/context/ThemeContext";
import { useModal } from "@/hooks/useModal";
import { useSession } from "@/lib/auth-client";
import { isRtl } from "@/i18n/languages";
import type { Locale } from "@/i18n/routing";
import type {
  DateSelectInfo,
  DayCellInfo,
  DayHeaderInfo,
  DayLaneInfo,
  EventClickInfo,
  EventDisplayInfo,
  MoreLinkInfo,
  ToolbarSectionInfo,
} from "@fullcalendar/react";
import FullCalendar, { CalendarRef } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useLocale } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import CalendarEventItem from "./CalendarEventItem";
import CalendarEventModal from "./CalendarEventModal";
import CalendarViewSelect from "./CalendarViewSelect";
import {
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from "./icons";
import type { CalendarEvent, EventFormData } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const cleanApiBase = API_BASE.replace(/\/$/, "");

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch calendar events.");
  }
  return res.json();
};

const Calendar: React.FC = () => {
  const locale = useLocale();
  const isRtlLayout = isRtl(locale as Locale);
  const { theme } = useTheme();
  const { data: session } = useSession();

  const { data: eventsData, mutate: mutateEvents } = useSWR<CalendarEvent[]>(
    `${cleanApiBase}/api/v1/calendar/events`,
    fetcher
  );

  const events = eventsData || [];

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [portalNode, setPortalNode] = useState<Element | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const calendarRef = useRef<CalendarRef>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const handleViewChange = (viewKey: string) => {
    setCurrentView(viewKey);
    calendarRef.current?.getApi()?.changeView(viewKey);
  };

  const handleOpenAddModal = () => {
    const currentDate = new Date();
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dd = String(currentDate.getDate()).padStart(2, "0");
    const combineDate = `${yyyy}-${mm}-${dd}`;

    setSelectedEvent(null);
    setSelectedStartDate(combineDate);
    setSelectedEndDate(combineDate);
    openModal();
  };

  const handleDateSelect = (selectInfo: DateSelectInfo) => {
    const startStr = selectInfo.startStr
      ? selectInfo.startStr.split("T")[0]
      : "";
    const endStr = selectInfo.endStr
      ? selectInfo.endStr.split("T")[0]
      : startStr;

    setSelectedEvent(null);
    setSelectedStartDate(startStr);
    setSelectedEndDate(endStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickInfo) => {
    const event = clickInfo.event;
    if (event.url) {
      window.open(event.url);
      clickInfo.jsEvent?.preventDefault();
      return;
    }

    const startStr = event.startStr ? event.startStr.split("T")[0] : "";
    const endStr = event.endStr ? event.endStr.split("T")[0] : startStr;

    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      extendedProps: {
        calendar: event.extendedProps?.calendar || event.extendedProps?.category || "Primary",
        user_id: event.extendedProps?.user_id,
      },
    });
    setSelectedStartDate(startStr);
    setSelectedEndDate(endStr);
    openModal();
  };

  const handleSaveEvent = async (formData: EventFormData) => {
    const titleVal = formData.title.trim() || (selectedEvent ? "Event" : "New Event");
    const startDateVal = formData.start;
    const endDateVal = formData.end || startDateVal;
    const levelVal = formData.level || "Primary";

    try {
      if (selectedEvent) {
        // Update existing event
        const res = await fetch(`${cleanApiBase}/api/v1/calendar/events/${selectedEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: titleVal,
            start_time: new Date(startDateVal).toISOString(),
            end_time: new Date(endDateVal).toISOString(),
            category: levelVal,
          }),
        });
        if (!res.ok) throw new Error("Failed to update event");
      } else {
        // Create new event
        const res = await fetch(`${cleanApiBase}/api/v1/calendar/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: titleVal,
            start_time: new Date(startDateVal).toISOString(),
            end_time: new Date(endDateVal).toISOString(),
            category: levelVal,
          }),
        });
        if (!res.ok) throw new Error("Failed to create event");
      }
      mutateEvents();
      closeModal();
    } catch (err) {
      console.error("Error saving calendar event:", err);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await fetch(`${cleanApiBase}/api/v1/calendar/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete event");
      mutateEvents();
      closeModal();
    } catch (err) {
      console.error("Error deleting calendar event:", err);
    }
  };

  // Determine if active user can edit the selected event
  const isSuperOrAdmin = (session?.user as any)?.role === "admin";
  const canEditSelected =
    !selectedEvent ||
    isSuperOrAdmin ||
    selectedEvent.extendedProps?.user_id === session?.user?.id;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCurrentView("timeGridDay");
        calendarRef.current?.getApi()?.changeView("timeGridDay");
      } else {
        setCurrentView("dayGridMonth");
        calendarRef.current?.getApi()?.changeView("dayGridMonth");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      {/* Calendar Header */}
      <div className="custom-calendar flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <CalendarViewSelect
            value={currentView}
            onChange={handleViewChange}
          />
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 cursor-pointer"
          >
            Add Event
          </button>
        </div>
      </div>

      {/* FullCalendar Component */}
      <div
        ref={calendarContainerRef}
        className="custom-calendar overflow-hidden px-4 pb-6 sm:px-6"
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            multiMonthPlugin,
          ]}
          initialView={currentView}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          events={events}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          direction={isRtlLayout ? "rtl" : "ltr"}
        />
      </div>

      {/* Event Add/Edit Modal */}
      <CalendarEventModal
        isOpen={isOpen}
        onClose={closeModal}
        selectedEvent={selectedEvent}
        initialStartDate={selectedStartDate}
        initialEndDate={selectedEndDate}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        canEdit={canEditSelected}
      />
    </div>
  );
};

export default Calendar;
