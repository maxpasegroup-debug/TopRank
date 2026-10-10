import { z } from "zod";
export const id = z.string().min(1).max(128);
export const reason = z.string().trim().min(8).max(500);
export const scopesSchema = z.array(z.enum(["ACTIVITY", "MOCKS", "ACHIEVEMENTS", "ANNOUNCEMENTS", "SUPPORT", "COUNSELLING"])).min(1).max(6).refine((v) => new Set(v).size === v.length);
export type Scope = z.output<typeof scopesSchema>[number];
export const date = z.union([z.iso.datetime(), z.date()]).transform((v) => new Date(v));
const verification = { authorizationBasis: reason, verificationReference: z.string().trim().min(8).max(160), expiresAt: date };
export const portalMutationSchema = z.discriminatedUnion("action", [
 z.object({ action: z.literal("schoolCreate"), name: z.string().trim().min(3).max(160), slug: z.string().regex(/^[a-z0-9-]{3,80}$/), reason }).strict(),
 z.object({ action: z.literal("schoolUpdate"), schoolId: id, version: z.number().int().nonnegative(), name: z.string().trim().min(3).max(160), profile: z.string().trim().max(1000), reason }).strict(),
 z.object({ action: z.literal("schoolStatus"), schoolId: id, version: z.number().int().nonnegative(), status: z.enum(["ACTIVE", "SUSPENDED", "TRIAL"]), reason }).strict(),
 z.object({ action: z.literal("guardianPropose"), studentId: id, parentId: id, relationshipType: z.enum(["MOTHER", "FATHER", "GUARDIAN", "OTHER"]), scopes: scopesSchema.refine((s) => !s.includes("COUNSELLING") && !s.includes("SUPPORT")), ...verification }).strict(),
 z.object({ action: z.literal("guardianDecision"), id, version: z.number().int().nonnegative(), decision: z.enum(["ACCEPT", "REJECT", "REVOKE", "NARROW"]), scopes: scopesSchema.optional(), reason }).strict(),
 z.object({ action: z.literal("enroll"), schoolId: id, studentId: id, scopes: scopesSchema, ...verification }).strict(),
 z.object({ action: z.literal("enrollmentDecision"), id, version: z.number().int().nonnegative(), decision: z.enum(["ACCEPT", "REJECT", "REVOKE", "NARROW"]), scopes: scopesSchema.optional(), reason }).strict(),
 z.object({ action: z.literal("enrollmentRemove"), schoolId: id, id, version: z.number().int().nonnegative(), reason }).strict(),
 z.object({ action: z.literal("invite"), schoolId: id.nullable(), email: z.email().transform((s) => s.toLowerCase()), name: z.string().trim().min(2).max(120),
   role: z.enum(["PARENT", "TEACHER", "SCHOOL_ADMIN"]), duty: z.enum(["PARENT", "TEACHING", "MENTOR", "COUNSELLING", "ADMIN"]), requestKey: z.uuid(), ...verification }).strict(),
 z.object({ action: z.literal("inviteRevoke"), id, reason }).strict(),
 z.object({ action: z.literal("membership"), schoolId: id, id, version: z.number().int().nonnegative(), status: z.enum(["ACTIVE", "SUSPENDED", "REMOVED"]),
   duty: z.enum(["TEACHING", "MENTOR", "COUNSELLING", "ADMIN"]), reason }).strict(),
 z.object({ action: z.literal("assign"), schoolId: id, enrollmentId: id, membershipId: id, active: z.boolean(), reason }).strict(),
 z.object({ action: z.literal("feedback"), schoolId: id, studentId: id, confidential: z.boolean(), message: z.string().trim().min(3).max(2000), requestKey: z.uuid() }).strict(),
 z.object({ action: z.literal("announce"), schoolId: id, title: z.string().trim().min(3).max(100), message: z.string().trim().min(3).max(2000), requestKey: z.uuid() }).strict(),
 z.object({ action: z.literal("announcementWithdraw"), schoolId: id, id, reason }).strict(),
 z.object({ action: z.literal("readNotification"), id }).strict(),
]);
export const inviteAcceptSchema = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/), email: z.email().transform((s) => s.toLowerCase()),
 password: z.string().min(8).max(128).refine((s) => Buffer.byteLength(s, "utf8") <= 72, "Password exceeds hashing limit") }).strict();
export const portalQuerySchema = z.object({ mode: z.enum(["home", "student", "export", "feedback"]).default("home"), schoolId: id.optional(), studentId: id.optional(),
 page: z.coerce.number().int().min(1).max(1000).default(1), reason: reason.optional() }).strict();
