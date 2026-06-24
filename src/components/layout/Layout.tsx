import { useState } from "react";
import type { UserStats } from "../../types";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  stats: UserStats;
}

const NAV_SECTIONS = [
  {
    label: "core",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "⎔" },
      { id: "exams", label: "Exams", icon: "⌂" },
      { id: "schedule", label: "Schedule", icon: "☰" },
      { id: "pomodoro", label: "Focus", icon: "◉" },
    ],
  },
  {
    label: "workspace",
    items: [
      { id: "tasks", label: "Tasks", icon: "☐" },
      { id: "studylog", label: "Study Log", icon: "≡" },
      { id: "notes", label: "Notes", icon: "¶" },
      { id: "analytics", label: "Analytics", icon: "⬡" },
      { id: "calendar", label: "Calendar", icon: "⟡" },
    ],
  },
  {
    label: "tools",
    items: [
      { id: "attendance", label: "Attendance", icon: "◈" },
      { id: "gpa", label: "GPA", icon: "∑" },
      { id: "assignments", label: "Assignments", icon: "⊡" },
      { id: "examcountdown", label: "Countdown", icon: "⏱" },
      { id: "studyanalytics", label: "Study Analytics", icon: "⬒" },
    ],
  },
];

export default function Layout({ children, currentPage, onNavigate, stats }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      <aside
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="sidebar-header">
          <div className="sidebar-logo" aria-hidden="true">_</div>
          <div>
            <span className="sidebar-title">study_runtime</span>
            <span className="sidebar-version">v2.0</span>
          </div>
        </div>
        <nav className="sidebar-nav" aria-label="Sidebar">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="nav-section" role="group" aria-label={section.label}>
              <div className="nav-section-title">{section.label}</div>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${currentPage === item.id ? "active" : ""}`}
                  onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                  aria-current={currentPage === item.id ? "page" : undefined}
                  aria-label={item.label}
                >
              <span className="nav-item-icon" aria-hidden="true" style={{ fontFamily: "var(--font-mono)" }}>{item.icon}</span>
              {item.label}
                </button>
              ))}
            </div>
          ))}
          <div className="nav-section" style={{ marginTop: "auto", paddingTop: "0.65rem", borderTop: "1px solid var(--border)" }}>
            <button
              className={`nav-item ${currentPage === "landing" ? "active" : ""}`}
              onClick={() => { onNavigate("landing"); setSidebarOpen(false); }}
              aria-label="Landing page"
            >
              <span className="nav-item-icon" aria-hidden="true" style={{ fontFamily: "var(--font-mono)" }}>⌂</span>
              Home
            </button>
          </div>
        </nav>
      </aside>

      <div className="main-area">
        <header className="topbar" role="banner">
          <div className="topbar-left">
            <button
              className="topbar-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? "✕" : "☰"}
            </button>
            <div className="topbar-search" role="search">
              <span className="topbar-search-icon" aria-hidden="true">🔍</span>
                <input
                  type="text"
                  placeholder="Search knowledge pipeline..."
                  aria-label="Search the application"
                />
            </div>
          </div>
          <div className="topbar-right">
            <div className="user-info">
              <span className="user-level">Lv.{stats.level}</span>
              <div className="user-avatar" role="img" aria-label={`User avatar, level ${stats.level}, ${stats.xp} XP`}>
                TZ
              </div>
            </div>
          </div>
        </header>

        <main className="content" role="main" id="main-content">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 49 }}
          onClick={() => setSidebarOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
