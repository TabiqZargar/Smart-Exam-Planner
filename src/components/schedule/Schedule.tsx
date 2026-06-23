import { useMemo } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import type { StudyPlan, Exam } from "../../types";
import { calculateReadiness } from "../../utils/schedule";

interface ScheduleProps {
  plans: StudyPlan[];
  exams: Exam[];
  onToggleDay: (planId: string, dayId: string) => void;
}

export default function Schedule({ plans, exams, onToggleDay }: ScheduleProps) {
  const activePlan = plans[plans.length - 1];
  const relatedExam = activePlan ? exams.find((e) => e.id === activePlan.examId) : null;
  const readiness = activePlan ? calculateReadiness(activePlan, exams) : 0;

  const weekDays = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, []);

  if (!activePlan) {
    return (
      <div>
        <div className="page-header">
        <h1 className="page-title">Study Schedule</h1>
        <p className="page-subtitle">// generate_optimized_timeline</p>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-title">No schedule yet</div>
          <div className="empty-state-desc">Add an exam and generate a smart study schedule.</div>
        </div>
      </div>
    );
  }

  const completedDays = activePlan.days.filter((d) => d.completed).length;
  const totalDays = activePlan.days.length;
  const progress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Study Schedule</h1>
        <p className="page-subtitle">
          {relatedExam ? `// exam: ${relatedExam.title} | ` : "// "}
          {completedDays}/{totalDays} days synced
        </p>
        <div className="page-actions">
          <div className="glass" style={{ padding: ".5rem 1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <span>Readiness</span>
            <span className="countdown" style={{ fontSize: "1.5rem", color: readiness >= 70 ? "var(--success)" : readiness >= 40 ? "var(--warning)" : "var(--danger)" }}>
              {readiness}%
            </span>
          </div>
        </div>
      </div>

      <div className="progress-card glass" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
        <div className="flex justify-between items-center mb-2">
          <span className="glass-title" style={{ fontSize: ".88rem" }}>overall_progress</span>
          <span className="text-sm text-muted">{progress}%</span>
        </div>
        <div className="progress-bar" style={{ height: 8, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
          <div className="progress-fill" style={{ width: `${progress}%`, height: "100%", background: "var(--accent-gradient)", borderRadius: 99, transition: "width .6s cubic-bezier(.22,1,.36,1)" }} />
        </div>
        <div className="flex justify-between" style={{ fontSize: ".75rem", color: "var(--text-secondary)", marginTop: ".5rem" }}>
          <span>Study days: {activePlan.days.filter((d) => !d.isRevision).filter((d) => d.completed).length}/{activePlan.days.filter((d) => !d.isRevision).length}</span>
          <span>Revision days: {activePlan.days.filter((d) => d.isRevision).filter((d) => d.completed).length}/{activePlan.days.filter((d) => d.isRevision).length}</span>
        </div>
      </div>

      <div className="glass" style={{ marginBottom: "1.25rem" }}>
        <div className="glass-header">
          <span className="glass-title">weekly_view</span>
        </div>
        <div className="glass-body">
          <div className="schedule-week">
            {weekDays.map((d) => {
              const ds = format(d, "yyyy-MM-dd");
              const day = activePlan.days.find((sd) => sd.date === ds);
              const isToday = isSameDay(d, new Date());
              return (
                <div key={ds} className={`schedule-day ${isToday ? "today" : ""} ${day?.isRevision ? "revision" : ""}`}>
                  <div className="schedule-day-name">{format(d, "EEE")}</div>
                  <div className="schedule-day-date">{format(d, "d")}</div>
                  {day ? (
                    <>
                      <div className="schedule-day-hours">{day.totalHours}h</div>
                      <div className="schedule-day-subjects">
                        {day.subjects.slice(0, 3).map((s, i) => (
                          <span key={i} className={`schedule-subject ${day.isRevision ? "revision-subject" : ""}`}>
                            {s.name}
                          </span>
                        ))}
                        {day.subjects.length > 3 && <span className="schedule-subject">+{day.subjects.length - 3}</span>}
                      </div>
                      <div
                        className={`schedule-check ${day.completed ? "done" : ""}`}
                        onClick={() => onToggleDay(activePlan.id, day.id)}
                      >
                        {day.completed ? "✓" : ""}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: ".72rem", color: "var(--text-muted)", marginTop: ".35rem" }}>Rest</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass">
        <div className="glass-header">
          <span className="glass-title">full_timeline</span>
          <span className="glass-subtitle">{totalDays} days</span>
        </div>
        <div className="glass-body" style={{ padding: 0 }}>
          <div className="table-wrap" style={{ maxHeight: 500, overflowY: "auto" }}>
            <table className="table" style={{ fontSize: ".82rem" }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Subjects</th>
                  <th>Hours</th>
                  <th>Done</th>
                </tr>
              </thead>
              <tbody>
                {activePlan.days.map((day) => (
                  <tr key={day.id} className={`${day.completed ? "row-done" : ""} ${day.isRevision ? "row-revision" : ""}`}>
                    <td>{format(new Date(day.date), "MMM d, EEE")}</td>
                    <td>
                      {day.isRevision ? (
                        <span className="badge-revision" style={{ display: "inline-block", background: "var(--accent-gradient)", color: "#fff", fontSize: ".7rem", fontWeight: 600, padding: ".15rem .5rem", borderRadius: 6 }}>Revision</span>
                      ) : (
                        <span className="badge-study" style={{ display: "inline-block", background: "var(--border)", color: "var(--text-secondary)", fontSize: ".7rem", fontWeight: 600, padding: ".15rem .5rem", borderRadius: 6 }}>Study</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: ".15rem" }}>
                        {day.subjects.map((s, i) => (
                          <span key={i} style={{ fontSize: ".78rem" }}>{s.name} · {s.hours}h</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{day.totalHours.toFixed(1)}h</td>
                    <td>
                      <div
                        className="task-check"
                        style={{ width: 22, height: 22 }}
                        onClick={() => onToggleDay(activePlan.id, day.id)}
                      >
                        {day.completed ? "✓" : ""}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
