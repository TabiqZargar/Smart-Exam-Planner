import { useState, useMemo } from "react";
import { daysUntil, formatDate, generateId, EXAM_COLORS } from "../../utils/helpers";
import { generateSchedule } from "../../utils/schedule";
import type { Exam, Subject, StudyPlan } from "../../types";

interface ExamsProps {
  exams: Exam[];
  subjects: Subject[];
  plans: StudyPlan[];
  onAddExam: (exam: Exam) => void;
  onUpdateExam: (id: string, exam: Partial<Exam>) => void;
  onDeleteExam: (id: string) => void;
  onAddPlan: (plan: StudyPlan) => void;
  onAddSubject: (subject: Subject) => void;
}

const DIFFICULTIES = [1, 2, 3, 4, 5] as const;
const PRIORITIES = ["low", "medium", "high", "critical"] as const;

export default function Exams({ exams, subjects, plans, onAddExam, onUpdateExam, onDeleteExam, onAddPlan, onAddSubject }: ExamsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState<string | null>(null);
  const [showSubjectForm, setShowSubjectForm] = useState(false);

  const [form, setForm] = useState({
    title: "", subject: "", date: "", difficulty: 3 as 1 | 2 | 3 | 4 | 5,
    priority: "medium" as "low" | "medium" | "high" | "critical",
    syllabus: 100, completedSyllabus: 0, notes: "", color: "#6366f1",
  });

  const [scheduleForm, setScheduleForm] = useState({ dailyHours: 4, cramMode: false });
  const [subjectForm, setSubjectForm] = useState({ name: "", color: "#6366f1", icon: "📚" });

  const sortedExams = useMemo(() => [...exams].sort((a, b) => daysUntil(a.date) - daysUntil(b.date)), [exams]);

  const resetForm = () => {
    setForm({ title: "", subject: "", date: "", difficulty: 3, priority: "medium", syllabus: 100, completedSyllabus: 0, notes: "", color: "#6366f1" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.date) return;
    if (editingId) onUpdateExam(editingId, form);
    else onAddExam({ ...form, id: generateId(), createdAt: new Date().toISOString() });
    resetForm();
  };

  const handleEdit = (exam: Exam) => {
    setForm({ title: exam.title, subject: exam.subject, date: exam.date, difficulty: exam.difficulty, priority: exam.priority, syllabus: exam.syllabus, completedSyllabus: exam.completedSyllabus, notes: exam.notes, color: exam.color });
    setEditingId(exam.id);
    setShowForm(true);
  };

  const handleGenerate = (exam: Exam) => {
    const plan = generateSchedule({
      exam, subjects: subjects.map((s) => ({ name: s.name, difficulty: form.difficulty })),
      dailyHours: scheduleForm.dailyHours, cramMode: scheduleForm.cramMode,
    });
    onAddPlan(plan);
    setShowSchedule(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Exams</h1>
        <p className="page-subtitle">{exams.length} exam{exams.length !== 1 ? "s" : ""} in pipeline</p>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }} aria-label="Add new exam">+ New Exam</button>
          <button className="btn btn-secondary" onClick={() => setShowSubjectForm(!showSubjectForm)} aria-label={showSubjectForm ? "Close subject form" : "Add a subject"}>
            {showSubjectForm ? "Done" : "+ Add Subject"}
          </button>
        </div>
      </div>

      {showSubjectForm && (
        <div className="glass" style={{ marginBottom: "1rem" }}>
          <div className="glass-body">
            <div className="input-group">
              <label className="input-label" htmlFor="subject-name">Subject Name</label>
              <input id="subject-name" className="input" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} placeholder="e.g. Mathematics" />
            </div>
            <div className="flex gap-2 items-center">
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label" htmlFor="subject-icon">Icon</label>
                <input id="subject-icon" className="input" value={subjectForm.icon} onChange={(e) => setSubjectForm({ ...subjectForm, icon: e.target.value })} placeholder="📐" />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label" htmlFor="subject-color">Color</label>
                <input id="subject-color" type="color" className="input" style={{ height: 40, padding: 4 }} value={subjectForm.color} onChange={(e) => setSubjectForm({ ...subjectForm, color: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary btn-sm mt-2" onClick={() => {
              if (subjectForm.name.trim()) { onAddSubject({ ...subjectForm, id: generateId() }); setSubjectForm({ name: "", color: "#6366f1", icon: "📚" }); }
            }} aria-label="Add this subject">Add Subject</button>
            {subjects.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.65rem" }}>
                {subjects.map((s) => (
                  <span key={s.id} className="badge badge-accent" style={{ fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}>
                    {s.icon} {s.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="glass" style={{ marginBottom: "1rem" }}>
          <div className="glass-header">
            <span className="glass-title">{editingId ? "edit_exam" : "new_exam"}</span>
            <button className="topbar-btn" onClick={resetForm} aria-label="Close form" style={{ width: 32, height: 32, fontSize: "1rem", border: "none" }}>✕</button>
          </div>
          <div className="glass-body">
            <div className="input-group">
              <label className="input-label" htmlFor="exam-title">Exam Title</label>
              <input id="exam-title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Final Mathematics Exam" />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="exam-subject">Subject</label>
              <input id="exam-subject" className="input" list="subjects-list" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject name" />
              <datalist id="subjects-list">{subjects.map((s) => <option key={s.id} value={s.name} />)}</datalist>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="exam-date">Exam Date</label>
              <input id="exam-date" type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <div className="input-group" role="radiogroup" aria-label="Difficulty level">
                <label className="input-label">Difficulty</label>
                <div className="flex gap-1">
                  {DIFFICULTIES.map((d) => (
                    <button key={d} className={`btn btn-sm ${form.difficulty === d ? "btn-primary" : "btn-secondary"}`} onClick={() => setForm({ ...form, difficulty: d })} aria-pressed={form.difficulty === d} aria-label={`Difficulty ${d}`}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="exam-priority">Priority</label>
                <select id="exam-priority" className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="input-group">
                <label className="input-label" htmlFor="exam-syllabus">Syllabus Topics</label>
                <input id="exam-syllabus" type="number" className="input" value={form.syllabus} onChange={(e) => setForm({ ...form, syllabus: Number(e.target.value) })} min={1} />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="exam-completed">Completed</label>
                <input id="exam-completed" type="number" className="input" value={form.completedSyllabus} onChange={(e) => setForm({ ...form, completedSyllabus: Number(e.target.value) })} min={0} max={form.syllabus} />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Color</label>
              <div className="flex gap-1" role="radiogroup" aria-label="Exam color">
                {EXAM_COLORS.map((c) => (
                  <button
                    key={c}
                    style={{ width: 26, height: 26, borderRadius: "50%", background: c, cursor: "pointer", border: form.color === c ? "3px solid var(--text)" : "3px solid transparent", outline: "none" }}
                    onClick={() => setForm({ ...form, color: c })}
                    aria-label={`Select color ${c}`}
                    aria-pressed={form.color === c}
                  />
                ))}
              </div>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="exam-notes">Notes</label>
              <textarea id="exam-notes" className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
            <div className="flex gap-2 mt-2">
              <button className="btn btn-primary" onClick={handleSave}>{editingId ? "Update" : "Create"} Exam</button>
              <button className="btn btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="exam-grid">
        {sortedExams.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: "1/-1" }}>
            <div className="empty-state-icon" aria-hidden="true">📋</div>
            <div className="empty-state-title">No exams yet</div>
            <div className="empty-state-desc">Add your first exam to get started with smart scheduling.</div>
            <div className="empty-state-action">
              <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }} aria-label="Add your first exam">+ Add Exam</button>
            </div>
          </div>
        ) : sortedExams.map((exam) => {
          const daysLeft = daysUntil(exam.date);
          const syllabusPct = Math.round((exam.completedSyllabus / exam.syllabus) * 100);
          const hasPlan = plans.find((p) => p.examId === exam.id);
          const isUrgent = daysLeft <= 7;

          return (
            <div key={exam.id} className="exam-card">
              <div className="exam-card-top" style={{ background: exam.color }} aria-hidden="true" />
              <div className="exam-card-body">
                <div className="exam-card-title">{exam.title}</div>
                <div className="exam-card-subject">{exam.subject}</div>
                <div className="exam-card-details">
                  <div className="exam-card-detail">Date<span>{formatDate(exam.date)}</span></div>
                  <div className="exam-card-detail">Days Left<span style={{ color: isUrgent ? "var(--danger)" : "var(--text)", fontWeight: 800 }}>{daysLeft}d</span></div>
                  <div className="exam-card-detail">Difficulty<span>{"⭐".repeat(exam.difficulty)}</span></div>
                  <div className="exam-card-detail">Priority<span className={`badge ${exam.priority === "critical" ? "badge-danger" : exam.priority === "high" ? "badge-warning" : "badge-accent"}`}>{exam.priority}</span></div>
                </div>
                <div>
                  <div className="flex justify-between" style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.15rem" }}>
                    <span>Syllabus: {exam.completedSyllabus}/{exam.syllabus}</span>
                    <span>{syllabusPct}%</span>
                  </div>
                  <div className="syllabus-bar"><div className="syllabus-fill" style={{ width: `${syllabusPct}%`, background: exam.color }} /></div>
                </div>
              </div>
              <div className="exam-card-footer">
                <div className="flex gap-2">
                  <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(exam)} aria-label={`Edit ${exam.title}`}>✏️</button>
                  <button className="btn btn-sm btn-ghost" onClick={() => onDeleteExam(exam.id)} aria-label={`Delete ${exam.title}`}>🗑️</button>
                </div>
                {!hasPlan ? (
                  <button className="btn btn-sm btn-primary" onClick={() => { setShowSchedule(exam.id); setScheduleForm({ dailyHours: 4, cramMode: false }); }} aria-label="Generate study schedule">
                    Generate Schedule
                  </button>
                ) :                   <span className="badge badge-success">scheduled</span>}
              </div>
              {showSchedule === exam.id && (
                <div style={{ padding: "0.875rem 1.25rem", borderTop: "1px solid var(--border)", background: "var(--bg-soft)" }}>
                  <div className="flex gap-2 items-center" style={{ marginBottom: "0.4rem" }}>
                    <div className="input-group" style={{ margin: 0, flex: 1 }}>
                      <label className="input-label" htmlFor="daily-hours">Daily hours</label>
                      <input id="daily-hours" type="number" className="input" style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem" }} value={scheduleForm.dailyHours} onChange={(e) => setScheduleForm({ ...scheduleForm, dailyHours: Number(e.target.value) })} min={1} max={16} />
                    </div>
                    <label className="flex items-center gap-1" style={{ cursor: "pointer", marginTop: "1.1rem" }}>
                      <input type="checkbox" checked={scheduleForm.cramMode} onChange={(e) => setScheduleForm({ ...scheduleForm, cramMode: e.target.checked })} />
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>Cram mode</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-primary" onClick={() => handleGenerate(exam)}>Generate</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => setShowSchedule(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
