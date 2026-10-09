"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { studentRequest } from "./client";
type Progress = { completedTasks: number; completedLessons: number; recordedMinutes: number;
  sessions: { topic: string; startedAt: string; endedAt: string }[]; saved: { title: string; href: string }[] };
export function ProgressDashboard() {
  const [data, setData] = useState<Progress | null>(null);
  const [error, setError] = useState("");
  function load() { setError(""); studentRequest<Progress>("/api/student/progress").then(setData).catch((e: Error) => setError(e.message)); }
  useEffect(load, []);
  return <main className="journey-shell"><span className="journey-kicker">TOPRANK DIGITAL PROFILE</span><h1>My Progress</h1>
    {error && <p role="alert" className="journey-error">{error}<button onClick={load}>Retry</button></p>}
    {!data ? <p role="status">{error ? "Progress unavailable" : "Loading progress..."}</p> : <>
      <dl className="journey-metrics"><div><dt>Completed missions</dt><dd>{data.completedTasks}</dd></div><div><dt>Lessons marked complete</dt><dd>{data.completedLessons}</dd></div><div><dt>Session minutes (last 100)</dt><dd>{data.recordedMinutes}</dd></div></dl>
      <section><h2>Saved lessons</h2>{data.saved.length ? <ul className="journey-task-list">{data.saved.map((lesson) => <li key={lesson.href}><Link href={lesson.href}>{lesson.title}</Link></li>)}</ul> : <p>No saved lessons yet.</p>}</section>
      <section><h2>Study history</h2>{data.sessions.length ? <ul className="journey-task-list">{data.sessions.map((session, i) => <li key={i}><strong>{session.topic}</strong><span>{new Date(session.startedAt).toLocaleDateString()}</span></li>)}</ul> : <p>No finished study sessions yet.</p>}</section>
    </>}
  </main>;
}
