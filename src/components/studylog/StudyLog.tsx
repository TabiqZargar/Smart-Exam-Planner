import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { generateId } from "../../utils/helpers";
import type { StudySession, Subject } from "../../types";

interface StudyLogProps {
  sessions: StudySession[];
  subjects: Subject[];
  onAddSession: (s: StudySession) => void;
  onDeleteSession: (id: string) => void;
}

export default function StudyLog({ sessions, subjects, onAddSession, onDeleteSession }: StudyLogProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: subjects[0]?.name || "", duration: 60, notes: "", productivity: 3 as 1 | 2 | 3 | 4 | 5, mood: "good" as "great" | "good" | "okay" | "bad" | "tired" });

  const today = format(new Date(), "yyyy-MM-dd");
  const weekDates = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, []);

  const todaySessions = useMemo(() => sessions.filter((s) => s.date === today).sort((a, b) => b.duration - a.duration), [sessions, today]);
  const weekSessions = useMemo(() => sessions.filter((s) => weekDates.map((d) => format(d, "yyyy-MM-dd")).includes(s.date)), [sessions, weekDates]);
  const totalWeekHours = Math.round(weekSessions.reduce((s, s2) => s + s2.duration, 0) / 60 * 10) / 10;
  const recentSessions = useMemo(() => [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20), [sessions]);

  const handleSave = () => {
    if (!form.subject) return;
    onAddSession({ id: generateId(), date: today, subject: form.subject, duration: form.duration, notes: form.notes, productivity: form.productivity, mood: form.mood, completed: true });
    setForm({ subject: subjects[0]?.name || "", duration: 60, notes: "", productivity: 3, mood: "good" });
    setShowForm(false);
  };

  const MOOD_EMOJIS: Record<string, string> = { great: "😄", good: "🙂", okay: "😐", bad: "😞", tired: "😴" };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Study Log</h1>
        <p className="page-subtitle">{sessions.length} sessions · {Math.round(sessions.reduce((s, s2) => s + s2.duration, 0) / 60)}h logged</p>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} aria-label={showForm ? "Cancel" : "Log a study session"}>
            {showForm ? "Cancel" : "+ Log Session"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass" style={{ marginBottom: "1rem" }}>
          <div className="glass-header"><span className="glass-title">log_session</span></div>
          <div className="glass-body">
            <div className="input-group">
              <label className="input-label" htmlFor="log-subject">Subject</label>
              <select id="log-subject" className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                {subjects.map((s) => <option key={s.id} value={s.name}>{s.icon} {s.name}</option>)}
                <option value="General">📚 General</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="log-duration">Duration (minutes)</label>
              <input id="log-duration" type="number" className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} min={1} max={600} />
            </div>
            <div className="input-group">
              <label className="input-label">Productivity</label>
              <div className="flex gap-1" role="radiogroup" aria-label="Productivity rating">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button key={v} className={`btn btn-sm ${form.productivity === v ? "btn-primary" : "btn-secondary"}`} onClick={() => setForm({ ...form, productivity: v as any })} aria-pressed={form.productivity === v}>{v}</button>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Mood</label>
              <div className="flex gap-1" role="radiogroup" aria-label="Study mood">
                {(["great", "good", "okay", "bad", "tired"] as const).map((m) => (
                  <button key={m} className={`btn btn-sm ${form.mood === m ? "btn-primary" : "btn-secondary"}`} onClick={() => setForm({ ...form, mood: m })} aria-pressed={form.mood === m}>
                    {MOOD_EMOJIS[m]} {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="log-notes">Notes</label>
              <textarea id="log-notes" className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="What did you study?" />
            </div>
            <button className="btn btn-primary mt-2" onClick={handleSave}>Log Session</button>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="glass">
          <div className="glass-header">
            <span className="glass-title">today</span>
            <span className="glass-subtitle">{Math.round(todaySessions.reduce((s, s2) => s + s2.duration, 0) / 60 * 10) / 10}h</span>
          </div>
          <div className="glass-body" style={{ padding: "0.35rem 0.75rem" }}>
            {todaySessions.length === 0 ? (
              <div className="empty-state" style={{ padding: "1.25rem 0" }}>
                <div className="empty-state-icon" style={{ fontSize: "1.8rem" }}>📝</div>
                <div className="empty-state-title" style={{ fontSize: "0.85rem" }}>No sessions today</div>
              </div>
            ) : todaySessions.map((s) => (
              <div key={s.id} className="session-item" style={{ border: "none", padding: "0.45rem 0" }}>
                <span className="session-subject" style={{ fontSize: "0.78rem" }}>{s.subject}</span>
                <span className="session-duration">{formatDuration(s.duration)}</span>
                <span className="session-notes">{s.notes}</span>
                <span className="session-mood" aria-label={`Mood: ${s.mood}`}>{MOOD_EMOJIS[s.mood]}</span>
                <button className="btn btn-sm btn-ghost" onClick={() => onDeleteSession(s.id)} aria-label="Delete session" style={{ fontSize: "0.7rem" }}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass">
          <div className="glass-header">
            <span className="glass-title">this_week</span>
            <span className="glass-subtitle">{totalWeekHours}h</span>
          </div>
          <div className="chart-container">
            <div className="chart-bars" style={{ height: 100 }}>
              {weekDates.map((d) => {
                const ds = format(d, "yyyy-MM-dd");
                const dayHours = weekSessions.filter((s) => s.date === ds).reduce((s, s2) => s + s2.duration, 0) / 60;
                const maxH = Math.max(...weekDates.map((wd) => weekSessions.filter((s) => s.date === format(wd, "yyyy-MM-dd")).reduce((s, s2) => s + s2.duration, 0) / 60), 1);
                return (
                  <div key={ds} className="chart-bar" style={{ height: `${(dayHours / maxH) * 100}%`, minHeight: 4 }} role="img" aria-label={`${dayHours.toFixed(1)} hours on ${format(d, "EEEE")}`}>
                    <span className="chart-bar-value">{dayHours.toFixed(1)}h</span>
                    <span className="chart-bar-label">{format(d, "EEE")}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="glass">
        <div className="glass-header">
          <span className="glass-title">recent_sessions</span>
          <span className="glass-subtitle">Last 20</span>
        </div>
        {recentSessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">📝</div>
            <div className="empty-state-title">No sessions yet</div>
            <div className="empty-state-desc">Start logging your study sessions to track progress.</div>
          </div>
        ) : (
          <div className="session-list">
            {recentSessions.map((s) => (
              <div key={s.id} className="session-item">
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", minWidth: 80 }}>{format(new Date(s.date), "MMM d")}</span>
                <span className="session-subject">{s.subject}</span>
                <span className="session-duration">{formatDuration(s.duration)}</span>
                <span className="session-notes">{s.notes}</span>
                <span className="session-mood" aria-label={`Mood: ${s.mood}`}>{MOOD_EMOJIS[s.mood]}</span>
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }} aria-label={`Productivity: ${s.productivity}/5`}>{"★".repeat(s.productivity)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
