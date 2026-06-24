import { useMemo, useState } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import type { StudySession } from "../../types";

interface StudyAnalyticsProps {
  sessions: StudySession[];
}

type PeriodTab = "weekly" | "monthly";

export default function StudyAnalytics({ sessions }: StudyAnalyticsProps) {
  const [period, setPeriod] = useState<PeriodTab>("weekly");

  const now = new Date();

  const weekDates = eachDayOfInterval({ start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) });

  const dailyHours = useMemo(() => {
    return weekDates.map((d) => {
      const ds = format(d, "yyyy-MM-dd");
      const daySessions = sessions.filter((s) => s.date === ds);
      const hours = daySessions.reduce((sum, s) => sum + s.duration, 0) / 60;
      return { date: ds, day: format(d, "EEE"), hours: Math.round(hours * 100) / 100 };
    });
  }, [sessions, weekDates]);

  const weeklyData = useMemo(() => {
    const last8Weeks = Array.from({ length: 8 }, (_, i) => subWeeks(now, 7 - i));
    return last8Weeks.map((w) => {
      const start = startOfWeek(w, { weekStartsOn: 1 });
      const end = endOfWeek(w, { weekStartsOn: 1 });
      const weekSessions = sessions.filter((s) => {
        const d = new Date(s.date);
        return d >= start && d <= end;
      });
      const hours = Math.round(weekSessions.reduce((sum, s) => sum + s.duration, 0) / 60 * 10) / 10;
      return { label: `W${format(w, "M/d")}`, hours };
    });
  }, [sessions, now]);

  const monthlyData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));
    return last6Months.map((m) => {
      const start = startOfMonth(m);
      const end = endOfMonth(m);
      const monthSessions = sessions.filter((s) => {
        const d = new Date(s.date);
        return d >= start && d <= end;
      });
      const hours = Math.round(monthSessions.reduce((sum, s) => sum + s.duration, 0) / 60 * 10) / 10;
      return { label: format(m, "MMM"), hours };
    });
  }, [sessions, now]);

  const subjectAnalytics = useMemo(() => {
    const bySubject: Record<string, { hours: number; sessions: number; minutes: number }> = {};
    sessions.forEach((s) => {
      if (!bySubject[s.subject]) bySubject[s.subject] = { hours: 0, sessions: 0, minutes: 0 };
      bySubject[s.subject].minutes += s.duration;
      bySubject[s.subject].hours = Math.round(bySubject[s.subject].minutes / 60 * 10) / 10;
      bySubject[s.subject].sessions += 1;
    });
    return Object.entries(bySubject).sort(([, a], [, b]) => b.hours - a.hours);
  }, [sessions]);

  const totalHours = useMemo(() => Math.round(sessions.reduce((s, se) => s + se.duration, 0) / 60 * 10) / 10, [sessions]);
  const thisWeekHours = useMemo(() => dailyHours.reduce((s, d) => s + d.hours, 0), [dailyHours]);
  const avgDaily = useMemo(() => dailyHours.length > 0 ? Math.round((thisWeekHours / dailyHours.length) * 100) / 100 : 0, [thisWeekHours, dailyHours]);

  const maxChartHours = useMemo(() => {
    const data = period === "weekly" ? weeklyData : monthlyData;
    return Math.max(...data.map((d) => d.hours), 1);
  }, [period, weeklyData, monthlyData]);

  const chartData = period === "weekly" ? weeklyData : monthlyData;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Study Analytics</h1>
          <p className="page-subtitle">{totalHours}h total · {sessions.length} sessions</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--accent-soft)" }} aria-hidden="true">📚</div>
          </div>
          <div className="stat-card-value" style={{ color: "var(--accent)" }}>{totalHours}h</div>
          <div className="stat-card-label">Total Study Hours</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--success-soft)" }} aria-hidden="true">📅</div>
          </div>
          <div className="stat-card-value" style={{ color: "var(--success)" }}>{thisWeekHours.toFixed(1)}h</div>
          <div className="stat-card-label">This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--warning-soft)" }} aria-hidden="true">📊</div>
          </div>
          <div className="stat-card-value" style={{ color: "var(--warning)" }}>{avgDaily.toFixed(1)}h</div>
          <div className="stat-card-label">Avg Daily</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--danger-soft)" }} aria-hidden="true">🎯</div>
          </div>
          <div className="stat-card-value" style={{ color: "var(--secondary)" }}>{sessions.length}</div>
          <div className="stat-card-label">Sessions</div>
        </div>
      </div>

      <div className="glass" style={{ marginBottom: "1rem" }}>
        <div className="glass-header">
          <span className="glass-title">study_hours_trend</span>
          <div className="tabs" style={{ marginBottom: 0 }}>
            {(["weekly", "monthly"] as PeriodTab[]).map((p) => (
              <button key={p} className={`tab ${period === p ? "active" : ""}`} onClick={() => setPeriod(p)} role="tab" aria-selected={period === p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="chart-container">
          <div className="chart-bars">
            {chartData.map((d, i) => (
              <div key={i} className="chart-bar" style={{ height: `${(d.hours / maxChartHours) * 100}%`, minHeight: 4 }} role="img" aria-label={`${d.hours}h on ${d.label}`}>
                <span className="chart-bar-value">{d.hours.toFixed(1)}h</span>
                <span className="chart-bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass">
          <div className="glass-header">
            <span className="glass-title">daily_logs</span>
            <span className="glass-subtitle">this week</span>
          </div>
          <div className="glass-body" style={{ padding: "0.5rem 0.75rem" }}>
            {dailyHours.map((d) => (
              <div key={d.date} className="session-item" style={{ padding: "0.35rem 0.5rem" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, minWidth: 40 }}>{d.day}</span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{format(new Date(d.date), "MMM d")}</span>
                <span style={{ marginLeft: "auto", fontSize: "0.78rem", fontWeight: 600, color: d.hours > 0 ? "var(--accent)" : "var(--text-muted)" }}>{d.hours.toFixed(1)}h</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass">
          <div className="glass-header">
            <span className="glass-title">subject_wise</span>
            <span className="glass-subtitle">{subjectAnalytics.length} subjects</span>
          </div>
          <div className="chart-container">
            {subjectAnalytics.length === 0 ? (
              <div className="empty-state" style={{ padding: "1rem 0" }}>
                <div className="empty-state-title" style={{ fontSize: "0.85rem" }}>No data yet</div>
              </div>
            ) : subjectAnalytics.map(([subject, data], i) => {
              const pct = totalHours > 0 ? (data.hours / totalHours) * 100 : 0;
              const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#f97316", "#eab308"];
              return (
                <div key={subject} style={{ marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "0.15rem" }}>
                    <span style={{ color: "var(--text)", fontWeight: 600 }}>{subject}</span>
                    <span style={{ color: "var(--text-muted)" }}>{data.hours}h · {data.sessions} sessions</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
