import { useState, useMemo } from "react";
import { format } from "date-fns";
import { generateId } from "../../utils/helpers";
import type { AttendanceSubject, AttendanceRecord } from "../../types";

interface AttendanceProps {
  subjects: AttendanceSubject[];
  records: AttendanceRecord[];
  onAddSubject: (s: AttendanceSubject) => void;
  onRecordAttendance: (r: AttendanceRecord) => void;
  onDeleteSubject: (id: string) => void;
}

const SUBJECT_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#f97316", "#eab308"];

export default function Attendance({ subjects, records, onAddSubject, onRecordAttendance, onDeleteSubject }: AttendanceProps) {
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showRecordForm, setShowRecordForm] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  const stats = useMemo(() => {
    return subjects.map((s) => {
      const subjectRecords = records.filter((r) => r.subjectId === s.id);
      const present = subjectRecords.filter((r) => r.status === "present").length;
      const late = subjectRecords.filter((r) => r.status === "late").length;
      const total = subjectRecords.length;
      const attended = present + late;
      const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
      return { ...s, present, late, absent: total - attended, total, attended, pct };
    });
  }, [subjects, records]);

  const overallPct = useMemo(() => {
    const total = stats.reduce((s, a) => s + a.total, 0);
    const attended = stats.reduce((s, a) => s + a.attended, 0);
    return total > 0 ? Math.round((attended / total) * 100) : 0;
  }, [stats]);

  const lowAttendance = useMemo(() => stats.filter((s) => s.total > 0 && s.pct < 75), [stats]);

  const handleAddSubject = () => {
    if (!subjectName.trim()) return;
    const color = SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length];
    onAddSubject({ id: generateId(), name: subjectName.trim(), color, totalClasses: 0, attendedClasses: 0 });
    setSubjectName("");
    setShowSubjectForm(false);
  };

  const handleRecord = (status: "present" | "absent" | "late") => {
    if (!selectedSubject) return;
    const existing = records.find((r) => r.subjectId === selectedSubject && r.date === today);
    if (existing) return;
    onRecordAttendance({ id: generateId(), subjectId: selectedSubject, date: today, status });
    setShowRecordForm(true);
  };

  const todayRecorded = selectedSubject ? records.some((r) => r.subjectId === selectedSubject && r.date === today) : false;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">{overallPct}% overall · {stats.reduce((s, a) => s + a.total, 0)} classes</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowSubjectForm(true)}>+ Add Subject</button>
        </div>
      </div>

      {lowAttendance.length > 0 && (
        <div className="glass" style={{ marginBottom: "1rem", borderColor: "rgba(239,68,68,0.3)" }}>
          <div className="glass-header">
            <span className="glass-title">low_attendance_warning</span>
          </div>
          <div className="glass-body" style={{ padding: "0.75rem 1rem" }}>
            {lowAttendance.map((s) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.25rem 0" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>{s.name}</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--danger)" }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSubjectForm && (
        <div className="glass" style={{ marginBottom: "1rem" }}>
          <div className="glass-header">
            <span className="glass-title">new_subject</span>
            <button className="topbar-btn" onClick={() => setShowSubjectForm(false)} style={{ width: 32, height: 32, border: "none" }}>✕</button>
          </div>
          <div className="glass-body">
            <div className="input-group">
              <label className="input-label" htmlFor="subj-name">Subject Name</label>
              <input id="subj-name" className="input" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Mathematics" />
            </div>
            <button className="btn btn-primary mt-2" onClick={handleAddSubject}>Add Subject</button>
          </div>
        </div>
      )}

      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.id} className="stat-card" onClick={() => setSelectedSubject(s.id)} style={{ cursor: "pointer", borderColor: selectedSubject === s.id ? "var(--accent)" : undefined }}>
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ background: s.color + "20", borderColor: s.color + "40" }} aria-hidden="true">{s.name.charAt(0)}</div>
              <span className={`badge ${s.pct < 75 ? "badge-danger" : s.pct >= 90 ? "badge-success" : "badge-accent"}`}>{s.pct}%</span>
            </div>
            <div className="stat-card-value" style={{ color: s.color, fontSize: "1.1rem" }}>{s.name}</div>
            <div className="stat-card-label">{s.total} classes · {s.attended} attended</div>
          </div>
        ))}
      </div>

      {selectedSubject && (
        <div className="glass" style={{ marginTop: "1rem" }}>
          <div className="glass-header">
            <span className="glass-title">{subjects.find((s) => s.id === selectedSubject)?.name || "Subject"}</span>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {!todayRecorded && !showRecordForm && (
                <>
                  <button className="btn btn-sm btn-primary" onClick={() => handleRecord("present")}>Present</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleRecord("late")}>Late</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleRecord("absent")}>Absent</button>
                </>
              )}
              {showRecordForm && (
                <span className="badge badge-success" style={{ fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}>✓ Recorded</span>
              )}
              <button className="btn btn-sm btn-ghost" onClick={() => { setSelectedSubject(null); setShowRecordForm(false); }}>Close</button>
            </div>
          </div>
          <div className="glass-body">
            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--success)" }}>{stats.find((s) => s.id === selectedSubject)?.present || 0}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>Present</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--warning)" }}>{stats.find((s) => s.id === selectedSubject)?.late || 0}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>Late</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--danger)" }}>{stats.find((s) => s.id === selectedSubject)?.absent || 0}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>Absent</div>
              </div>
            </div>
            <div className="progress-bar" style={{ marginTop: "0.75rem" }}>
              <div className="progress-fill" style={{ width: `${stats.find((s) => s.id === selectedSubject)?.pct || 0}%` }} role="progressbar" aria-valuenow={stats.find((s) => s.id === selectedSubject)?.pct || 0} aria-valuemin={0} aria-valuemax={100} />
            </div>
            <div style={{ textAlign: "center", marginTop: "0.35rem", fontSize: "0.72rem", color: "var(--text-muted)" }}>Overall attendance: {stats.find((s) => s.id === selectedSubject)?.pct || 0}%</div>
          </div>
        </div>
      )}

      <div className="page-header" style={{ marginTop: "1.5rem" }}>
        <h2 className="page-title">Records</h2>
      </div>
      <div className="glass" style={{ padding: "0.75rem" }}>
        {records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">📋</div>
            <div className="empty-state-title">No records yet</div>
            <div className="empty-state-desc">Select a subject and record daily attendance.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {[...records].reverse().slice(0, 30).map((r) => {
              const subj = subjects.find((s) => s.id === r.subjectId);
              return (
                <div key={r.id} className="session-item" style={{ fontSize: "0.78rem" }}>
                  <span style={{ width: 4, height: 24, borderRadius: 2, background: subj?.color || "var(--card-border)", flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, minWidth: 80 }}>{subj?.name || "Unknown"}</span>
                  <span style={{ color: "var(--text-muted)" }}>{format(new Date(r.date), "MMM d")}</span>
                  <span className={`badge ${r.status === "present" ? "badge-success" : r.status === "late" ? "badge-warning" : "badge-danger"}`} style={{ marginLeft: "auto" }}>{r.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
