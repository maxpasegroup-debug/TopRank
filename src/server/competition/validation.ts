import { z } from "zod";
import { idSchema } from "@/server/mock/validation";
export const configSchema = z.object({ capacity: z.number().int().min(1).max(1000),
 minCompletedMocks: z.number().int().min(0).max(100), scoring: z.enum(["RAW_SCORE", "PERCENT_SCORE"]),
 awards: z.array(z.object({ definitionId: idSchema, fromRank: z.number().int().min(1).max(1000),
 toRank: z.number().int().min(1).max(1000), prizeLabel: z.string().trim().max(160) }).strict()
 .refine((v) => v.fromRank <= v.toRank)).max(10) }).strict()
 .refine((v) => new Set(v.awards.map((a) => a.definitionId)).size === v.awards.length, "Use each award definition once");
export const competitionSchema = z.object({ title: z.string().trim().min(3).max(160), type: z.enum(["WEEKLY", "MONTHLY", "CUSTOM"]),
 mockExamId: idSchema, startsAt: z.iso.datetime(), endsAt: z.iso.datetime(), config: configSchema }).strict()
 .refine((v) => new Date(v.startsAt) < new Date(v.endsAt), "End must follow start");
export const definitionSchema = z.object({ code: z.string().regex(/^[A-Z][A-Z0-9_]{2,39}$/), title: z.string().trim().min(3).max(160),
 kind: z.enum(["FIRST_MOCK", "STUDY_DAYS", "LESSONS", "IMPROVEMENT", "PLACEMENT"]), threshold: z.number().int().min(1).max(100),
 badge: z.enum(["compete", "progress", "learn", "home"]) }).strict()
 .refine((v) => v.kind !== "FIRST_MOCK" || v.threshold === 1, "First mock threshold must be one")
 .refine((v) => v.kind !== "STUDY_DAYS" || v.threshold <= 30, "Study streak threshold cannot exceed the 30-day evidence window");
const versioned = { id: idSchema, version: z.number().int().nonnegative() };
export const adminCompetitionSchema = z.discriminatedUnion("action", [
 z.object({ action: z.literal("create"), competition: competitionSchema }).strict(),
 z.object({ action: z.literal("edit"), ...versioned, competition: competitionSchema }).strict(),
 z.object({ action: z.enum(["validate", "publish", "close", "cancel", "recalculate"]), ...versioned, reason: z.string().trim().min(3).max(300).optional() }).strict()
 .refine((v) => !["cancel", "recalculate"].includes(v.action) || Boolean(v.reason)),
 z.object({ action: z.literal("moderate"), ...versioned, entryId: idSchema, disqualified: z.boolean(), reason: z.string().trim().min(3).max(300) }).strict(),
 z.object({ action: z.literal("definition"), definition: definitionSchema }).strict(),
 z.object({ action: z.literal("definition-edit"), ...versioned, definition: definitionSchema }).strict(),
 z.object({ action: z.literal("definition-status"), ...versioned, publish: z.boolean() }).strict(),
 z.object({ action: z.literal("award-status"), ...versioned, revoke: z.boolean(), reason: z.string().trim().min(3).max(300) }).strict(),
 z.object({ action: z.literal("prize"), ...versioned, status: z.enum(["PENDING_REVIEW", "APPROVED", "REJECTED", "FULFILLED"]), reason: z.string().trim().min(3).max(300) }).strict(),
]);
export const participationSchema = z.discriminatedUnion("action", [
 z.object({ action: z.literal("join"), id: idSchema, requestKey: z.uuid() }).strict(),
 z.object({ action: z.literal("visibility"), id: idSchema, visible: z.boolean() }).strict(),
 z.object({ action: z.literal("sync"), id: idSchema }).strict(),
]);
export const achievementSchema = z.discriminatedUnion("action", [
 z.object({ action: z.literal("check") }).strict(),
 z.object({ action: z.literal("share"), id: idSchema, enabled: z.boolean() }).strict(),
]);
export const pageSchema = z.coerce.number().int().min(1).max(10000).default(1);
export type CompetitionConfig = z.infer<typeof configSchema>;
