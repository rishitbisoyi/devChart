"use client";

import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SUPER_ADMIN_EMAIL } from "@/lib/constants";

type User = { _id: string; name: string; email: string; role: string; createdAt: string };

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "super-admin": { label: "Super Admin", color: "#3ddc84", bg: "rgba(61,220,132,.12)" },
  admin:         { label: "Admin",       color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
  member:        { label: "Member",      color: "#3ddc84", bg: "rgba(61,220,132,.12)"  },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
function avatarColor(name: string) {
  const colors = ["#3ddc84","#3b82f6","#3ddc84","#ea4335","#f59e0b","#fbbc04","#3ddc84"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers]           = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);
  const [transferTarget, setTransferTarget] = useState("");
  const [showTransfer, setShowTransfer]     = useState(false);

  const sessionRole  = (session?.user as { role?: string })?.role;
  const sessionEmail = session?.user?.email;
  const isSuperAdmin = sessionRole === "super-admin";
  const isAdmin      = sessionRole === "admin" || isSuperAdmin;

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && !isAdmin) { router.push("/dashboard"); return; }
    if (status === "authenticated" && isAdmin) {
      fetch("/api/users").then((r) => r.json()).then(setUsers).finally(() => setLoading(false));
    }
  }, [status, isAdmin, router]);

  async function setRole(userId: string, role: string) {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: data.role } : u));
      toast.success(`Role updated to ${role}`);
    } catch {
      toast.error("Failed to update role");
    }
  }

  async function deleteUser(userId: string, name: string) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  }

  async function transferSuperAdmin() {
    if (!transferTarget) return;
    const target = users.find((u) => u._id === transferTarget);
    if (!target) return;
    if (!window.confirm(`Transfer super-admin to "${target.name}"? You will be downgraded to admin.`)) return;
    try {
      const res = await fetch(`/api/users/${transferTarget}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "super-admin" }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      toast.success(`Super-admin transferred to ${target.name}. Please sign in again.`);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      toast.error("Transfer failed");
    }
  }

  if (status === "loading" || loading) {
    return (
      <>
        <Navbar />
        <div className="page-wrapper" style={{ maxWidth: "900px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "14px" }} />)}
          </div>
        </div>
      </>
    );
  }

  const otherUsers = users.filter((u) => u._id !== (session?.user as { id?: string })?.id && u.email !== SUPER_ADMIN_EMAIL);

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ maxWidth: "900px" }}>
        {/* Header */}
        <div className="page-header animate-fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-light)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "12px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
                User Management
              </div>
              <h1 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 800, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.04em" }}>
                Admin Panel
              </h1>
              <p style={{ marginTop: "8px", color: "var(--text-muted)", fontSize: "14px" }}>
                {users.length} registered user{users.length !== 1 ? "s" : ""}
                {isSuperAdmin && " · You are the super-admin"}
              </p>
            </div>

            {/* Transfer super-admin (only visible to super-admin) */}
            {isSuperAdmin && (
              <button
                onClick={() => setShowTransfer((v) => !v)}
                style={{ padding: "9px 16px", borderRadius: "9px", background: "rgba(61,220,132,.1)", border: "1px solid rgba(61,220,132,.25)", color: "var(--accent-light)", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/>
                </svg>
                Transfer Super-Admin
              </button>
            )}
          </div>

          {/* Transfer panel */}
          {showTransfer && isSuperAdmin && (
            <div className="animate-scale-in" style={{ marginTop: "16px", padding: "16px", background: "rgba(61,220,132,.08)", border: "1px solid rgba(61,220,132,.2)", borderRadius: "12px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "10px" }}>
                Select a user to become the new super-admin. You will be downgraded to admin and signed out.
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <select
                  value={transferTarget}
                  onChange={(e) => setTransferTarget(e.target.value)}
                  className="input-base"
                  style={{ flex: 1, minWidth: "200px" }}
                >
                  <option value="">Select user…</option>
                  {otherUsers.map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <button
                  onClick={transferSuperAdmin}
                  disabled={!transferTarget}
                  style={{ padding: "10px 18px", borderRadius: "9px", background: "var(--accent)", border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: transferTarget ? "pointer" : "not-allowed", opacity: transferTarget ? 1 : 0.5 }}
                >
                  Confirm Transfer
                </button>
                <button onClick={() => setShowTransfer(false)} className="btn-ghost" style={{ padding: "10px 14px", borderRadius: "9px", fontSize: "13px" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {users.map((user) => {
            const rc = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.member;
            const isSelf    = user.email === sessionEmail;
            const isLocked  = user.email === SUPER_ADMIN_EMAIL;
            const canEdit   = !isSelf && !isLocked && (isSuperAdmin || user.role === "member");

            return (
              <div
                key={user._id}
                className="animate-fade-up"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}
              >
                {/* Avatar */}
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `linear-gradient(135deg, ${avatarColor(user.name)}, ${avatarColor(user.name)}aa)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {getInitials(user.name)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: "140px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{user.name}</span>
                    {isSelf && <span style={{ fontSize: "10px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>(you)</span>}
                    {isLocked && (
                      <span style={{ fontSize: "10px", color: "var(--accent-light)", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: "3px" }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                        hardcoded
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>{user.email}</div>
                </div>

                {/* Role badge */}
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: rc.color, background: rc.bg, padding: "4px 10px", borderRadius: "6px", fontFamily: "var(--font-mono)", border: `1px solid ${rc.color}28`, flexShrink: 0 }}>
                  {rc.label}
                </span>

                {/* Actions */}
                {canEdit && (
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    {user.role === "member" && (
                      <button
                        onClick={() => setRole(user._id, "admin")}
                        style={{ padding: "6px 12px", borderRadius: "7px", background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.25)", color: "#f59e0b", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                      >
                        Make Admin
                      </button>
                    )}
                    {user.role === "admin" && isSuperAdmin && (
                      <button
                        onClick={() => setRole(user._id, "member")}
                        style={{ padding: "6px 12px", borderRadius: "7px", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                      >
                        Revoke Admin
                      </button>
                    )}
                    <button
                      onClick={() => deleteUser(user._id, user.name)}
                      style={{ width: "32px", height: "32px", borderRadius: "7px", background: "rgba(234,67,53,.08)", border: "1px solid rgba(234,67,53,.2)", color: "#ea4335", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
      </div>
    </>
  );
}
