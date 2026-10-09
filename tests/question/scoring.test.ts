import { describe, expect, it } from "vitest";
import { scoreAnswer } from "@/server/practice/scoring";
import { answerSchema } from "@/server/practice/validation";
const base = { type: "SINGLE_CHOICE", mode: "EXACT_SET", marks: "4", negativeMarks: "1", numericalAnswer: null,
  options: [{ id: "a", isCorrect: true }, { id: "b", isCorrect: false }] };
describe("explicit server scoring", () => {
  it("awards configured marks and negative marks", () => {
    expect(scoreAnswer(base, { optionIds: ["a"] }).score.toString()).toBe("4");
    expect(scoreAnswer(base, { optionIds: ["b"] }).score.toString()).toBe("-1");
    expect(scoreAnswer({ ...base, negativeMarks: "0" }, { optionIds: ["b"] }).score.toString()).toBe("0");
  });
  it("requires the exact set for multi-select without invented partial credit", () => {
    const multi = { ...base, type: "MULTIPLE_CHOICE", options: [...base.options, { id: "c", isCorrect: true }] };
    expect(scoreAnswer(multi, { optionIds: ["c", "a"] }).correct).toBe(true);
    expect(scoreAnswer(multi, { optionIds: ["a"] }).correct).toBe(false);
  });
  it("uses exact decimal equality only when explicitly configured", () => {
    const numerical = { ...base, type: "NUMERICAL", mode: "DECIMAL_EXACT", numericalAnswer: "1.20" };
    expect(scoreAnswer(numerical, { numerical: "+01.200" }).correct).toBe(true);
    expect(scoreAnswer(numerical, { numerical: "1.20000001" }).correct).toBe(false);
    expect(scoreAnswer({ ...numerical, numericalAnswer: "-0.5" }, { numerical: "-.50" }).correct).toBe(true);
  });
  it.each([null, "DECIMAL_EXACT", "INVENTED"])("rejects incomplete or mismatched MCQ rule %s", (mode) => expect(() => scoreAnswer({ ...base, mode }, { optionIds: ["a"] })).toThrow());
  it.each(["NaN", "Infinity", "-1", "0"])("rejects invalid marks %s", (marks) => expect(() => scoreAnswer({ ...base, marks }, { optionIds: ["a"] })).toThrow());
  it("rejects incomplete numerical configuration", () => {
    for (const numericalAnswer of [null, "", "NaN", "1e1000", "x".repeat(100)]) expect(() => scoreAnswer({ ...base, type: "NUMERICAL", mode: "DECIMAL_EXACT", numericalAnswer }, { numerical: "1" })).toThrow();
  });
  it.each([{ optionIds: ["foreign"] }, { optionIds: ["a", "a"] }, { optionIds: ["a", "b"] }, { optionIds: [] }])("rejects invalid choices %j", (answer) => expect(() => scoreAnswer(base, answer)).toThrow());
  it("rejects browser-provided scores and ownership", () => {
    const input = { requestKey: "8664dc14-a97f-4e63-9747-0a76e597a077", questionId: "q", optionIds: ["a"] };
    expect(answerSchema.safeParse(input).success).toBe(true);
    for (const key of ["score", "correct", "elapsedTime", "userId"]) expect(answerSchema.safeParse({ ...input, [key]: 100 }).success).toBe(false);
    expect(answerSchema.safeParse({ ...input, numerical: "1" }).success).toBe(false);
  });
});
