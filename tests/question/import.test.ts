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

  it("accepts a protected numerical answer without options", () => {
    const { options: _options, ...record } = validQuestion;
    const [result] = validateQuestionImportBatch([{ ...record, type: "NUMERICAL", numericalAnswer: "-1.250e+2" }]);
    expect(result.options).toEqual([]);
    expect(result.numericalAnswer).toBe("-1.250e+2");
  });

  it("rejects legacy numerical answer options even with a protected key", () => {
    expect(() => validateQuestionImportBatch([{
      ...validQuestion, type: "NUMERICAL", numericalAnswer: "4",
      options: [{ code: "NUMERIC", text: "4", isCorrect: true }],
    }])).toThrow();
  });

  it("requires a protected numerical answer", () => {
    expect(() => validateQuestionImportBatch([{ ...validQuestion, type: "NUMERICAL", options: [] }])).toThrow();
  });

  it.each(["", "NaN", "Infinity", "1 to 2", "4 kg"])("rejects malformed numerical key %s", (numericalAnswer) => {
    expect(() => validateQuestionImportBatch([{ ...validQuestion, type: "NUMERICAL", options: [], numericalAnswer }])).toThrow();
  });

  it("rejects numerical keys on choice questions", () => {
    expect(() => validateQuestionImportBatch([{ ...validQuestion, numericalAnswer: "4" }])).toThrow();
  });

  it("still requires multiple-choice options and correct choices", () => {
    expect(() => validateQuestionImportBatch([{ ...validQuestion, type: "MULTIPLE_CHOICE", options: [] }])).toThrow();
    expect(() => validateQuestionImportBatch([{
      ...validQuestion, type: "MULTIPLE_CHOICE", options: validQuestion.options.map((option) => ({ ...option, isCorrect: false })),
    }])).toThrow();
    expect(validateQuestionImportBatch([{ ...validQuestion, type: "MULTIPLE_CHOICE" }])).toHaveLength(1);
  });

  it("rejects unsupported imported question types", () => {
    expect(() => validateQuestionImportBatch([{ ...validQuestion, type: "FREE_TEXT" }])).toThrow();
  });
});
