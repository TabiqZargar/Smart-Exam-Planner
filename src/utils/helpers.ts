import { format, formatDistanceToNow, differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function formatDate(date: string | Date, fmt: string = "MMM d, yyyy"): string {
  return format(new Date(date), fmt);
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function daysUntil(date: string | Date): number {
  return differenceInDays(new Date(date), new Date());
}

export function getWeekDates(): string[] {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map(d => format(d, "yyyy-MM-dd"));
}

export function getMonthDates(): string[] {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return eachDayOfInterval({ start, end }).map(d => format(d, "yyyy-MM-dd"));
}

export function getDayName(date: string): string {
  return format(new Date(date), "EEE");
}

export function getShortDate(date: string): string {
  return format(new Date(date), "MMM d");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function calculateXpForLevel(level: number): number {
  return level * level * 100;
}

export function getProgressPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getGradeColor(percentage: number): string {
  if (percentage >= 80) return "var(--success)";
  if (percentage >= 60) return "var(--warning)";
  if (percentage >= 40) return "var(--accent)";
  return "var(--danger)";
}

export const EXAM_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
];

export const SUBJECT_ICONS: Record<string, string> = {
  mathematics: "📐",
  physics: "⚡",
  chemistry: "🧪",
  biology: "🧬",
  english: "📖",
  history: "📜",
  geography: "🌍",
  computer: "💻",
  economics: "📊",
  accounting: "💰",
  business: "🏢",
  art: "🎨",
  music: "🎵",
  philosophy: "🤔",
  psychology: "🧠",
  sociology: "👥",
  literature: "📚",
  anatomy: "🦴",
  pharmacology: "💊",
  law: "⚖️",
};
