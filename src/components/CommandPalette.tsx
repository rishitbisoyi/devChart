"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

type Task   = { _id: string; title: string; status: string; priority: string };
type Member = { _id: string; name: string; email: string; role: string };

type Result = {
  id: string;
  label: string;
  sub?: string;
  href: string;
  group: string;
  icon: React.ReactNode;
  badge?: { label: string; color: string };
};

const PRIORITY_COLORS: Record<string, string> = { high: "#ea4335", medium: "#f59e0b", low: "#3ddc84" };
const STATUS_LABELS:   Record<string, string> = { todo: "To Do", "in-progress": "In Progress", done: "Done" };
const STATUS_COLORS:   Record<string, string> = { todo: "#6366f1", "in-progress": "#f59e0b", done: "#3ddc84" };

const NAV_ITEMS: Result[] = [
  {
    id: "nav-dashboard",
    label: "Dashboard",
    sub: "Kanban board",
    href: "/dashboard",
    group: "Navigate",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: "nav-members",
    label: "Members",
    sub: "Team directory",
    href: "/members",
    group: "Navigate",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    id: "nav-activity",
    label: "Activity",
    sub: "Event timeline",
    href: "/activity",
    group: "Navigate",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    id: "nav-analytics",
    label: "Analytics",
    sub: "Project insights",
    href: "/analytics",
    group: "Navigate",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: "nav-announcements",
    label: "Announcements",
    sub: "Club bulletin board",
    href: "/announcements",
    group: "Navigate",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
      </svg>
    ),
  },
  {
    id: "nav-sprints",
    label: "Sprints",
    sub: "Milestones & sprint tracking",
    href: "/sprints",
    group: "Navigate",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    id: "nav-new-task",
    label: "Create New Task",
    sub: "Add to the board",
    href: "/create-task",
    group: "Actions",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
  },
  {
    id: "nav-new-member",
    label: "Add Team Member",
    sub: "Onboard a new member",
    href: "/create-member",
    group: "Actions",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/>
      </svg>
    ),
  },
];

