import { useState } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks } from "date-fns";
import type { StudySession, Exam, Task, PomodoroSession } from "../../types";
import type { Achievement } from "../../types";

interface AnalyticsProps {
  sessions: StudySession[];
  exams: Exam[];
  tasks: Task[];
  pomodoro: PomodoroSession[];
  achievements: Achievement[];
  totalXp: number;
  level: number;
  streak: number;
}

type Tab = "charts" | "achievements";

export default function Analytics({ sessions, exams, tasks, pomodoro, achievements, totalXp, level, streak }: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("charts");

  const weekDates = eachDayOfInterval({ start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfWeek(new Date(), { weekStartsOn: 1 }) });
  const last8Weeks = Array.from({ length: 8 }, (_, i) => subWeeks(new Date(), 7 - i));

  const weeklyHours = last8Weeks.map((w) => {
    const start = startOfWeek(w, { weekStartsOn: 1 });
    const end = endOfWeek(w, { weekStartsOn: 1 });
    const weekSessions = sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= start && d <= end;
    });
    return Math.round(weekSessions.reduce((sum, s) => sum + s.duration, 0) / 60 * 10) / 10;
  });

  const weeklyFocusSessions = last8Weeks.map((w) => {
    const start = startOfWeek(w, { weekStartsOn: 1 });
    const end = endOfWeek(w, { weekStartsOn: 1 });
    return pomodoro.filter((p) => {
      const d = new Date(p.date);
      return d >= start && d <= end;
    }).length;
  });

  const subjectHours = sessions.reduce((acc, s) => {
    acc[s.subject] = (acc[s.subject] || 0) + s.duration;
    return acc;
  }, {} as Record<string, number>);
  const totalHours = Object.values(subjectHours).reduce((a, b) => a + b, 0);
  const subjectColors = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6"];

  const examReadiness = exams.map((e) => {
    const now = new Date();
    const examDate = new Date(e.date);
    const daysLeft = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const syllabusPct = e.syllabus > 0 ? e.completedSyllabus / e.syllabus : 0;
    const readiness = daysLeft <= 0 ? 100 : Math.min(100, Math.round(
      (syllabusPct * 50) + ((1 - Math.min(daysLeft / 30, 1)) * 30) + (e.priority === "high" ? 15 : e.priority === "medium" ? 10 : 5)
    ));
    return { ...e, daysLeft, readiness };
  });

  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">lv.{level} · {totalXp} xp · streak: {streak}d</p>
      </div>

      <div className="tabs" role="tablist" aria-label="Analytics tabs">
        {(["charts", "achievements"] as Tab[]).map((t) => (
          <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)} role="tab" aria-selected={activeTab === t}>
            {t === "charts" ? "📊 Charts" : "🏆 Achievements"}
          </button>
        ))}
      </div>

      {activeTab === "charts" && (
        <>
          <div className="dashboard-grid">
            {/* Weekly Hours */}
            <div className="glass">
              <div className="glass-header">
                <span className="glass-title">weekly_hours</span>
                <span className="glass-subtitle">{weeklyHours.reduce((a, b) => a + b, 0).toFixed(1)}h total</span>
              </div>
              <div className="chart-container">
                <div className="chart-bars">
                  {weeklyHours.map((h, i) => {
                    const max = Math.max(...weeklyHours, 1);
                    return (
                      <div key={i} className="chart-bar" style={{ height: `${(h / max) * 100}%`, minHeight: 4 }} role="img" aria-label={`${h.toFixed(1)} hours week ${i + 1}`}>
                        <span className="chart-bar-value">{h.toFixed(1)}h</span>
                        <span className="chart-bar-label">W{last8Weeks[i] ? format(last8Weeks[i], "M/d") : ""}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="glass">
              <div className="glass-header">
                <span className="glass-title">monthly_trend</span>
                <span className="glass-subtitle">Focus sessions</span>
              </div>
              <div className="chart-container">
                <div className="chart-bars">
                  {weeklyFocusSessions.map((c, i) => {
                    const max = Math.max(...weeklyFocusSessions, 1);
                    return (
                      <div key={i} className="chart-bar" style={{ height: `${(c / max) * 100}%`, minHeight: 4 }} role="img" aria-label={`${c} focus sessions week ${i + 1}`}>
                        <span className="chart-bar-value">{c}</span>
                        <span className="chart-bar-label">W{last8Weeks[i] ? format(last8Weeks[i], "M/d") : ""}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Subject Distribution */}
            <div className="glass">
              <div className="glass-header">
                <span className="glass-title">subject_distribution</span>
                <span className="glass-subtitle">{totalHours.toFixed(1)}h total</span>
              </div>
              <div className="chart-container">
                {Object.entries(subjectHours).length === 0 ? (
                  <div className="empty-state" style={{ padding: "1rem 0" }}>
                    <div className="empty-state-title" style={{ fontSize: "0.85rem" }}>No data yet</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {Object.entries(subjectHours).sort(([, a], [, b]) => b - a).slice(0, 6).map(([subject, hours], i) => {
                      const pct = totalHours > 0 ? (hours / totalHours) * 100 : 0;
                      return (
                        <div key={subject}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "0.2rem" }}>
                            <span>{subject}</span>
                            <span style={{ color: "var(--text-muted)" }}>{(hours / 60).toFixed(1)}h</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: subjectColors[i % subjectColors.length] }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Exam Readiness */}
            <div className="glass">
              <div className="glass-header">
                <span className="glass-title">exam_readiness</span>
                <span className="glass-subtitle">{exams.length} exams</span>
              </div>
              <div className="chart-container">
                {examReadiness.length === 0 ? (
                  <div className="empty-state" style={{ padding: "1rem 0" }}>
                    <div className="empty-state-title" style={{ fontSize: "0.85rem" }}>No exams yet</div>
                  </div>
                ) : examReadiness.map((e) => (
                  <div key={e.id} style={{ marginBottom: "0.6rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "0.2rem" }}>
                      <span>{e.title}</span>
                      <span style={{ color: e.readiness >= 70 ? "var(--success)" : e.readiness >= 40 ? "var(--warning)" : "var(--danger)" }}>{e.readiness}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${e.readiness}%`,
                        backgroundColor: e.readiness >= 70 ? "var(--success)" : e.readiness >= 40 ? "var(--warning)" : "var(--danger)"
                      }} role="progressbar" aria-valuenow={e.readiness} aria-valuemin={0} aria-valuemax={100} />
                    </div>
                    <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>{e.daysLeft > 0 ? `${e.daysLeft}d left` : "Past due"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements Graph */}
            <div className="glass">
              <div className="glass-header">
                <span className="glass-title">achievements</span>
                <span className="glass-subtitle">{achievements.filter((a) => a.unlocked).length}/{achievements.length} unlocked</span>
              </div>
              <div className="chart-container" style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {achievements.slice(0, 8).map((a) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: a.unlocked ? 1 : 0.4 }}>
                    <span style={{ fontSize: "1.1rem" }}>{a.icon}</span>
                    <span style={{ fontSize: "0.72rem", flex: 1 }}>{a.title}</span>
                    <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{a.unlocked ? "✓" : "🔒"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Focus Sessions Trend */}
            <div className="glass">
              <div className="glass-header">
                <span className="glass-title">focus_sessions</span>
                <span className="glass-subtitle">{pomodoro.length} total</span>
              </div>
              <div className="chart-container">
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div className="stat-row">
                    <span className="stat-label">Total Focus Hours</span>
                    <span className="stat-value">{(pomodoro.filter((p) => p.completed).length * 25 / 60).toFixed(1)}h</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Completion Rate</span>
                    <span className="stat-value">{pomodoro.length > 0 ? Math.round((pomodoro.filter((p) => p.completed).length / pomodoro.length) * 100) : 0}%</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Task Completion</span>
                    <span className="stat-value">{completionRate}%</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Current Streak</span>
                    <span className="stat-value">{streak} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "achievements" && (
        <div className="achievement-grid">
          {achievements.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
              <div className="empty-state-icon" aria-hidden="true">🏆</div>
              <div className="empty-state-title">No achievements yet</div>
              <div className="empty-state-desc">Complete tasks and study sessions to earn achievements.</div>
            </div>
          ) : achievements.map((a) => (
            <div key={a.id} className={`achievement-card ${a.unlocked ? "unlocked" : "locked"}`}>
              <div className="achievement-icon">{a.icon}</div>
              <div className="achievement-info">
                <div className="achievement-name">{a.title}</div>
                <div className="achievement-desc">{a.description}</div>
                {a.unlocked && a.unlockedAt && <div className="achievement-date">Unlocked {format(new Date(a.unlockedAt), "MMM d")}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
