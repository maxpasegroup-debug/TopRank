import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { AuthorizationApiError, ConflictApiError, ValidationApiError } from "@/server/api/errors";
import type { AuthUser } from "@/server/auth/session";
import { previewStudyPlan } from "@/server/journey/planner";
import { journeySchema, taskSchema, planSchema, dateSchema } from "@/server/journey/validation";
import { safeResourceUrl } from "@/server/content/resource-url";

const db = vi.hoisted(() => ({
  studentProfile: { findUnique: vi.fn(), update: vi.fn() }, exam: { findFirst: vi.fn(), findMany: vi.fn() },
  examSubject: { findMany: vi.fn(), count: vi.fn() }, studyPlan: { findUnique: vi.fn(), updateMany: vi.fn(), create: vi.fn(), findFirst: vi.fn() },
  missionTask: { findFirst: vi.fn(), updateMany: vi.fn(), count: vi.fn() }, missionTaskEvent: { create: vi.fn() },
  studySession: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), updateMany: vi.fn(), findMany: vi.fn() },
  studentLessonProgress: { findUnique: vi.fn(), upsert: vi.fn(), findMany: vi.fn(), count: vi.fn() },
  lesson: { findFirst: vi.fn() }, $transaction: vi.fn(),
}));
vi.mock("@/server/db", () => ({ prisma: db }));
import { saveJourney, previewJourneyPlan, confirmJourneyPlan, changeMissionTask, getMissionBoard,
  updateStudySession, getLearningProgress, updateLearningProgress, getVerifiedProgress } from "@/server/journey/service";
const user: AuthUser = { id: "student-a", name: "Student", email: "s@example.com", role: "STUDENT" };
const start = new Date("2026-12-30T00:00:00Z");
const profile = { targetExamId: "exam", targetYear: 2027, dreamCollege: "My goal", dailyStudyMins: 121, preparationStart: start, focusSubjectIds: [] };
const key = "8664dc14-a97f-4e63-9747-0a76e597a077";

