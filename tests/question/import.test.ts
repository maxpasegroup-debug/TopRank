import { describe, expect, it } from "vitest";
import { ValidationApiError } from "@/server/api/errors";
import { validateQuestionImportBatch } from "@/server/question/import";

const validQuestion = {
  code: "FND-PHY-001",
  text: "What is 2 + 2?",
  type: "SINGLE_CHOICE",
  difficulty: "EASY",
  subjectCode: "PHYSICS",
  chapterSlug: "units-and-measurements",
  options: [
    { code: "A", text: "3", isCorrect: false },
    { code: "B", text: "4", isCorrect: true },
  ],
  exams: ["NEET"],
  tags: ["foundation"],
};

describe("question import validation", () => {
  it("accepts valid question import records", () => {
    expect(validateQuestionImportBatch([validQuestion])).toHaveLength(1);
  });

  it("rejects invalid records", () => {
    expect(() => validateQuestionImportBatch([{ ...validQuestion, code: "bad code" }])).toThrow();
  });

  it("handles duplicate question codes safely", () => {
    expect(() => validateQuestionImportBatch([validQuestion, validQuestion])).toThrow(ValidationApiError);
  });

  it("rejects unsafe single-choice answer keys", () => {
    const invalid = {
      ...validQuestion,
      options: validQuestion.options.map((option) => ({ ...option, isCorrect: false })),
    };

    expect(() => validateQuestionImportBatch([invalid])).toThrow(ValidationApiError);
  });
});
