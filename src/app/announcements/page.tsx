"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

type Announcement = {
  _id: string;
  title: string;
  content: string;
  author: string;
  pinned: boolean;
  emoji: string;
  createdAt: string;
};

const EMOJIS = ["📢","🚀","🎯","⚡","🔔","📌","🛠","🎉","💡","🔥","📅","👥"];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "yesterday";
  return `${d}d ago`;
}

export default function AnnouncementsPage() {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);

  const sessionRole = (session?.user as { role?: string })?.role;
  const isAdmin = sessionRole === "admin" || sessionRole === "super-admin";

  // Form state
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [emoji, setEmoji]     = useState("📢");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then(setAnnouncements)
      .catch(() => toast.error("Failed to load announcements"))
      .finally(() => setLoading(false));
  }, []);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    setPosting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, author: session?.user?.name ?? "Team", emoji }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setAnnouncements((prev) => [created, ...prev]);
      setTitle(""); setContent(""); setEmoji("📢");
      setShowForm(false);
      toast.success("Announcement posted");
    } catch {
      toast.error("Failed to post");
    } finally {
      setPosting(false);
    }
  }

  async function togglePin(id: string, pinned: boolean) {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !pinned }),
      });
      const updated = await res.json();
      setAnnouncements((prev) =>
        [...prev.map((a) => (a._id === id ? updated : a))].sort(
          (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      toast.success(pinned ? "Unpinned" : "Pinned to top");
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
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
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "var(--text-faint)",
    marginBottom: "8px",
    display: "block",
    fontFamily: "var(--font-mono)",
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ maxWidth: "800px" }}>

        {/* Header */}
        <div className="page-header animate-fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-light)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "12px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                Club Bulletin Board
              </div>
              <h1 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, letterSpacing: "-0.04em", margin: 0, color: "var(--text-primary)", lineHeight: 1.05 }}>
                Announcements
              </h1>
              <p style={{ marginTop: "10px", color: "var(--text-muted)", fontSize: "14px" }}>
                Club-wide updates, reminders, and important notices.
              </p>
            </div>

            {isAdmin && <button
              className="btn-primary"
              onClick={() => setShowForm((v) => !v)}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "11px 20px", fontSize: "14px", borderRadius: "10px" }}
            >
              {showForm ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Cancel</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Post Announcement</>
              )}
            </button>}
          </div>
        </div>

        {/* New announcement form */}
        {showForm && (
          <div
            className="animate-scale-in"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid rgba(61,220,132,.2)",
              borderRadius: "18px",
              padding: "28px",
              marginBottom: "24px",
              boxShadow: "0 0 0 1px rgba(61,220,132,.08), var(--shadow-md)",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              New Announcement
            </div>

            <form onSubmit={handlePost} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Emoji picker */}
              <div>
                <label style={labelStyle}>Icon</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "8px",
                        border: `1px solid ${emoji === e ? "var(--accent)" : "var(--border)"}`,
                        background: emoji === e ? "rgba(61,220,132,.12)" : "var(--bg-elevated)",
                        fontSize: "18px",
                        cursor: "pointer",
                        transition: "all 0.1s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Title</label>
                <input
                  style={inputStyle}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Announcement title"
                  required
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                />
              </div>

              <div>
                <label style={labelStyle}>Content</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "100px", resize: "vertical", lineHeight: 1.6 }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the announcement details…"
                  required
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
                />
              </div>

              <div style={{ fontSize: "12px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                Posting as <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{session?.user?.name ?? "Team"}</span>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: "11px", fontSize: "14px", borderRadius: "10px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="btn-primary"
                  style={{ flex: 2, padding: "11px", fontSize: "14px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: posting ? 0.7 : 1 }}
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
                  {posting ? "Posting…" : "Post Announcement"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "16px" }} />)}
          </div>
        ) : announcements.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "80px 0",
              gap: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "20px",
                background: "var(--bg-elevated)",
                border: "1px dashed var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              📢
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>No announcements yet</div>
              <div style={{ fontSize: "13px", color: "var(--text-faint)" }}>Post the first club announcement above.</div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: "14px", animationDelay: "0.05s" }}>
            {announcements.map((ann) => (
              <div
                key={ann._id}
                style={{
                  background: "var(--bg-surface)",
                  border: ann.pinned ? "1px solid rgba(61,220,132,.25)" : "1px solid var(--border)",
                  borderLeft: ann.pinned ? "3px solid var(--accent)" : "3px solid transparent",
                  borderRadius: "16px",
                  padding: "22px 24px",
                  position: "relative",
                  transition: "border-color 0.2s",
                }}
              >
                {ann.pinned && (
                  <div
                    style={{
                      position: "absolute",
                      top: "14px",
                      right: "14px",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--accent-light)",
                      background: "rgba(61,220,132,.12)",
                      border: "1px solid rgba(61,220,132,.22)",
                      padding: "3px 9px",
                      borderRadius: "999px",
                      fontFamily: "var(--font-mono)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 00-.81-1.61l-3.38-2.55A2 2 0 0014 9.38V4"/>
                      <path d="M10 4h4"/><line x1="5" y1="4" x2="19" y2="4"/>
                    </svg>
                    Pinned
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  {/* Emoji */}
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      flexShrink: 0,
                    }}
                  >
                    {ann.emoji}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: "17px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        letterSpacing: "-0.02em",
                        marginBottom: "6px",
                        paddingRight: ann.pinned ? "90px" : "0",
                      }}
                    >
                      {ann.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--text-muted)",
                        lineHeight: 1.65,
                        marginBottom: "14px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {ann.content}
                    </p>

                    {/* Footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-faint)",
                            fontFamily: "var(--font-mono)",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="8" r="4"/><path d="M4 20v-2a4 4 0 014-4h8a4 4 0 014 4v2"/>
                          </svg>
                          {ann.author}
                        </div>
                        <span style={{ color: "var(--border)", fontSize: "12px" }}>·</span>
                        <span style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                          {timeAgo(ann.createdAt)}
                        </span>
                      </div>

                      {/* Actions (admin only) */}
                      {isAdmin && <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => togglePin(ann._id, ann.pinned)}
                          title={ann.pinned ? "Unpin" : "Pin to top"}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            background: ann.pinned ? "rgba(61,220,132,.1)" : "var(--bg-elevated)",
                            border: `1px solid ${ann.pinned ? "rgba(61,220,132,.3)" : "var(--border)"}`,
                            color: ann.pinned ? "var(--accent-light)" : "var(--text-muted)",
                            borderRadius: "7px",
                            padding: "5px 10px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 00-.81-1.61l-3.38-2.55A2 2 0 0014 9.38V4"/>
                            <path d="M10 4h4"/>
                          </svg>
                          {ann.pinned ? "Unpin" : "Pin"}
                        </button>
                        <button
                          onClick={() => handleDelete(ann._id)}
                          title="Delete announcement"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            background: "rgba(234,67,53,.07)",
                            border: "1px solid rgba(234,67,53,.2)",
                            color: "#ea4335",
                            borderRadius: "7px",
                            padding: "5px 9px",
                            fontSize: "11px",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          </svg>
                        </button>
                      </div>}
                    </div>
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
