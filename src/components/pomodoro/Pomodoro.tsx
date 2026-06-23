import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { generateId } from "../../utils/helpers";
import type { PomodoroSession } from "../../types";

interface PomodoroProps {
  pomodoros: PomodoroSession[];
  onAddPomodoro: (s: PomodoroSession) => void;
  subjects: { name: string }[];
}

type Mode = "focus" | "shortBreak" | "longBreak";

  const MODE_CONFIG: Record<Mode, { label: string; duration: number; icon: string }> = {
    focus: { label: "focus", duration: 25, icon: "◉" },
    shortBreak: { label: "short_break", duration: 5, icon: "○" },
    longBreak: { label: "long_break", duration: 15, icon: "◎" },
  };

const CIRCUMFERENCE = 2 * Math.PI * 120;

export default function Pomodoro({ pomodoros, onAddPomodoro, subjects }: PomodoroProps) {
  const [mode, setMode] = useState<Mode>("focus");
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIG.focus.duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [currentSubject, setCurrentSubject] = useState(subjects[0]?.name || "General");
  const [fullscreen, setFullscreen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalTime = MODE_CONFIG[mode].duration * 60;
  const progress = 1 - (timeLeft / totalTime);
  const offset = CIRCUMFERENCE * (1 - progress);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { clearInterval(intervalRef.current!); setIsRunning(false); handleSessionComplete(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const handleSessionComplete = useCallback(() => {
    if (mode === "focus") {
      onAddPomodoro({ id: generateId(), date: format(new Date(), "yyyy-MM-dd"), focusDuration: MODE_CONFIG.focus.duration, breakDuration: MODE_CONFIG.shortBreak.duration, sessions: 1, subject: currentSubject, completed: true });
      setSessionsCompleted((s) => s + 1);
      const nextMode = (sessionsCompleted + 1) % 4 === 0 ? "longBreak" : "shortBreak";
      setMode(nextMode);
      setTimeLeft(MODE_CONFIG[nextMode].duration * 60);
    } else { setMode("focus"); setTimeLeft(MODE_CONFIG.focus.duration * 60); }
  }, [mode, currentSubject, sessionsCompleted, onAddPomodoro]);

  const toggleTimer = () => {
    if (timeLeft <= 0) { setTimeLeft(MODE_CONFIG[mode].duration * 60); setIsRunning(true); }
    else setIsRunning(!isRunning);
  };

  const resetTimer = () => { setIsRunning(false); setTimeLeft(MODE_CONFIG[mode].duration * 60); };
  const switchMode = (m: Mode) => { setIsRunning(false); setMode(m); setTimeLeft(MODE_CONFIG[m].duration * 60); };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const todayCount = pomodoros.filter((p) => p.date === format(new Date(), "yyyy-MM-dd")).length;
  const totalFocus = pomodoros.reduce((s, p) => s + p.focusDuration * p.sessions, 0);

  const timerContent = (
    <>
      <div className="pomodoro-modes" role="tablist" aria-label="Timer mode">
        {(["focus", "shortBreak", "longBreak"] as Mode[]).map((m) => (
          <button key={m} className={`pomodoro-mode ${mode === m ? "active" : ""}`} onClick={() => switchMode(m)} role="tab" aria-selected={mode === m} aria-label={MODE_CONFIG[m].label}>
            {MODE_CONFIG[m].icon} {MODE_CONFIG[m].label}
          </button>
        ))}
      </div>

      <div className="pomodoro-subject-select">
        <select className="input" value={currentSubject} onChange={(e) => setCurrentSubject(e.target.value)} aria-label="Select subject for this session">
          {subjects.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
          <option value="General">General</option>
        </select>
      </div>

      <div className="pomodoro-circle" role="timer" aria-label={`${mode === "focus" ? "Focus" : "Break"} timer: ${timeStr}`}>
        <svg width={252} height={252} aria-hidden="true">
          <circle className="bg" cx={126} cy={126} r={120} />
          <circle className={`progress ${mode !== "focus" ? "break-progress" : ""}`} cx={126} cy={126} r={120} strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset} />
        </svg>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div className={`pomodoro-timer ${isRunning && mode === "focus" ? "active" : ""} ${mode !== "focus" ? "break" : ""}`}>{timeStr}</div>
          <div className="pomodoro-status">{isRunning ? (mode === "focus" ? "Focusing..." : "Taking a break...") : "Ready"}</div>
        </div>
      </div>

      <div className="pomodoro-controls">
        <button className={`btn ${isRunning ? "btn-danger" : "btn-primary"} btn-lg`} onClick={toggleTimer} aria-label={isRunning ? "Stop timer" : "Start timer"}>
          {isRunning ? "⏹ Stop" : timeLeft < MODE_CONFIG[mode].duration * 60 ? "▶ Resume" : "▶ Start"}
        </button>
        <button className="btn btn-secondary btn-lg" onClick={resetTimer} aria-label="Reset timer">↺ Reset</button>
        <button className="btn btn-secondary btn-lg" onClick={() => setFullscreen(true)} aria-label="Enter fullscreen mode">⛶</button>
      </div>

      <div className="pomodoro-stats">
        <div className="pomodoro-stat"><div className="pomodoro-stat-value">{todayCount}</div><div className="pomodoro-stat-label">Today</div></div>
        <div className="pomodoro-stat"><div className="pomodoro-stat-value">{sessionsCompleted}</div><div className="pomodoro-stat-label">Sessions</div></div>
        <div className="pomodoro-stat"><div className="pomodoro-stat-value">{Math.round(totalFocus / 60)}h</div><div className="pomodoro-stat-label">Total Focus</div></div>
      </div>
    </>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Focus Engine</h1>
        <p className="page-subtitle">// focus_session_manager</p>
      </div>
      <div className="glass pomodoro">{timerContent}</div>

      {fullscreen && (
        <div className="pomodoro-fullscreen" role="dialog" aria-label="Fullscreen focus timer">
          <button className="btn btn-lg btn-secondary" style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }} onClick={() => setFullscreen(false)} aria-label="Exit fullscreen mode">
            ✕ Exit Fullscreen
          </button>
          {timerContent}
        </div>
      )}
    </div>
  );
}
