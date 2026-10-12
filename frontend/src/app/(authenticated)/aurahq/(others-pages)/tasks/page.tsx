"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { useSession } from "@/lib/auth-client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import {
  PlusIcon,
  PencilIcon,
  TrashBinIcon,
  TimeIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
} from "@/icons";

import { authFetch } from "@/lib/auth-fetch";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const cleanApiBase = API_BASE.replace(/\/$/, "");

export interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string | null;
  assigned_to_id?: string | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

const fetcher = async (url: string) => {
  const res = await authFetch(url);
  if (!res.ok) {
    throw new Error("Failed to load tasks");
  }
  return res.json();
};

const COLUMNS: { id: "todo" | "in_progress" | "done"; label: string; dotColor: string }[] = [
  { id: "todo", label: "To Do", dotColor: "bg-blue-500" },
  { id: "in_progress", label: "In Progress", dotColor: "bg-warning-500" },
  { id: "done", label: "Done", dotColor: "bg-success-500" },
];

const PRIORITY_CONFIG: Record<
  string,
  { label: string; color: "error" | "warning" | "primary" | "light" }
> = {
  urgent: { label: "Urgent", color: "error" },
  high: { label: "High", color: "warning" },
  medium: { label: "Medium", color: "primary" },
  low: { label: "Low", color: "light" },
};

