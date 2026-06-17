"use client";

import Navbar from "@/components/Navbar";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

type Member = { _id: string; name: string; role: string };
type Sprint = { _id: string; name: string; color: string; status: string };

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

const PRIORITY_COLORS: Record<string, string> = { low: "#3ddc84", medium: "#f59e0b", high: "#ea4335" };
const STATUS_COLORS:   Record<string, string> = { todo: "#6366f1", "in-progress": "#f59e0b", done: "#3ddc84" };

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("todo");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [loadingTask, setLoadingTask] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/tasks/${params.id}`).then((r) => r.json()),
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/sprints").then((r) => r.json()),
    ])
      .then(([task, mems, sps]) => {
        setTitle(task.title ?? "");
        setDescription(task.description ?? "");
        setPriority(task.priority ?? "medium");
        setStatus(task.status ?? "todo");
        setAssignedTo(task.assignedTo ?? "");
        setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
        setTags(task.tags?.join(", ") ?? "");
        setSprintId(task.sprint ?? "");
        setMembers(mems);
        setSprints(sps);
      })
      .catch(() => toast.error("Failed to load task"))
      .finally(() => setLoadingTask(false));
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${params.id}`, {
        method: "PATCH",
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
      toast.success("Task updated");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to update task");
    } finally {
      setSubmitting(false);
    }
  }

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

  if (loadingTask) {
    return (
      <>
        <Navbar />
        <div className="page-wrapper" style={{ maxWidth: "720px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="skeleton" style={{ height: "32px", width: "200px", borderRadius: "8px" }} />
            <div className="skeleton" style={{ height: "400px", borderRadius: "18px" }} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ maxWidth: "720px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
          <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "var(--text-faint)", fontWeight: 500 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Dashboard
          </Link>
          <span style={{ color: "var(--border-hover)" }}>/</span>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Edit Task</span>
        </div>

        <h1
          style={{
            fontSize: "28px",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--text-primary)",
            marginBottom: "28px",
          }}
        >
          Edit Task
        </h1>

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
              required
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61,220,132,.1)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical", lineHeight: "1.6" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61,220,132,.1)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.boxShadow = "none"; }}
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
              onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
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
                onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
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
                onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {sprints.length > 0 && (
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
                {sprints.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-ghost"
              style={{ flex: 1, padding: "12px", fontSize: "14px", borderRadius: "10px" }}
            >
              Cancel
            </button>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14z"/>
                <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
