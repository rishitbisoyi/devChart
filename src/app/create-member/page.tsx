"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";

const ROLE_CONFIG = [
  { value: "member", label: "Member", color: "#3ddc84", desc: "Regular contributor" },
  { value: "lead",   label: "Lead",   color: "#f59e0b", desc: "Team lead role"     },
  { value: "admin",  label: "Admin",  color: "#ea4335", desc: "Full access"        },
];

export default function CreateMember() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [submitting, setSubmitting] = useState(false);

  const sessionRole = (session?.user as { role?: string })?.role;
  const isAdmin = sessionRole === "admin" || sessionRole === "super-admin";

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.push("/members");
    }
  }, [status, isAdmin, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      if (!res.ok) throw new Error();
      toast.success("Member added");
      router.push("/members");
    } catch {
      toast.error("Failed to add member");
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

  const selectedRole = ROLE_CONFIG.find((r) => r.value === role);

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ maxWidth: "540px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
          <Link href="/members" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "var(--text-faint)", fontWeight: 500 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Members
          </Link>
          <span style={{ color: "var(--border-hover)" }}>/</span>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Add Member</span>
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
          Add Member
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
            <label style={labelStyle}>Full Name</label>
            <input
              style={inputStyle}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61,220,132,.1)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              required
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61,220,132,.1)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Role</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {ROLE_CONFIG.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  style={{
                    flex: 1,
                    padding: "10px 8px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "1px solid",
                    background: role === r.value ? r.color + "16" : "var(--bg-elevated)",
                    borderColor: role === r.value ? r.color + "55" : "var(--border)",
                    color: role === r.value ? r.color : "var(--text-muted)",
                    transition: "all 0.15s",
                    textTransform: "capitalize",
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {selectedRole && (
              <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                {selectedRole.desc}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <Link href="/members" style={{ flex: 1 }}>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {submitting ? "Adding…" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
