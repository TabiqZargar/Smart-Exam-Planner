import { useMemo } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import type { Exam, StudySession, Task, UserStats, StudyPlan, PomodoroSession, AttendanceSubject, AttendanceRecord, Course, Assignment, ExamCountdown } from "../../types";
import { daysUntil, formatDate, getGradeColor, calculateLevel } from "../../utils/helpers";

interface DashboardProps {
  exams: Exam[];
  sessions: StudySession[];
  tasks: Task[];
  stats: UserStats;
  plans: StudyPlan[];
  pomodoros: PomodoroSession[];
  attendanceSubjects: AttendanceSubject[];
  attendanceRecords: AttendanceRecord[];
  courses: Course[];
  assignments: Assignment[];
  examCountdowns: ExamCountdown[];
  onNavigate: (page: string) => void;
}

export default function Dashboard({ exams, sessions, tasks, stats, plans, pomodoros, attendanceSubjects, attendanceRecords, courses, assignments, examCountdowns, onNavigate }: DashboardProps) {
  const today = format(new Date(), "yyyy-MM-dd");

  const upcomingExams = useMemo(() =>
    exams.filter((e) => daysUntil(e.date) >= 0).sort((a, b) => daysUntil(a.date) - daysUntil(b.date)).slice(0, 3),
  [exams]);

  const todaySessions = useMemo(() => sessions.filter((s) => s.date === today), [sessions, today]);
  const todayPomodoro = useMemo(() => pomodoros.filter((p) => p.date === today), [pomodoros, today]);
  const pendingTasks = useMemo(() => tasks.filter((t) => !t.completed).slice(0, 5), [tasks]);

  const weekDates = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, []);

  const weekHours = useMemo(() =>
    weekDates.map((d) => {
      const ds = format(d, "yyyy-MM-dd");
      return sessions.filter((s) => s.date === ds).reduce((sum, s) => sum + s.duration, 0);
    }),
  [weekDates, sessions]);

  const maxWeekHours = Math.max(...weekHours, 1);
  const activePlan = plans[plans.length - 1];
  const planProgress = activePlan ? Math.round((activePlan.days.filter((d) => d.completed).length / activePlan.days.length) * 100) : 0;
  const xpProgress = stats.level > 1 ? ((stats.xp - (stats.level - 1) * (stats.level - 1) * 100) / (stats.level * stats.level * 100 - (stats.level - 1) * (stats.level - 1) * 100)) * 100 : Math.min((stats.xp / 100) * 100, 100);
  const taskCompletion = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div>
      <div className="welcome-banner">
        <h1 className="welcome-title">Ready to compile knowledge?</h1>
        <p className="welcome-subtitle">
          {upcomingExams.length > 0
            ? `// ${upcomingExams.length} pending exam${upcomingExams.length === 1 ? "" : "s"} in queue`
            : "// No exams scheduled. Initialize study pipeline."}
        </p>
        <div className="welcome-streak">
          <span aria-hidden="true">⤷</span>
          <span>streak: {stats.streak}d</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>lv.{stats.level}</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>xp: {stats.xp}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate("studylog")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onNavigate("studylog")} aria-label="View study log">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--accent-soft)" }} aria-hidden="true">📚</div>
            <span className="badge badge-accent">{todaySessions.length} today</span>
          </div>
          <div className="stat-card-value" style={{ color: "var(--accent)" }}>{Math.round(stats.totalStudyHours)}h</div>
          <div className="stat-card-label">study_hours</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate("pomodoro")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onNavigate("pomodoro")} aria-label="View focus timer">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--success-soft)" }} aria-hidden="true">⏱️</div>
            <span className="badge badge-success">{todayPomodoro.length} today</span>
          </div>
          <div className="stat-card-value" style={{ color: "var(--secondary)" }}>{stats.totalFocusSessions}</div>
          <div className="stat-card-label">focus_sessions</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate("tasks")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onNavigate("tasks")} aria-label="View tasks">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--warning-soft)" }} aria-hidden="true">✅</div>
            <span className="badge badge-warning">{pendingTasks.length} pending</span>
          </div>
          <div className="stat-card-value" style={{ color: "var(--warning)" }}>{taskCompletion}%</div>
          <div className="stat-card-label">task_completion</div>
        </div>

        <div className="stat-card" aria-label="Exam readiness">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--danger-soft)" }} aria-hidden="true">📋</div>
            <span className="badge badge-accent">{upcomingExams.length} exams</span>
          </div>
          <div className="stat-card-value" style={{ color: getGradeColor(planProgress) }}>{planProgress}%</div>
          <div className="stat-card-label">plan_readiness</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate("attendance")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onNavigate("attendance")} aria-label="View attendance">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--accent-soft)" }} aria-hidden="true">◈</div>
          </div>
          <div className="stat-card-value" style={{ color: "var(--accent)", fontSize: "1.1rem" }}>
            {attendanceRecords.length > 0 ? `${Math.round((attendanceRecords.filter((r) => r.status !== "absent").length / attendanceRecords.length) * 100)}%` : "N/A"}
          </div>
          <div className="stat-card-label">attendance</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate("gpa")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onNavigate("gpa")} aria-label="View GPA">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--success-soft)" }} aria-hidden="true">∑</div>
          </div>
          <div className="stat-card-value" style={{ color: "var(--success)", fontSize: "1.1rem" }}>
            {(() => {
              const totalCred = courses.reduce((s, c) => s + c.credits, 0);
              const totalPts = courses.reduce((s, c) => s + c.credits * ({ "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0 }[c.grade] || 0), 0);
              return totalCred > 0 ? totalPts / totalCred : "N/A";
            })()}
          </div>
          <div className="stat-card-label">gpa</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate("assignments")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onNavigate("assignments")} aria-label="View assignments">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--warning-soft)" }} aria-hidden="true">⊡</div>
            <span className="badge badge-warning">{assignments.filter((a) => !a.completed).length} pending</span>
          </div>
          <div className="stat-card-value" style={{ color: "var(--warning)", fontSize: "1.1rem" }}>{assignments.length}</div>
          <div className="stat-card-label">assignments</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate("examcountdown")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onNavigate("examcountdown")} aria-label="View exam countdowns">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--danger-soft)" }} aria-hidden="true">⏱</div>
            <span className="badge badge-accent">{examCountdowns.length} exams</span>
          </div>
          <div className="stat-card-value" style={{ color: "var(--secondary)", fontSize: "1.1rem" }}>
            {examCountdowns.length > 0 ? `${Math.max(0, Math.ceil((new Date(Math.min(...examCountdowns.map((e) => new Date(e.date).getTime()))).getTime() - Date.now()) / (1000*60*60*24)))}d` : "N/A"}
          </div>
          <div className="stat-card-label">next_exam</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate("studyanalytics")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onNavigate("studyanalytics")} aria-label="View study analytics">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--accent-soft)" }} aria-hidden="true">⬒</div>
          </div>
          <div className="stat-card-value" style={{ color: "var(--accent)", fontSize: "1.1rem" }}>
            {(() => { const w = sessions.filter((s) => { const d = new Date(s.date); const now = new Date(); const start = startOfWeek(now, { weekStartsOn: 1 }); return d >= start && d <= endOfWeek(now, { weekStartsOn: 1 }); }); return `${Math.round(w.reduce((sum, s) => sum + s.duration, 0) / 60 * 10) / 10}h`; })()}
          </div>
          <div className="stat-card-label">this_week</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass">
          <div className="glass-header">
            <span className="glass-title">weekly_tracker</span>
            <span className="glass-subtitle">{Math.round(weekHours.reduce((a, b) => a + b, 0))}h total</span>
          </div>
          <div className="chart-container">
            <div className="chart-bars" style={{ height: 100 }}>
              {weekHours.map((h, i) => (
                <div key={i} className="chart-bar" style={{ height: `${(h / maxWeekHours) * 100}%`, minHeight: 4 }} role="img" aria-label={`${h} hours on ${format(weekDates[i], "EEEE")}`}>
                  <span className="chart-bar-value">{h}h</span>
                  <span className="chart-bar-label">{format(weekDates[i], "EEE")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass">
          <div className="glass-header">
            <span className="glass-title">exam_queue</span>
            <button className="btn btn-sm btn-ghost" onClick={() => onNavigate("exams")} aria-label="View all exams">view all</button>
          </div>
          <div className="glass-body">
            {upcomingExams.length === 0 ? (
              <div className="empty-state" style={{ padding: "1.5rem 0" }}>
                <div className="empty-state-icon" style={{ fontSize: "2rem" }}>📋</div>
                <div className="empty-state-title" style={{ fontSize: "0.9rem" }}>No exams yet</div>
                <div className="empty-state-desc" style={{ fontSize: "0.78rem" }}>Add an exam to see your countdowns.</div>
              </div>
            ) : upcomingExams.map((exam) => (
              <div key={exam.id} className="subject-progress-item" style={{ cursor: "pointer" }} onClick={() => onNavigate("exams")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onNavigate("exams")}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: exam.color, flexShrink: 0 }} aria-hidden="true" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>{exam.title}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.05rem" }}>{exam.subject}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="countdown" style={{ fontSize: "1.1rem", color: daysUntil(exam.date) <= 7 ? "var(--danger)" : "var(--text)" }}>
                    {daysUntil(exam.date)}d
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{formatDate(exam.date, "MMM d")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass">
          <div className="glass-header">
            <span className="glass-title">active_tasks</span>
            <button className="btn btn-sm btn-ghost" onClick={() => onNavigate("tasks")} aria-label="Manage tasks">view all</button>
          </div>
          <div className="glass-body" style={{ padding: "0.35rem 0.75rem" }}>
            {pendingTasks.length === 0 ? (
              <div className="empty-state" style={{ padding: "1.5rem 0" }}>
                <div className="empty-state-icon" style={{ fontSize: "2rem" }}>✅</div>
                <div className="empty-state-title" style={{ fontSize: "0.9rem" }}>All done!</div>
                <div className="empty-state-desc" style={{ fontSize: "0.78rem" }}>No pending tasks. Great work!</div>
              </div>
            ) : pendingTasks.map((task) => (
              <div key={task.id} className="task-item" style={{ margin: 0, padding: "0.5rem 0.65rem", border: "none", background: "transparent" }}>
                <div className="task-check" aria-hidden="true" />
                <div className="task-content">
                  <div className="task-title" style={{ fontSize: "0.8rem" }}>{task.title}</div>
                </div>
                <span className={`badge ${
                  task.priority === "critical" ? "badge-danger" :
                  task.priority === "high" ? "badge-warning" :
                  "badge-accent"
                }`} style={{ fontSize: "0.62rem" }}>{task.priority}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass">
          <div className="glass-header">
            <span className="glass-title">streak_tracker</span>
            <span className="glass-subtitle">best: {stats.longestStreak}d</span>
          </div>
          <div className="streak-display">
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <span className="streak-fire" aria-hidden="true">🔥</span>
              <span className="streak-count">{stats.streak}</span>
              <span className="streak-label">day streak</span>
            </div>
            <div className="streak-days" role="list" aria-label="Last 7 days study activity">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const ds = format(d, "yyyy-MM-dd");
                const studied = sessions.some((s) => s.date === ds);
                const isToday = i === 6;
                return (
                  <div
                    key={i}
                    className={`streak-day ${studied ? "active" : ""} ${isToday ? "today" : ""}`}
                    role="listitem"
                    aria-label={`${format(d, "EEEE")}${studied ? " — studied" : " — no study"}${isToday ? " (today)" : ""}`}
                    title={format(d, "EEEE")}
                  >
                    {format(d, "EEE").charAt(0)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
