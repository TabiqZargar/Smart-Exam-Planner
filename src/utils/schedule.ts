import { differenceInCalendarDays, addDays, format } from "date-fns";
import { generateId } from "./helpers";
import type { Exam, StudyDay, StudyPlan } from "../types";

interface ScheduleInput {
  exam: Exam;
  subjects: { name: string; difficulty: number }[];
  dailyHours: number;
  performanceData?: { subject: string; score: number }[];
  weakSubjects?: string[];
  remainingSyllabus?: { subject: string; percent: number }[];
  cramMode?: boolean;
}

export function generateSchedule(input: ScheduleInput): StudyPlan {
  const { exam, subjects, dailyHours, weakSubjects = [], remainingSyllabus = [], cramMode = false } = input;
  const today = new Date();
  const examDate = new Date(exam.date);
  const totalDays = differenceInCalendarDays(examDate, today);
  if (totalDays <= 0) return { id: generateId(), examId: exam.id, days: [], createdAt: new Date().toISOString() };

  const effectiveHours = cramMode ? Math.min(dailyHours * 1.3, 12) : dailyHours;
  const studyDays = Math.max(1, Math.floor(totalDays * 0.8));
  const revisionDays = totalDays - studyDays;

  const subjectWeights: Record<string, number> = {};
  for (const s of subjects) {
    let weight = s.difficulty;
    if (weakSubjects.includes(s.name)) weight *= 1.5;
    const rem = remainingSyllabus.find((r) => r.subject === s.name);
    if (rem) weight *= 1 + rem.percent / 100;
    subjectWeights[s.name] = weight;
  }
  const totalWeight = Object.values(subjectWeights).reduce((a, b) => a + b, 0);

  const totalHours = studyDays * effectiveHours;
  const subjectHours: { name: string; hours: number }[] = [];
  for (const s of subjects) {
    const hours = (subjectWeights[s.name] / totalWeight) * totalHours;
    subjectHours.push({ name: s.name, hours: Math.round(hours * 2) / 2 });
  }

  const sessionSlots: { name: string; hours: number }[] = [];
  for (const sh of subjectHours) {
    let allocated = 0;
    while (allocated < sh.hours - 0.01) {
      const h = Math.min(1.5, sh.hours - allocated);
      sessionSlots.push({ name: sh.name, hours: Math.round(h * 10) / 10 });
      allocated += h;
    }
  }
  for (let i = sessionSlots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sessionSlots[i], sessionSlots[j]] = [sessionSlots[j], sessionSlots[i]];
  }

  const revisionSet = new Set<number>();
  if (revisionDays > 0) {
    const step = totalDays / (revisionDays + 1);
    for (let r = 1; r <= revisionDays; r++) {
      const idx = Math.round(step * r);
      if (idx < totalDays) revisionSet.add(idx);
    }
  }

  const daySubjects: { name: string; hours: number }[][] = [];
  let pos = 0;
  for (let d = 0; d < studyDays; d++) {
    const list: { name: string; hours: number }[] = [];
    let h = 0;
    while (pos < sessionSlots.length && h < effectiveHours) {
      const s = sessionSlots[pos];
      if (h + s.hours <= effectiveHours) {
        list.push(s);
        h += s.hours;
        pos++;
      } else break;
    }
    daySubjects.push(list);
  }
  while (pos < sessionSlots.length) {
    daySubjects[daySubjects.length - 1].push(sessionSlots[pos]);
    pos++;
  }

  let si = 0;
  const days: StudyDay[] = [];
  for (let i = 0; i < totalDays; i++) {
    const date = addDays(today, i);
    if (revisionSet.has(i)) {
      days.push({
        id: generateId(),
        date: format(date, "yyyy-MM-dd"),
        subjects: subjects.map((s) => ({ name: s.name, hours: effectiveHours / subjects.length })),
        totalHours: effectiveHours,
        isRevision: true,
        completed: false,
      });
    } else {
      const subs = daySubjects[si] || [];
      si++;
      days.push({
        id: generateId(),
        date: format(date, "yyyy-MM-dd"),
        subjects: subs,
        totalHours: subs.reduce((s, x) => s + x.hours, 0),
        isRevision: false,
        completed: false,
      });
    }
  }

  return { id: generateId(), examId: exam.id, days, createdAt: new Date().toISOString() };
}

export function calculateReadiness(plan: StudyPlan, exams: Exam[]): number {
  if (plan.days.length === 0) return 0;
  const completedDays = plan.days.filter((d) => d.completed).length;
  const progress = completedDays / plan.days.length;
  const exam = exams.find((e) => e.id === plan.examId);
  const syllabus = exam ? exam.completedSyllabus / Math.max(exam.syllabus, 1) : 0;
  return Math.round((progress * 0.5 + syllabus * 0.5) * 100);
}