export default function TasksPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const isAdmin = (session?.user as any)?.role === "admin";

  const {
    data: tasks = [],
    error,
    isLoading,
    mutate,
  } = useSWR<TaskItem[]>(`${cleanApiBase}/api/v1/tasks`, fetcher);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [repFilter, setRepFilter] = useState<"all" | "mine">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [formStatus, setFormStatus] = useState<"todo" | "in_progress" | "done">("todo");
  const [formDueDate, setFormDueDate] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = (defaultStatus: "todo" | "in_progress" | "done" = "todo") => {
    setEditingTask(null);
    setFormTitle("");
    setFormDescription("");
    setFormPriority("medium");
    setFormStatus(defaultStatus);
    setFormDueDate("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || "");
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormDueDate(task.due_date ? task.due_date.slice(0, 10) : "");
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormError("");
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Task title is required.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim() || null,
      priority: formPriority,
      status: formStatus,
      due_date: formDueDate ? new Date(formDueDate).toISOString() : null,
    };

    try {
      if (editingTask) {
        const res = await authFetch(`${cleanApiBase}/api/v1/tasks/${editingTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to update task");
        }
      } else {
        const res = await authFetch(`${cleanApiBase}/api/v1/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to create task");
        }
      }

      await mutate();
      closeModal();
    } catch (err: any) {
      setFormError(err.message || "An error occurred while saving the task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: "todo" | "in_progress" | "done") => {
    try {
      const res = await authFetch(`${cleanApiBase}/api/v1/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to transition task status");
      mutate();
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await authFetch(`${cleanApiBase}/api/v1/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      mutate();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Keyword match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Priority match
      if (priorityFilter !== "all" && t.priority !== priorityFilter) {
        return false;
      }

      // Rep scoping match
      if (repFilter === "mine" && currentUserId) {
        if (t.created_by_id !== currentUserId && t.assigned_to_id !== currentUserId) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, searchQuery, priorityFilter, repFilter, currentUserId]);

  const tasksByColumn = useMemo(() => {
    return {
      todo: filteredTasks.filter((t) => t.status === "todo"),
      in_progress: filteredTasks.filter((t) => t.status === "in_progress"),
      done: filteredTasks.filter((t) => t.status === "done"),
    };
  }, [filteredTasks]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Tasks Board" />

      {/* Control Toolbar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:text-white/90"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Mine vs All toggle */}
          <button
            type="button"
            onClick={() => setRepFilter(repFilter === "all" ? "mine" : "all")}
            className={`h-10 rounded-lg border px-3 text-sm font-medium transition cursor-pointer ${
              repFilter === "mine"
                ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {repFilter === "mine" ? "Showing My Tasks" : "All Team Tasks"}
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={() => openCreateModal("todo")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 cursor-pointer"
          >
            <PlusIcon className="size-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const colTasks = tasksByColumn[col.id] || [];

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-2xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5 dark:border-gray-800 dark:bg-white/[0.02]"
            >
              {/* Column Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`size-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                    {col.label}
                  </h3>
                  <span className="flex size-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {colTasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => openCreateModal(col.id)}
                  title={`Add task to ${col.label}`}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
                >
                  <PlusIcon className="size-5" />
                </button>
              </div>

              {/* Task Cards Container */}
              <div className="flex flex-1 flex-col gap-3">
                {colTasks.length === 0 ? (
                  <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs text-gray-400 dark:border-gray-700">
                    No tasks in {col.label}
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const canEdit =
                      isAdmin ||
                      task.created_by_id === currentUserId ||
                      task.assigned_to_id === currentUserId;

                    const priorityMeta = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

                    return (
                      <div
                        key={task.id}
                        data-testid={`task-card-${task.id}`}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs transition hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900"
                      >
                        {/* Card Header: Priority & Quick Shift */}
                        <div className="mb-2 flex items-center justify-between">
                          <Badge size="sm" color={priorityMeta.color}>
                            {priorityMeta.label}
                          </Badge>

                          <div className="flex items-center gap-1">
                            {/* Move Backward */}
                            {col.id === "in_progress" && (
                              <button
                                type="button"
                                title="Move to To Do"
                                onClick={() => handleStatusChange(task.id, "todo")}
                                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 cursor-pointer"
                              >
                                <ChevronLeftIcon className="size-4" />
                              </button>
                            )}
                            {col.id === "done" && (
                              <button
                                type="button"
                                title="Move to In Progress"
                                onClick={() => handleStatusChange(task.id, "in_progress")}
                                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 cursor-pointer"
                              >
                                <ChevronLeftIcon className="size-4" />
                              </button>
                            )}

                            {/* Move Forward */}
                            {col.id === "todo" && (
                              <button
                                type="button"
                                title="Move to In Progress"
                                onClick={() => handleStatusChange(task.id, "in_progress")}
                                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 cursor-pointer"
                              >
                                <ArrowRightIcon className="size-4" />
                              </button>
                            )}
                            {col.id === "in_progress" && (
                              <button
                                type="button"
                                title="Mark as Done"
                                onClick={() => handleStatusChange(task.id, "done")}
                                className="rounded p-1 text-success-500 hover:bg-success-50 dark:hover:bg-success-500/15 cursor-pointer"
                              >
                                <CheckCircleIcon className="size-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h4 className="mb-1 text-sm font-semibold text-gray-800 dark:text-white/90">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="mb-3 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                            {task.description}
                          </p>
                        )}

                        {/* Due Date & Meta */}
                        <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs text-gray-400 dark:border-gray-800">
                          <div className="flex items-center gap-1.5">
                            <TimeIcon className="size-3.5 text-gray-400" />
                            <span>
                              {task.due_date
                                ? new Date(task.due_date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "No due date"}
                            </span>
                          </div>

                          {canEdit && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditModal(task)}
                                title="Edit task"
                                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 cursor-pointer"
                              >
                                <PencilIcon className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                title="Delete task"
                                className="rounded p-1 text-error-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10 cursor-pointer"
                              >
                                <TrashBinIcon className="size-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Task Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="m-4 max-w-[550px]">
        <div className="w-full rounded-2xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-1 text-xl font-bold text-gray-800 dark:text-white/90">
            {editingTask ? "Edit Task" : "Create New Task"}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            {editingTask
              ? "Update details or reassign this task."
              : "Define deliverables and priority for your team."}
          </p>

          {formError && (
            <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveTask} className="space-y-4">
            <div>
              <Label htmlFor="task-title">Title *</Label>
              <Input
                id="task-title"
                type="text"
                placeholder="e.g. Schedule Product Demo with Client"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="task-desc">Description</Label>
              <textarea
                id="task-desc"
                rows={3}
                placeholder="Add context or execution notes..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:text-white/90"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="task-status">Status</Label>
                <select
                  id="task-status"
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as "todo" | "in_progress" | "done")
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <select
                  id="task-priority"
                  value={formPriority}
                  onChange={(e) =>
                    setFormPriority(e.target.value as "low" | "medium" | "high" | "urgent")
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <Label htmlFor="task-due">Due Date</Label>
                <input
                  id="task-due"
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
