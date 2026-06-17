"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: "/members",
    label: "Members",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    href: "/announcements",
    label: "Board",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    href: "/activity",
    label: "Activity",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    href: "/sprints",
    label: "Sprints",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function avatarColor(name: string) {
  const colors = ["#3ddc84","#4285f4","#3ddc84","#ea4335","#f59e0b","#fbbc04","#3b82f6","#f97316"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

/* Nexus hex-node icon */
function NexusIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
      <circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="2" x2="12" y2="9"/>
      <line x1="22" y1="8.5" x2="15.6" y2="10.5"/>
      <line x1="22" y1="15.5" x2="15.6" y2="13.5"/>
      <line x1="12" y1="22" x2="12" y2="15"/>
      <line x1="2" y1="15.5" x2="8.4" y2="13.5"/>
      <line x1="2" y1="8.5" x2="8.4" y2="10.5"/>
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const sessionRole = (session?.user as { role?: string })?.role;
  const isAdmin = sessionRole === "admin" || sessionRole === "super-admin";

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
    setIsDark(document.documentElement.getAttribute("data-theme") !== "light");
    function onScroll() { setScrolled(window.scrollY > 8); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!showUserMenu) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) setShowUserMenu(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showUserMenu]);

  function toggleTheme() {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    }
  }

  function openPalette() {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true, bubbles: true }));
  }

  const navBg = scrolled
    ? "color-mix(in srgb, var(--bg-base) 95%, transparent)"
    : "color-mix(in srgb, var(--bg-base) 70%, transparent)";

  const borderB = scrolled
    ? "1px solid rgba(61,220,132,.14)"
    : "1px solid rgba(61,220,132,.06)";

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: "62px",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          background: navBg,
          borderBottom: borderB,
          transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
          boxShadow: scrolled ? "0 2px 32px rgba(61,220,132,.06)" : "none",
        }}
      >
        <div
          style={{
            maxWidth: "1380px",
            margin: "0 auto",
            height: "100%",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "11px", flexShrink: 0 }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #3ddc84 0%, #4285f4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 20px rgba(61,220,132,.5), 0 0 0 1px rgba(61,220,132,.2)",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <NexusIcon size={17} />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: "17px",
                  letterSpacing: "-0.05em",
                  lineHeight: 1.1,
                  background: "linear-gradient(90deg, #86efac, #93c5fd)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Nexus
              </div>
              <div style={{ fontSize: "9px", color: "rgba(61,220,132,.6)", textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1 }}>
                Android Club
              </div>
            </div>
          </Link>

          {/* Desktop Nav pill */}
          <div
            className="hidden md:flex"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid rgba(61,220,132,.1)",
              borderRadius: "999px",
              padding: "4px",
              gap: "2px",
              flex: "0 0 auto",
            }}
          >
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link key={link.href} href={link.href}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "6px 12px",
                      borderRadius: "999px",
                      background: active ? "linear-gradient(135deg, rgba(61,220,132,.2), rgba(66,133,244,.15))" : "transparent",
                      border: active ? "1px solid rgba(61,220,132,.35)" : "1px solid transparent",
                      color: active ? "#86efac" : "var(--text-muted)",
                      fontSize: "13px",
                      fontWeight: 600,
                      transition: "all 0.15s ease",
                      cursor: "pointer",
                      boxShadow: active ? "0 0 12px rgba(61,220,132,.15)" : "none",
                    }}
                    onMouseOver={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = "var(--text-secondary)";
                        e.currentTarget.style.background = "rgba(61,220,132,.06)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = "var(--text-muted)";
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <span style={{ opacity: active ? 1 : 0.6 }}>{link.icon}</span>
                    {link.label}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Search trigger */}
          <button
            className="hidden md:flex"
            onClick={openPalette}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 12px",
              background: "var(--bg-surface)",
              border: "1px solid rgba(61,220,132,.1)",
              borderRadius: "9px",
              color: "var(--text-faint)",
              fontSize: "13px",
              cursor: "pointer",
              flex: "0 0 auto",
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "rgba(61,220,132,.4)";
              e.currentTarget.style.color = "#86efac";
              e.currentTarget.style.boxShadow = "0 0 12px rgba(61,220,132,.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "rgba(61,220,132,.1)";
              e.currentTarget.style.color = "var(--text-faint)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span>Search…</span>
            <kbd
              style={{
                fontSize: "10px",
                padding: "2px 5px",
                background: "rgba(61,220,132,.08)",
                border: "1px solid rgba(61,220,132,.2)",
                borderRadius: "4px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-faint)",
              }}
            >
              {isMac ? "⌘K" : "Ctrl+K"}
            </kbd>
          </button>

          <div style={{ flex: 1 }} />

          {/* Theme toggle */}
          <button
            className="hidden md:flex"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              width: "34px",
              height: "34px",
              background: "var(--bg-surface)",
              border: "1px solid rgba(61,220,132,.1)",
              borderRadius: "9px",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(61,220,132,.4)"; e.currentTarget.style.color = "#86efac"; e.currentTarget.style.boxShadow = "0 0 12px rgba(61,220,132,.12)"; }}
            onMouseOut={(e)  => { e.currentTarget.style.borderColor = "rgba(61,220,132,.1)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            {isDark ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            )}
          </button>

          {/* New Task CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/create-task">
              <button
                className="btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "13px",
                  padding: "8px 16px",
                  borderRadius: "9px",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Task
              </button>
            </Link>
          </div>

          {/* User avatar + dropdown */}
          {session?.user && (
            <div className="hidden md:block" data-user-menu style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  background: `linear-gradient(135deg, ${avatarColor(session.user.name ?? "U")}, ${avatarColor(session.user.name ?? "U")}aa)`,
                  border: showUserMenu ? "2px solid #3ddc84" : "2px solid rgba(61,220,132,.2)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                  boxShadow: showUserMenu ? "0 0 0 3px rgba(61,220,132,.25), 0 0 20px rgba(61,220,132,.2)" : "none",
                }}
              >
                {getInitials(session.user.name ?? "U")}
              </button>

              {showUserMenu && (
                <div
                  className="animate-scale-in"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    minWidth: "230px",
                    background: "var(--bg-surface)",
                    border: "1px solid rgba(61,220,132,.2)",
                    borderRadius: "16px",
                    padding: "8px",
                    boxShadow: "var(--shadow-lg), 0 0 40px rgba(61,220,132,.08)",
                    zIndex: 100,
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <div style={{ padding: "10px 12px 12px", borderBottom: "1px solid rgba(61,220,132,.1)", marginBottom: "6px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
                      {session.user.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginBottom: "8px" }}>
                      {session.user.email}
                    </div>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: sessionRole === "super-admin" ? "#3ddc84" : sessionRole === "admin" ? "#f59e0b" : "#3ddc84",
                      background: sessionRole === "super-admin" ? "rgba(61,220,132,.12)" : sessionRole === "admin" ? "rgba(245,158,11,.12)" : "rgba(61,220,132,.12)",
                      padding: "3px 8px",
                      borderRadius: "5px",
                      fontFamily: "var(--font-mono)",
                      border: `1px solid ${sessionRole === "super-admin" ? "rgba(61,220,132,.25)" : sessionRole === "admin" ? "rgba(245,158,11,.25)" : "rgba(61,220,132,.25)"}`,
                    }}>
                      {sessionRole === "super-admin" ? "Super Admin" : sessionRole === "admin" ? "Admin" : "Member"}
                    </span>
                  </div>

                  {isAdmin && (
                    <Link href="/admin" onClick={() => setShowUserMenu(false)}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: "9px",
                        padding: "9px 12px", borderRadius: "8px",
                        fontSize: "13px", fontWeight: 600, color: "var(--text-muted)",
                        cursor: "pointer", transition: "all 0.12s",
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = "rgba(61,220,132,.08)"; e.currentTarget.style.color = "#86efac"; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                        </svg>
                        Admin Panel
                      </div>
                    </Link>
                  )}

                  <button
                    onClick={() => { setShowUserMenu(false); signOut({ callbackUrl: "/login" }); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "9px",
                      padding: "9px 12px", borderRadius: "8px",
                      fontSize: "13px", fontWeight: 600, color: "#ea4335",
                      background: "transparent", border: "none", cursor: "pointer",
                      textAlign: "left", transition: "background 0.12s",
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "rgba(234,67,53,.1)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              marginLeft: "auto",
              background: menuOpen ? "rgba(61,220,132,.1)" : "transparent",
              border: `1px solid ${menuOpen ? "rgba(61,220,132,.3)" : "transparent"}`,
              borderRadius: "8px",
              padding: "7px 9px",
              color: menuOpen ? "#86efac" : "var(--text-primary)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: "62px",
            left: 0,
            right: 0,
            zIndex: 45,
            background: "color-mix(in srgb, var(--bg-base) 97%, transparent)",
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(61,220,132,.12)",
            padding: "16px",
          }}
          className="animate-fade-in"
        >
          <button
            onClick={() => { openPalette(); setMenuOpen(false); }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 14px",
              borderRadius: "10px",
              background: "rgba(61,220,132,.06)",
              color: "var(--text-muted)",
              border: "1px solid rgba(61,220,132,.12)",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              marginBottom: "8px",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search…
            <kbd style={{ marginLeft: "auto", fontSize: "10px", padding: "2px 6px", background: "rgba(61,220,132,.08)", border: "1px solid rgba(61,220,132,.2)", borderRadius: "4px", fontFamily: "var(--font-mono)" }}>
              {isMac ? "⌘K" : "Ctrl+K"}
            </kbd>
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: active ? "linear-gradient(135deg, rgba(61,220,132,.18), rgba(66,133,244,.12))" : "var(--bg-elevated)",
                      color: active ? "#86efac" : "var(--text-muted)",
                      border: `1px solid ${active ? "rgba(61,220,132,.35)" : "rgba(61,220,132,.06)"}`,
                      fontWeight: 600,
                      fontSize: "14px",
                      boxShadow: active ? "0 0 12px rgba(61,220,132,.1)" : "none",
                    }}
                  >
                    {link.icon}
                    {link.label}
                  </div>
                </Link>
              );
            })}
            <Link href="/create-task" onClick={() => setMenuOpen(false)}>
              <button
                className="btn-primary"
                style={{ width: "100%", marginTop: "6px", padding: "12px", borderRadius: "10px", fontSize: "14px", justifyContent: "center", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Task
              </button>
            </Link>

            {isAdmin && (
              <Link href="/admin" onClick={() => setMenuOpen(false)}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "12px 14px", borderRadius: "10px",
                  background: "var(--bg-elevated)", color: "var(--text-muted)",
                  border: "1px solid rgba(61,220,132,.06)", fontWeight: 600, fontSize: "14px", marginTop: "2px",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                  Admin Panel
                </div>
              </Link>
            )}

            {session?.user && (
              <button
                onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/login" }); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "10px",
                  padding: "12px 14px", borderRadius: "10px", marginTop: "2px",
                  background: "rgba(234,67,53,.06)", border: "1px solid rgba(234,67,53,.2)",
                  color: "#ea4335", fontWeight: 600, fontSize: "14px", cursor: "pointer", textAlign: "left",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
