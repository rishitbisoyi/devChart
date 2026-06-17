"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";

type Sprint = {
  _id: string;
  name: string;
  goal: string;
  startDate?: string;
  endDate?: string;
  status: "planned" | "active" | "completed";
  color: string;
  createdAt: string;
};

type Task = {
  _id: string;
  title: string;
  status: string;
  priority: string;
  sprint?: string;
};

const STATUS_CONFIG = {
  planned:   { label: "Planned",   color: "#6366f1", bg: "rgba(99,102,241,.12)" },
  active:    { label: "Active",    color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
  completed: { label: "Completed", color: "#3ddc84", bg: "rgba(61,220,132,.12)"  },
};

const SPRINT_COLORS = ["#3ddc84","#3b82f6","#f59e0b","#3ddc84","#ea4335","#fbbc04","#3ddc84","#f97316"];

function ProgressRing({ pct, color, size = 60 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.5s ease" }}
      />
    </svg>
  );
}

export default function SprintsPage() {
  const { data: session } = useSession();
  const sessionRole = (session?.user as { role?: string })?.role;
  const isAdmin = sessionRole === "admin" || sessionRole === "super-admin";

  const [sprints, setSprints]   = useState<Sprint[]>([]);
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "", goal: "", startDate: "", endDate: "",
    status: "planned" as Sprint["status"], color: "#3ddc84",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/sprints").then((r) => r.json()),
      fetch("/api/tasks").then((r) => r.json()),
    ]).then(([s, t]) => { setSprints(s); setTasks(t); }).finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      const res = await fetch("/api/sprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      setSprints((prev) => [created, ...prev]);
      setForm({ name: "", goal: "", startDate: "", endDate: "", status: "planned", color: "#3ddc84" });
      setCreating(false);
      toast.success("Sprint created");
    } catch {
      toast.error("Failed to create sprint");
    }
  }

  async function cycleStatus(sprint: Sprint) {
    const next: Record<Sprint["status"], Sprint["status"]> = {
      planned: "active", active: "completed", completed: "planned",
    };
    const newStatus = next[sprint.status];
    try {
      const res = await fetch(`/api/sprints/${sprint._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await res.json();
      setSprints((prev) => prev.map((s) => (s._id === sprint._id ? updated : s)));
      toast.success(`Sprint marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update sprint");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this sprint? Tasks assigned to it will not be deleted.")) return;
    try {
      await fetch(`/api/sprints/${id}`, { method: "DELETE" });
      setSprints((prev) => prev.filter((s) => s._id !== id));
      toast.success("Sprint deleted");
    } catch {
      toast.error("Failed to delete sprint");
    }
  }

  function sprintTasks(sprintId: string) {
    return tasks.filter((t) => t.sprint === sprintId);
  }

  const unassigned = tasks.filter((t) => !t.sprint);

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ maxWidth: "1100px" }}>
        {/* Header */}
        <div className="page-header animate-fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-light)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "12px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                devChart Sprints
              </div>
              <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
                Sprints & Milestones
              </h1>
              <p style={{ marginTop: "8px", color: "var(--text-muted)", fontSize: "14px" }}>
                Group tasks into sprints, track progress with visual rings
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setCreating((v) => !v)}
                className="btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", padding: "10px 18px", borderRadius: "10px" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Sprint
              </button>
            )}
          </div>
        </div>

        {/* Create form — admin only */}
        {creating && isAdmin && (
          <div
            className="animate-scale-in"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}
          >
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "18px" }}>New Sprint</div>
            <form onSubmit={handleCreate}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "var(--font-mono)", display: "block", marginBottom: "6px" }}>Sprint Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Sprint 1 — Auth Flow"
                    required
                    className="input-base"
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "var(--font-mono)", display: "block", marginBottom: "6px" }}>Goal</label>
                  <input
                    value={form.goal}
                    onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                    placeholder="What should be achieved in this sprint?"
                    className="input-base"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "var(--font-mono)", display: "block", marginBottom: "6px" }}>Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="input-base" style={{ colorScheme: "dark" }} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "var(--font-mono)", display: "block", marginBottom: "6px" }}>End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className="input-base" style={{ colorScheme: "dark" }} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "var(--font-mono)", display: "block", marginBottom: "6px" }}>Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Sprint["status"] }))} className="input-base">
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "var(--font-mono)", display: "block", marginBottom: "6px" }}>Color</label>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {SPRINT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, color: c }))}
                        style={{
                          width: "24px", height: "24px", borderRadius: "6px", background: c, border: "none", cursor: "pointer",
                          outline: form.color === c ? `2px solid ${c}` : "2px solid transparent",
                          outlineOffset: "2px",
                          transition: "outline 0.1s",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setCreating(false)} className="btn-ghost" style={{ padding: "9px 16px", fontSize: "13px", borderRadius: "9px" }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: "9px 18px", fontSize: "13px", borderRadius: "9px" }}>Create Sprint</button>
              </div>
            </form>
          </div>
        )}

        {/* Sprint cards */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: "160px", borderRadius: "16px" }} />)}
          </div>
        ) : sprints.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--text-faint)" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚡</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>No sprints yet</div>
            <div style={{ fontSize: "14px" }}>Create your first sprint to group and track tasks</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {sprints.map((sprint) => {
              const st = sprintTasks(sprint._id);
              const done = st.filter((t) => t.status === "done").length;
              const pct = st.length ? Math.round((done / st.length) * 100) : 0;
              const sc = STATUS_CONFIG[sprint.status];
              const daysLeft = sprint.endDate
                ? Math.ceil((new Date(sprint.endDate).getTime() - Date.now()) / 86400000)
                : null;
              const isOverdue = daysLeft !== null && daysLeft < 0 && sprint.status !== "completed";

              return (
                <div
                  key={sprint._id}
                  className="animate-fade-up"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderLeft: `3px solid ${sprint.color}`,
                    borderRadius: "16px",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Progress ring */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <ProgressRing pct={pct} color={sprint.color} size={64} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, color: sprint.color, fontFamily: "var(--font-mono)" }}>
                      {pct}%
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
                        {sprint.name}
                      </h3>
                      <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: sc.color, background: sc.bg, padding: "2px 8px", borderRadius: "5px", fontFamily: "var(--font-mono)", border: `1px solid ${sc.color}28` }}>
                        {sc.label}
                      </span>
                    </div>
                    {sprint.goal && (
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px", lineHeight: 1.5 }}>{sprint.goal}</p>
                    )}
                    <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                        {done}/{st.length} tasks done
                      </span>
                      {sprint.startDate && (
                        <span style={{ fontSize: "12px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                          {new Date(sprint.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          {sprint.endDate && ` → ${new Date(sprint.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
                        </span>
                      )}
                      {daysLeft !== null && sprint.status !== "completed" && (
                        <span style={{ fontSize: "12px", fontWeight: 700, color: isOverdue ? "#ea4335" : daysLeft <= 3 ? "#f59e0b" : "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                          {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                        </span>
                      )}
                    </div>

                    {/* Mini task list */}
                    {st.length > 0 && (
                      <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {st.slice(0, 6).map((t) => (
                          <Link key={t._id} href={`/edit-task/${t._id}`}>
                            <span style={{
                              fontSize: "11px", padding: "2px 9px", borderRadius: "5px", cursor: "pointer",
                              background: t.status === "done" ? "rgba(61,220,132,.1)" : "var(--bg-elevated)",
                              border: `1px solid ${t.status === "done" ? "rgba(61,220,132,.2)" : "var(--border)"}`,
                              color: t.status === "done" ? "#3ddc84" : "var(--text-muted)",
                              textDecoration: t.status === "done" ? "line-through" : "none",
                              fontFamily: "var(--font-mono)",
                              display: "inline-block",
                              maxWidth: "120px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              verticalAlign: "middle",
                            }}>
                              {t.title}
                            </span>
                          </Link>
                        ))}
                        {st.length > 6 && (
                          <span style={{ fontSize: "11px", color: "var(--text-faint)", padding: "2px 6px", fontFamily: "var(--font-mono)" }}>+{st.length - 6} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions — admin only */}
                  {isAdmin && (
                    <div style={{ display: "flex", gap: "7px", flexShrink: 0 }}>
                      <button
                        onClick={() => cycleStatus(sprint)}
                        title="Advance sprint status"
                        style={{ padding: "7px 13px", borderRadius: "8px", background: sprint.color + "18", border: `1px solid ${sprint.color}35`, color: sprint.color, fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                      >
                        {sprint.status === "planned" ? "Start" : sprint.status === "active" ? "Complete" : "Reopen"}
                      </button>
                      <button
                        onClick={() => handleDelete(sprint._id)}
                        style={{ width: "33px", height: "33px", borderRadius: "8px", background: "rgba(234,67,53,.08)", border: "1px solid rgba(234,67,53,.2)", color: "#ea4335", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Unassigned tasks */}
        {!loading && unassigned.length > 0 && (
          <div style={{ marginTop: "32px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Unassigned to any sprint ({unassigned.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {unassigned.map((t) => (
                <Link key={t._id} href={`/edit-task/${t._id}`}>
                  <span style={{ fontSize: "12px", padding: "4px 11px", borderRadius: "7px", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer", display: "inline-block", fontFamily: "var(--font-mono)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                    {t.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
