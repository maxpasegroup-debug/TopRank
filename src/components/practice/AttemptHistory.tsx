"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { studentRequest } from "@/components/journey/client";
type Attempt = { id: string; questionId: string; questionText: string; score: string; maximumScore: string;
  correct: boolean; explanation: string | null; submittedAt: string };
export function AttemptHistory() {
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; studentRequest<Attempt[]>("/api/student/practice/attempts")
    .then((data) => active && setAttempts(data)).catch((e: Error) => active && setError(e.message)); return () => { active = false; }; }, []);
  return <main className="journey-shell"><h1>Practice history</h1><Link href="/practice">Back to practice</Link>
    {error && <p role="alert" className="journey-error">{error}</p>}
    {!attempts ? <p role="status">{error ? "History unavailable" : "Loading attempts..."}</p> : attempts.length ? <ul className="journey-task-list">{attempts.map((a) => <li key={a.id}><div><strong>{a.questionText}</strong><span>{new Date(a.submittedAt).toLocaleString()} / {a.correct ? "Correct" : "Review needed"} / {a.score} of {a.maximumScore}</span>{a.explanation && <p>{a.explanation}</p>}</div><Link href={`/practice/questions/${a.questionId}`}>Retry</Link></li>)}</ul> : <p>No submitted answers yet.</p>}
  </main>;
}
