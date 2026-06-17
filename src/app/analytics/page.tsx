"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type AnalyticsData = {
  total: number;
  byStatus: { todo: number; "in-progress": number; done: number };
  byPriority: { low: number; medium: number; high: number };
  completedThisWeek: number;
  overdue: number;
  byMember: { name: string; total: number; done: number }[];
};

type Task = {
  _id: string;
  title: string;
  status: string;
  priority: string;
  assignedTo: string;
  dueDate: string;
};

function avatarColor(name: string) {
  const colors = ["#3ddc84","#4285f4","#3ddc84","#ea4335","#f59e0b","#fbbc04","#3b82f6","#f97316"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function StatCard({
  label,
  value,
  color,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className="stat-card"
      style={{
        borderTop: color ? `2px solid ${color}` : "2px solid var(--border)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {color && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: color + "0c",
            transform: "translate(25%, -25%)",
            pointerEvents: "none",
          }}
        />
      )}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-faint)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {label}
        </div>
        {icon && (
          <div style={{ color: color ?? "var(--text-faint)", opacity: 0.7 }}>{icon}</div>
        )}
      </div>
      <div
        style={{
          fontSize: "34px",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: color ?? "var(--text-primary)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "11px", color: "var(--text-faint)", marginTop: "6px", fontFamily: "var(--font-mono)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

const ChartTooltipStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--text-primary)",
  fontSize: "12px",
  fontFamily: "var(--font-mono)",
  boxShadow: "var(--shadow-md)",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics").then((r) => r.json()),
      fetch("/api/tasks").then((r) => r.json()),
    ])
      .then(([analytics, taskList]) => { setData(analytics); setTasks(taskList); })
      .finally(() => setLoading(false));
  }, []);

  function exportCSV() {
    const headers = ["Title", "Status", "Priority", "Assigned To", "Due Date"];
    const rows = tasks.map((t) => [
      `"${t.title}"`,
      t.status,
      t.priority,
      t.assignedTo || "Unassigned",
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexus-tasks.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const completionRate = data && data.total > 0 ? Math.round((data.byStatus.done / data.total) * 100) : 0;

  const statusChartData = data ? [
    { label: "To Do",       count: data.byStatus.todo,             color: "#6366f1" },
    { label: "In Progress", count: data.byStatus["in-progress"],   color: "#f59e0b" },
    { label: "Done",        count: data.byStatus.done,             color: "#3ddc84" },
  ] : [];

  const priorityChartData = data ? [
    { label: "Low",    count: data.byPriority.low,    color: "#3ddc84" },
    { label: "Medium", count: data.byPriority.medium, color: "#f59e0b" },
    { label: "High",   count: data.byPriority.high,   color: "#ea4335" },
  ] : [];

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ maxWidth: "1200px" }}>

        {/* Page header */}
        <div className="page-header animate-fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--accent-light)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-mono)",
                  marginBottom: "12px",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Analytics Center
              </div>
              <h1
                style={{
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  margin: 0,
                  color: "var(--text-primary)",
                  lineHeight: 1.05,
                }}
              >
                Project Insights
              </h1>
              <p style={{ marginTop: "10px", color: "var(--text-muted)", fontSize: "14px" }}>
                Track productivity, completion trends and team performance.
              </p>
            </div>

            <button
              onClick={exportCSV}
              className="btn-ghost"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "11px 18px",
                fontSize: "14px",
                borderRadius: "10px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              {[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "14px" }} />)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              {[1,2].map((i) => <div key={i} className="skeleton" style={{ height: "280px", borderRadius: "14px" }} />)}
            </div>
          </div>
        ) : data ? (
          <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
            {/* Stat cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              <StatCard
                label="Total Tasks"
                value={data.total}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
              />
              <StatCard
                label="Completed"
                value={data.byStatus.done}
                color="#3ddc84"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
              />
              <StatCard
                label="Completion Rate"
                value={`${completionRate}%`}
                color={completionRate >= 70 ? "#3ddc84" : completionRate >= 40 ? "#f59e0b" : "var(--text-primary)"}
                sub={`${data.byStatus.done} of ${data.total} tasks`}
              />
              <StatCard
                label="High Priority"
                value={data.byPriority.high}
                color="#ea4335"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>}
              />
              <StatCard
                label="Overdue"
                value={data.overdue}
                color={data.overdue > 0 ? "#ea4335" : undefined}
                sub={data.overdue === 0 ? "All on schedule" : "Need attention"}
              />
              <StatCard
                label="Done This Week"
                value={data.completedThisWeek}
                color="#3ddc84"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
              />
            </div>

            {/* Charts */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              {[
                { title: "Tasks by Status", data: statusChartData },
                { title: "Tasks by Priority", data: priorityChartData },
              ].map((chart) => (
                <div
                  key={chart.title}
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "24px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-mono)",
                      marginBottom: "20px",
                    }}
                  >
                    {chart.title}
                  </div>
                  <div style={{ height: "220px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chart.data} barSize={36} barCategoryGap="30%">
                        <XAxis
                          dataKey="label"
                          tick={{ fill: "var(--text-faint)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "var(--text-faint)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={ChartTooltipStyle}
                          cursor={{ fill: "rgba(255,255,255,0.03)", radius: 4 }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {chart.data.map((entry, i) => (
                            <Cell key={i} fill={entry.color} fillOpacity={0.9} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>

            {/* Member leaderboard */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--text-faint)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Member Workload
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-faint)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {data.byMember.length} contributor{data.byMember.length !== 1 ? "s" : ""}
                </div>
              </div>

              {data.byMember.length === 0 ? (
                <div style={{ color: "var(--text-faint)", fontSize: "13px", textAlign: "center", padding: "24px 0" }}>
                  No tasks assigned yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {data.byMember.map((m, i) => {
                    const pct = m.total === 0 ? 0 : Math.round((m.done / m.total) * 100);
                    const color = avatarColor(m.name);
                    return (
                      <div key={m.name} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            color: i < 3 ? "var(--accent-light)" : "var(--text-faint)",
                            width: "18px",
                            textAlign: "right",
                            flexShrink: 0,
                            fontWeight: i < 3 ? 700 : 400,
                          }}
                        >
                          {i + 1}
                        </span>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "9px",
                            background: `linear-gradient(135deg, ${color}, ${color}aa)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 800,
                            color: "#fff",
                            flexShrink: 0,
                            boxShadow: `0 2px 8px ${color}40`,
                          }}
                        >
                          {getInitials(m.name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", alignItems: "center" }}>
                            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                              {m.name}
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                fontFamily: "var(--font-mono)",
                                color: pct === 100 ? "#3ddc84" : "var(--text-faint)",
                                fontWeight: pct === 100 ? 700 : 400,
                              }}
                            >
                              {m.done}/{m.total} · {pct}%
                            </span>
                          </div>
                          <div style={{ background: "var(--bg-elevated)", borderRadius: "999px", height: "5px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: pct === 100
                                  ? "linear-gradient(90deg, #3ddc84, #86efac)"
                                  : `linear-gradient(90deg, ${color}, ${color}aa)`,
                                borderRadius: "999px",
                                transition: "width 0.5s ease",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
