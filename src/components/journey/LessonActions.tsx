"use client";
import { useEffect, useState } from "react";
import { studentRequest } from "./client";
type State = { bookmarked: boolean; completedAt: string | null };
export function LessonActions({ lessonId }: { lessonId: string }) {
  const [state, setState] = useState<State>({ bookmarked: false, completedAt: null });
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    studentRequest<State | null>(`/api/student/learning-progress?lessonId=${encodeURIComponent(lessonId)}`)
      .then((data) => { if (active) setState(data ?? { bookmarked: false, completedAt: null }); })
      .catch((e: Error) => active && setError(e.message)).finally(() => active && setBusy(false));
    return () => { active = false; };
  }, [lessonId]);
  async function save(values: object) {
    setBusy(true); setError("");
    try { setState(await studentRequest<State>("/api/student/learning-progress", "PUT", { lessonId, ...values })); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to save"); } finally { setBusy(false); }
  }
  return <div className="journey-shell"><div className="journey-actions"><button disabled={busy} aria-pressed={state.bookmarked} onClick={() => void save({ bookmarked: !state.bookmarked })}>{state.bookmarked ? "Remove bookmark" : "Save lesson"}</button><button className="journey-primary" disabled={busy} aria-pressed={Boolean(state.completedAt)} onClick={() => void save({ completed: !state.completedAt })}>{state.completedAt ? "Mark incomplete" : "Mark complete"}</button></div>{error && <p role="alert" className="journey-error">{error}</p>}</div>;
}
