"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
    label: "Kanban Board",
    desc: "Drag tasks across To Do, In Progress, and Done stages with live state sync.",
    color: "#3ddc84",
    glow: "rgba(61,220,132,.3)",
    delay: 0,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    label: "Member Profiles",
    desc: "Track ownership, assignments, and individual completion rates in real time.",
    color: "#4285f4",
    glow: "rgba(66,133,244,.3)",
    delay: 80,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    label: "Activity Feed",
    desc: "Every task event — creation, moves, edits — logged in a live timeline.",
    color: "#3ddc84",
    glow: "rgba(61,220,132,.3)",
    delay: 160,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    label: "Analytics",
    desc: "Completion rates, priority distributions, and team workload at a glance.",
    color: "#f59e0b",
    glow: "rgba(245,158,11,.3)",
    delay: 240,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    label: "Sprints",
    desc: "Scope and track time-boxed sprints with velocity graphs.",
    color: "#fbbc04",
    glow: "rgba(251,188,4,.3)",
    delay: 320,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
    label: "Announcements",
    desc: "Broadcast updates to your club. Pinned posts stay visible for the team.",
    color: "#3b82f6",
    glow: "rgba(59,130,246,.3)",
    delay: 400,
  },
];

/* Particle system */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.min(Math.floor(window.innerWidth / 14), 90);

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      r: number; a: number; color: string;
    }

    const colors = ["rgba(61,220,132,", "rgba(66,133,244,", "rgba(251,188,4,"];
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.6,
      a: Math.random(),
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        p.a = 0.3 + 0.5 * Math.abs(Math.sin(Date.now() * 0.0008 + i));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.a + ")";
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = p.color + (0.09 * (1 - dist / 130)) + ")";
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.7 }}
    />
  );
}

/* Typewriter hook */
function useTypewriter(words: string[], speed = 90, pause = 1800) {
  const [text, setText]       = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    } else {
      setDeleting(false);
      setWordIdx((i) => (i + 1) % words.length);
    }

    setText(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return text;
}

export default function Home() {
  const typed = useTypewriter(["Collaborate.", "Ship Faster.", "Stay in Sync.", "Build Together."]);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", position: "relative", overflow: "visible" }}>
      <ParticleCanvas />

      {/* Atmospheric orbs */}
      <div
        className="float-slow"
        style={{
          position: "fixed",
          top: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(61,220,132,.08) 0%, rgba(66,133,244,.05) 45%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
          filter: "blur(2px)",
        }}
      />
      <div
        className="float"
        style={{
          position: "fixed",
          bottom: "-18%",
          right: "-12%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(251,188,4,.07) 0%, rgba(66,133,244,.04) 50%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
          filter: "blur(2px)",
        }}
      />
      <div
        className="float-alt"
        style={{
          position: "fixed",
          top: "30%",
          left: "-8%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(61,220,132,.05) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />

        <section
          style={{
            minHeight: "calc(100vh - 62px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "80px 28px 120px",
          }}
        >
          <div style={{ maxWidth: "840px", width: "100%" }}>

            {/* Badge */}
            <div
              className="animate-fade-up"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "#86efac",
                fontFamily: "var(--font-mono)",
                background: "rgba(61,220,132,.08)",
                padding: "7px 16px",
                borderRadius: "999px",
                border: "1px solid rgba(61,220,132,.25)",
                marginBottom: "40px",
                boxShadow: "0 0 20px rgba(61,220,132,.12)",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#3ddc84",
                  display: "inline-block",
                  boxShadow: "0 0 8px #3ddc84",
                  animation: "glow-pulse 2s ease-in-out infinite",
                }}
              />
              Android Club · Mission Control
            </div>

            {/* Hero heading */}
            <h1
  className="animate-fade-up"
  style={{
    fontSize: "clamp(44px, 8vw, 84px)",
    fontWeight: 900,
    letterSpacing: "-0.05em",
    lineHeight: 1.2,
    marginBottom: "32px",
    paddingBottom: "16px",
    overflow: "visible",
    animationDelay: "0.06s",
  }}
>
  <span
    className="gradient-text"
    style={{
      display: "inline-block",
      paddingRight: "12px",
    }}
  >
    Nexus
  </span>
</h1>

            {/* Typewriter subtitle */}
            <div
              className="animate-fade-up"
              style={{
                fontSize: "clamp(18px, 3vw, 28px)",
                fontWeight: 700,
                color: "var(--text-secondary)",
                letterSpacing: "-0.03em",
                marginBottom: "20px",
                minHeight: "1.4em",
                animationDelay: "0.1s",
                fontFamily: "var(--font-mono)",
              }}
            >
              <span style={{ color: "#86efac" }}>{typed}</span>
              <span
                style={{
                  display: "inline-block",
                  width: "2px",
                  height: "1em",
                  background: "#3ddc84",
                  marginLeft: "3px",
                  verticalAlign: "middle",
                  animation: "cursor-blink 1s ease-in-out infinite",
                  boxShadow: "0 0 8px #3ddc84",
                }}
              />
            </div>

            <p
              className="animate-fade-up"
              style={{
                fontSize: "17px",
                color: "var(--text-muted)",
                maxWidth: "540px",
                margin: "0 auto 56px",
                lineHeight: 1.8,
                animationDelay: "0.14s",
              }}
            >
              Project command center for student clubs. Kanban boards, sprint tracking,
              analytics — everything your team needs to ship together.
            </p>

            {/* CTA buttons */}
            <div
              className="animate-fade-up"
              style={{
                display: "flex",
                gap: "14px",
                justifyContent: "center",
                flexWrap: "wrap",
                animationDelay: "0.18s",
                marginBottom: "100px",
              }}
            >
              <Link href="/dashboard">
                <button
                  className="btn-primary"
                  style={{
                    padding: "15px 32px",
                    fontSize: "16px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                  }}
                >
                  Launch Dashboard
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </Link>
              <Link href="/members">
                <button
                  className="btn-ghost"
                  style={{ padding: "15px 32px", fontSize: "16px", borderRadius: "12px" }}
                >
                  View Team
                </button>
              </Link>
            </div>

            {/* Feature grid */}
            <div
              className="animate-fade-up"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                animationDelay: "0.22s",
              }}
            >
              {features.map((f, i) => (
                <div
                  key={f.label}
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  style={{
                    background: hoveredFeature === i
                      ? "var(--bg-elevated)"
                      : "var(--bg-surface)",
                    border: `1px solid ${hoveredFeature === i ? f.color + "50" : "rgba(61,220,132,.08)"}`,
                    borderRadius: "18px",
                    padding: "24px 20px",
                    textAlign: "left",
                    cursor: "default",
                    transition: "all 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
                    transform: hoveredFeature === i ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
                    boxShadow: hoveredFeature === i
                      ? `0 20px 40px rgba(0,0,0,.5), 0 0 30px ${f.glow}`
                      : "0 4px 16px rgba(0,0,0,.3)",
                    animationDelay: `${0.22 + f.delay * 0.001}s`,
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "13px",
                      background: f.color + "14",
                      border: `1px solid ${f.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: f.color,
                      marginBottom: "16px",
                      transition: "all 0.28s ease",
                      boxShadow: hoveredFeature === i ? `0 0 20px ${f.glow}` : "none",
                    }}
                  >
                    {f.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: hoveredFeature === i ? f.color : "var(--text-primary)",
                      marginBottom: "7px",
                      letterSpacing: "-0.01em",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {f.label}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.65 }}>
                    {f.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
