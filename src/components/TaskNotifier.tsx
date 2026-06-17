"use client";

import { useEffect } from "react";

const NOTIFIED_KEY = "notified_task_ids";

function getNotified(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) ?? "[]")); } catch { return new Set(); }
}
function markNotified(id: string) {
  try {
    const s = getNotified();
    s.add(id);
    // Keep only last 200 IDs to prevent unbounded growth
    const arr = Array.from(s).slice(-200);
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(arr));
  } catch {}
}

export default function TaskNotifier() {
  useEffect(() => {
    if (!("Notification" in window)) return;

    async function check() {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }
      if (permission !== "granted") return;

      const res = await fetch("/api/tasks").catch(() => null);
      if (!res?.ok) return;
      const tasks: { _id: string; title: string; dueDate?: string; status: string }[] = await res.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const notified = getNotified();

      for (const task of tasks) {
        if (!task.dueDate || task.status === "done") continue;
        const due = new Date(task.dueDate);
        due.setHours(0, 0, 0, 0);
        const notifId = `${task._id}-${due.toDateString()}`;
        if (notified.has(notifId)) continue;

        if (due < today) {
          new Notification("⚠️ Overdue task", {
            body: `"${task.title}" was due ${due.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
            icon: "/favicon.ico",
            tag: notifId,
          });
          markNotified(notifId);
        } else if (due.getTime() === today.getTime()) {
          new Notification("📅 Task due today", {
            body: `"${task.title}" is due today`,
            icon: "/favicon.ico",
            tag: notifId,
          });
          markNotified(notifId);
        } else if (due.getTime() === tomorrow.getTime()) {
          new Notification("🔔 Task due tomorrow", {
            body: `"${task.title}" is due tomorrow`,
            icon: "/favicon.ico",
            tag: notifId,
          });
          markNotified(notifId);
        }
      }
    }

    // Check on mount (short delay so the page is settled)
    const t = setTimeout(check, 2000);
    return () => clearTimeout(t);
  }, []);

  return null;
}
