"use client";
import { useState } from "react";
import { studentRequest } from "./client";
const categories = ["CENTRAL_RECRUITMENT", "STATE_RECRUITMENT", "CIVIL_SERVICES", "BANKING", "RAILWAYS", "DEFENCE", "ENGINEERING", "MEDICAL", "UNIVERSITY", "MANAGEMENT", "LAW", "TEACHING", "RESEARCH", "OTHER"];
export function ExamEditor({ saved }: { saved: () => void }) {
  const [code, setCode] = useState(""); const [name, setName] = useState(""); const [category, setCategory] = useState("OTHER");
  const [url, setUrl] = useState(""); const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function create() {
    setBusy(true); setError("");
    try { await studentRequest("/api/admin/exams", "POST", { code, name, category, description, officialUrl: url });
      setCode(""); setName(""); setUrl(""); setDescription(""); saved(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to create exam"); } finally { setBusy(false); }
  }
  return <section><h2>Add exam draft</h2><div className="journey-fields">
    <label className="journey-field">Exam code<input maxLength={40} disabled={busy} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} /></label>
    <label className="journey-field">Name<input maxLength={160} disabled={busy} value={name} onChange={(e) => setName(e.target.value)} /></label>
    <label className="journey-field">Category<select disabled={busy} value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
    <label className="journey-field">Official HTTPS URL<input type="url" disabled={busy} maxLength={500} value={url} onChange={(e) => setUrl(e.target.value)} /></label>
    <label className="journey-field">Reviewed description<textarea rows={3} maxLength={2000} disabled={busy} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
    </div>{error && <p role="alert" className="journey-error">{error}</p>}<div className="journey-actions"><button disabled={busy || code.length < 2 || name.trim().length < 3} onClick={() => void create()}>Create draft</button></div></section>;
}
