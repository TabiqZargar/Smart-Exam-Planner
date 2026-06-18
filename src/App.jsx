import { useState, useCallback, useEffect } from "react";
import { differenceInCalendarDays, format, addDays } from "date-fns";
import "./App.css";

const STORAGE_KEY = "smart-exam-prep-planner";
const REVISION_PERCENTAGE = 0.2;

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function generateSchedule({ examDate, subjects, dailyHours }) {
  const today = new Date();
  const exam = new Date(examDate);
  const totalDays = differenceInCalendarDays(exam, today);
  if (totalDays <= 0) return [];

  const revisionCount = Math.max(
    1,
    Math.floor(totalDays * REVISION_PERCENTAGE),
  );
  const studyCount = totalDays - revisionCount;

  const revisionSet = new Set();
  if (revisionCount > 0) {
    const step = totalDays / (revisionCount + 1);
    for (let r = 1; r <= revisionCount; r++) {
      const idx = Math.round(step * r);
      if (idx < totalDays) revisionSet.add(idx);
    }
  }

  const totalStudyHours = studyCount * dailyHours;
  const hoursPerSubject =
    subjects.length > 0 ? totalStudyHours / subjects.length : 0;
  const sessions = [];
  for (const name of subjects) {
    let allocated = 0;
    while (allocated < hoursPerSubject - 0.001) {
      const h = Math.min(1, hoursPerSubject - allocated);
      sessions.push({ name, hours: Math.round(h * 10) / 10 });
      allocated += h;
    }
  }
  for (let i = sessions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sessions[i], sessions[j]] = [sessions[j], sessions[i]];
  }

  const daySubjects = [];
  let pos = 0;
  for (let d = 0; d < studyCount; d++) {
    const list = [];
    let h = 0;
    while (pos < sessions.length && h < dailyHours) {
      const s = sessions[pos];
      if (h + s.hours <= dailyHours) {
        list.push(s);
        h += s.hours;
        pos++;
      } else break;
    }
    daySubjects.push(list);
  }
  while (pos < sessions.length) {
    daySubjects[daySubjects.length - 1].push(sessions[pos]);
    pos++;
  }

  let si = 0;
  const plan = [];
  for (let i = 0; i < totalDays; i++) {
    const date = addDays(today, i);
    if (revisionSet.has(i)) {
      plan.push({
        id: generateId(),
        date: format(date, "yyyy-MM-dd"),
        displayDate: format(date, "EEE, MMM d"),
        isRevision: true,
        subjects: [],
        hours: dailyHours,
        completed: false,
      });
    } else {
      const subs = daySubjects[si] || [];
      si++;
      plan.push({
        id: generateId(),
        date: format(date, "yyyy-MM-dd"),
        displayDate: format(date, "EEE, MMM d"),
        isRevision: false,
        subjects: subs,
        hours: subs.reduce((s, x) => s + x.hours, 0),
        completed: false,
      });
    }
  }
  return plan;
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export default function App() {
  const saved = loadData();
  const [config, setConfig] = useState(saved?.config || null);
  const [plan, setPlan] = useState(saved?.plan || null);

  const [examDate, setExamDate] = useState("");
  const [dailyHours, setDailyHours] = useState(4);
  const [subjects, setSubjects] = useState([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [error, setError] = useState("");
  const [dark, setDark] = useState(() => {
    const t = localStorage.getItem("theme");
    if (t) return t === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light",
    );
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const daysRemaining = config
    ? differenceInCalendarDays(new Date(config.examDate), new Date())
    : 0;

  const addSubject = () => {
    const t = subjectInput.trim();
    if (!t) return;
    if (subjects.includes(t)) {
      setError(`"${t}" is already added.`);
      return;
    }
    setSubjects((p) => [...p, t]);
    setSubjectInput("");
    setError("");
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!examDate) return setError("Please select an exam date.");
    if (new Date(examDate) <= new Date())
      return setError("Exam date must be in the future.");
    if (subjects.length === 0)
      return setError("Please add at least one subject.");
    if (dailyHours < 1 || dailyHours > 24)
      return setError("Daily hours must be between 1 and 24.");
    setError("");
    const c = { examDate, subjects, dailyHours };
    const p = generateSchedule(c);
    saveData({ config: c, plan: p });
    setConfig(c);
    setPlan(p);
  };

  const toggleDay = useCallback(
    (id) => {
      setPlan((prev) => {
        const updated = prev.map((d) =>
          d.id === id ? { ...d, completed: !d.completed } : d,
        );
        saveData({ config, plan: updated });
        return updated;
      });
    },
    [config],
  );

  const handleReset = () => {
    if (
      !plan ||
      window.confirm("Reset your study plan? All progress will be lost.")
    ) {
      localStorage.removeItem(STORAGE_KEY);
      setConfig(null);
      setPlan(null);
    }
  };

  const completedCount = plan ? plan.filter((d) => d.completed).length : 0;
  const totalDays = plan ? plan.length : 0;
  const totalPct =
    totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;
  const revisionDays = plan ? plan.filter((d) => d.isRevision).length : 0;
  const studyDays = totalDays - revisionDays;
  const completedStudyDays = plan
    ? plan.filter((d) => !d.isRevision && d.completed).length
    : 0;

  return (
    <div className="app">
      <header className="header">
        <h1 className="header-title">Smart Exam Prep Planner</h1>
        <button
          className="theme-toggle"
          onClick={() => setDark((d) => !d)}
          aria-label="Toggle theme"
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </header>

      <main className="main">
        {!config ? (
          <form className="form" onSubmit={handleGenerate} noValidate>
            <h2 className="form-heading">Plan Your Exam Prep</h2>

            <label className="field">
              Exam Date
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="input"
              />
            </label>

            <label className="field">
              Daily Study Hours
              <input
                type="number"
                min={1}
                max={24}
                step={0.5}
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="input"
              />
            </label>

            <div className="field">
              <span className="field-label">Subjects</span>
              <div className="subject-row">
                <input
                  type="text"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubject();
                    }
                  }}
                  placeholder="e.g. Mathematics"
                  className="input"
                />
                <button type="button" className="btn-add" onClick={addSubject}>
                  + Add
                </button>
              </div>
              {subjects.length > 0 && (
                <div className="tag-list">
                  {subjects.map((s) => (
                    <span key={s} className="tag">
                      {s}
                      <button
                        type="button"
                        className="tag-remove"
                        onClick={() =>
                          setSubjects((p) => p.filter((x) => x !== s))
                        }
                        aria-label={`Remove ${s}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-primary">
              Generate Schedule
            </button>
          </form>
        ) : plan && plan.length > 0 ? (
          <>
            <div className="info-bar">
              <div className="subjects-display">
                <span className="subjects-label">Subjects:</span>
                {config.subjects.map((s) => (
                  <span key={s} className="subject-tag">
                    {s}
                  </span>
                ))}
              </div>
              <div className="days-remaining">
                <span className="days-num">{daysRemaining}</span> days until
                exam
              </div>
              <button className="btn-reset" onClick={handleReset}>
                Reset
              </button>
            </div>

            <div className="progress-card">
              <div className="progress-stats">
                <div className="stat">
                  <span className="stat-value">{totalDays}</span>
                  <span className="stat-label">Total Days</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{completedCount}</span>
                  <span className="stat-label">Done</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {totalDays - completedCount}
                  </span>
                  <span className="stat-label">Remaining</span>
                </div>
                <div className="stat">
                  <span className="stat-value pct">{totalPct}%</span>
                  <span className="stat-label">Complete</span>
                </div>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${totalPct}%` }}
                />
              </div>
              <div className="progress-breakdown">
                <span>
                  Study days: {completedStudyDays}/{studyDays}
                </span>
                <span>
                  Revision days: {completedCount - completedStudyDays}/
                  {revisionDays}
                </span>
              </div>
            </div>

            <div className="schedule-header">
              <h2 className="schedule-title">Study Schedule</h2>
              <span className="schedule-progress">
                {completedCount}/{totalDays} &middot; {totalPct}%
              </span>
            </div>
            <div className="progress-bar thin">
              <div
                className="progress-fill"
                style={{ width: `${totalPct}%` }}
              />
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Type</th>
                    <th scope="col">Subjects</th>
                    <th scope="col">Hours</th>
                    <th scope="col">Done</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.map((day) => (
                    <tr
                      key={day.id}
                      className={`${day.completed ? "row-done" : ""} ${day.isRevision ? "row-revision" : ""}`}
                    >
                      <td>{day.displayDate}</td>
                      <td>
                        {day.isRevision ? (
                          <span className="badge-revision">Revision</span>
                        ) : (
                          <span className="badge-study">Study</span>
                        )}
                      </td>
                      <td>
                        {day.isRevision ? (
                          <em className="revision-note">Review all subjects</em>
                        ) : (
                          <ul className="subject-list">
                            {day.subjects.map((s, i) => (
                              <li key={i} className="subject-list-item">
                                <span className="subject-name">{s.name}</span>{" "}
                                <span className="subject-hours">
                                  {s.hours}h
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td>{day.hours}h</td>
                      <td>
                        <label className="check-label">
                          <input
                            type="checkbox"
                            checked={day.completed}
                            onChange={() => toggleDay(day.id)}
                            className="check-input"
                          />
                          <span className="check-box" />
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p>No study days available.</p>
            <p style={{ fontSize: "0.85rem" }}>
              Choose a future exam date to get started.
            </p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p className="footer-name">Tabiq Zargar</p>
        <p className="footer-email">
          <a href="mailto:zargartabiq@gmail.com">zargartabiq@gmail.com</a>
        </p>
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-btn"
        >
          Built for Digital Heroes
        </a>
      </footer>
    </div>
  );
}
