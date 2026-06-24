export type Theme = "dark";

export interface Exam {
  id: string;
  title: string;
  subject: string;
  date: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  priority: "low" | "medium" | "high" | "critical";
  syllabus: number;
  completedSyllabus: number;
  notes: string;
  color: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface StudySession {
  id: string;
  date: string;
  subject: string;
  duration: number;
  notes: string;
  productivity: 1 | 2 | 3 | 4 | 5;
  mood: "great" | "good" | "okay" | "bad" | "tired";
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  priority: "low" | "medium" | "high" | "critical";
  dueDate: string;
  date: string;
  completed: boolean;
  recurring: "none" | "daily" | "weekly";
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  date: string;
  focusDuration: number;
  breakDuration: number;
  sessions: number;
  subject: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlan {
  id: string;
  examId: string;
  days: StudyDay[];
  createdAt: string;
}

export interface StudyDay {
  id: string;
  date: string;
  subjects: { name: string; hours: number }[];
  totalHours: number;
  isRevision: boolean;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface UserStats {
  streak: number;
  longestStreak: number;
  xp: number;
  level: number;
  totalStudyHours: number;
  totalFocusSessions: number;
  completedTasks: number;
  totalTasks: number;
  weeklyHours: number[];
  lastStudyDate: string | null;
}

// Attendance Tracker
export interface AttendanceSubject {
  id: string;
  name: string;
  color: string;
  totalClasses: number;
  attendedClasses: number;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  date: string;
  status: "present" | "absent" | "late";
}

// GPA Calculator
export type Grade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D+" | "D" | "F";

export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: Grade;
  semester: number;
}

// Assignment Manager
export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high" | "critical";
  completed: boolean;
  createdAt: string;
}

// Exam Countdown
export interface ExamCountdown {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  color: string;
  createdAt: string;
}
