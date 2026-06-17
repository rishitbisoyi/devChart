"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Comment = { _id: string; author: string; text: string; createdAt: string };
type Subtask = { _id: string; text: string; done: boolean };

type Task = {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo?: string;
  dueDate?: string;
  tags?: string[];
  subtasks?: Subtask[];
  comments?: Comment[];
  createdAt?: string;
};

type Props = {
  taskId: string | null;
  onClose: () => void;
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  high:   { color: "#ea4335", bg: "rgba(234,67,53,.12)"  },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
  low:    { color: "#3ddc84", bg: "rgba(61,220,132,.12)"  },
};
const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  todo:        { color: "#6366f1", label: "To Do"       },
  "in-progress": { color: "#f59e0b", label: "In Progress" },
  done:        { color: "#3ddc84", label: "Done"        },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function avatarColor(name: string) {
  const colors = ["#3ddc84","#3b82f6","#3ddc84","#ea4335","#f59e0b","#fbbc04","#3ddc84"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function TaskDrawer({ taskId, onClose }: Props) {
  const [task, setTask]         = useState<Task | null>(null);
  const [loading, setLoading]   = useState(false);
  const [author, setAuthor]       = useState("");
  const [commentText, setComment] = useState("");
  const [posting, setPosting]     = useState(false);
  const [visible, setVisible]     = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!taskId) { setVisible(false); return; }
    setVisible(true);
    setLoading(true);
    fetch(`/api/tasks/${taskId}`)
      .then((r) => r.json())
      .then(setTask)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [taskId]);

  useEffect(() => {
    if (task?.comments?.length) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [task?.comments?.length]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !taskId) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentText.trim(), author: author.trim() || "Anonymous" }),
      });
      const updated = await res.json();
      setTask(updated);
      setComment("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } finally {
      setPosting(false);
    }
  }

  async function toggleSubtask(subtaskId: string) {
    if (!taskId) return;
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtaskId }),
    });
    const updated = await res.json();
    setTask(updated);
  }

  async function addSubtask(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubtask.trim() || !taskId) return;
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addSubtask: newSubtask.trim() }),
    });
    const updated = await res.json();
    setTask(updated);
    setNewSubtask("");
  }

  async function deleteSubtask(subtaskId: string) {
    if (!taskId) return;
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleteSubtask: subtaskId }),
    });
    const updated = await res.json();
    setTask(updated);
  }

  if (!taskId) return null;

  const pc = PRIORITY_CONFIG[task?.priority ?? ""] ?? { color: "#8b90a7", bg: "rgba(139,144,167,.1)" };
  const sc = STATUS_CONFIG[task?.status ?? ""] ?? { color: "#8b90a7", label: task?.status ?? "" };
  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          animation: "fade-in 0.2s ease",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "520px",
          zIndex: 101,
          background: "var(--bg-surface)",
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          animation: "drawer-slide-in 0.25s cubic-bezier(0.32,0.72,0,1)",
          boxShadow: "-24px 0 80px rgba(0,0,0,.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Task Detail</span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {task && (
              <Link href={`/edit-task/${task._id}`}>
                <button
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    borderRadius: "7px",
                    padding: "6px 11px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
              </Link>
            )}
            <button
              onClick={onClose}
              style={{
                width: "30px",
                height: "30px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "7px",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="skeleton" style={{ height: "28px", width: "70%", borderRadius: "8px" }} />
              <div className="skeleton" style={{ height: "80px", borderRadius: "10px" }} />
              <div className="skeleton" style={{ height: "40px", borderRadius: "8px" }} />
            </div>
          ) : task ? (
            <>
              {/* Priority bar */}
              <div style={{ height: "3px", background: pc.color, borderRadius: "2px", marginBottom: "20px" }} />

              {/* Title */}
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.3,
                  marginBottom: "12px",
                }}
              >
                {task.title}
              </h2>

              {/* Status + Priority badges */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: sc.color, background: sc.color + "18", padding: "4px 10px", borderRadius: "6px", fontFamily: "var(--font-mono)", border: `1px solid ${sc.color}28` }}>
                  {sc.label}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: pc.color, background: pc.bg, padding: "4px 10px", borderRadius: "6px", fontFamily: "var(--font-mono)", border: `1px solid ${pc.color}28` }}>
                  {task.priority} priority
                </span>
              </div>

              {/* Description */}
              <div
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  marginBottom: "20px",
                }}
              >
                {task.description}
              </div>

              {/* Metadata grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                {task.assignedTo && (
                  <MetaBlock
                    label="Assigned To"
                    value={
                      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: avatarColor(task.assignedTo), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: 800, color: "#fff" }}>
                          {getInitials(task.assignedTo)}
                        </div>
                        <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>{task.assignedTo}</span>
                      </div>
                    }
                  />
                )}
                {task.dueDate && (
                  <MetaBlock
                    label="Due Date"
                    value={
                      <span style={{ fontSize: "13px", color: isOverdue ? "#ea4335" : "var(--text-primary)", fontWeight: 600, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: "4px" }}>
                        {isOverdue && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                          </svg>
                        )}
                        {new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    }
                  />
                )}
                {task.createdAt && (
                  <MetaBlock
                    label="Created"
                    value={<span style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{timeAgo(task.createdAt)}</span>}
                  />
                )}
                <MetaBlock
                  label="Comments"
                  value={<span style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{task.comments?.length ?? 0}</span>}
                />
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginBottom: "8px" }}>Tags</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {task.tags.map((t) => (
                      <span key={t} className="tag">#{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtasks checklist */}
              {(() => {
                const subs = task.subtasks ?? [];
                const doneCnt = subs.filter((s) => s.done).length;
                const pct = subs.length ? Math.round((doneCnt / subs.length) * 100) : 0;
                return (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                        </svg>
                        Checklist
                      </div>
                      {subs.length > 0 && (
                        <span style={{ fontSize: "11px", color: pct === 100 ? "#3ddc84" : "var(--text-faint)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                          {doneCnt}/{subs.length}
                        </span>
                      )}
                    </div>
                    {subs.length > 0 && (
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ height: "4px", background: "var(--border)", borderRadius: "999px", overflow: "hidden", marginBottom: "10px" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#3ddc84" : "var(--accent)", borderRadius: "999px", transition: "width 0.3s ease" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {subs.map((sub) => (
                            <div
                              key={sub._id}
                              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                            >
                              <button
                                onClick={() => toggleSubtask(sub._id)}
                                style={{
                                  width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0, cursor: "pointer",
                                  background: sub.done ? "var(--accent)" : "transparent",
                                  border: `2px solid ${sub.done ? "var(--accent)" : "var(--border-hover)"}`,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  transition: "all 0.15s",
                                }}
                              >
                                {sub.done && (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                )}
                              </button>
                              <span style={{ flex: 1, fontSize: "13px", color: sub.done ? "var(--text-faint)" : "var(--text-secondary)", textDecoration: sub.done ? "line-through" : "none", transition: "all 0.15s" }}>
                                {sub.text}
                              </span>
                              <button
                                onClick={() => deleteSubtask(sub._id)}
                                style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center", opacity: 0.5 }}
                                onMouseOver={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "#ea4335"; }}
                                onMouseOut={(e)  => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.color = "var(--text-faint)"; }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <form onSubmit={addSubtask} style={{ display: "flex", gap: "6px" }}>
                      <input
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        placeholder="Add a checklist item…"
                        style={{ flex: 1, padding: "8px 10px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "7px", color: "var(--text-primary)", fontSize: "13px", outline: "none", fontFamily: "var(--font-inter)" }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                        onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                      />
                      <button
                        type="submit"
                        disabled={!newSubtask.trim()}
                        style={{ padding: "8px 12px", borderRadius: "7px", background: "var(--accent)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 600, opacity: newSubtask.trim() ? 1 : 0.4 }}
                      >
                        Add
                      </button>
                    </form>
                  </div>
                );
              })()}

              {/* Divider */}
              <div style={{ borderTop: "1px solid var(--border)", marginBottom: "20px" }} />

              {/* Comments */}
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "7px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                Comments
                {(task.comments?.length ?? 0) > 0 && (
                  <span style={{ fontSize: "11px", color: "var(--accent-light)", background: "rgba(61,220,132,.12)", padding: "1px 7px", borderRadius: "999px", fontWeight: 600 }}>
                    {task.comments!.length}
                  </span>
                )}
              </div>

              {!task.comments || task.comments.length === 0 ? (
                <div
                  style={{
                    border: "1px dashed var(--border)",
                    borderRadius: "10px",
                    padding: "24px",
                    textAlign: "center",
                    color: "var(--text-faint)",
                    fontSize: "13px",
                    marginBottom: "16px",
                  }}
                >
                  No comments yet. Be the first!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  {task.comments.map((c) => {
                    const color = avatarColor(c.author);
                    return (
                      <div
                        key={c._id}
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            background: `linear-gradient(135deg, ${color}, ${color}aa)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "9px",
                            fontWeight: 800,
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(c.author)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{c.author}</span>
                            <span style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{timeAgo(c.createdAt)}</span>
                          </div>
                          <div
                            style={{
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              padding: "10px 12px",
                              fontSize: "13px",
                              color: "var(--text-secondary)",
                              lineHeight: 1.55,
                            }}
                          >
                            {c.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Comment form */}
        <form
          onSubmit={postComment}
          style={{
            borderTop: "1px solid var(--border)",
            padding: "16px 24px",
            background: "var(--bg-elevated)",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginBottom: "10px" }}>
            Add Comment
          </div>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name (optional)"
            style={{
              width: "100%",
              padding: "9px 12px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              fontSize: "13px",
              outline: "none",
              marginBottom: "8px",
              fontFamily: "var(--font-inter)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)";  }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <textarea
              value={commentText}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment…"
              rows={2}
              style={{
                flex: 1,
                padding: "9px 12px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
                fontFamily: "var(--font-inter)",
                resize: "none",
                lineHeight: 1.5,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)";  }}
            />
            <button
              type="submit"
              disabled={posting || !commentText.trim()}
              className="btn-primary"
              style={{
                padding: "0 16px",
                borderRadius: "8px",
                fontSize: "13px",
                flexShrink: 0,
                opacity: posting || !commentText.trim() ? 0.5 : 1,
                cursor: posting || !commentText.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {posting ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function MetaBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginBottom: "5px" }}>
        {label}
      </div>
      {value}
    </div>
  );
}