describe("student journey", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    db.$transaction.mockImplementation((fn) => fn(db));
    db.studentProfile.findUnique.mockResolvedValue(profile);
    db.exam.findFirst.mockResolvedValue({ id: "exam" });
    db.examSubject.findMany.mockResolvedValue([{ subject: { name: "Biology", slug: "biology", chapters: [{ slug: "cells", lessons: [{ title: "Cell structure", slug: "structure" }] }] } }]);
    db.studyPlan.findUnique.mockResolvedValue(null);
    db.studyPlan.create.mockResolvedValue({ id: "plan" });
  });
  it("splits exact daily availability across seven UTC days", () => {
    const lessons = ["a", "b", "c"].map((title) => ({ title, subject: "Science", href: "/learn" }));
    const tasks = previewStudyPlan(start, 121, lessons);
    expect(tasks).toHaveLength(21);
    for (let i = 0; i < 7; i++) expect(tasks.slice(i * 3, i * 3 + 3).reduce((n, t) => n + t.minutes, 0)).toBe(121);
    expect(tasks[6].dueDate.toISOString().slice(0, 10)).toBe("2027-01-01");
    expect(start.toISOString()).toBe("2026-12-30T00:00:00.000Z");
  });
  it.each([29, 721, 30.5, NaN])("rejects invalid daily minutes %s", (minutes) => {
    expect(() => previewStudyPlan(start, minutes, [{ title: "A", subject: "A", href: "/learn" }])).toThrow();
  });
  it("rejects an empty curriculum and invalid date", () => {
    expect(() => previewStudyPlan(start, 60, [])).toThrow();
    expect(() => previewStudyPlan(new Date("invalid"), 60, [{ title: "A", subject: "A", href: "/learn" }])).toThrow();
  });
  it("validates input strictly and deduplicates focus subjects", () => {
    expect(journeySchema.safeParse({ userId: "other" }).success).toBe(false);
    expect(journeySchema.parse({ focusSubjectIds: ["a", "a"] }).focusSubjectIds).toEqual(["a"]);
    expect(dateSchema.safeParse("2026-02-30").success).toBe(false);
    expect(taskSchema.safeParse({ id: "task", version: 0 }).success).toBe(false);
    expect(planSchema.safeParse({ requestKey: key, title: "My plan" }).success).toBe(false);
  });
  it("rejects nonstudent access before any database call", async () => {
    await expect(getMissionBoard({ ...user, role: "PARENT" })).rejects.toBeInstanceOf(AuthorizationApiError);
    expect(db.studyPlan.findFirst).not.toHaveBeenCalled();
  });
  it("rejects unavailable exams and subjects without saving", async () => {
    db.exam.findFirst.mockResolvedValueOnce(null);
    await expect(saveJourney(user, { targetExamId: "hidden" })).rejects.toBeInstanceOf(ValidationApiError);
    db.examSubject.count.mockResolvedValue(0);
    await expect(saveJourney(user, { focusSubjectIds: ["foreign"] })).rejects.toBeInstanceOf(ValidationApiError);
    expect(db.studentProfile.update).not.toHaveBeenCalled();
  });
  it("clears stale subject choices when changing exam", async () => {
    await saveJourney(user, { targetExamId: "new-exam" });
    expect(db.studentProfile.update).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: user.id }, data: expect.objectContaining({ focusSubjectIds: [], onboardingCompletedAt: null }) }));
  });
  it("confirms only the reviewed published-content draft transactionally", async () => {
    const preview = await previewJourneyPlan(user);
    await expect(confirmJourneyPlan(user, { requestKey: key, title: "My plan", previewToken: preview.previewToken })).resolves.toEqual({ id: "plan" });
    expect(db.studyPlan.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: user.id, tasks: { create: preview.tasks } }) }));
    expect(db.$transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    expect(db.examSubject.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ exam: { status: "PUBLISHED", active: true } }) }));
  });
  it("rejects a changed draft before any persistent write", async () => {
    await expect(confirmJourneyPlan(user, { requestKey: key, title: "My plan", previewToken: "0".repeat(64) })).rejects.toBeInstanceOf(ConflictApiError);
    expect(db.studyPlan.create).not.toHaveBeenCalled(); expect(db.studyPlan.updateMany).not.toHaveBeenCalled();
  });
  it("replays a confirmation without needing now-unpublished content", async () => {
    db.studyPlan.findUnique.mockResolvedValue({ id: "existing" });
    await expect(confirmJourneyPlan(user, { requestKey: key, title: "My plan", previewToken: "0".repeat(64) })).resolves.toEqual({ id: "existing" });
    expect(db.examSubject.findMany).not.toHaveBeenCalled(); expect(db.studyPlan.create).not.toHaveBeenCalled();
  });
  it("retries serialization conflicts with a bounded budget", async () => {
    db.$transaction.mockRejectedValue(new Prisma.PrismaClientKnownRequestError("conflict", { code: "P2034", clientVersion: "test" }));
    await expect(confirmJourneyPlan(user, { requestKey: key, title: "My plan", previewToken: "0".repeat(64) })).rejects.toBeInstanceOf(ConflictApiError);
    expect(db.$transaction).toHaveBeenCalledTimes(3);
  });
  it("rejects foreign tasks without updating or recording an event", async () => {
    db.missionTask.findFirst.mockResolvedValue(null);
    await expect(changeMissionTask(user, { id: "foreign", version: 0, status: "COMPLETED" })).rejects.toBeInstanceOf(ValidationApiError);
    expect(db.missionTask.findFirst).toHaveBeenCalledWith({ where: { id: "foreign", plan: { userId: user.id } } });
    expect(db.missionTask.updateMany).not.toHaveBeenCalled(); expect(db.missionTaskEvent.create).not.toHaveBeenCalled();
  });
  it("rejects stale task versions without an event", async () => {
    db.missionTask.findFirst.mockResolvedValue({ id: "task", status: "TODO", dueDate: start, version: 3 });
    db.missionTask.updateMany.mockResolvedValue({ count: 0 });
    await expect(changeMissionTask(user, { id: "task", version: 1, status: "COMPLETED" })).rejects.toBeInstanceOf(ConflictApiError);
    expect(db.missionTaskEvent.create).not.toHaveBeenCalled();
  });
  it("records successful changes and treats repeats as idempotent", async () => {
    db.missionTask.findFirst.mockResolvedValue({ id: "task", status: "TODO", dueDate: start, version: 0 });
    db.missionTask.updateMany.mockResolvedValue({ count: 1 });
    await changeMissionTask(user, { id: "task", version: 0, status: "COMPLETED" });
    expect(db.missionTaskEvent.create).toHaveBeenCalledWith({ data: { taskId: "task", status: "COMPLETED", dueDate: start } });
    db.missionTask.findFirst.mockResolvedValue({ id: "task", status: "COMPLETED", dueDate: start, version: 1 });
    await expect(changeMissionTask(user, { id: "task", version: 0, status: "COMPLETED" })).resolves.toEqual({ id: "task", version: 1 });
    expect(db.missionTaskEvent.create).toHaveBeenCalledTimes(1);
  });
  it("does not allow overlapping sessions or stop another student's session", async () => {
    db.studySession.findFirst.mockResolvedValueOnce({ id: "active" });
    await expect(updateStudySession(user, { action: "start", requestKey: key, topic: "Cells" })).rejects.toBeInstanceOf(ConflictApiError);
    expect(db.studySession.create).not.toHaveBeenCalled();
    db.studySession.findFirst.mockResolvedValueOnce(null);
    await expect(updateStudySession(user, { action: "stop", id: "foreign" })).rejects.toBeInstanceOf(ValidationApiError);
    expect(db.studySession.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "foreign", userId: user.id, endedAt: null } }));
  });
  it("never accepts unpublished lesson completion", async () => {
    db.lesson.findFirst.mockResolvedValue(null);
    await expect(updateLearningProgress(user, { lessonId: "hidden", completed: true })).rejects.toBeInstanceOf(ValidationApiError);
    expect(db.studentLessonProgress.upsert).not.toHaveBeenCalled();
  });
  it("uses the authenticated identity for saved lesson reads", async () => {
    await getLearningProgress(user, "lesson");
    expect(db.studentLessonProgress.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { userId_lessonId: { userId: user.id, lessonId: "lesson" } } }));
  });
  it("returns actual counts and clamps session elapsed time without fabricated ranks", async () => {
    db.missionTask.count.mockResolvedValue(2); db.studentLessonProgress.count.mockResolvedValue(1);
    db.studySession.findMany.mockResolvedValue([{ topic: "Cells", startedAt: start, endedAt: new Date(start.getTime() + 45 * 60000) }]);
    db.studentLessonProgress.findMany.mockResolvedValue([]);
    expect(await getVerifiedProgress(user)).toEqual({ completedTasks: 2, completedLessons: 1, recordedMinutes: 45,
      sessions: [{ topic: "Cells", startedAt: start, endedAt: new Date(start.getTime() + 45 * 60000) }], saved: [] });
  });
  it.each(["javascript:alert(1)", "data:text/html,test", "http://example.com", "https://user:pass@example.com", "/private", null])("rejects unsafe resource URL %s", (url) => expect(safeResourceUrl(url)).toBeNull());
  it("accepts HTTPS resources", () => expect(safeResourceUrl("https://example.com/notes")).toBe("https://example.com/notes"));
});
