import { z } from "zod";

export const questionIdParamSchema = z.object({
  questionId: z.string().trim().min(1).max(120).regex(/^[A-Za-z0-9_-]+$/),
});

export const questionSlugParamSchema = z.object({
  subjectSlug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  chapterSlug: z.string().trim().min(1).max(160).regex(/^[a-z0-9-]+$/).optional(),
});

export const questionFilterSchema = z.object({
  exam: z.string().trim().toUpperCase().regex(/^[A-Z0-9_]+$/).optional(),
  subject: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  chapter: z.string().trim().min(1).max(160).regex(/^[a-z0-9-]+$/).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "NUMERICAL"]).optional(),
});

export function parseQuestionFilters(url: string) {
  const params = new URL(url).searchParams;

  return questionFilterSchema.parse({
    exam: params.get("exam") ?? undefined,
    subject: params.get("subject") ?? undefined,
    chapter: params.get("chapter") ?? undefined,
    difficulty: params.get("difficulty") ?? undefined,
    type: params.get("type") ?? undefined,
  });
}
