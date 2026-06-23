import { useState, useCallback, useMemo, useEffect } from "react";
import { format } from "date-fns";
import type { Exam, Subject, StudySession, Task, PomodoroSession, Note, StudyPlan, Achievement, UserStats } from "./types";
import { calculateLevel } from "./utils/helpers";
import { loadData, saveData } from "./utils/storage";
import Layout from "./components/layout/Layout";
import Dashboard from "./components/dashboard/Dashboard";
import Exams from "./components/exams/Exams";
import Schedule from "./components/schedule/Schedule";
import Pomodoro from "./components/pomodoro/Pomodoro";
import Tasks from "./components/tasks/Tasks";
import StudyLog from "./components/studylog/StudyLog";
import Notes from "./components/notes/Notes";
import Analytics from "./components/analytics/Analytics";
import CalendarView from "./components/calendar/CalendarView";
import Landing from "./components/landing/Landing";

const STORAGE_PREFIX = "study_runtime_";

function usePersistedState<T>(key: string, initial: T) {
  const fullKey = STORAGE_PREFIX + key;
  const [value, setValue] = useState<T>(() => loadData(fullKey, initial));
  useEffect(() => { saveData(fullKey, value); }, [fullKey, value]);
  return [value, setValue] as const;
}

function createInitialStats(): UserStats {
  return {
    streak: 0,
    longestStreak: 0,
    xp: 0,
    level: 1,
    totalStudyHours: 0,
    totalFocusSessions: 0,
    completedTasks: 0,
    totalTasks: 0,
    weeklyHours: [0, 0, 0, 0, 0, 0, 0],
    lastStudyDate: null,
  };
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "first_session", title: "First Study", description: "Log your first study session", icon: "📝", unlocked: false, unlockedAt: null },
  { id: "streak_3", title: "Consistent", description: "3-day study streak", icon: "🔥", unlocked: false, unlockedAt: null },
  { id: "streak_7", title: "Week Warrior", description: "7-day study streak", icon: "💪", unlocked: false, unlockedAt: null },
  { id: "streak_30", title: "Unstoppable", description: "30-day study streak", icon: "🏆", unlocked: false, unlockedAt: null },
  { id: "hours_10", title: "Dedicated", description: "Study 10 hours total", icon: "⏰", unlocked: false, unlockedAt: null },
  { id: "hours_50", title: "Scholar", description: "Study 50 hours total", icon: "🎓", unlocked: false, unlockedAt: null },
  { id: "hours_100", title: "Master", description: "Study 100 hours total", icon: "👑", unlocked: false, unlockedAt: null },
  { id: "tasks_10", title: "Task Master", description: "Complete 10 tasks", icon: "✅", unlocked: false, unlockedAt: null },
  { id: "tasks_50", title: "Productivity Pro", description: "Complete 50 tasks", icon: "⚡", unlocked: false, unlockedAt: null },
  { id: "focus_10", title: "Focused Mind", description: "Complete 10 focus sessions", icon: "🧘", unlocked: false, unlockedAt: null },
  { id: "focus_50", title: "Zen Master", description: "Complete 50 focus sessions", icon: "🧠", unlocked: false, unlockedAt: null },
  { id: "exam_ready", title: "Exam Ready", description: "Schedule an exam", icon: "📋", unlocked: false, unlockedAt: null },
];

