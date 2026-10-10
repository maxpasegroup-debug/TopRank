import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { phase, requireWindow, rankEntries, verifiedScore, studyStreak } from "@/server/competition/rules";
import { competitionSchema, participationSchema, adminCompetitionSchema, definitionSchema } from "@/server/competition/validation";
const start = new Date("2026-10-10T00:00:00Z"), end = new Date("2026-10-11T00:00:00Z");
function entry(id: string, score: string | null, timeSeconds = 10, joinedAt = start) { return { id, score: score === null ? null : new Prisma.Decimal(score), timeSeconds, joinedAt, disqualified: false }; }
describe("competition windows and ranking", () => {
 it("derives scheduled, active and awaiting-results phases without invented activity", () => {
   expect(phase("PUBLISHED", start, end, new Date(start.getTime() - 1))).toBe("SCHEDULED");
   expect(phase("PUBLISHED", start, end, start)).toBe("ACTIVE"); expect(phase("PUBLISHED", start, end, end)).toBe("AWAITING_RESULTS");
   expect(phase("COMPLETED", start, end, start)).toBe("COMPLETED");
 });
 it.each(["DRAFT", "CANCELLED", "COMPLETED"])("rejects joining %s", (status) => { expect(() => requireWindow(status, start, end, start)).toThrow(); });
 it("treats the opening boundary as inclusive and closing boundary as exclusive", () => { expect(() => requireWindow("PUBLISHED", start, end, start)).not.toThrow(); expect(() => requireWindow("PUBLISHED", start, end, end)).toThrow(); });
 it("orders exact decimals, shorter time and earlier participation", () => {
   const rows = rankEntries([entry("low", "4.001"), entry("slow", "4.002", 20), entry("later", "4.002", 10, end), entry("first", "4.002")]);
   expect(rows.map((r) => r.id)).toEqual(["first", "later", "slow", "low"]);
 });
 it("shares exact-tie placements without random tie-breaks and skips occupied ranks", () => {
   const rows = rankEntries([entry("b", "4"), entry("a", "4"), entry("c", "3")]);
   expect(rows.map((r) => r.rank)).toEqual([1, 1, 3]); expect(rankEntries([...rows].reverse()).map((r) => r.rank)).toEqual([1, 1, 3]);
 });
 it("excludes unfinished and disqualified entries and handles empty rankings", () => { expect(rankEntries([entry("blank", null), { ...entry("dq", "100"), disqualified: true }])).toEqual([]); expect(rankEntries([])).toEqual([]); });
 it("normalizes persisted scores with documented four-place percentage precision", () => { expect(verifiedScore({ score: "1", maximumScore: "3", answered: 1, timeSeconds: 5 }, "PERCENT_SCORE").score.toString()).toBe("33.3333"); });
 it.each([{ score: "100", maximumScore: "4", answered: 1, timeSeconds: 1 }, { score: "NaN", maximumScore: "4", answered: 1, timeSeconds: 1 }, { score: "4", maximumScore: "0", answered: 1, timeSeconds: 1 }, { score: "4", maximumScore: "4", answered: 1, timeSeconds: -1 }, { score: 4, maximumScore: "4", answered: 1, timeSeconds: 1 }])("rejects invalid persisted results %j", (result) => { expect(() => verifiedScore(result, "RAW_SCORE")).toThrow(); });
 it("counts distinct consecutive UTC days with at least fifteen saved minutes", () => {
   const session = (day: number, minutes: number) => ({ startedAt: new Date(Date.UTC(2026, 9, day)), endedAt: new Date(Date.UTC(2026, 9, day, 0, minutes)) });
   expect(studyStreak([session(1, 8), session(1, 7), session(2, 15), session(4, 30)])).toBe(2);
   expect(studyStreak([{ startedAt: start, endedAt: null }])).toBe(0);
 });
});
describe("competition schema boundaries", () => {
 const config = { capacity: 100, minCompletedMocks: 0, scoring: "RAW_SCORE", awards: [] };
 const competition = { title: "Weekly challenge", type: "WEEKLY", mockExamId: "mock", startsAt: start.toISOString(), endsAt: end.toISOString(), config };
 it("accepts configured weekly and monthly challenges", () => { expect(competitionSchema.safeParse(competition).success).toBe(true); expect(competitionSchema.safeParse({ ...competition, type: "MONTHLY" }).success).toBe(true); });
 it("rejects reversed dates and excess capacity", () => { expect(competitionSchema.safeParse({ ...competition, endsAt: start.toISOString() }).success).toBe(false); expect(competitionSchema.safeParse({ ...competition, config: { ...config, capacity: 1001 } }).success).toBe(false); });
 it.each(["userId", "role", "rank", "score", "eligibility", "award"])("rejects manipulated client %s", (field) => { expect(participationSchema.safeParse({ action: "sync", id: "c", [field]: "forged" }).success).toBe(false); });
 it("requires a reason for cancellation and corrections", () => { expect(adminCompetitionSchema.safeParse({ action: "cancel", id: "c", version: 0 }).success).toBe(false); expect(adminCompetitionSchema.safeParse({ action: "recalculate", id: "c", version: 0 }).success).toBe(false); });
 it("rejects unattainable study-day thresholds beyond the evidence window", () => { expect(definitionSchema.safeParse({ code: "STUDY_DAYS", title: "Study activity", kind: "STUDY_DAYS", threshold: 31, badge: "home" }).success).toBe(false); });
});
