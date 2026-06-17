"use client";

import Navbar from "@/components/Navbar";
import KanbanColumn from "@/components/KanbanColumn";
import TaskDrawer from "@/components/TaskDrawer";
import CalendarView from "@/components/CalendarView";
import { useEffect, useMemo, useState, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense } from "react";
import Link from "next/link";

type Task = {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string;
  dueDate: string;
  tags?: string[];
  subtasks?: { _id: string; text: string; done: boolean }[];
};

const STATUS_ORDER = ["todo", "in-progress", "done"];
const COLUMNS = [
  { id: "todo",        title: "To Do",       accent: "#6366f1" },
  { id: "in-progress", title: "In Progress", accent: "#f59e0b" },
  { id: "done",        title: "Done",        accent: "#3ddc84" },
];
const PRIORITIES = ["all", "high", "medium", "low"];
const PRIORITY_COLORS: Record<string, string> = {
  high: "#ea4335", medium: "#f59e0b", low: "#3ddc84",
};

function launchConfetti() {
  const colors = ["#3ddc84","#3ddc84","#f59e0b","#ea4335","#4285f4","#fbbc04","#3b82f6","#f97316"];
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;";
  for (let i = 0; i < 90; i++) {
    const p = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 9 + 5;
    const x = Math.random() * 100;
    const dur = (Math.random() * 1.4 + 1.2).toFixed(2);
    const delay = (Math.random() * 0.6).toFixed(2);
    const isCircle = Math.random() > 0.4;
    p.style.cssText = `
      position:absolute;top:-16px;left:${x}%;
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:${isCircle ? "50%" : "2px"};
      animation:confetti-fall ${dur}s ${delay}s ease-in forwards, confetti-sway ${dur}s ${delay}s ease-in-out infinite;
      opacity:1;
    `;
    container.appendChild(p);
  }
  document.body.appendChild(container);
  setTimeout(() => container.remove(), 3200);
}

