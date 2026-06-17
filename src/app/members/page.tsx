"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Member = { _id: string; name: string; email: string; role: string };
type Task = { _id: string; assignedTo: string; status: string };

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function avatarColor(name: string) {
  const colors = ["#3ddc84","#4285f4","#3ddc84","#ea4335","#f59e0b","#fbbc04","#3b82f6","#f97316"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const ROLE_CONFIG: Record<string, { color: string; label: string }> = {
  admin:  { color: "#ea4335", label: "Admin"  },
  lead:   { color: "#f59e0b", label: "Lead"   },
  member: { color: "#3ddc84", label: "Member" },
};

export default function MembersPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const sessionRole = (session?.user as { role?: string })?.role;
  const isAdmin = sessionRole === "admin" || sessionRole === "super-admin";

  useEffect(() => {
    Promise.all([
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/tasks").then((r) => r.json()),
    ])
      .then(([m, t]) => { setMembers(m); setTasks(t); })
      .finally(() => setLoading(false));
  }, []);

  function getMemberStats(memberName: string) {
    const memberTasks = tasks.filter((t) => t.assignedTo === memberName);
    const done = memberTasks.filter((t) => t.status === "done").length;
    const inProgress = memberTasks.filter((t) => t.status === "in-progress").length;
    const total = memberTasks.length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, inProgress, pct };
  }

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
                  <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
                Team Directory
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
                Members
              </h1>
              <p style={{ marginTop: "10px", color: "var(--text-muted)", fontSize: "14px" }}>
                {loading ? "Loading team…" : `${members.length} contributor${members.length !== 1 ? "s" : ""} · View assignments and performance.`}
              </p>
            </div>

            {isAdmin && <Link href="/create-member">
              <button
                className="btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "11px 20px",
                  fontSize: "14px",
                  borderRadius: "10px",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Member
              </button>
            </Link>}
          </div>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px" }}>
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="skeleton" style={{ height: "160px", borderRadius: "18px" }} />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 0",
              gap: "16px",
              color: "var(--text-faint)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "18px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>No members yet</div>
              <div style={{ fontSize: "13px" }}>Add your first team member to get started.</div>
            </div>
            <Link href="/create-member">
              <button className="btn-primary" style={{ padding: "10px 20px", fontSize: "14px", borderRadius: "10px" }}>
                Add First Member
              </button>
            </Link>
          </div>
        ) : (
          <div
            className="animate-fade-up"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "18px",
              animationDelay: "0.05s",
            }}
          >
            {members.map((member) => {
              const { total, done, inProgress, pct } = getMemberStats(member.name);
              const color = avatarColor(member.name);
              const roleCfg = ROLE_CONFIG[member.role] ?? { color: "var(--accent)", label: member.role };

              return (
                <Link key={member._id} href={`/members/${member._id}`}>
                  <div
                    className="card-hover"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "18px",
                      padding: "22px",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.borderColor = color + "60")}
                    onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    {/* Subtle color glow in top-right */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-30px",
                        right: "-30px",
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        background: color + "0f",
                        pointerEvents: "none",
                      }}
                    />

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                      <div
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "14px",
                          background: `linear-gradient(135deg, ${color}, ${color}aa)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          fontWeight: 800,
                          color: "#fff",
                          flexShrink: 0,
                          boxShadow: `0 4px 16px ${color}40`,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {getInitials(member.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            letterSpacing: "-0.01em",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {member.name}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-faint)",
                            fontFamily: "var(--font-mono)",
                            marginTop: "2px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {member.email}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: roleCfg.color,
                          background: roleCfg.color + "18",
                          padding: "3px 9px",
                          borderRadius: "6px",
                          flexShrink: 0,
                          fontFamily: "var(--font-mono)",
                          border: `1px solid ${roleCfg.color}30`,
                        }}
                      >
                        {roleCfg.label}
                      </span>
                    </div>

                    {/* Mini task counts */}
                    {total > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginBottom: "12px",
                        }}
                      >
                        {[
                          { label: "Total", value: total, c: "var(--text-faint)" },
                          { label: "Active", value: inProgress, c: "#f59e0b" },
                          { label: "Done", value: done, c: "#3ddc84" },
                        ].map((s) => (
                          <div
                            key={s.label}
                            style={{
                              flex: 1,
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              padding: "6px 8px",
                              textAlign: "center",
                            }}
                          >
                            <div style={{ fontSize: "16px", fontWeight: 700, color: s.c, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: "9px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px", fontFamily: "var(--font-mono)" }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Completion bar */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                        <span>{total} task{total !== 1 ? "s" : ""}</span>
                        <span style={{ color: pct === 100 ? "#3ddc84" : "var(--text-muted)", fontWeight: pct === 100 ? 700 : 400 }}>
                          {pct}% done
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
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
