import type { UserStats } from "../../types";

interface LandingProps {
  onGetStarted: () => void;
  stats?: UserStats;
}

export default function Landing({ onGetStarted, stats }: LandingProps) {
  const safeStats = {
    totalStudyHours: stats?.totalStudyHours ?? 0,
    totalFocusSessions: stats?.totalFocusSessions ?? 0,
    tasksCompleted: stats?.completedTasks ?? 0,
    currentStreak: stats?.streak ?? 0,
  };

  return (
    <div className="landing" role="main" aria-label="StudyOS landing page">
      <nav className="landing-nav" role="banner">
        <div className="landing-logo">$_study_runtime</div>
        <div className="landing-nav-links visible-desktop">
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            // features
          </a>
          <a
            href="#stats"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("stats")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            // metrics
          </a>
            <button className="btn btn-primary" onClick={onGetStarted}>
              launch_app
            </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-bg" aria-hidden="true" />
        <div className="landing-hero-content">
          <div className="landing-hero-text">
            <div className="landing-badge">⏵ study_runtime v2.0</div>
            <h1 className="landing-title">
              Your All-in-One
              <br />
              <span className="gradient-text">Study Operating System</span>
            </h1>
            <p className="landing-subtitle">
              A productivity operating system for developers. Plan, track, and
              compile knowledge with AI-powered study pipelines.
            </p>
            <div className="landing-hero-actions">
              <button className="btn btn-primary landing-cta" onClick={onGetStarted}>
                initialize_study_runtime
              </button>
            </div>
          </div>
          <div className="landing-hero-visual">
            <div className="terminal-window">
              <div className="terminal-header">
                <span className="terminal-dot" />
                <span className="terminal-dot" />
                <span className="terminal-dot" />
                <span className="terminal-title">study_runtime</span>
              </div>
              <div className="terminal-body">
                <div className="terminal-line"><span className="terminal-prompt">$</span><span className="terminal-output info">python3 study_runtime.py</span></div>
                <div className="terminal-line"><span className="terminal-output success">[✓] Study engine initialized</span></div>
                <div className="terminal-line"><span className="terminal-output success">[✓] 3 exams synced</span></div>
                <div className="terminal-line"><span className="terminal-output success">[✓] Schedule generated (14 days)</span></div>
                <div className="terminal-line"><span className="terminal-output success">[✓] Focus sessions: 12 completed</span></div>
                <div className="terminal-line" style={{ marginTop: "0.5rem" }}><span className="terminal-prompt">$</span><span className="terminal-output">system.status</span></div>
                <div className="terminal-line"><span className="terminal-output">Ready to compile knowledge<span className="terminal-cursor" /></span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-section">
        <h2 className="landing-section-title">
          Everything You Need to Succeed
        </h2>
        <p className="landing-section-subtitle">
          // complete_study_engineering_kit
        </p>
        <div className="landing-features">
          {[
            {
              icon: "⎔",
              title: "Dashboard",
              desc: "System monitor for study metrics, weekly hours, and exam queue.",
            },
            {
              icon: "⌂",
              title: "Exam Manager",
              desc: "Track exams with syllabus progress meters and priority flags.",
            },
            {
              icon: "☰",
              title: "Schedule Generator",
              desc: "AI engine that builds optimized study timelines based on difficulty.",
            },
            {
              icon: "◉",
              title: "Focus Engine",
              desc: "Pomodoro-based concentration timer with terminal aesthetic.",
            },
            {
              icon: "☐",
              title: "Task Pipeline",
              desc: "Organize tasks with priority sorting, due dates, and recurring jobs.",
            },
            {
              icon: "≡",
              title: "Study Logger",
              desc: "Log sessions with productivity metrics and mood tracking.",
            },
            {
              icon: "¶",
              title: "Knowledge Base",
              desc: "Notes system with tags, search indexing, and pinning.",
            },
            {
              icon: "⬡",
              title: "Analytics Engine",
              desc: "Performance metrics with chart visualizations and readiness scores.",
            },
            {
              icon: "⟡",
              title: "Calendar",
              desc: "Sprint-style calendar for exams, study blocks, and revision.",
            },
            {
              icon: "✦",
              title: "Achievements",
              desc: "Unlock badges for streaks, study hours, and task completions.",
            },
            {
              icon: "⤴",
              title: "XP System",
              desc: "Level progression with experience points and streak tracking.",
            },
            {
              icon: "⟐",
              title: "Theme Switcher",
              desc: "Optimized dark theme for extended study sessions with reduced eye strain.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="landing-feature-card glass"
              style={{ cursor: "default" }}
            >
              <div className="landing-feature-icon">{f.icon}</div>
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="stats" className="landing-section">
        <h2 className="landing-section-title">System Metrics</h2>
        <div className="landing-stats">
          {[
            {
              value: safeStats.totalStudyHours,
              label: "study_hours",
              icon: "⎔",
            },
            {
              value: safeStats.totalFocusSessions,
              label: "focus_sessions",
              icon: "◉",
            },
            {
              value: safeStats.tasksCompleted,
              label: "tasks_completed",
              icon: "☐",
            },
            { value: safeStats.currentStreak, label: "streak_days", icon: "⤴" },
          ].map((s) => (
            <div key={s.label} className="landing-stat-card glass">
              <div className="landing-stat-icon">{s.icon}</div>
              <div className="landing-stat-value">{s.value}</div>
              <div className="landing-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="landing-section landing-cta-section"
        role="region"
        aria-label="Call to action"
      >
        <h2 className="landing-section-title">Ready to Compile Knowledge?</h2>
        <p className="landing-section-subtitle">
          // initialize_your_study_engine
        </p>
        <button
          className="btn btn-primary landing-cta"
          style={{ fontSize: "1.1rem", padding: "0.85rem 2.2rem" }}
          onClick={onGetStarted}
        >
          launch_study_runtime
        </button>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div className="landing-footer-links">
            <span>© {new Date().getFullYear()} study_runtime</span>
            <span>built for engineers</span>
            <span>v2.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
