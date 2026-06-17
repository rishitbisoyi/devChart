"use client";

import Link from "next/link";

type Subtask = { _id: string; text: string; done: boolean };

type TaskCardProps = {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo?: string;
  dueDate?: string;
  tags?: string[];
  subtasks?: Subtask[];
  isDragging?: boolean;
  isAdmin?: boolean;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "forward" | "back") => void;
  onOpen?: (id: string) => void;
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function avatarColor(name: string) {
  const colors = ["#3ddc84", "#4285f4", "#3ddc84", "#ea4335", "#f59e0b", "#fbbc04", "#3b82f6", "#f97316"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  high:   { color: "#ea4335", bg: "rgba(234,67,53,.12)",   label: "High"   },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,.12)",  label: "Medium" },
  low:    { color: "#3ddc84", bg: "rgba(61,220,132,.12)",  label: "Low"    },
};

const STATUS_ORDER = ["todo", "in-progress", "done"];

export default function TaskCard({
  _id,
  title,
  description,
  priority,
  status,
  assignedTo,
  dueDate,
  tags = [],
  subtasks = [],
  isDragging = false,
  isAdmin = false,
  onDelete,
  onMove,
  onOpen,
}: TaskCardProps) {
  const pc = PRIORITY_CONFIG[priority] ?? { color: "#8b90a7", bg: "rgba(139,144,167,.12)", label: priority };
  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== "done";
  const statusIdx = STATUS_ORDER.indexOf(status);
  const canMoveForward = statusIdx < STATUS_ORDER.length - 1;
  const canMoveBack = statusIdx > 0;

  return (
    <div
      className="group"
      style={{
        background: isDragging ? "var(--bg-hover)" : "var(--bg-elevated)",
        border: isDragging ? `1px solid var(--accent)` : "1px solid var(--border)",
        borderRadius: "14px",
        padding: "0",
        boxShadow: isDragging ? "0 16px 40px rgba(0,0,0,.6), 0 0 0 1px rgba(61,220,132,.4), 0 0 30px rgba(61,220,132,.15)" : "var(--shadow-xs)",
        transform: isDragging ? "rotate(1.5deg) scale(1.02)" : "none",
        transition: "all 0.2s ease",
        position: "relative",
        cursor: "grab",
        overflow: "hidden",
      }}
    >
      {/* Priority bar */}
      <div style={{ height: "3px", background: pc.color, opacity: 0.9 }} />

      <div style={{ padding: "14px" }}>
        {/* Drag handle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "10px",
            opacity: 0,
            transition: "opacity 0.15s",
          }}
          className="group-hover:opacity-100"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4">
            <circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/>
            <circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/>
            <circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/>
          </svg>
          <span style={{ fontSize: "10px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>drag to move</span>
        </div>

        {/* Priority badge + title */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
          <h3
            onClick={(e) => { e.stopPropagation(); onOpen?.(_id); }}
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
              flex: 1,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              cursor: onOpen ? "pointer" : "inherit",
              textDecoration: onOpen ? "underline" : "none",
              textDecorationColor: "rgba(61,220,132,.35)",
              textUnderlineOffset: "3px",
            }}
          >
            {title}
          </h3>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: pc.color,
              background: pc.bg,
              padding: "3px 7px",
              borderRadius: "5px",
              fontFamily: "var(--font-mono)",
              flexShrink: 0,
              border: `1px solid ${pc.color}30`,
            }}
          >
            {pc.label}
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            lineHeight: 1.55,
            marginBottom: "12px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {description}
        </p>

        {/* Assignee + due date */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          {assignedTo ? (
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: avatarColor(assignedTo),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  fontWeight: 800,
                  color: "#fff",
                  flexShrink: 0,
                  boxShadow: `0 0 0 2px var(--bg-elevated)`,
                }}
              >
                {getInitials(assignedTo)}
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {assignedTo}
              </span>
            </div>
          ) : (
            <span style={{ fontSize: "11px", color: "var(--text-faint)", fontStyle: "italic" }}>Unassigned</span>
          )}

          {dueDate && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: isOverdue ? "#ea4335" : "var(--text-faint)",
                background: isOverdue ? "rgba(234,67,53,.1)" : "transparent",
                padding: isOverdue ? "2px 7px" : "0",
                borderRadius: "5px",
                fontWeight: isOverdue ? 700 : 400,
              }}
            >
              {isOverdue && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              )}
              {new Date(dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </div>
          )}
        </div>

        {/* Subtask progress */}
        {subtasks.length > 0 && (() => {
          const done = subtasks.filter((s) => s.done).length;
          const pct  = Math.round((done / subtasks.length) * 100);
          const full = done === subtasks.length;
          return (
            <div style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={full ? "#3ddc84" : "var(--text-faint)"} strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                    {done}/{subtasks.length} subtasks
                  </span>
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: full ? "#3ddc84" : "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{pct}%</span>
              </div>
              <div style={{ height: "3px", background: "var(--border)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: full ? "#3ddc84" : "var(--accent)", borderRadius: "999px", transition: "width 0.3s ease" }} />
              </div>
            </div>
          );
        })()}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
            {tags.length > 3 && (
              <span className="tag" style={{ color: "var(--text-faint)" }}>+{tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border)", margin: "2px 0 10px" }} />

        {/* Actions */}
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          {canMoveBack && (
            <button
              onClick={(e) => { e.stopPropagation(); onMove(_id, "back"); }}
              title="Move back"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                borderRadius: "6px",
                padding: "5px 9px",
                fontSize: "11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "3px",
                fontWeight: 600,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back
            </button>
          )}
          {canMoveForward && (
            <button
              onClick={(e) => { e.stopPropagation(); onMove(_id, "forward"); }}
              title="Move forward"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                borderRadius: "6px",
                padding: "5px 9px",
                fontSize: "11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "3px",
                fontWeight: 600,
              }}
            >
              Move
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          )}

          <div style={{ flex: 1 }} />

          <Link href={`/edit-task/${_id}`} onClick={(e) => e.stopPropagation()}>
            <button
              title="Edit task"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                borderRadius: "6px",
                padding: "5px 8px",
                fontSize: "11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </Link>
          {isAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(_id); }}
              title="Delete task"
              style={{
                background: "rgba(234,67,53,.08)",
                border: "1px solid rgba(234,67,53,.2)",
                color: "#ea4335",
                borderRadius: "6px",
                padding: "5px 8px",
                fontSize: "11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
