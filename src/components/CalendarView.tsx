"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Task = {
  _id: string;
  title: string;
  priority: string;
  status: string;
  dueDate?: string;
};

type Props = { tasks: Task[] };

const PRIORITY_COLORS: Record<string, string> = {
  high: "#ea4335",
  medium: "#f59e0b",
  low: "#3ddc84",
};

const STATUS_COLORS: Record<string, string> = {
  todo: "#6366f1",
  "in-progress": "#f59e0b",
  done: "#3ddc84",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function CalendarView({ tasks }: Props) {
  const router = useRouter();
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map tasks to day numbers
  const tasksByDay: Record<number, Task[]> = {};
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const d = new Date(task.dueDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(task);
    }
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden" }}>
      {/* Month navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-elevated)",
        }}
      >
        <button
          onClick={prevMonth}
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}
            style={{ fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "6px", background: "rgba(61,220,132,.12)", border: "1px solid rgba(61,220,132,.25)", color: "var(--accent-light)", cursor: "pointer" }}
          >
            Today
          </button>
        </div>

        <button
          onClick={nextMonth}
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--border)" }}>
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              padding: "10px 0",
              textAlign: "center",
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--text-faint)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div>
        {weeks.map((week, wi) => (
          <div
            key={wi}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              borderBottom: wi < weeks.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            {week.map((day, di) => {
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const dayTasks = day ? (tasksByDay[day] ?? []) : [];
              const hasOverdue = dayTasks.some((t) => t.status !== "done");

              return (
                <div
                  key={di}
                  style={{
                    minHeight: "110px",
                    padding: "8px",
                    borderRight: di < 6 ? "1px solid var(--border)" : "none",
                    background: day ? "transparent" : "rgba(0,0,0,.04)",
                    position: "relative",
                  }}
                >
                  {day && (
                    <>
                      {/* Day number */}
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: isToday ? 800 : 500,
                          color: isToday ? "#fff" : "var(--text-muted)",
                          background: isToday ? "var(--accent)" : "transparent",
                          marginBottom: "4px",
                          flexShrink: 0,
                        }}
                      >
                        {day}
                      </div>

                      {/* Task pills */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task._id}
                            onClick={() => router.push(`/edit-task/${task._id}`)}
                            title={task.title}
                            style={{
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: 600,
                              cursor: "pointer",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              background: PRIORITY_COLORS[task.priority] + "20",
                              borderLeft: `2px solid ${PRIORITY_COLORS[task.priority] ?? "#8b90a7"}`,
                              color: task.status === "done" ? "var(--text-faint)" : "var(--text-secondary)",
                              textDecoration: task.status === "done" ? "line-through" : "none",
                              transition: "all 0.1s",
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = PRIORITY_COLORS[task.priority] + "35"; }}
                            onMouseOut={(e)  => { e.currentTarget.style.background = PRIORITY_COLORS[task.priority] + "20"; }}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div style={{ fontSize: "10px", color: "var(--text-faint)", fontFamily: "var(--font-mono)", paddingLeft: "4px" }}>
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border)", background: "var(--bg-elevated)", display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {[
          { label: "High", color: "#ea4335" },
          { label: "Medium", color: "#f59e0b" },
          { label: "Low", color: "#3ddc84" },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--text-faint)" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: color }} />
            {label} priority
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
          Click a task to edit
        </div>
      </div>
    </div>
  );
}
