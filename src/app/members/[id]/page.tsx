"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

type Member = { _id: string; name: string; email: string; role: string };
type Task = {
  _id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  tags?: string[];
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function avatarColor(name: string) {
  const colors = ["#3ddc84","#f59e0b","#3ddc84","#ea4335","#3b82f6","#fbbc04","#3ddc84","#f97316"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const ROLE_CONFIG: Record<string, { color: string }> = {
  admin:  { color: "#ea4335" },
  lead:   { color: "#f59e0b" },
  member: { color: "#3ddc84" },
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "#ea4335", medium: "#f59e0b", low: "#3ddc84",
};

const STATUS_LABELS:  Record<string, string> = {
  todo: "To Do", "in-progress": "In Progress", done: "Done",
};

const STATUS_COLORS: Record<string, string> = {
  todo: "#6366f1", "in-progress": "#f59e0b", done: "#3ddc84",
};

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [member, setMember] = useState<Member | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const sessionRole = (session?.user as { role?: string })?.role;
  const isAdmin = sessionRole === "admin" || sessionRole === "super-admin";

  useEffect(() => {
    fetch(`/api/members/${params.id}`)
      .then((r) => r.json())
      .then(({ member, tasks }) => { setMember(member); setTasks(tasks); })
      .catch(() => toast.error("Failed to load member"))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleDelete() {
    if (!window.confirm("Remove this member? This cannot be undone.")) return;
    try {
      await fetch(`/api/members/${params.id}`, { method: "DELETE" });
      toast.success("Member removed");
      router.push("/members");
    } catch {
      toast.error("Failed to remove member");
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-wrapper" style={{ maxWidth: "900px" }}>
          <div className="skeleton" style={{ height: "160px", borderRadius: "20px", marginBottom: "16px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "16px" }}>
            {[1,2,3,4,5].map((i) => <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "12px" }} />)}
          </div>
        </div>
      </>
    );
  }

  if (!member) {
    return (
      <>
        <Navbar />
        <div className="page-wrapper" style={{ color: "var(--text-muted)" }}>Member not found.</div>
      </>
    );
  }

  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const total = tasks.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const color = avatarColor(member.name);
  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;
  const roleCfg = ROLE_CONFIG[member.role] ?? { color: "var(--accent)" };

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ maxWidth: "900px" }}>

        {/* Breadcrumb */}
        <Link
          href="/members"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "var(--text-faint)",
            fontWeight: 500,
            marginBottom: "24px",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Members
        </Link>

        {/* Profile header card */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "28px 32px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "18px",
            flexWrap: "wrap",
            position: "relative",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Gradient glow */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              left: "-40px",
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              background: color + "12",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: `linear-gradient(135deg, ${color}, ${color}aa)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
              boxShadow: `0 8px 24px ${color}40`,
              letterSpacing: "-0.02em",
            }}
          >
            {getInitials(member.name)}
          </div>

          <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                {member.name}
              </h1>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: roleCfg.color,
                  background: roleCfg.color + "18",
                  padding: "3px 9px",
                  borderRadius: "6px",
                  fontFamily: "var(--font-mono)",
                  border: `1px solid ${roleCfg.color}30`,
                }}
              >
                {member.role}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: "var(--text-faint)",
                fontFamily: "var(--font-mono)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {member.email}
            </div>
          </div>

          {isAdmin && <button
            onClick={handleDelete}
            style={{
              background: "rgba(234,67,53,.08)",
              border: "1px solid rgba(234,67,53,.25)",
              color: "#ea4335",
              padding: "9px 16px",
              borderRadius: "9px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(234,67,53,.14)"; }}
            onMouseOut={(e)  => { e.currentTarget.style.background = "rgba(234,67,53,.08)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            </svg>
            Remove
          </button>}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          {[
            { label: "Total",       value: total,      color: "var(--text-primary)", border: "var(--border)"                   },
            { label: "To Do",       value: todo,       color: "#6366f1",             border: "rgba(99,102,241,.25)"             },
            { label: "In Progress", value: inProgress, color: "#f59e0b",             border: "rgba(245,158,11,.25)"             },
            { label: "Done",        value: done,       color: "#3ddc84",             border: "rgba(61,220,132,.25)"              },
            { label: "Overdue",     value: overdue,    color: overdue > 0 ? "#ea4335" : "var(--text-primary)", border: overdue > 0 ? "rgba(234,67,53,.25)" : "var(--border)" },
          ].map((s) => (
            <div
              key={s.label}
              className="stat-card"
              style={{
                borderColor: s.border,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginBottom: "6px" }}>
                {s.label}
              </div>
              <div style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.04em", color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Completion bar */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "20px 24px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
              Completion Rate
            </span>
            <span
              style={{
                fontSize: "14px",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                color: pct === 100 ? "#3ddc84" : pct > 50 ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              {pct}%
            </span>
          </div>
          <div style={{ background: "var(--bg-elevated)", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
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
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
            <span>{done} of {total} tasks completed</span>
            {overdue > 0 && (
              <span style={{ color: "#ea4335", fontWeight: 600 }}>{overdue} overdue</span>
            )}
          </div>
        </div>

        {/* Task list */}
        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginBottom: "12px" }}>
          Assigned Tasks ({total})
        </div>

        {tasks.length === 0 ? (
          <div
            style={{
              color: "var(--text-faint)",
              fontSize: "13px",
              textAlign: "center",
              padding: "56px 0",
              border: "1px dashed var(--border)",
              borderRadius: "14px",
            }}
          >
            No tasks assigned yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {tasks.map((task) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
              const pc = PRIORITY_COLORS[task.priority];
              const sc = STATUS_COLORS[task.status];
              return (
                <div
                  key={task._id}
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderLeft: `3px solid ${sc ?? "var(--border)"}`,
                    borderRadius: "10px",
                    padding: "13px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    transition: "border-color 0.15s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = (sc ?? "var(--border)") + "90")}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.borderLeftColor = sc ?? "var(--border)";
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: "5px",
                        letterSpacing: "-0.01em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {task.title}
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                      {pc && (
                        <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: pc, background: pc + "18", padding: "2px 6px", borderRadius: "4px", fontFamily: "var(--font-mono)" }}>
                          {task.priority}
                        </span>
                      )}
                      {task.dueDate && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            color: isOverdue ? "#ea4335" : "var(--text-faint)",
                            fontWeight: isOverdue ? 700 : 400,
                          }}
                        >
                          {isOverdue && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                            </svg>
                          )}
                          {new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: sc ?? "var(--text-faint)",
                        background: (sc ?? "#8b90a7") + "18",
                        padding: "3px 8px",
                        borderRadius: "5px",
                        fontFamily: "var(--font-mono)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {STATUS_LABELS[task.status] ?? task.status}
                    </span>
                    <Link href={`/edit-task/${task._id}`}>
                      <button
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border)",
                          color: "var(--text-muted)",
                          borderRadius: "6px",
                          padding: "5px 9px",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          transition: "all 0.15s",
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(61,220,132,.4)"; e.currentTarget.style.color = "var(--accent-light)"; }}
                        onMouseOut={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
