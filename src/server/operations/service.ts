import { z } from "zod";
import type { AuthUser } from "@/server/auth/session";
import { AuthorizationApiError, ValidationApiError } from "@/server/api/errors";
import { prisma } from "@/server/db";
import { Prisma } from "@/generated/prisma/client";
import { ConflictApiError } from "@/server/api/errors";
import { scoreAnswer } from "@/server/practice/scoring";
import { safeResourceUrl } from "@/server/content/resource-url";
export const entitySchema = z.enum(["EXAM", "SUBJECT", "CHAPTER", "LESSON", "RESOURCE", "QUESTION", "QUESTION_EXAM"]);
export const publicationSchema = z.object({ entity: entitySchema, id: z.string().min(1).max(100),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]), active: z.boolean(),
  reviewStatus: z.enum(["NEEDS_REVIEW", "REVIEWED"]).optional(),
  scoringMode: z.enum(["EXACT_SET", "DECIMAL_EXACT"]).optional(),
}).strict().refine((v) => (v.reviewStatus === undefined || v.entity === "QUESTION") && (v.scoringMode === undefined || v.entity === "QUESTION_EXAM"));
export function assertPlatformAdmin(user: AuthUser) {
  if (user.role !== "PLATFORM_ADMIN") throw new AuthorizationApiError("Platform administrator access required");
}
export const examCategories = ["CENTRAL_RECRUITMENT", "STATE_RECRUITMENT", "CIVIL_SERVICES", "BANKING", "RAILWAYS", "DEFENCE", "ENGINEERING", "MEDICAL", "UNIVERSITY", "MANAGEMENT", "LAW", "TEACHING", "RESEARCH", "OTHER"] as const;
export const examCreateSchema = z.object({ code: z.string().trim().min(2).max(40).regex(/^[A-Z0-9_]+$/), name: z.string().trim().min(3).max(160),
  category: z.enum(examCategories), description: z.string().trim().max(2000).optional(),
  officialUrl: z.string().max(500).optional().refine((value) => !value || Boolean(safeResourceUrl(value))) }).strict();
export async function createExam(user: AuthUser, input: z.infer<typeof examCreateSchema>) {
  assertPlatformAdmin(user);
  try { return await prisma.$transaction(async (tx) => {
    const exam = await tx.exam.create({ data: { ...input, officialUrl: input.officialUrl || null, status: "DRAFT" }, select: { id: true } });
    await tx.auditEvent.create({ data: { actorId: user.id, entity: "EXAM", entityId: exam.id, action: "EXAM_CREATED_DRAFT" } });
    return exam;
  }); } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ConflictApiError("This exam code already exists");
    throw error;
  }
}
export async function listPublicationRecords(user: AuthUser, entity: z.infer<typeof entitySchema>) {
  assertPlatformAdmin(user);
  const options = { take: 100, orderBy: { updatedAt: "desc" as const } };
  switch (entity) {
    case "EXAM": return prisma.exam.findMany({ ...options, select: { id: true, name: true, status: true, active: true } });
    case "SUBJECT": return prisma.subject.findMany({ ...options, select: { id: true, name: true, status: true, active: true } });
    case "CHAPTER": return prisma.chapter.findMany({ ...options, select: { id: true, title: true, status: true, active: true } });
    case "LESSON": return prisma.lesson.findMany({ ...options, select: { id: true, title: true, status: true, active: true } });
    case "RESOURCE": return prisma.learningResource.findMany({ ...options, select: { id: true, title: true, url: true, reference: true, status: true, active: true } });
    case "QUESTION": return prisma.question.findMany({ ...options, select: { id: true, code: true, text: true, type: true, reviewStatus: true,
      status: true, active: true, numericalAnswer: true, options: { where: { active: true }, select: { id: true, text: true, isCorrect: true } } } });
    case "QUESTION_EXAM": return prisma.questionExam.findMany({ ...options, select: { id: true, questionId: true, examId: true, scoringMode: true, marks: true, negativeMarks: true, status: true, active: true } });
  }
}
export async function changePublication(user: AuthUser, input: z.infer<typeof publicationSchema>) {
  assertPlatformAdmin(user);
  return prisma.$transaction(async (tx) => {
    const data = { status: input.status, active: input.active };
    switch (input.entity) {
      case "EXAM": await tx.exam.update({ where: { id: input.id }, data }); break;
      case "SUBJECT": await tx.subject.update({ where: { id: input.id }, data }); break;
      case "CHAPTER": await tx.chapter.update({ where: { id: input.id }, data }); break;
      case "LESSON": await tx.lesson.update({ where: { id: input.id }, data }); break;
      case "RESOURCE": {
        const resource = await tx.learningResource.findUnique({ where: { id: input.id }, select: { url: true } });
        if (!resource || (input.status === "PUBLISHED" && resource.url && !safeResourceUrl(resource.url))) throw new ValidationApiError("Provide a safe HTTPS resource before publishing");
        await tx.learningResource.update({ where: { id: input.id }, data }); break;
      }
      case "QUESTION": {
        const question = await tx.question.findUnique({ where: { id: input.id }, include: { options: { where: { active: true } }, exams: { where: { active: true, status: "PUBLISHED" } } } });
        if (!question) throw new ValidationApiError("Question was not found");
        if (input.status === "PUBLISHED") {
          if ((input.reviewStatus ?? question.reviewStatus) !== "REVIEWED" || !question.exams.length) throw new ValidationApiError("Review this question and configure an exam link before publishing");
          for (const link of question.exams) scoreAnswer({ type: question.type, mode: link.scoringMode, marks: link.marks.toString(), negativeMarks: link.negativeMarks.toString(), numericalAnswer: question.numericalAnswer, options: question.options },
            question.type === "NUMERICAL" ? { numerical: question.numericalAnswer ?? "" } : { optionIds: question.options.filter((o) => o.isCorrect).map((o) => o.id) });
        }
        await tx.question.update({ where: { id: input.id }, data: { ...data, reviewStatus: input.reviewStatus } }); break;
      }
      case "QUESTION_EXAM": await tx.questionExam.update({ where: { id: input.id }, data: { ...data, scoringMode: input.scoringMode } }); break;
    }
    await tx.auditEvent.create({ data: { actorId: user.id, entity: input.entity, entityId: input.id, action: `PUBLICATION_${input.status}` } });
    return { id: input.id };
  });
}
export const helpResponseSchema = z.object({ id: z.string().min(1).max(100), status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
  response: z.string().trim().min(1).max(2000) }).strict();
export async function listSupportQueue(user: AuthUser) {
  assertPlatformAdmin(user);
  return prisma.helpRequest.findMany({ orderBy: { createdAt: "asc" }, take: 100,
    select: { id: true, subject: true, message: true, status: true, response: true } });
}
export async function respondToHelp(user: AuthUser, input: z.infer<typeof helpResponseSchema>) {
  assertPlatformAdmin(user);
  return prisma.$transaction(async (tx) => {
    await tx.helpRequest.update({ where: { id: input.id }, data: { status: input.status, response: input.response } });
    await tx.auditEvent.create({ data: { actorId: user.id, entity: "HELP_REQUEST", entityId: input.id, action: `HELP_${input.status}` } });
    return { id: input.id };
  });
}
