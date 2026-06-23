import { useState, useMemo } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import type { Exam, StudySession, StudyPlan } from "../../types";

interface CalendarViewProps {
  exams: Exam[];
  sessions: StudySession[];
  plans: StudyPlan[];
}

type Event = { date: string; title: string; type: "exam" | "study" | "revision" };

export default function CalendarView({ exams, sessions, plans }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const events = useMemo(() => {
    const evts: Event[] = [];
    exams.forEach((e) => evts.push({ date: e.date, title: `${e.title} (Exam)`, type: "exam" }));
    sessions.forEach((s) => evts.push({ date: s.date, title: `${s.subject} - ${Math.floor(s.duration / 60)}h${s.duration % 60}m`, type: "study" }));
    plans.forEach((p) => {
      p.days.forEach((d) => evts.push({ date: d.date, title: `${d.subjects.map(s => s.name).join(", ")} (Revision)`, type: "revision" }));
    });
    return evts;
  }, [exams, sessions, plans]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach((e) => {
      const existing = map.get(e.date) || [];
      existing.push(e);
      map.set(e.date, existing);
    });
    return map;
  }, [events]);

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const eventColors = { exam: "var(--danger)", study: "var(--primary)", revision: "var(--warning)" };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Calendar</h1>
        <p className="page-subtitle">{events.length} scheduled events</p>
        <div className="page-actions">
          <button className="btn btn-sm btn-ghost" onClick={() => setCurrentDate(new Date())} aria-label="Go to today">today</button>
        </div>
      </div>

      <div className="glass">
        <div className="glass-header">
          <div className="flex" style={{ alignItems: "center", gap: "1rem" }}>
            <button className="topbar-btn" onClick={() => setCurrentDate(subMonths(currentDate, 1))} aria-label="Previous month" tabIndex={0}>‹</button>
            <span className="glass-title" style={{ fontSize: "1rem", minWidth: 140, textAlign: "center" }}>{format(currentDate, "MMMM yyyy")}</span>
            <button className="topbar-btn" onClick={() => setCurrentDate(addMonths(currentDate, 1))} aria-label="Next month" tabIndex={0}>›</button>
          </div>
          <div className="calendar-legend">
            {(["exam", "study", "revision"] as const).map((t) => (
              <span key={t} className="calendar-legend-item">
                <span className="calendar-dot" style={{ backgroundColor: eventColors[t] }} />{t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            ))}
          </div>
        </div>
        <div className="calendar-grid">
          {daysOfWeek.map((d) => (
            <div key={d} className="calendar-day-header">{d}</div>
          ))}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDay.get(dateStr) || [];
            const isToday = isSameDay(day, new Date());
            const inMonth = isSameMonth(day, currentDate);
            return (
              <div key={dateStr} className={`calendar-day ${!inMonth ? "outside" : ""} ${isToday ? "today" : ""}`} role="gridcell" aria-label={format(day, "MMMM d, yyyy") + (dayEvents.length > 0 ? `: ${dayEvents.length} events` : "")}>
                <div className="calendar-day-number">{format(day, "d")}</div>
                {dayEvents.slice(0, 3).map((e, i) => (
                  <div key={i} className="calendar-event" style={{ backgroundColor: eventColors[e.type] + "22", borderLeftColor: eventColors[e.type], color: "var(--text)" }}>
                    <span className="calendar-event-text">{e.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && <div className="calendar-event" style={{ opacity: 0.6 }}>+{dayEvents.length - 3} more</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
