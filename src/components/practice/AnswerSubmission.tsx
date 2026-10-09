"use client";
import { useState } from "react";
import type { StudentQuestionDto } from "@/server/question/service";
import { studentRequest } from "@/components/journey/client";
type Result = { id: string; correct: boolean; score: string; maximumScore: string; explanation: string | null };
export function AnswerSubmission({ question }: { question: StudentQuestionDto }) {
  const [options, setOptions] = useState<string[]>([]);
  const [numerical, setNumerical] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit() {
    const requestKey = key || crypto.randomUUID(); setKey(requestKey); setBusy(true); setError("");
    try { setResult(await studentRequest<Result>("/api/student/practice/attempts", "POST", { requestKey, questionId: question.id,
      ...(question.type === "NUMERICAL" ? { numerical } : { optionIds: options }) })); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to submit"); } finally { setBusy(false); }
  }
  return <section className="journey-shell"><h2>Your answer</h2>
    {question.type === "NUMERICAL" ? <label className="journey-field">Numerical answer<input inputMode="decimal" maxLength={60} disabled={busy || Boolean(result)} value={numerical} onChange={(e) => { setNumerical(e.target.value); setKey(""); }} /></label> : <fieldset className="journey-answer-options"><legend>{question.type === "SINGLE_CHOICE" ? "Choose one answer" : "Choose all applicable answers"}</legend>{question.options.map((option) => <label key={option.id}><input type={question.type === "SINGLE_CHOICE" ? "radio" : "checkbox"} name={`answer-${question.id}`} disabled={busy || Boolean(result)} checked={options.includes(option.id)} onChange={(e) => { setOptions(question.type === "SINGLE_CHOICE" ? [option.id] : e.target.checked ? [...options, option.id] : options.filter((id) => id !== option.id)); setKey(""); }} />{option.code}. {option.text}</label>)}</fieldset>}
    {error && <p className="journey-error" role="alert">{error}</p>}
    {result ? <div role="status"><h2>{result.correct ? "Correct" : "Not quite"}</h2><p>Score: {result.score} / {result.maximumScore}</p>{result.explanation && <p>{result.explanation}</p>}<button onClick={() => { setResult(null); setOptions([]); setNumerical(""); setKey(""); }}>Try again</button></div> : <button className="journey-primary" disabled={busy || (question.type === "NUMERICAL" ? !numerical.trim() : !options.length)} onClick={() => void submit()}>{busy ? "Submitting..." : "Submit answer"}</button>}
  </section>;
}
