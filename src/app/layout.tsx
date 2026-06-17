import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import CommandPalette from "@/components/CommandPalette";
import TaskNotifier from "@/components/TaskNotifier";
import SessionWrapper from "@/components/SessionWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexus — Android Club",
  description: "Mission control for Android Club — Kanban, sprints, analytics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <SessionWrapper>
        {children}
        <CommandPalette />
        <TaskNotifier />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              border: "1px solid rgba(61,220,132,.15)",
              borderLeft: "3px solid #3ddc84",
              fontFamily: "var(--font-inter)",
              fontSize: "13px",
              borderRadius: "12px",
              boxShadow: "0 12px 40px rgba(0,0,0,.6), 0 0 20px rgba(61,220,132,.06)",
            },
            error: {
              style: { borderLeft: "3px solid #ea4335" },
              iconTheme: { primary: "#ea4335", secondary: "#fff" },
            },
            success: {
              style: { borderLeft: "3px solid #3ddc84" },
              iconTheme: { primary: "#3ddc84", secondary: "#fff" },
            },
          }}
        />
        </SessionWrapper>
      </body>
    </html>
  );
}
