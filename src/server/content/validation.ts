import { z } from "zod";

export const codeParamSchema = z.object({
  examCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9_]+$/),
});

export const slugParamSchema = z.object({
  subjectSlug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  chapterSlug: z.string().trim().min(1).max(160).regex(/^[a-z0-9-]+$/).optional(),
  lessonSlug: z.string().trim().min(1).max(160).regex(/^[a-z0-9-]+$/).optional(),
});
