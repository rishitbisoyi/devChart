"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

type ActivityItem = {
  _id: string;
  action: string;
  taskTitle: string;
  type: "created" | "moved" | "deleted" | "updated";
  createdAt: string;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function groupByDay(items: ActivityItem[]): Record<string, ActivityItem[]> {
  const groups: Record<string, ActivityItem[]> = {};
  const now = new Date();
  items.forEach((item) => {
    const d = new Date(item.createdAt);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const itemDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let label: string;
    if (itemDay.getTime() === today.getTime()) label = "Today";
    else if (itemDay.getTime() === yesterday.getTime()) label = "Yesterday";
    else label = d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });
  return groups;
}

const TYPE_CONFIG: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  created: {
    color: "#3ddc84",
    label: "Created",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
  },
  moved: {
    color: "#3b82f6",
    label: "Moved",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
      </svg>
    ),
  },
  deleted: {
    color: "#ea4335",
    label: "Deleted",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
  },
  updated: {
    color: "#f59e0b",
    label: "Updated",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then(setActivities)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = groupByDay(activities);

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ maxWidth: "760px" }}>

        {/* Page header */}
        <div className="page-header animate-fade-up" style={{ marginBottom: "32px" }}>
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
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Event Log
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
            Activity
          </h1>
          <p style={{ marginTop: "10px", color: "var(--text-muted)", fontSize: "14px" }}>
            {activities.length} event{activities.length !== 1 ? "s" : ""} recorded across the project.
          </p>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="skeleton" style={{ height: "60px", borderRadius: "10px" }} />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 0",
              gap: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "18px",
                background: "var(--bg-elevated)",
                border: "1px dashed var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-faint)",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>No activity yet</div>
              <div style={{ fontSize: "13px", color: "var(--text-faint)" }}>Create or move a task to see events here.</div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
            {Object.entries(grouped).map(([day, items]) => (
              <div key={day} style={{ marginBottom: "36px" }}>
                {/* Day label */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-mono)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {day}
                  </div>
                  <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-mono)",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {items.length} event{items.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "16px",
                      bottom: "16px",
                      width: "1px",
                      background: "linear-gradient(to bottom, var(--border), transparent)",
                    }}
                  />

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {items.map((item, idx) => {
                      const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.updated;
                      return (
                        <div
                          key={item._id}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "14px",
                            padding: "2px 0",
                          }}
                        >
                          {/* Icon */}
                          <div
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              background: cfg.color + "14",
                              border: `1px solid ${cfg.color}35`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: cfg.color,
                              flexShrink: 0,
                              position: "relative",
                              zIndex: 1,
                              marginTop: "1px",
                            }}
                          >
                            {cfg.icon}
                          </div>

                          {/* Content */}
                          <div
                            style={{
                              flex: 1,
                              background: "var(--bg-surface)",
                              border: "1px solid var(--border)",
                              borderRadius: "10px",
                              padding: "10px 14px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "12px",
                              transition: "border-color 0.15s",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.borderColor = cfg.color + "40")}
                            onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "2px" }}>
                                <span
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    color: cfg.color,
                                    fontFamily: "var(--font-mono)",
                                    background: cfg.color + "12",
                                    padding: "1px 6px",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {cfg.label}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: "13px",
                                  color: "var(--text-primary)",
                                  lineHeight: 1.4,
                                }}
                              >
                                {item.action}
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: "11px",
                                color: "var(--text-faint)",
                                fontFamily: "var(--font-mono)",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                              }}
                            >
                              {timeAgo(item.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
