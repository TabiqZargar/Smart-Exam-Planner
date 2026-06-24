import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { generateId } from "../../utils/helpers";
import type { ExamCountdown } from "../../types";

interface ExamCountdownProps {
  exams: ExamCountdown[];
  onAddExam: (e: ExamCountdown) => void;
  onDeleteExam: (id: string) => void;
}

const EXAM_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"];

export default function ExamCountdown({ exams, onAddExam, onDeleteExam }: ExamCountdownProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", date: "", time: "" });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const resetForm = () => {
    setForm({ title: "", subject: "", date: "", time: "" });
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.date) return;
    const color = EXAM_COLORS[exams.length % EXAM_COLORS.length];
    onAddExam({ id: generateId(), title: form.title.trim(), subject: form.subject.trim(), date: form.date, time: form.time, color, createdAt: new Date().toISOString() });
    resetForm();
  };

  const sortedExams = useMemo(() => {
    return [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exams]);

  const liveCountdowns = useMemo(() => {
    return sortedExams.map((e) => {
      const examDateTime = new Date(`${e.date}T${e.time || "00:00"}`);
      const diff = examDateTime.getTime() - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return { ...e, days, hours, minutes, seconds, diff, examDateTime };
    });
  }, [sortedExams, now]);

  const upcoming = liveCountdowns.filter((e) => e.diff > 0);
  const passed = liveCountdowns.filter((e) => e.diff <= 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Exam Countdown</h1>
          <p className="page-subtitle">{upcoming.length} upcoming · {passed.length} completed</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>+ Add Exam</button>
        </div>
      </div>

      {showForm && (
        <div className="glass" style={{ marginBottom: "1rem" }}>
          <div className="glass-header">
            <span className="glass-title">new_exam_countdown</span>
            <button className="topbar-btn" onClick={resetForm} style={{ width: 32, height: 32, border: "none" }}>✕</button>
          </div>
          <div className="glass-body">
            <div className="input-group">
              <label className="input-label" htmlFor="exam-title">Exam Title</label>
              <input id="exam-title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Final Exam" />
            </div>
            <div className="flex gap-2">
              <div className="input-group">
                <label className="input-label" htmlFor="exam-subject">Subject</label>
                <input id="exam-subject" className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="exam-time">Time</label>
                <input id="exam-time" type="time" className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="exam-date">Date</label>
              <input id="exam-date" type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <button className="btn btn-primary mt-2" onClick={handleSave}>Add Exam</button>
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="stats-grid">
          {upcoming.slice(0, 3).map((e) => (
            <div key={e.id} className="stat-card" style={{ textAlign: "center", borderTop: `3px solid ${e.color}` }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>{e.title}</div>
              {e.subject && <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>{e.subject}</div>}
              <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: e.days <= 7 ? "var(--danger)" : "var(--accent)", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
                {e.days > 0
                  ? `${e.days}d ${e.hours}h ${e.minutes}m ${e.seconds}s`
                  : `${e.hours}h ${e.minutes}m ${e.seconds}s`}
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {format(new Date(e.examDateTime), "MMM d, yyyy")} {e.time && `at ${e.time}`}
              </div>
              <button className="btn btn-sm btn-ghost" style={{ marginTop: "0.35rem" }} onClick={() => onDeleteExam(e.id)}>🗑️</button>
            </div>
          ))}
        </div>
      )}

      <div className="page-header" style={{ marginTop: "1.5rem" }}>
        <h2 className="page-title">All Exams</h2>
      </div>

      <div className="task-list">
        {liveCountdowns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">⏰</div>
            <div className="empty-state-title">No exams added</div>
            <div className="empty-state-desc">Add an exam to see your live countdowns.</div>
          </div>
        ) : liveCountdowns.map((e) => (
          <div key={e.id} className="task-item" style={{ margin: 0 }}>
            <div style={{ width: 4, height: 40, borderRadius: 2, background: e.color, flexShrink: 0 }} aria-hidden="true" />
            <div className="task-content">
              <div className="task-title">{e.title}</div>
              {e.subject && <div className="task-desc">{e.subject}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: e.diff <= 0 ? "var(--text-muted)" : e.days <= 7 ? "var(--danger)" : "var(--text)", letterSpacing: "-0.02em" }}>
                {e.diff <= 0 ? "Done!" : `${e.days}d ${String(e.hours).padStart(2, "0")}:${String(e.minutes).padStart(2, "0")}:${String(e.seconds).padStart(2, "0")}`}
              </div>
              <div style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{format(new Date(e.date), "MMM d")}{e.time ? ` ${e.time}` : ""}</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => onDeleteExam(e.id)}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}
