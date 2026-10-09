import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "@/server/auth/session";
import { AuthorizationApiError, ValidationApiError } from "@/server/api/errors";
const db = vi.hoisted(() => ({ $transaction: vi.fn(), exam: { findMany: vi.fn(), update: vi.fn(), create: vi.fn() },
  question: { findUnique: vi.fn(), update: vi.fn() }, learningResource: { findUnique: vi.fn(), update: vi.fn() },
  auditEvent: { create: vi.fn() }, helpRequest: { update: vi.fn(), findMany: vi.fn(), upsert: vi.fn() } }));
vi.mock("@/server/db", () => ({ prisma: db }));
import { changePublication, listPublicationRecords, respondToHelp, publicationSchema, createExam, examCreateSchema } from "@/server/operations/service";
import { createHelpRequest, listHelpRequests } from "@/server/help/service";
const admin: AuthUser = { id: "admin", role: "PLATFORM_ADMIN", name: "A", email: "a@example.com" };
const student: AuthUser = { ...admin, id: "student", role: "STUDENT" };
const publication = { entity: "EXAM" as const, id: "exam", status: "PUBLISHED" as const, active: true };
beforeEach(() => { vi.resetAllMocks(); db.$transaction.mockImplementation((fn) => fn(db)); });
describe("publication and support ownership (mocked persistence)", () => {
  it("creates new exams only as audited drafts", async () => {
    db.exam.create.mockResolvedValue({ id: "new-exam" });
    await createExam(admin, { code: "TEST_EXAM", name: "Test exam", category: "OTHER" });
    expect(db.exam.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "DRAFT" }) }));
    expect(db.auditEvent.create).toHaveBeenCalledWith({ data: { actorId: admin.id, entity: "EXAM", entityId: "new-exam", action: "EXAM_CREATED_DRAFT" } });
    expect(examCreateSchema.safeParse({ code: "TEST", name: "Test exam", category: "OTHER", officialUrl: "javascript:alert(1)" }).success).toBe(false);
  });
  it.each(["STUDENT", "TEACHER", "PARENT", "SCHOOL_ADMIN"] as const)("denies %s global publication permissions", async (role) => {
    await expect(changePublication({ ...admin, role }, publication)).rejects.toBeInstanceOf(AuthorizationApiError);
    await expect(listPublicationRecords({ ...admin, role }, "EXAM")).rejects.toBeInstanceOf(AuthorizationApiError);
    expect(db.$transaction).not.toHaveBeenCalled(); expect(db.exam.findMany).not.toHaveBeenCalled();
  });
  it("writes publication and minimal audit metadata together", async () => {
    await changePublication(admin, publication); expect(db.auditEvent.create).toHaveBeenCalledWith({ data: { actorId: admin.id, entity: "EXAM", entityId: "exam", action: "PUBLICATION_PUBLISHED" } });
  });
  it("rejects publishing unsafe links before update", async () => {
    db.learningResource.findUnique.mockResolvedValue({ url: "javascript:alert(1)" });
    await expect(changePublication(admin, { ...publication, entity: "RESOURCE" })).rejects.toBeInstanceOf(ValidationApiError);
    expect(db.learningResource.update).not.toHaveBeenCalled(); expect(db.auditEvent.create).not.toHaveBeenCalled();
  });
  it("rejects unreviewed question publication", async () => {
    db.question.findUnique.mockResolvedValue({ reviewStatus: "NEEDS_REVIEW", exams: [] });
    await expect(changePublication(admin, { ...publication, entity: "QUESTION" })).rejects.toBeInstanceOf(ValidationApiError);
    expect(db.question.update).not.toHaveBeenCalled(); expect(db.auditEvent.create).not.toHaveBeenCalled();
  });
  it("denies scoring and review fields for the wrong entity", () => {
    expect(publicationSchema.safeParse({ ...publication, scoringMode: "EXACT_SET" }).success).toBe(false);
    expect(publicationSchema.safeParse({ ...publication, reviewStatus: "REVIEWED" }).success).toBe(false);
  });
  it("audits support response without private messages in audit records", async () => {
    await respondToHelp(admin, { id: "help", status: "RESOLVED", response: "Study guidance" });
    expect(db.auditEvent.create).toHaveBeenCalledWith({ data: { actorId: admin.id, entity: "HELP_REQUEST", entityId: "help", action: "HELP_RESOLVED" } });
  });
  it("bounds student support reads to their own records", async () => {
    await listHelpRequests(student); expect(db.helpRequest.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: student.id }, take: 100 }));
  });
  it("uses owner-bound idempotency keys for help creation", async () => {
    const input = { requestKey: "8664dc14-a97f-4e63-9747-0a76e597a077", subject: "Need help", message: "Please explain this concept" };
    db.helpRequest.upsert.mockResolvedValue({ id: "help", ...input });
    await expect(createHelpRequest(student, input)).resolves.toMatchObject({ id: "help" });
    expect(db.helpRequest.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { userId_requestKey: { userId: student.id, requestKey: input.requestKey } }, update: {} }));
  });
});
