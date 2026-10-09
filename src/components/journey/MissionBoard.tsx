"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { studentRequest } from "./client";

type Task = { id: string; title: string; subject: string; href: string | null; dueDate: string; minutes: number;
  status: "TODO" | "COMPLETED" | "SKIPPED"; version: number };
type Plan = { id: string; title: string; tasks: Task[] };
type Session = { id: string; topic: string; startedAt: string; endedAt: string | null };
export function MissionBoard({ name }: { name?: string }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [topic, setTopic] = useState("");
  const [sessionKey, setSessionKey] = useState("");
  async function load() { setPlan(await studentRequest<Plan | null>("/api/student/missions")); }
  useEffect(() => {
    let active = true;
    Promise.all([studentRequest<Plan | null>("/api/student/missions"), studentRequest<Session | null>("/api/student/study-sessions")])
      .then(([data, current]) => { if (active) { setPlan(data); setSession(current); } })
      .catch((e: Error) => active && setError(e.message)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);
  async function change(task: Task, values: object) {
    setBusy(true); setError("");
    try { await studentRequest("/api/student/missions", "PATCH", { id: task.id, version: task.version, ...values }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to save"); }
    finally { setBusy(false); }
  }
  async function timer() {
    setBusy(true); setError("");
    const key = sessionKey || crypto.randomUUID(); setSessionKey(key);
    try {
      const result = await studentRequest<Session>("/api/student/study-sessions", "POST", session ? { action: "stop", id: session.id } : { action: "start", requestKey: key, topic });
      setSession(result.endedAt ? null : result); if (result.endedAt) setSessionKey("");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save"); } finally { setBusy(false); }
  }
  const completed = plan?.tasks.filter((task) => task.status === "COMPLETED").length ?? 0;
  return <main className="journey-shell">
    <div className="journey-heading"><span className="journey-kicker">MISSION CONTROL</span><Link href="/onboarding">Edit goals</Link></div>
    <h1>{name ? `${name}'s mission board` : "Your mission board"}</h1>
    {error && <p className="journey-error" role="alert">{error}<button onClick={() => void load().then(() => setError("")).catch((e: Error) => setError(e.message))}>Retry</button></p>}
    {loading ? <p role="status">Loading missions...</p> : !plan ? <section><h2>No mission plan yet</h2><Link href="/onboarding">Create a mission</Link></section> : <>
      <div className="journey-heading"><h2>{plan.title}</h2><span>{completed} / {plan.tasks.length} completed</span></div>
      <progress aria-label="Mission completion" value={completed} max={Math.max(1, plan.tasks.length)} />
      <ul className="journey-task-list">{plan.tasks.map((task) => <li key={task.id}>
        <label className="journey-check"><input type="checkbox" disabled={busy} checked={task.status === "COMPLETED"} onChange={(e) => void change(task, { status: e.target.checked ? "COMPLETED" : "TODO" })} /><div><strong>{task.title}</strong><span>{task.subject} / {task.minutes} min</span></div></label>
        <div className="journey-task-actions"><label>Study date<input aria-label={`Study date for ${task.title}`} type="date" disabled={busy} value={task.dueDate.slice(0, 10)} onChange={(e) => e.target.value && void change(task, { dueDate: e.target.value })} /></label>{task.href && <Link href={task.href}>Open lesson</Link>}<button disabled={busy} onClick={() => void change(task, { status: task.status === "SKIPPED" ? "TODO" : "SKIPPED" })}>{task.status === "SKIPPED" ? "Restore task" : "Skip"}</button></div>
      </li>)}</ul>
    </>}
    <section className="journey-session"><h2>Study session</h2>{session ? <p>{session.topic} / Started {new Date(session.startedAt).toLocaleTimeString()}</p> : <label className="journey-field">Study topic<input maxLength={120} value={topic} onChange={(e) => setTopic(e.target.value)} /></label>}<button className="journey-primary" disabled={busy || (!session && topic.trim().length < 2)} onClick={() => void timer()}>{session ? "Finish session" : "Start session"}</button></section>
  </main>;
}
