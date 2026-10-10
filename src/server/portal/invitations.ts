import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import type { AuthUser } from "@/server/auth/session";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { ConflictApiError, ValidationApiError } from "@/server/api/errors";
import { atomic } from "@/server/commerce/transaction";
import { portalMutationSchema, inviteAcceptSchema } from "./validation";
import { freshActor, tenantContext, portalAudit, denied } from "./authorization";
type Invite = Extract<z.output<typeof portalMutationSchema>, { action: "invite" }>;
export const invitationHash = (token: string) => createHash("sha256").update(token).digest("hex");
export function invitationTerms(input: { role: string; duty: string; schoolId: string | null }) {
 if (!["PARENT", "TEACHER", "SCHOOL_ADMIN"].includes(input.role)) throw new ValidationApiError();
 if (input.role === "PARENT") { if (input.schoolId || input.duty !== "PARENT") throw new ValidationApiError(); return null; }
 if (!input.schoolId) throw new ValidationApiError("Institution context is required");
 if (input.role === "SCHOOL_ADMIN") { if (input.duty !== "ADMIN") throw new ValidationApiError(); return "ADMIN" as const; }
 if (!["TEACHING", "MENTOR", "COUNSELLING"].includes(input.duty)) throw new ValidationApiError();
 return input.duty === "TEACHING" ? "TEACHER" as const : "STAFF" as const;
}
export async function createInvitation(user: AuthUser, input: Invite) {
 const membershipRole = invitationTerms(input);
 if (input.expiresAt <= new Date()) throw new ValidationApiError("Invitation window has expired");
 return atomic(async (tx) => {
   const actor = await freshActor(user, tx, ["SCHOOL_ADMIN", "PLATFORM_ADMIN"]);
   if (actor.role !== "PLATFORM_ADMIN" && input.role !== "TEACHER") throw denied();
   if (input.schoolId) await tenantContext(user, input.schoolId, tx, true);
   const old = await tx.portalInvitation.findUnique({ where: { requestKey: input.requestKey } });
   if (old) {
     if (old.issuerId !== actor.id || old.email !== input.email || old.schoolId !== input.schoolId || old.role !== input.role || old.duty !== input.duty || old.expiresAt.getTime() !== input.expiresAt.getTime() || old.name !== input.name || old.authorizationBasis !== input.authorizationBasis || old.verificationReference !== input.verificationReference) throw new ConflictApiError();
     return { id: old.id, token: null, status: old.status };
   }
   await tx.portalInvitation.updateMany({ where: { email: input.email, schoolId: input.schoolId, status: "PENDING", expiresAt: { lte: new Date() } }, data: { status: "EXPIRED" } });
   const duplicate = await tx.portalInvitation.findFirst({ where: { email: input.email, schoolId: input.schoolId, status: "PENDING", expiresAt: { gt: new Date() } } });
   if (duplicate) throw new ConflictApiError("A pending invitation already exists");
   const token = randomBytes(32).toString("base64url");
   const invitation = await tx.portalInvitation.create({ data: { schoolId: input.schoolId, issuerId: actor.id, email: input.email, name: input.name,
     role: input.role, duty: input.duty, membershipRole, tokenHash: invitationHash(token), requestKey: input.requestKey,
     authorizationBasis: input.authorizationBasis, verificationReference: input.verificationReference, expiresAt: input.expiresAt } });
   await portalAudit(tx, actor.id, input.schoolId, invitation.id, "INVITATION_CREATED");
   return { id: invitation.id, token, status: "PENDING" };
 });
}
export async function acceptInvitation(raw: z.input<typeof inviteAcceptSchema>) {
 const input = inviteAcceptSchema.parse(raw);
 // Hashing is outside retryable transactions; no session is created by acceptance.
 const passwordHash = await hashPassword(input.password);
 return atomic(async (tx) => {
   const invitation = await tx.portalInvitation.findUnique({ where: { tokenHash: invitationHash(input.token) } });
   if (!invitation || invitation.status !== "PENDING" || invitation.email !== input.email || invitation.expiresAt <= new Date()) throw denied();
   const issuer = await tx.user.findUnique({ where: { id: invitation.issuerId } });
   if (!issuer || issuer.status !== "ACTIVE" || !["PLATFORM_ADMIN", "SCHOOL_ADMIN"].includes(issuer.role)) throw denied();
   const issuerIdentity = { id: issuer.id, name: issuer.name, email: issuer.email, role: issuer.role };
   if (issuer.role !== "PLATFORM_ADMIN" && invitation.role !== "TEACHER") throw denied();
   const membershipRole = invitationTerms(invitation);
   if (invitation.schoolId) await tenantContext(issuerIdentity, invitation.schoolId, tx, true);
   if (membershipRole !== invitation.membershipRole || !invitation.authorizationBasis || !invitation.verificationReference) throw denied();
   let target = await tx.user.findUnique({ where: { email: input.email } });
   if (target) {
     // Never upgrade a public student account or reset an existing staff password.
     if (target.status !== "ACTIVE" || target.role !== invitation.role || !await verifyPassword(input.password, target.passwordHash)) throw denied();
   } else {
     target = await tx.user.create({ data: { email: input.email, name: invitation.name, passwordHash, role: invitation.role, status: "ACTIVE" } });
     if (target.role === "PARENT") await tx.parentProfile.create({ data: { userId: target.id } });
     else if (target.role === "TEACHER") await tx.teacherProfile.create({ data: { userId: target.id } });
   }
   if (invitation.schoolId && membershipRole) {
     const old = await tx.schoolMembership.findUnique({ where: { schoolId_userId: { schoolId: invitation.schoolId, userId: target.id } } });
     if (old?.status === "ACTIVE") throw new ConflictApiError("Membership already exists");
     if (old) await tx.schoolStaffAssignment.updateMany({ where: { membershipId: old.id }, data: { active: false } });
     await tx.schoolMembership.upsert({ where: { schoolId_userId: { schoolId: invitation.schoolId, userId: target.id } },
       create: { schoolId: invitation.schoolId, userId: target.id, role: membershipRole, status: "ACTIVE", duty: invitation.duty },
       update: { role: membershipRole, status: "ACTIVE", duty: invitation.duty, version: { increment: 1 } } });
   }
   const claimed = await tx.portalInvitation.updateMany({ where: { id: invitation.id, status: "PENDING", expiresAt: { gt: new Date() } }, data: { status: "ACCEPTED", acceptedAt: new Date(), acceptedUserId: target.id } });
   if (claimed.count !== 1) throw new ConflictApiError();
   await tx.session.updateMany({ where: { userId: target.id, revokedAt: null }, data: { revokedAt: new Date() } });
   await portalAudit(tx, target.id, invitation.schoolId, invitation.id, "INVITATION_ACCEPTED");
   return { accepted: true, requiresLogin: true };
 });
}
// Public acceptance uses the existing auth activation/limiter/origin boundaries in its route.
export async function revokeInvitation(user: AuthUser, id: string, reason: string) {
 return atomic(async (tx) => {
   const actor = await freshActor(user, tx, ["SCHOOL_ADMIN", "PLATFORM_ADMIN"]);
   const invitation = await tx.portalInvitation.findUnique({ where: { id } });
   if (!invitation) throw denied();
   if (actor.role !== "PLATFORM_ADMIN") {
     if (!invitation.schoolId || invitation.role !== "TEACHER") throw denied();
     await tenantContext(user, invitation.schoolId, tx, true);
   }
   if (invitation.status === "ACCEPTED") throw new ConflictApiError("Accepted memberships require membership removal");
   await tx.portalInvitation.updateMany({ where: { id, status: "PENDING" }, data: { status: "REVOKED" } });
   await portalAudit(tx, actor.id, invitation.schoolId, id, "INVITATION_REVOKED", reason); return { id };
 });
}
