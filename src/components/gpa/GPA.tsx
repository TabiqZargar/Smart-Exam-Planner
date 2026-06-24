import { useState, useMemo } from "react";
import { generateId } from "../../utils/helpers";
import type { Course, Grade } from "../../types";

interface GPAProps {
  courses: Course[];
  onAddCourse: (c: Course) => void;
  onDeleteCourse: (id: string) => void;
}

const GRADE_POINTS: Record<Grade, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "F": 0.0,
};

const GRADES: Grade[] = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"];

export default function GPA({ courses, onAddCourse, onDeleteCourse }: GPAProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [credits, setCredits] = useState(3);
  const [grade, setGrade] = useState<Grade>("B");
  const [semester, setSemester] = useState(1);

  const resetForm = () => {
    setName(""); setCredits(3); setGrade("B"); setSemester(1); setShowForm(false);
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    onAddCourse({ id: generateId(), name: name.trim(), credits, grade, semester });
    resetForm();
  };

  const semesters = useMemo(() => {
    const semSet = new Set(courses.map((c) => c.semester));
    return Array.from(semSet).sort((a, b) => a - b);
  }, [courses]);

  const cgpa = useMemo(() => {
    const totalCredits = courses.reduce((s, c) => s + c.credits, 0);
    const totalPoints = courses.reduce((s, c) => s + c.credits * GRADE_POINTS[c.grade], 0);
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }, [courses]);

  const semesterGpas = useMemo(() => {
    return semesters.map((sem) => {
      const semCourses = courses.filter((c) => c.semester === sem);
      const totalCredits = semCourses.reduce((s, c) => s + c.credits, 0);
      const totalPoints = semCourses.reduce((s, c) => s + c.credits * GRADE_POINTS[c.grade], 0);
      return { semester: sem, gpa: totalCredits > 0 ? totalPoints / totalCredits : 0, courses: semCourses.length };
    });
  }, [courses, semesters]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">GPA Calculator</h1>
          <p className="page-subtitle">{courses.length} courses · CGPA: {cgpa.toFixed(2)}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Course</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--accent-soft)" }} aria-hidden="true">📊</div>
          </div>
          <div className="stat-card-value" style={{ color: "var(--accent)", fontSize: "2rem" }}>{cgpa.toFixed(2)}</div>
          <div className="stat-card-label">CGPA</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--success-soft)" }} aria-hidden="true">📚</div>
          </div>
          <div className="stat-card-value" style={{ color: "var(--success)", fontSize: "2rem" }}>{courses.length}</div>
          <div className="stat-card-label">Total Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--warning-soft)" }} aria-hidden="true">🎓</div>
          </div>
          <div className="stat-card-value" style={{ color: "var(--warning)", fontSize: "2rem" }}>{semesters.length}</div>
          <div className="stat-card-label">Semesters</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: "var(--danger-soft)" }} aria-hidden="true">📋</div>
          </div>
          <div className="stat-card-value" style={{ color: "var(--secondary)", fontSize: "2rem" }}>{courses.reduce((s, c) => s + c.credits, 0)}</div>
          <div className="stat-card-label">Total Credits</div>
        </div>
      </div>

      {showForm && (
        <div className="glass" style={{ marginBottom: "1rem" }}>
          <div className="glass-header">
            <span className="glass-title">add_course</span>
            <button className="topbar-btn" onClick={resetForm} style={{ width: 32, height: 32, border: "none" }}>✕</button>
          </div>
          <div className="glass-body">
            <div className="input-group">
              <label className="input-label" htmlFor="course-name">Course Name</label>
              <input id="course-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Calculus I" />
            </div>
            <div className="flex gap-2">
              <div className="input-group">
                <label className="input-label" htmlFor="course-credits">Credits</label>
                <input id="course-credits" type="number" className="input" min={1} max={6} value={credits} onChange={(e) => setCredits(Math.max(1, Number(e.target.value)))} />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="course-grade">Grade</label>
                <select id="course-grade" className="input" value={grade} onChange={(e) => setGrade(e.target.value as Grade)}>
                  {GRADES.map((g) => <option key={g} value={g}>{g} ({GRADE_POINTS[g].toFixed(1)})</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="course-semester">Semester</label>
                <input id="course-semester" type="number" className="input" min={1} max={12} value={semester} onChange={(e) => setSemester(Math.max(1, Number(e.target.value)))} />
              </div>
            </div>
            <button className="btn btn-primary mt-2" onClick={handleAdd}>Add Course</button>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {semesterGpas.map((sg) => (
          <div key={sg.semester} className="glass">
            <div className="glass-header">
              <span className="glass-title">semester_{sg.semester}</span>
              <span className="glass-subtitle">{sg.courses} courses</span>
            </div>
            <div className="glass-body" style={{ padding: "0.75rem 1rem" }}>
              <div className="stat-card-value" style={{ color: "var(--accent)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>{sg.gpa.toFixed(2)}</div>
              {courses.filter((c) => c.semester === sg.semester).map((c) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.3rem 0", borderBottom: "1px solid var(--card-border)" }}>
                  <div>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)" }}>{c.name}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{c.credits} cr</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span className={`badge ${GRADE_POINTS[c.grade] >= 3.7 ? "badge-success" : GRADE_POINTS[c.grade] >= 2.7 ? "badge-accent" : GRADE_POINTS[c.grade] >= 1.7 ? "badge-warning" : "badge-danger"}`}>{c.grade}</span>
                    <button className="btn btn-sm btn-ghost" onClick={() => onDeleteCourse(c.id)} aria-label={`Delete ${c.name}`}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">📊</div>
          <div className="empty-state-title">No courses yet</div>
          <div className="empty-state-desc">Add courses with grades to calculate your GPA.</div>
        </div>
      )}
    </div>
  );
}
