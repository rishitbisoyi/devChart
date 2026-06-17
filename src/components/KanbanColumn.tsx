"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import Link from "next/link";
import type { ReactNode } from "react";

type Task = {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string;
  dueDate: string;
  tags?: string[];
  subtasks?: { _id: string; text: string; done: boolean }[];
};

type KanbanColumnProps = {
  id: string;
  title: string;
  accentColor: string;
  tasks: Task[];
  isAdmin?: boolean;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "forward" | "back") => void;
  onOpen?: (id: string) => void;
};

const COLUMN_ICONS: Record<string, ReactNode> = {
  todo: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
  "in-progress": (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  done: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
};

export default function KanbanColumn({
  id,
  title,
  accentColor,
  tasks,
  isAdmin = false,
  onDelete,
  onMove,
  onOpen,
}: KanbanColumnProps) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: "300px",
        maxWidth: "400px",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderTop: `2px solid ${accentColor}`,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 18px 14px",
          background: `linear-gradient(180deg, ${accentColor}0d 0%, transparent 100%)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: accentColor + "18",
                border: `1px solid ${accentColor}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: accentColor,
              }}
            >
              {COLUMN_ICONS[id]}
            </div>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: "var(--text-primary)",
              }}
            >
              {title}
            </span>
          </div>

          <div
            style={{
              minWidth: "26px",
              height: "26px",
              borderRadius: "8px",
              background: tasks.length > 0 ? accentColor + "20" : "var(--bg-elevated)",
              border: `1px solid ${tasks.length > 0 ? accentColor + "35" : "var(--border)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 7px",
              fontSize: "12px",
              fontWeight: 700,
              color: tasks.length > 0 ? accentColor : "var(--text-faint)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {tasks.length}
          </div>
        </div>
      </div>

      {/* Tasks */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              minHeight: "180px",
              background: snapshot.isDraggingOver
                ? accentColor + "0a"
                : "transparent",
              transition: "background 0.2s ease",
            }}
          >
            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard
                      {...task}
                      isDragging={snapshot.isDragging}
                      isAdmin={isAdmin}
                      onDelete={onDelete}
                      onMove={onMove}
                      onOpen={onOpen}
                    />
                  </div>
                )}
              </Draggable>
            ))}

            {provided.placeholder}

            {tasks.length === 0 && (
              <div
                style={{
                  flex: 1,
                  minHeight: "160px",
                  border: `1px dashed ${accentColor}30`,
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  color: "var(--text-faint)",
                  fontSize: "13px",
                  background: snapshot.isDraggingOver ? accentColor + "08" : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                  <rect x="3" y="5" width="18" height="14" rx="3"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span style={{ fontSize: "12px" }}>No tasks yet</span>
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Footer */}
      <div style={{ padding: "10px 12px 12px", borderTop: "1px solid var(--border)" }}>
        <Link href={`/create-task?status=${id}`}>
          <button
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: `1px dashed ${accentColor}35`,
              background: "transparent",
              color: accentColor,
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = accentColor + "12";
              e.currentTarget.style.borderColor = accentColor + "60";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = accentColor + "35";
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Task
          </button>
        </Link>
      </div>
    </div>
  );
}