function avatarColor(name: string) {
  const colors = ["#3ddc84","#f59e0b","#3ddc84","#ea4335","#3b82f6","#fbbc04","#3ddc84"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const RECENT_KEY = "cmd_recent_searches";
const MAX_RECENT = 5;

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}
function saveRecent(q: string) {
  try {
    const prev = loadRecent().filter((s) => s !== q);
    localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)));
  } catch {}
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState("");
  const [cursor, setCursor] = useState(0);
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load data once
  useEffect(() => {
    fetch("/api/tasks").then((r) => r.json()).then(setTasks).catch(() => {});
    fetch("/api/members").then((r) => r.json()).then(setMembers).catch(() => {});
  }, []);

  // Keyboard trigger
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => {
          if (!v) setRecent(loadRecent());
          return !v;
        });
        setQuery("");
        setCursor(0);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const q = query.toLowerCase();

  const taskResults: Result[] = tasks
    .filter((t) => t.title.toLowerCase().includes(q))
    .slice(0, 5)
    .map((t) => ({
      id: t._id,
      label: t.title,
      sub: STATUS_LABELS[t.status] ?? t.status,
      href: `/edit-task/${t._id}`,
      group: "Tasks",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      badge: {
        label: STATUS_LABELS[t.status] ?? t.status,
        color: STATUS_COLORS[t.status] ?? "#8b90a7",
      },
    }));

  const memberResults: Result[] = members
    .filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
    .slice(0, 4)
    .map((m) => ({
      id: m._id,
      label: m.name,
      sub: m.email,
      href: `/members/${m._id}`,
      group: "Members",
      icon: (
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "6px",
            background: avatarColor(m.name),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "8px",
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {getInitials(m.name)}
        </div>
      ),
      badge: { label: m.role, color: "#3ddc84" },
    }));

  const navFiltered = NAV_ITEMS.filter(
    (n) =>
      !q ||
      n.label.toLowerCase().includes(q) ||
      (n.sub ?? "").toLowerCase().includes(q)
  );

  // Group results
  const grouped: { group: string; items: Result[] }[] = [];
  const addGroup = (items: Result[]) => {
    if (items.length === 0) return;
    const g = items[0].group;
    grouped.push({ group: g, items });
  };

  if (!q) {
    addGroup(navFiltered);
  } else {
    if (navFiltered.length) addGroup(navFiltered);
    if (taskResults.length) addGroup(taskResults);
    if (memberResults.length) addGroup(memberResults);
  }

  const flat = grouped.flatMap((g) => g.items);

  function navigate(item: Result) {
    if (query.trim()) saveRecent(query.trim());
    router.push(item.href);
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, flat.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && flat[cursor]) navigate(flat[cursor]);
  }

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "80px",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          margin: "0 16px",
          background: "var(--bg-surface)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(61,220,132,.15)",
          animation: "palette-in 0.18s ease both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search tasks, members, pages…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "16px",
              fontFamily: "var(--font-inter)",
              caretColor: "var(--accent)",
            }}
          />
          <kbd
            style={{
              fontSize: "11px",
              padding: "3px 7px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "5px",
              color: "var(--text-faint)",
              fontFamily: "var(--font-mono)",
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: "420px", overflowY: "auto", padding: "8px 0" }}>
          {/* Recent searches — shown when query is empty and there are saved searches */}
          {!q && recent.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)", fontFamily: "var(--font-mono)", padding: "8px 20px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Recent</span>
                <button
                  onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}
                  style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: "10px", fontFamily: "var(--font-mono)", padding: 0 }}
                >
                  Clear
                </button>
              </div>
              {recent.map((s, i) => (
                <div
                  key={s + i}
                  onClick={() => { setQuery(s); setCursor(0); }}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 20px", cursor: "pointer", transition: "background 0.1s" }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "rgba(61,220,132,.06)"; }}
                  onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)", flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)", letterSpacing: "-0.01em" }}>{s}</span>
                </div>
              ))}
              <div style={{ height: "1px", background: "var(--border)", margin: "6px 0" }} />
            </div>
          )}

          {flat.length === 0 && q ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-faint)", fontSize: "14px" }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            grouped.map(({ group, items }) => {
              const groupStart = flat.indexOf(items[0]);
              return (
                <div key={group}>
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-mono)",
                      padding: "8px 20px 4px",
                    }}
                  >
                    {group}
                  </div>
                  {items.map((item, i) => {
                    const globalIdx = groupStart + i;
                    const active = cursor === globalIdx;
                    return (
                      <div
                        key={item.id}
                        onClick={() => navigate(item)}
                        onMouseEnter={() => setCursor(globalIdx)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 20px",
                          cursor: "pointer",
                          background: active ? "rgba(61,220,132,.1)" : "transparent",
                          borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                          transition: "all 0.1s",
                        }}
                      >
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "8px",
                            background: active ? "rgba(61,220,132,.15)" : "var(--bg-elevated)",
                            border: `1px solid ${active ? "rgba(61,220,132,.3)" : "var(--border)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: active ? "var(--accent-light)" : "var(--text-muted)",
                            flexShrink: 0,
                            transition: "all 0.1s",
                          }}
                        >
                          {item.icon}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: active ? "var(--text-primary)" : "var(--text-secondary)", letterSpacing: "-0.01em" }}>
                            {item.label}
                          </div>
                          {item.sub && (
                            <div style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.sub}
                            </div>
                          )}
                        </div>

                        {item.badge && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              color: item.badge.color,
                              background: item.badge.color + "18",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontFamily: "var(--font-mono)",
                              flexShrink: 0,
                              border: `1px solid ${item.badge.color}28`,
                            }}
                          >
                            {item.badge.label}
                          </span>
                        )}

                        {active && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "8px 20px",
            display: "flex",
            gap: "16px",
            alignItems: "center",
          }}
        >
          {[
            { keys: ["↑","↓"], label: "Navigate" },
            { keys: ["↵"], label: "Open" },
            { keys: ["Esc"], label: "Close" },
          ].map(({ keys, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--text-faint)" }}>
              {keys.map((k) => (
                <kbd key={k} style={{ fontSize: "10px", padding: "2px 5px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "4px", fontFamily: "var(--font-mono)" }}>{k}</kbd>
              ))}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
