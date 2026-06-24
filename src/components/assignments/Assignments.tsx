import { useState, useMemo } from "react";
import { format } from "date-fns";
import { generateId } from "../../utils/helpers";
import type { Assignment } from "../../types";

interface AssignmentsProps {
  assignments: Assignment[];
  onAddAssignment: (a: Assignment) => void;
  onToggleAssignment: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
}

export default function Assignments({ assignments, onAddAssignment, onToggleAssignment, onDeleteAssignment }: AssignmentsProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", description: "", dueDate: "", priority: "medium" as "low" | "medium" | "high" | "critical" });

  const today = format(new Date(), "yyyy-MM-dd");

  const upcomingDeadlines = useMemo(() => {
    return assignments
      .filter((a) => !a.completed && a.dueDate >= today)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [assignments, today]);

  const overdue = useMemo(() => {
    return assignments.filter((a) => !a.completed && a.dueDate < today);
  }, [assignments, today]);

  const pending = useMemo(() => {
    return assignments.filter((a) => !a.completed).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [assignments]);

  const completed = useMemo(() => assignments.filter((a) => a.completed), [assignments]);

  const resetForm = () => {
    setForm({ title: "", subject: "", description: "", dueDate: "", priority: "medium" });
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    onAddAssignment({ ...form, id: generateId(), completed: false, createdAt: new Date().toISOString() });
    resetForm();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">{pending.length} pending · {overdue.length} overdue · {completed.length} done</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>+ New Assignment</button>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="glass" style={{ marginBottom: "1rem", borderColor: "rgba(239,68,68,0.3)" }}>
          <div className="glass-header">
            <span className="glass-title">overdue_assignments</span>
          </div>
          <div className="glass-body" style={{ padding: "0.5rem 0.75rem" }}>
            {overdue.slice(0, 5).map((a) => (
              <div key={a.id} className="task-item" style={{ margin: 0, padding: "0.4rem 0.65rem", border: "none", background: "transparent" }}>
                <button className={`task-check ${a.completed ? "done" : ""}`} onClick={() => onToggleAssignment(a.id)}>
                  {a.completed ? "✓" : ""}
                </button>
                <div className="task-content">
                  <div className="task-title" style={{ fontSize: "0.8rem" }}>{a.title}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--danger)" }}>Due: {format(new Date(a.dueDate), "MMM d")}</div>
                </div>
                <span className="badge badge-danger">{a.priority}</span>
                <button className="btn btn-sm btn-ghost" onClick={() => onDeleteAssignment(a.id)}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingDeadlines.length > 0 && (
        <div className="glass" style={{ marginBottom: "1rem" }}>
          <div className="glass-header">
            <span className="glass-title">upcoming_deadlines</span>
          </div>
          <div className="glass-body" style={{ padding: "0.5rem 0.75rem" }}>
            {upcomingDeadlines.map((a) => {
              const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={a.id} className="task-item" style={{ margin: 0, padding: "0.4rem 0.65rem", border: "none", background: "transparent" }}>
                  <button className={`task-check ${a.completed ? "done" : ""}`} onClick={() => onToggleAssignment(a.id)}>
                    {a.completed ? "✓" : ""}
                  </button>
                  <div className="task-content">
                    <div className="task-title" style={{ fontSize: "0.8rem" }}>{a.title}</div>
                    <div className="task-meta" style={{ marginTop: 0 }}>
                      {a.subject && <span className="badge badge-accent" style={{ fontSize: "0.6rem" }}>{a.subject}</span>}
                      <span style={{ fontSize: "0.65rem", color: daysLeft <= 2 ? "var(--danger)" : "var(--text-muted)" }}>{daysLeft === 0 ? "Due today" : `${daysLeft}d left`}</span>
                    </div>
                  </div>
                  <span className={`badge ${a.priority === "critical" ? "badge-danger" : a.priority === "high" ? "badge-warning" : "badge-accent"}`} style={{ fontSize: "0.6rem" }}>{a.priority}</span>
                  <button className="btn btn-sm btn-ghost" onClick={() => onDeleteAssignment(a.id)}>🗑️</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showForm && (
        <div className="glass" style={{ marginBottom: "1rem" }}>
          <div className="glass-header">
            <span className="glass-title">new_assignment</span>
            <button className="topbar-btn" onClick={resetForm} style={{ width: 32, height: 32, border: "none" }}>✕</button>
          </div>
          <div className="glass-body">
            <div className="input-group">
              <label className="input-label" htmlFor="assign-title">Title</label>
              <input id="assign-title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" />
            </div>
            <div className="flex gap-2">
              <div className="input-group">
                <label className="input-label" htmlFor="assign-subject">Subject</label>
                <input id="assign-subject" className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="assign-priority">Priority</label>
                <select id="assign-priority" className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="assign-desc">Description</label>
              <textarea id="assign-desc" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="assign-date">Due Date</label>
              <input id="assign-date" type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <button className="btn btn-primary mt-2" onClick={handleSave}>Create Assignment</button>
          </div>
        </div>
      )}

      <div className="glass" style={{ padding: "0.35rem 0.75rem" }}>
        {assignments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">📝</div>
            <div className="empty-state-title">No assignments yet</div>
            <div className="empty-state-desc">Create your first assignment to get started.</div>
          </div>
        ) : (
          <div className="task-list">
            {pending.concat(completed).map((a) => (
              <div key={a.id} className={`task-item ${a.completed ? "completed" : ""}`} style={{ margin: 0, border: "none" }}>
                <button className={`task-check ${a.completed ? "done" : ""}`} onClick={() => onToggleAssignment(a.id)} role="checkbox" aria-checked={a.completed}>
                  {a.completed ? "✓" : ""}
                </button>
                <div className="task-content">
                  <div className="task-title">{a.title}</div>
                  <div className="task-meta">
                    {a.subject && <span className="badge badge-accent" style={{ fontSize: "0.6rem" }}>{a.subject}</span>}
                    <span className={`badge ${a.priority === "critical" ? "badge-danger" : a.priority === "high" ? "badge-warning" : "badge-accent"}`} style={{ fontSize: "0.6rem" }}>{a.priority}</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{format(new Date(a.dueDate), "MMM d")}</span>
                  </div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => onDeleteAssignment(a.id)}>🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
