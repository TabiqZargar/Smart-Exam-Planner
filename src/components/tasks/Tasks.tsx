import { useState, useMemo } from "react";
import { format } from "date-fns";
import { generateId } from "../../utils/helpers";
import type { Task } from "../../types";

interface TasksProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, task: Partial<Task>) => void;
}

type TaskFilter = "all" | "today" | "pending" | "completed";

export default function Tasks({ tasks, onAddTask, onToggleTask, onDeleteTask, onUpdateTask }: TasksProps) {
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", subject: "", priority: "medium" as "low" | "medium" | "high" | "critical", dueDate: "", recurring: "none" as "none" | "daily" | "weekly" });

  const today = format(new Date(), "yyyy-MM-dd");

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case "today": return tasks.filter((t) => t.date === today);
      case "pending": return tasks.filter((t) => !t.completed);
      case "completed": return tasks.filter((t) => t.completed);
      default: return tasks;
    }
  }, [tasks, filter, today]);

  const sortedTasks = useMemo(() =>
    [...filteredTasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return ({ critical: 0, high: 1, medium: 2, low: 3 })[a.priority] - ({ critical: 0, high: 1, medium: 2, low: 3 })[b.priority];
    }),
  [filteredTasks]);

  const resetForm = () => {
    setForm({ title: "", description: "", subject: "", priority: "medium", dueDate: "", recurring: "none" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingId) onUpdateTask(editingId, form);
    else onAddTask({ ...form, id: generateId(), completed: false, createdAt: new Date().toISOString(), date: form.dueDate || today });
    resetForm();
  };

  const handleEdit = (task: Task) => {
    setForm({ title: task.title, description: task.description, subject: task.subject, priority: task.priority, dueDate: task.dueDate, recurring: task.recurring });
    setEditingId(task.id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <p className="page-subtitle">{tasks.filter((t) => !t.completed).length} active · {tasks.filter((t) => t.completed).length} done</p>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }} aria-label="Add new task">+ New Task</button>
        </div>
      </div>

      <div className="task-filters" role="tablist" aria-label="Filter tasks">
        {(["all", "today", "pending", "completed"] as TaskFilter[]).map((f) => (
          <button key={f} className={`task-filter ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)} role="tab" aria-selected={filter === f} aria-label={`Show ${f} tasks`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pending" && ` (${tasks.filter((t) => !t.completed).length})`}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="glass" style={{ marginBottom: "1rem" }}>
          <div className="glass-header">
            <span className="glass-title">{editingId ? "edit_task" : "new_task"}</span>
            <button className="topbar-btn" onClick={resetForm} aria-label="Close form" style={{ width: 32, height: 32, border: "none" }}>✕</button>
          </div>
          <div className="glass-body">
            <div className="input-group">
              <label className="input-label" htmlFor="task-title">Title</label>
              <input id="task-title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="task-desc">Description</label>
              <textarea id="task-desc" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="flex gap-2">
              <div className="input-group">
                <label className="input-label" htmlFor="task-subject">Subject</label>
                <input id="task-subject" className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="task-priority">Priority</label>
                <select id="task-priority" className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="input-group">
                <label className="input-label" htmlFor="task-date">Due Date</label>
                <input id="task-date" type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="task-recurring">Recurring</label>
                <select id="task-recurring" className="input" value={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.value as any })}>
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary mt-2" onClick={handleSave}>{editingId ? "Update" : "Create"} Task</button>
          </div>
        </div>
      )}

      <div className="task-list">
        {sortedTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">✅</div>
            <div className="empty-state-title">No tasks</div>
            <div className="empty-state-desc">Create your first task to get started.</div>
          </div>
        ) : sortedTasks.map((task) => (
          <div key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
            <button className={`task-check ${task.completed ? "done" : ""}`} onClick={() => onToggleTask(task.id)} aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`} role="checkbox" aria-checked={task.completed}>
              {task.completed ? "✓" : ""}
            </button>
            <div className="task-content">
              <div className="task-title">{task.title}</div>
              {task.description && <div className="task-desc">{task.description}</div>}
              <div className="task-meta">
                {task.subject && <span className="badge badge-accent" style={{ fontSize: "0.62rem", padding: "0.08rem 0.4rem" }}>{task.subject}</span>}
                <span className={`badge ${task.priority === "critical" ? "badge-danger" : task.priority === "high" ? "badge-warning" : "badge-accent"}`} style={{ fontSize: "0.62rem", padding: "0.08rem 0.4rem" }}>{task.priority}</span>
                {task.recurring !== "none" && <span className="badge badge-accent" style={{ fontSize: "0.62rem", padding: "0.08rem 0.4rem" }}>🔄</span>}
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{format(new Date(task.date), "MMM d")}</span>
              </div>
            </div>
            <div className="task-actions">
              <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(task)} aria-label={`Edit ${task.title}`}>✏️</button>
              <button className="btn btn-sm btn-ghost" onClick={() => onDeleteTask(task.id)} aria-label={`Delete ${task.title}`}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
