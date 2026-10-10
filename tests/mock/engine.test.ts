import { describe, expect, it } from "vitest";
import { calculateResult, publicQuestion, publicResult, type Snapshot } from "@/server/mock/engine";
import { blueprintSchema, mockMutationSchema } from "@/server/mock/validation";
const sections = [{ title: "Science", questionCount: 3, marks: "4", negativeMarks: "1", unansweredMarks: "0" }];
const question = { id: "q", text: "Question", type: "SINGLE_CHOICE", section: 0, subject: "Science", lessonId: null, lessonHref: null,
 marks: "4", negativeMarks: "1", unansweredMarks: "0", mode: "EXACT_SET", numericalAnswer: null, explanation: "Private until review", options: [{ id: "a", text: "A", isCorrect: true }, { id: "b", text: "B", isCorrect: false }] };
const snapshot: Snapshot = { title: "Mock", revealPolicy: "AFTER_SUBMISSION", sections, questions: [question,
 { ...question, id: "multi", type: "MULTIPLE_CHOICE", options: [{ id: "x", text: "X", isCorrect: true }, { id: "y", text: "Y", isCorrect: true }] },
 { ...question, id: "numeric", type: "NUMERICAL", mode: "DECIMAL_EXACT", numericalAnswer: "12.50", options: [] }] };
const start = new Date("2026-10-10T00:00:00Z"), deadline = new Date("2026-10-10T00:01:00Z");
const saved = (position: number, answer: { optionIds?: string[]; numerical?: string }) => ({ position, answer, flagged: false, bookmarked: false, version: 0 });
describe("timed mock scoring and payload boundaries", () => {
 it("scores choice, exact-set multi-choice and exact decimal answers with section totals", () => {
   const result = calculateResult(snapshot, [saved(0, { optionIds: ["a"] }), saved(1, { optionIds: ["y", "x"] }), saved(2, { numerical: "12.500" })], start, deadline, deadline);
   expect(result).toMatchObject({ score: "12", maximumScore: "12", answered: 3, correct: 3, accuracy: 100, timeSeconds: 60 });
   expect(result.sections).toEqual([{ title: "Science", score: "12", maximumScore: "12", answered: 3, correct: 3, total: 3 }]);
 });
 it("applies penalties only to incorrect answers, with configured unanswered marking", () => {
   const result = calculateResult(snapshot, [saved(0, { optionIds: ["b"] })], start, deadline, deadline);
   expect(result).toMatchObject({ score: "-1", answered: 1, correct: 0, accuracy: 0 });
   const blank = { ...snapshot, questions: snapshot.questions.map((q) => ({ ...q, unansweredMarks: "-0.5" })) };
   expect(calculateResult(blank, [], start, deadline, deadline).score).toBe("-1.5");
 });
 it("does not grant partial marks for multi-choice", () => { expect(calculateResult(snapshot, [saved(1, { optionIds: ["x"] })], start, deadline, deadline).score).toBe("-1"); });
 it("caps elapsed time at the deadline and avoids fabricated accuracy for blank attempts", () => {
   expect(calculateResult(snapshot, [], start, deadline, new Date(deadline.getTime() + 60000))).toMatchObject({ timeSeconds: 60, accuracy: 0, score: "0" });
   expect(calculateResult(snapshot, [], start, deadline, new Date(start.getTime() + 19000)).timeSeconds).toBe(19);
 });
 it("does not round near numerical answers into correct answers", () => { expect(calculateResult(snapshot, [saved(2, { numerical: "12.5001" })], start, deadline, deadline).score).toBe("-1"); });
 it.each([{ numerical: "NaN" }, { numerical: "1e2" }, { optionIds: ["other"] }, { optionIds: ["a", "a"] }])("rejects malformed or foreign answers: %j", (answer) => {
   const position = "numerical" in answer ? 2 : 0;
   expect(() => calculateResult(snapshot, [saved(position, answer)], start, deadline, deadline)).toThrow();
 });
 it("never exposes keys, correctness flags or explanations in question DTOs", () => {
   const value = JSON.stringify(snapshot.questions.map(publicQuestion));
   for (const privateValue of ["isCorrect", "numericalAnswer", "12.50", "Private until review", "lessonId", "mode"]) expect(value).not.toContain(privateValue);
 });
 it("aggregate results do not include per-question correctness or answer keys", () => {
   expect(publicResult(calculateResult(snapshot, [], start, deadline, deadline))).not.toHaveProperty("outcomes");
 });
});
describe("strict blueprint and mutation validation", () => {
 const blueprint = { examId: "exam", title: "Science mock", durationSeconds: 60, maxAttempts: 1, revealPolicy: "NEVER", sections: [{ ...sections[0], questionCount: 1, questionIds: ["q"] }] };
 it("accepts an explicitly configured blueprint", () => { expect(blueprintSchema.safeParse(blueprint).success).toBe(true); });
 it.each([{ durationSeconds: 0 }, { maxAttempts: 0 }, { revealPolicy: "ANYTIME" }, { role: "PLATFORM_ADMIN" }, { score: 100 }])("rejects invalid blueprint fields %j", (change) => {
   expect(blueprintSchema.safeParse({ ...blueprint, ...change }).success).toBe(false);
 });
 it("rejects duplicate questions and inconsistent counts", () => {
   expect(blueprintSchema.safeParse({ ...blueprint, sections: [blueprint.sections[0], blueprint.sections[0]] }).success).toBe(false);
   expect(blueprintSchema.safeParse({ ...blueprint, sections: [{ ...blueprint.sections[0], questionCount: 2 }] }).success).toBe(false);
 });
 it.each(["userId", "score", "deadline", "startedAt", "numericalAnswer", "role"])("rejects client-controlled %s", (field) => {
   expect(mockMutationSchema.safeParse({ action: "submit", attemptId: "attempt", [field]: "forged" }).success).toBe(false);
 });
});
