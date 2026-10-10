import { Prisma } from "@/generated/prisma/client";
import { ValidationApiError } from "@/server/api/errors";
export function phase(status: string, startsAt: Date, endsAt: Date, now: Date) {
 if (status !== "PUBLISHED") return status;
 return now < startsAt ? "SCHEDULED" : now < endsAt ? "ACTIVE" : "AWAITING_RESULTS";
}
export function requireWindow(status: string, startsAt: Date, endsAt: Date, now: Date) {
 if (phase(status, startsAt, endsAt, now) !== "ACTIVE") throw new ValidationApiError("Competition is not open for new attempts");
}
export function verifiedScore(result: unknown, mode: string) {
 const value = result as { score?: unknown; maximumScore?: unknown; timeSeconds?: unknown; answered?: unknown };
 if (!value || typeof value.score !== "string" || typeof value.maximumScore !== "string" ||
     !Number.isInteger(value.timeSeconds) || Number(value.timeSeconds) < 0 || !Number.isInteger(value.answered) || Number(value.answered) < 0) throw new ValidationApiError("Verified result is unavailable");
 const score = new Prisma.Decimal(value.score), max = new Prisma.Decimal(value.maximumScore);
 if (!score.isFinite() || !max.isFinite() || max.lte(0) || score.gt(max)) throw new ValidationApiError("Verified result is unavailable");
 return { score: mode === "PERCENT_SCORE" ? score.div(max).mul(100).toDecimalPlaces(4) : score, timeSeconds: Number(value.timeSeconds) };
}
export function rankEntries<T extends { id: string; score: Prisma.Decimal | null; timeSeconds: number | null; joinedAt: Date; disqualified: boolean }>(entries: T[]) {
 const sorted = entries.filter((e) => !e.disqualified && e.score !== null && e.timeSeconds !== null).sort((a, b) =>
   b.score!.cmp(a.score!) || a.timeSeconds! - b.timeSeconds! || a.joinedAt.getTime() - b.joinedAt.getTime() || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
 let rank = 1;
 return sorted.map((entry, index) => { const previous = sorted[index - 1];
   if (previous && (!entry.score!.eq(previous.score!) || entry.timeSeconds !== previous.timeSeconds || entry.joinedAt.getTime() !== previous.joinedAt.getTime())) rank = index + 1;
   return { ...entry, rank }; });
}
export function studyStreak(sessions: { startedAt: Date; endedAt: Date | null }[]) {
 const days = new Map<string, number>();
 for (const s of sessions) { if (!s.endedAt) continue; const minutes = Math.max(0, Math.min(720, (s.endedAt.getTime() - s.startedAt.getTime()) / 60000));
   const day = s.startedAt.toISOString().slice(0, 10); days.set(day, (days.get(day) ?? 0) + minutes); }
 const dates = [...days].filter(([, minutes]) => minutes >= 15).map(([day]) => new Date(day).getTime()).sort((a, b) => a - b);
 let longest = 0, count = 0, previous = 0;
 for (const date of dates) { count = date - previous === 86400000 ? count + 1 : 1; longest = Math.max(longest, count); previous = date; } return longest;
}
