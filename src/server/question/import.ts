import { ValidationApiError } from "@/server/api/errors";
import { z } from "zod";

const optionImportSchema = z.object({
  code: z.string().trim().min(1).max(20).regex(/^[A-Za-z0-9_-]+$/),
  text: z.string().trim().min(1).max(2000),
  isCorrect: z.boolean(),
});

export const questionImportRecordSchema = z.object({
  code: z.string().trim().min(1).max(120).regex(/^[A-Z0-9_-]+$/),
  text: z.string().trim().min(1).max(5000),
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "NUMERICAL"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  subjectCode: z.string().trim().min(1).max(80).regex(/^[A-Z0-9_]+$/),
  chapterSlug: z.string().trim().min(1).max(160).regex(/^[a-z0-9-]+$/),
  lessonSlug: z.string().trim().min(1).max(160).regex(/^[a-z0-9-]+$/).optional(),
  options: z.array(optionImportSchema).min(1).max(12),
  exams: z.array(z.string().trim().min(1).max(80).regex(/^[A-Z0-9_]+$/)).min(1),
  explanation: z.string().trim().min(1).max(5000).optional(),
  source: z.string().trim().min(1).max(250).optional(),
  sourceYear: z.number().int().min(1900).max(2100).optional(),
  tags: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
});

export const questionImportBatchSchema = z.array(questionImportRecordSchema).min(1).max(500);

export type QuestionImportRecord = z.infer<typeof questionImportRecordSchema>;

export function validateQuestionImportBatch(input: unknown): QuestionImportRecord[] {
  const records = questionImportBatchSchema.parse(input);
  const seen = new Set<string>();

  for (const record of records) {
    if (seen.has(record.code)) {
      throw new ValidationApiError(`Duplicate question code in import batch: ${record.code}`);
    }
    seen.add(record.code);

    const optionCodes = new Set<string>();
    for (const option of record.options) {
      if (optionCodes.has(option.code)) {
        throw new ValidationApiError(`Duplicate option code in question ${record.code}: ${option.code}`);
      }
      optionCodes.add(option.code);
    }

    const correctCount = record.options.filter((option) => option.isCorrect).length;
    if (record.type === "SINGLE_CHOICE" && correctCount !== 1) {
      throw new ValidationApiError(`Single-choice question ${record.code} must have exactly one correct option`);
    }

    if (record.type === "MULTIPLE_CHOICE" && correctCount < 1) {
      throw new ValidationApiError(`Multiple-choice question ${record.code} must have at least one correct option`);
    }

    if (record.type === "NUMERICAL" && correctCount !== 1) {
      throw new ValidationApiError(`Numerical question ${record.code} must have exactly one correct answer`);
    }
  }

  return records;
}
