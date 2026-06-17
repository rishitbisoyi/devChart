"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px",
    background: "var(--bg-elevated)", border: "1px solid var(--border)",
    borderRadius: "10px", color: "var(--text-primary)", fontSize: "14px",
    outline: "none", fontFamily: "var(--font-inter)",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)", padding: "24px" }}>
      {/* Background glows */}
      <div style={{ position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(61,220,132,.1) 0%, rgba(66,133,244,.06) 45%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "10%", right: "5%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(251,188,4,.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className="animate-scale-in" style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #3ddc84, #4285f4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 8px 32px rgba(61,220,132,.5), 0 0 0 1px rgba(61,220,132,.2)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
              <circle cx="12" cy="12" r="3"/>
              <line x1="12" y1="2" x2="12" y2="9"/>
              <line x1="22" y1="8.5" x2="15.6" y2="10.5"/>
              <line x1="2" y1="8.5" x2="8.4" y2="10.5"/>
            </svg>
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 900,
              letterSpacing: "-0.06em",
              marginBottom: "4px",
              background: "linear-gradient(90deg, #86efac, #93c5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Nexus
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-faint)" }}>Android Club · Sign in to continue</p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "18px", padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)", display: "block", marginBottom: "7px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61,220,132,.12)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)", display: "block", marginBottom: "7px" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61,220,132,.12)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {error && (
            <div style={{ fontSize: "13px", color: "#ea4335", background: "rgba(234,67,53,.1)", border: "1px solid rgba(234,67,53,.2)", borderRadius: "8px", padding: "10px 12px" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "13px", fontSize: "14px", borderRadius: "10px", marginTop: "4px", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {loading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
            ) : null}
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-faint)", marginTop: "4px" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "#86efac", fontWeight: 600 }}>Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