export default function App() {
  const [page, setPage] = useState(() => {
    const hasData = loadData(STORAGE_PREFIX + "exams", [] as Exam[]).length > 0;
    return hasData ? "dashboard" : "landing";
  });

  const [dark, setDark] = useState(() => {
    const t = localStorage.getItem("theme");
    if (t) return t === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [exams, setExams] = usePersistedState<Exam[]>("exams", []);
  const [subjects, setSubjects] = usePersistedState<Subject[]>("subjects", []);
  const [sessions, setSessions] = usePersistedState<StudySession[]>("sessions", []);
  const [tasks, setTasks] = usePersistedState<Task[]>("tasks", []);
  const [pomodoros, setPomodoros] = usePersistedState<PomodoroSession[]>("pomodoros", []);
  const [notes, setNotes] = usePersistedState<Note[]>("notes", []);
  const [plans, setPlans] = usePersistedState<StudyPlan[]>("plans", []);
  const [achievements, setAchievements] = usePersistedState<Achievement[]>("achievements", DEFAULT_ACHIEVEMENTS);
  const [stats, setStats] = usePersistedState<UserStats>("stats", createInitialStats());

  const [notification, setNotification] = useState<{ icon: string; title: string; desc: string } | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const notify = (icon: string, title: string, desc: string) => {
    setNotification({ icon, title, desc });
    setTimeout(() => setNotification(null), 4000);
  };

  const checkAchievements = useCallback((updatedStats: UserStats) => {
    const updated = achievements.map((a) => {
      if (a.unlocked) return a;
      if (a.id === "first_session" && sessions.length > 0) return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
      if (a.id === "streak_3" && updatedStats.streak >= 3) return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
      if (a.id === "streak_7" && updatedStats.streak >= 7) return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
      if (a.id === "streak_30" && updatedStats.streak >= 30) return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
      if (a.id === "hours_10" && updatedStats.totalStudyHours >= 10) return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
      if (a.id === "hours_50" && updatedStats.totalStudyHours >= 50) return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
      if (a.id === "hours_100" && updatedStats.totalStudyHours >= 100) return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
      if (a.id === "tasks_10" && updatedStats.completedTasks >= 10) return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
      if (a.id === "tasks_50" && updatedStats.completedTasks >= 50) return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
      if (a.id === "focus_10" && updatedStats.totalFocusSessions >= 10) return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
      if (a.id === "focus_50" && updatedStats.totalFocusSessions >= 50) return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
      if (a.id === "exam_ready" && exams.length > 0) return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
      return a;
    });
    setAchievements(updated);
    const newlyUnlocked = updated.find((a, i) => a.unlocked && !achievements[i]?.unlocked);
    if (newlyUnlocked) {
      notify("✦", "Achievement Unlocked", `${newlyUnlocked.title} — ${newlyUnlocked.description}`);
    }
  }, [achievements, sessions.length, exams.length]);

  const updateStatsWithSession = useCallback((duration: number) => {
    const today = format(new Date(), "yyyy-MM-dd");
    setStats((prev) => {
      const hours = duration / 60;
      const newStreak = prev.lastStudyDate === today ? prev.streak
        : prev.lastStudyDate === format(new Date(new Date().setDate(new Date().getDate() - 1)), "yyyy-MM-dd") ? prev.streak + 1
        : prev.lastStudyDate === null ? 1
        : 1;
      const newStats: UserStats = {
        ...prev,
        totalStudyHours: prev.totalStudyHours + hours,
        streak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        xp: prev.xp + Math.round(hours * 10),
        level: calculateLevel(prev.xp + Math.round(hours * 10)),
        lastStudyDate: today,
      };
      checkAchievements(newStats);
      return newStats;
    });
  }, [checkAchievements]);

  const handleAddExam = useCallback((exam: Exam) => {
    setExams((prev) => [...prev, exam]);
    notify("⌂", "Exam Queued", `"${exam.title}" added to pipeline.`);
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + 25,
      level: calculateLevel(prev.xp + 25),
    }));
  }, [setExams, setStats]);

  const handleUpdateExam = useCallback((id: string, data: Partial<Exam>) => {
    setExams((prev) => prev.map((e) => e.id === id ? { ...e, ...data } : e));
  }, [setExams]);

  const handleDeleteExam = useCallback((id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  }, [setExams]);

  const handleAddSubject = useCallback((subject: Subject) => {
    setSubjects((prev) => [...prev, subject]);
  }, [setSubjects]);

  const handleAddPlan = useCallback((plan: StudyPlan) => {
    setPlans((prev) => [...prev, plan]);
    notify("☰", "Timeline Compiled", "Study plan ready for execution.");
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + 50,
      level: calculateLevel(prev.xp + 50),
    }));
  }, [setPlans, setStats]);

  const handleToggleDay = useCallback((planId: string, dayId: string) => {
    setPlans((prev) => prev.map((p) => {
      if (p.id !== planId) return p;
      return {
        ...p,
        days: p.days.map((d) => d.id === dayId ? { ...d, completed: !d.completed } : d),
      };
    }));
  }, [setPlans]);

  const handleAddSession = useCallback((session: StudySession) => {
    setSessions((prev) => [...prev, session]);
    updateStatsWithSession(session.duration);
    notify("≡", "Session Saved", `${session.duration}m of ${session.subject}`);
  }, [setSessions, updateStatsWithSession]);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, [setSessions]);

  const handleAddTask = useCallback((task: Task) => {
    setTasks((prev) => [...prev, task]);
    setStats((prev) => ({ ...prev, totalTasks: prev.totalTasks + 1 }));
  }, [setTasks, setStats]);

  const handleToggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const nowCompleted = !t.completed;
      if (nowCompleted) {
        setStats((s) => {
          const newStats: UserStats = {
            ...s,
            completedTasks: s.completedTasks + 1,
            xp: s.xp + 15,
            level: calculateLevel(s.xp + 15),
          };
          checkAchievements(newStats);
          return newStats;
        });
      }
      return { ...t, completed: nowCompleted };
    }));
  }, [setTasks, setStats, checkAchievements]);

  const handleDeleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, [setTasks]);

  const handleUpdateTask = useCallback((id: string, data: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...data } : t));
  }, [setTasks]);

  const handleAddPomodoro = useCallback((p: PomodoroSession) => {
    setPomodoros((prev) => [...prev, p]);
    setStats((prev) => ({
      ...prev,
      totalFocusSessions: prev.totalFocusSessions + p.sessions,
      xp: prev.xp + p.sessions * 20,
      level: calculateLevel(prev.xp + p.sessions * 20),
    }));
  }, [setPomodoros, setStats]);

  const handleAddNote = useCallback((note: Note) => {
    setNotes((prev) => [...prev, note]);
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + 10,
      level: calculateLevel(prev.xp + 10),
    }));
  }, [setNotes, setStats]);

  const handleUpdateNote = useCallback((id: string, data: Partial<Note>) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, ...data } : n));
  }, [setNotes]);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, [setNotes]);

  const handleTogglePin = useCallback((id: string) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n));
  }, [setNotes]);

  const getCompletedTasks = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);

  if (page === "landing") {
    return (
      <div className="app">
        <Landing onGetStarted={() => setPage("dashboard")} />
      </div>
    );
  }

  return (
    <Layout
      currentPage={page}
      onNavigate={setPage}
      dark={dark}
      onToggleDark={() => setDark((d) => !d)}
      stats={stats}
    >
      {page === "dashboard" && (
        <Dashboard
          exams={exams}
          sessions={sessions}
          tasks={tasks}
          stats={stats}
          plans={plans}
          pomodoros={pomodoros}
          onNavigate={setPage}
        />
      )}
      {page === "exams" && (
        <Exams
          exams={exams}
          subjects={subjects}
          plans={plans}
          onAddExam={handleAddExam}
          onUpdateExam={handleUpdateExam}
          onDeleteExam={handleDeleteExam}
          onAddPlan={handleAddPlan}
          onAddSubject={handleAddSubject}
        />
      )}
      {page === "schedule" && (
        <Schedule
          plans={plans}
          exams={exams}
          onToggleDay={handleToggleDay}
        />
      )}
      {page === "pomodoro" && (
        <Pomodoro
          pomodoros={pomodoros}
          onAddPomodoro={handleAddPomodoro}
          subjects={subjects}
        />
      )}
      {page === "tasks" && (
        <Tasks
          tasks={tasks}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onUpdateTask={handleUpdateTask}
        />
      )}
      {page === "studylog" && (
        <StudyLog
          sessions={sessions}
          subjects={subjects}
          onAddSession={handleAddSession}
          onDeleteSession={handleDeleteSession}
        />
      )}
      {page === "notes" && (
        <Notes
          notes={notes}
          onAddNote={handleAddNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onTogglePin={handleTogglePin}
        />
      )}
      {page === "analytics" && (
        <Analytics
          exams={exams}
          sessions={sessions}
          tasks={tasks}
          pomodoro={pomodoros}
          achievements={achievements}
          totalXp={stats.xp}
          level={stats.level}
          streak={stats.streak}
        />
      )}
      {page === "calendar" && (
        <CalendarView
          exams={exams}
          sessions={sessions}
          plans={plans}
        />
      )}

      {notification && (
        <div className="notification-toast">
          <div className="notification-toast-icon">{notification.icon}</div>
          <div className="notification-toast-content">
            <div className="notification-toast-title">{notification.title}</div>
            <div className="notification-toast-desc">{notification.desc}</div>
          </div>
          <button className="notification-toast-close" onClick={() => setNotification(null)}>✕</button>
        </div>
      )}
    </Layout>
  );
}