function DashboardInner() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const sessionRole = (session?.user as { role?: string })?.role;
  const isAdmin = sessionRole === "admin" || sessionRole === "super-admin";

  const [tasks, setTasks]               = useState<Task[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState(searchParams.get("q") ?? "");
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get("priority") ?? "all");
  const [drawerTaskId, setDrawerTaskId] = useState<string | null>(null);
  const [view, setView]                 = useState<"kanban" | "calendar">("kanban");

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      router.replace(`/dashboard${params.toString() ? "?" + params.toString() : ""}`, { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, priorityFilter, router]);

  const fetchTasks = useCallback(async () => {
    try {
      const res  = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  async function updateStatus(id: string, newStatus: string) {
    const prev    = [...tasks];
    const wasNew  = newStatus === "done";
    setTasks((t) => t.map((task) => (task._id === id ? { ...task, status: newStatus } : task)));
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      const label = COLUMNS.find((c) => c.id === newStatus)?.title ?? newStatus;
      toast.success(`Moved to ${label}`);
      if (wasNew) launchConfetti();
    } catch {
      setTasks(prev);
      toast.error("Failed to move task");
    }
  }

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;
    if (source.droppableId === destination.droppableId) return;
    await updateStatus(draggableId, destination.droppableId);
  }

  async function handleMove(id: string, direction: "forward" | "back") {
    const task = tasks.find((t) => t._id === id);
    if (!task) return;
    const idx  = STATUS_ORDER.indexOf(task.status);
    const next = direction === "forward" ? STATUS_ORDER[idx + 1] : STATUS_ORDER[idx - 1];
    if (!next) return;
    await updateStatus(id, next);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    const prev = [...tasks];
    setTasks((t) => t.filter((task) => task._id !== id));
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Task deleted");
    } catch {
      setTasks(prev);
      toast.error("Failed to delete task");
    }
  }

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        !q ||
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.assignedTo?.toLowerCase().includes(q);
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  const counts = useMemo(() => ({
    todo: tasks.filter((t) => t.status === "todo").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    total: tasks.length,
  }), [tasks]);

  const completionPct = counts.total === 0 ? 0 : Math.round((counts.done / counts.total) * 100);

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ maxWidth: "1380px" }}>

        {/* Page header */}
        <div className="page-header animate-fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-light)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "12px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                Nexus Workspace
              </div>
              <h1 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
                Dashboard
              </h1>
              <p style={{ marginTop: "10px", color: "var(--text-muted)", fontSize: "14px" }}>
                Drag tasks between stages · Click a task to view details and comment
              </p>
            </div>

            {/* Stat counters */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                { label: "To Do",  value: counts.todo,             color: "#6366f1" },
                { label: "Active", value: counts["in-progress"],   color: "#f59e0b" },
                { label: "Done",   value: counts.done,             color: "#3ddc84" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "var(--bg-surface)",
                    border: `1px solid ${s.color}30`,
                    borderTop: `2px solid ${s.color}`,
                    borderRadius: "12px",
                    padding: "12px 18px",
                    minWidth: "90px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "10px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: "26px", fontWeight: 800, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall progress */}
          {counts.total > 0 && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                <span>Overall progress — {counts.total} task{counts.total !== 1 ? "s" : ""}</span>
                <span style={{ color: completionPct >= 70 ? "#3ddc84" : "var(--text-muted)" }}>
                  {completionPct}% complete
                </span>
              </div>
              <div style={{ background: "var(--bg-elevated)", borderRadius: "999px", height: "5px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${completionPct}%`,
                    height: "100%",
                    background: completionPct >= 70
                      ? "linear-gradient(90deg, #3ddc84, #86efac)"
                      : "linear-gradient(90deg, var(--accent), var(--accent-light))",
                    borderRadius: "999px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div
          className="animate-fade-up"
          style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center", animationDelay: "0.05s" }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "360px" }}>
            <div style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search tasks, members…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base"
              style={{ paddingLeft: "38px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "5px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "4px" }}>
            {PRIORITIES.map((p) => {
              const active = priorityFilter === p;
              const color  = p !== "all" ? PRIORITY_COLORS[p] : "var(--accent)";
              return (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "7px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1px solid transparent",
                    textTransform: "capitalize",
                    background: active ? (p === "all" ? "linear-gradient(135deg,#3ddc84,#4285f4)" : color + "22") : "transparent",
                    borderColor: active ? (p === "all" ? "#3ddc84" : color + "44") : "transparent",
                    color: active ? (p === "all" ? "#fff" : color) : "var(--text-muted)",
                    transition: "all 0.15s",
                  }}
                >
                  {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              );
            })}
          </div>

          {/* View toggle */}
          <div style={{ display: "flex", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "4px", gap: "3px", marginLeft: "auto" }}>
            {(["kanban", "calendar"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                title={v === "kanban" ? "Kanban board" : "Calendar view"}
                style={{
                  padding: "6px 10px",
                  borderRadius: "7px",
                  border: "1px solid transparent",
                  background: view === v ? "rgba(61,220,132,.18)" : "transparent",
                  borderColor: view === v ? "rgba(61,220,132,.3)" : "transparent",
                  color: view === v ? "var(--accent-light)" : "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                {v === "kanban" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                )}
              </button>
            ))}
          </div>

          <Link href="/create-task">
            <button className="btn-primary" style={{ fontSize: "13px", padding: "9px 16px", display: "flex", alignItems: "center", gap: "6px", borderRadius: "9px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Task
            </button>
          </Link>
        </div>

        {/* Board / Calendar */}
        {loading ? (
          <div style={{ display: "flex", gap: "18px" }}>
            {[1,2,3].map((i) => (
              <div key={i} style={{ flex: 1, minWidth: "280px" }}>
                <div className="skeleton" style={{ height: "52px", marginBottom: "14px", borderRadius: "14px" }} />
                {[1,2,3].map((j) => (
                  <div key={j} className="skeleton" style={{ height: "140px", marginBottom: "10px", borderRadius: "14px" }} />
                ))}
              </div>
            ))}
          </div>
        ) : view === "calendar" ? (
          <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <CalendarView tasks={filtered} />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div
              className="animate-fade-up"
              style={{ display: "flex", gap: "18px", alignItems: "flex-start", overflowX: "auto", paddingBottom: "16px", animationDelay: "0.1s" }}
            >
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  accentColor={col.accent}
                  tasks={filtered.filter((t) => t.status === col.id)}
                  isAdmin={isAdmin}
                  onDelete={handleDelete}
                  onMove={handleMove}
                  onOpen={(id) => setDrawerTaskId(id)}
                />
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Task detail drawer */}
      <TaskDrawer taskId={drawerTaskId} onClose={() => setDrawerTaskId(null)} />
    </>
  );
}

export default function Dashboard() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}
