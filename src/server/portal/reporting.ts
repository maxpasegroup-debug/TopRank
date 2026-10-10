import { Prisma } from "@/generated/prisma/client";
import type { Tx } from "@/server/commerce/transaction";
import type { Scope } from "./validation";
import { verifiedScore } from "@/server/competition/rules";
import { portalGuidance } from "@/server/sia/service";
export function csvCell(value: string | number) {
 const text = String(value); return `"${(/^[=+@\-\t\r\n]/.test(text) ? "'" : "") + text.replace(/"/g, '""')}"`;
}
export async function sharedSummary(db: Tx, student: { id: string; name: string }, scopes: Scope[]) {
 const data: { student: { id: string; name: string }; scopes: Scope[]; activity: null | { completedTasks: number; completedLessons: number; recordedMinutes: number; missions: { title: string; status: string; dueDate: string }[] };
 mocks: null | { id: string; title: string; score: string; maximumScore: string; finalizedAt: string }[];
 achievements: null | { title: string; badge: string; awardedAt: string; prizeStatus: string | null }[] } = { student, scopes, activity: null, mocks: null, achievements: null };
 if (scopes.includes("ACTIVITY")) {
   const [completedTasks, completedLessons, sessions, missions] = await Promise.all([
     db.missionTask.count({ where: { plan: { userId: student.id }, status: "COMPLETED" } }),
     db.studentLessonProgress.count({ where: { userId: student.id, completedAt: { not: null } } }),
     db.studySession.findMany({ where: { userId: student.id, endedAt: { not: null } }, orderBy: { startedAt: "desc" }, take: 100, select: { startedAt: true, endedAt: true } }),
     db.missionTask.findMany({ where: { plan: { userId: student.id, active: true } }, orderBy: [{ dueDate: "asc" }, { id: "asc" }], take: 25, select: { title: true, status: true, dueDate: true } }),
   ]);
   data.activity = { completedTasks, completedLessons, recordedMinutes: sessions.reduce((n, s) => n + Math.max(0, Math.min(720, Math.floor((s.endedAt!.getTime() - s.startedAt.getTime()) / 60000))), 0),
     missions: missions.map((m) => ({ title: m.title, status: m.status, dueDate: m.dueDate.toISOString() })) };
 }
 if (scopes.includes("MOCKS")) {
   const mocks = await db.mockAttempt.findMany({ where: { userId: student.id, status: { not: "IN_PROGRESS" }, finalizedAt: { not: null } }, orderBy: { startedAt: "desc" }, take: 25,
     select: { id: true, mockExam: { select: { title: true } }, result: true, finalizedAt: true } });
   data.mocks = mocks.filter((m) => m.result && m.finalizedAt).map((m) => {
     const score = verifiedScore(m.result, "RAW_SCORE");
     const maximum = new Prisma.Decimal(String((m.result as { maximumScore?: string }).maximumScore));
     return { id: m.id, title: m.mockExam.title, score: score.score.toString(), maximumScore: maximum.toString(), finalizedAt: m.finalizedAt!.toISOString() };
   });
 }
 if (scopes.includes("ACHIEVEMENTS")) {
   const achievements = await db.earnedAchievement.findMany({ where: { userId: student.id, status: "ACTIVE", definition: { status: "PUBLISHED" } }, orderBy: { awardedAt: "desc" }, take: 25,
     select: { title: true, badge: true, awardedAt: true, prize: { select: { status: true } } } });
   data.achievements = achievements.map((a) => ({ title: a.title, badge: a.badge, awardedAt: a.awardedAt.toISOString(), prizeStatus: a.prize?.status ?? null }));
 }
 return { ...data, sia: portalGuidance(data.activity) };
}
