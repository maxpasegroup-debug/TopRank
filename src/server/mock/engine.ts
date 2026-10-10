import { Prisma } from "@/generated/prisma/client";
import { scoreAnswer } from "@/server/practice/scoring";
import type { Answer } from "./validation";

export type FrozenQuestion = {
 id: string; text: string; type: string; section: number; subject: string;
 lessonId: string | null; lessonHref: string | null;
 marks: string; negativeMarks: string; unansweredMarks: string; mode: string | null;
 numericalAnswer: string | null; explanation: string | null;
 options: { id: string; text: string; isCorrect: boolean }[];
};
export type Snapshot = { title: string; revealPolicy: "AFTER_SUBMISSION" | "NEVER";
 sections: { title: string; questionCount: number; marks: string; negativeMarks: string; unansweredMarks: string }[];
 questions: FrozenQuestion[] };
export type SavedAnswer = { position: number; answer: Answer; version: number; flagged: boolean; bookmarked: boolean };
export type Result = { score: string; maximumScore: string; correct: number; answered: number;
 total: number; accuracy: number; timeSeconds: number;
 sections: { title: string; score: string; maximumScore: string; correct: number; answered: number; total: number }[];
 outcomes: { position: number; correct: boolean; answered: boolean; score: string }[] };
export function isAnswered(answer: Answer) { return Boolean(answer.optionIds?.length || answer.numerical !== undefined); }
export function calculateResult(snapshot: Snapshot, answers: SavedAnswer[], startedAt: Date, deadline: Date, now: Date): Result {
 const sections = snapshot.sections.map((s) => ({ title: s.title, score: new Prisma.Decimal(0),
   maximumScore: new Prisma.Decimal(0), correct: 0, answered: 0, total: 0 }));
 const outcomes = snapshot.questions.map((q, position) => {
   const answer = answers.find((a) => a.position === position)?.answer ?? {};
   const answered = isAnswered(answer);
   const scored = answered ? scoreAnswer(q, answer) : { correct: false, score: new Prisma.Decimal(q.unansweredMarks), maximumScore: new Prisma.Decimal(q.marks) };
   const section = sections[q.section]; section.score = section.score.plus(scored.score);
   section.maximumScore = section.maximumScore.plus(scored.maximumScore);
   section.total++; section.answered += Number(answered); section.correct += Number(scored.correct);
   return { position, correct: scored.correct, answered, score: scored.score.toString() };
 });
 const answered = outcomes.filter((o) => o.answered).length, correct = outcomes.filter((o) => o.correct).length;
 return { score: sections.reduce((s, v) => s.plus(v.score), new Prisma.Decimal(0)).toString(),
   maximumScore: sections.reduce((s, v) => s.plus(v.maximumScore), new Prisma.Decimal(0)).toString(),
   correct, answered, total: outcomes.length, accuracy: answered ? Math.round(correct / answered * 10000) / 100 : 0,
   timeSeconds: Math.max(0, Math.floor((Math.min(now.getTime(), deadline.getTime()) - startedAt.getTime()) / 1000)),
   sections: sections.map((s) => ({ ...s, score: s.score.toString(), maximumScore: s.maximumScore.toString() })), outcomes };
}
export function publicQuestion(q: FrozenQuestion, position: number) {
 return { position, id: q.id, text: q.text, type: q.type, section: q.section, subject: q.subject,
   marks: q.marks, negativeMarks: q.negativeMarks, unansweredMarks: q.unansweredMarks,
   options: q.type === "NUMERICAL" ? [] : q.options.map((o) => ({ id: o.id, text: o.text })) };
}
export function publicResult(result: Result) {
 return { score: result.score, maximumScore: result.maximumScore, correct: result.correct, answered: result.answered,
   total: result.total, accuracy: result.accuracy, timeSeconds: result.timeSeconds,
   sections: result.sections.map((s) => ({ title: s.title, score: s.score, maximumScore: s.maximumScore, correct: s.correct, answered: s.answered, total: s.total })) };
}
