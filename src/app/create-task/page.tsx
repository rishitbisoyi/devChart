"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

type Member = { _id: string; name: string; role: string };
type Sprint = { _id: string; name: string; status: string };

function SegmentedControl({
  options,
  value,
  onChange,
  colors,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  colors?: Record<string, string>;
}) {
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {options.map((opt) => {
        const active = value === opt.value;
        const color = colors?.[opt.value] ?? "var(--accent)";
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid",
              background: active ? color + "18" : "var(--bg-elevated)",
              borderColor: active ? color + "55" : "var(--border)",
              color: active ? color : "var(--text-muted)",
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "#3ddc84", medium: "#f59e0b", high: "#ea4335",
};
const STATUS_COLORS: Record<string, string> = {
  todo: "#6366f1", "in-progress": "#f59e0b", done: "#3ddc84",
};

function CreateTaskInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [members, setMembers] = useState<Member[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState(searchParams.get("status") ?? "todo");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/sprints").then((r) => r.json()),
    ]).then(([m, s]) => { setMembers(m); setSprints(s); }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          status,
          assignedTo,
          dueDate: dueDate || null,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          sprint: sprintId || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Task created");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  }

  const previewPriorityColor = PRIORITY_COLORS[priority] ?? "var(--accent)";
  const previewStatusColor = STATUS_COLORS[status] ?? "var(--accent)";
  const previewMember = members.find((m) => m.name === assignedTo);
  const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
    fontFamily: "var(--font-inter)",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--text-faint)",
    marginBottom: "8px",
    display: "block",
    fontFamily: "var(--font-mono)",
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ maxWidth: "1100px" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "13px",
                color: "var(--text-faint)",
                fontWeight: 500,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Dashboard
            </Link>
            <span style={{ color: "var(--border-hover)" }}>/</span>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>New Task</span>
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Create Task
          </h1>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) 320px",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "18px",
              padding: "28px",
            }}
          >
            <div>
              <label style={labelStyle}>Title</label>
              <input
                style={inputStyle}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                required
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61,220,132,.1)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: "100px", resize: "vertical", lineHeight: "1.6" }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more context…"
                required
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61,220,132,.1)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={labelStyle}>Priority</label>
              <SegmentedControl
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
                value={priority}
                onChange={setPriority}
                colors={PRIORITY_COLORS}
              />
            </div>

            <div>
              <label style={labelStyle}>Status</label>
              <SegmentedControl
                options={[
                  { value: "todo", label: "To Do" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "done", label: "Done" },
                ]}
                value={status}
                onChange={setStatus}
                colors={STATUS_COLORS}
              />
            </div>

            <div>
              <label style={labelStyle}>Assign To</label>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m._id} value={m.name}>
                    {m.name} · {m.role}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Due Date</label>
                <input
                  type="date"
                  style={{ ...inputStyle, colorScheme: "dark" }}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Tags</label>
                <input
                  style={inputStyle}
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="frontend, bug, api"
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61,220,132,.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {sprints.filter((s) => s.status !== "completed").length > 0 && (
              <div>
                <label style={labelStyle}>Sprint</label>
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value={sprintId}
                  onChange={(e) => setSprintId(e.target.value)}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  <option value="">No sprint</option>
                  {sprints.filter((s) => s.status !== "completed").map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <Link href="/dashboard" style={{ flex: 1 }}>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ width: "100%", padding: "12px", fontSize: "14px", borderRadius: "10px" }}
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{
                  flex: 2,
                  padding: "12px",
                  fontSize: "14px",
                  borderRadius: "10px",
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {submitting ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    Creating…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Create Task
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Live Preview */}
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-faint)",
                fontFamily: "var(--font-mono)",
                marginBottom: "12px",
              }}
            >
              Live Preview
            </div>
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                overflow: "hidden",
                position: "sticky",
                top: "76px",
              }}
            >
              {/* Priority bar */}
              <div style={{ height: "3px", background: previewPriorityColor }} />

              <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "10px" }}>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: title ? "var(--text-primary)" : "var(--text-faint)",
                      flex: 1,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                    }}
                  >
                    {title || "Task title"}
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: previewPriorityColor,
                      background: previewPriorityColor + "18",
                      padding: "3px 7px",
                      borderRadius: "5px",
                      fontFamily: "var(--font-mono)",
                      flexShrink: 0,
                    }}
                  >
                    {priority}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: "12px",
                    color: description ? "var(--text-muted)" : "var(--text-faint)",
                    lineHeight: 1.6,
                    marginBottom: "12px",
                  }}
                >
                  {description || "Description will appear here"}
                </p>

                {assignedTo && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "8px",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20v-2a4 4 0 014-4h8a4 4 0 014 4v2"/>
                    </svg>
                    <span style={{ fontFamily: "var(--font-mono)" }}>
                      {assignedTo}{previewMember ? ` · ${previewMember.role}` : ""}
                    </span>
                  </div>
                )}

                {dueDate && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "8px",
                      fontSize: "11px",
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Due {new Date(dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                )}

                {parsedTags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                    {parsedTags.map((tag) => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px", display: "flex", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: previewStatusColor,
                      background: previewStatusColor + "18",
                      padding: "3px 8px",
                      borderRadius: "5px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {status === "in-progress" ? "In Progress" : status === "todo" ? "To Do" : "Done"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

export default function CreateTask() {
  return (
    <Suspense>
      <CreateTaskInner />
    </Suspense>
  );
}
