"use client";

import { useMemo, useState } from "react";
import { MissionProgress } from "../components/mission/MissionProgress";
import { PlaceholderIllustration } from "../components/prototype/PlaceholderIllustration";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";

export type MissionStepKey = "missionExam" | "missionYear" | "missionCollege" | "missionHours";

type ExamOption = {
  id: string;
  code: string;
  name: string;
};

type OnboardingProfile = {
  name: string;
  phone: string | null;
  targetExam: ExamOption | null;
  targetYear: number | null;
  dreamCollege: string | null;
  dailyStudyHours: number | null;
  onboardingCompleted: boolean;
};

type MissionFlowProps = {
  screen: MissionStepKey;
  exams: ExamOption[];
  profile: OnboardingProfile;
};

const years = ["2027", "2028", "2029", "2030"];
const goals = ["AIIMS Delhi", "IIT Madras", "NIT Calicut", "My State College"];
const hours = [
  { label: "1 hour", value: "1" },
  { label: "2 hours", value: "2" },
  { label: "3 hours", value: "3" },
  { label: "4+ hours", value: "4" },
];

const steps = {
  missionExam: {
    step: 1,
    eyebrow: "Question 1",
    title: "Which exam is your mission?",
    subtitle: "Pick one goal for now. You can change it later.",
    previous: "/onboarding",
    next: "/mission/year",
  },
  missionYear: {
    step: 2,
    eyebrow: "Question 2",
    title: "What is your target year?",
    subtitle: "A clear year helps TopRank shape your daily rhythm.",
    previous: "/mission/exam",
    next: "/mission/college",
  },
  missionCollege: {
    step: 3,
    eyebrow: "Question 3",
    title: "What is your dream college or goal?",
    subtitle: "Keep it honest. Big dreams are welcome here.",
    previous: "/mission/year",
    next: "/mission/hours",
  },
  missionHours: {
    step: 4,
    eyebrow: "Question 4",
    title: "How many hours can you study daily?",
    subtitle: "Choose a steady number you can actually protect.",
    previous: "/mission/college",
    next: "/mission-ready",
  },
};

async function saveProfile(payload: Record<string, unknown>) {
  const response = await fetch("/api/student/profile", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error?.message ?? "Unable to save profile");
  }
}

export function MissionFlow({ screen, exams, profile }: MissionFlowProps) {
  const current = steps[screen];
  const [name, setName] = useState(profile.name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [selectedExamId, setSelectedExamId] = useState(profile.targetExam?.id ?? "");
  const [selectedYear, setSelectedYear] = useState(profile.targetYear ? String(profile.targetYear) : "");
  const [goal, setGoal] = useState(profile.dreamCollege ?? "");
  const [selectedHours, setSelectedHours] = useState(profile.dailyStudyHours ? String(profile.dailyStudyHours) : "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canContinue = useMemo(() => {
    if (screen === "missionExam") return name.trim().length >= 2 && Boolean(selectedExamId);
    if (screen === "missionYear") return Boolean(selectedYear);
    if (screen === "missionCollege") return goal.trim().length >= 2;
    return Boolean(selectedHours);
  }, [goal, name, screen, selectedExamId, selectedHours, selectedYear]);

  async function handleContinue() {
    setError(null);
    setIsSaving(true);

    try {
      if (screen === "missionExam") {
        await saveProfile({ name: name.trim(), phone: phone.trim(), targetExamId: selectedExamId });
      } else if (screen === "missionYear") {
        await saveProfile({ targetYear: Number(selectedYear) });
      } else if (screen === "missionCollege") {
        await saveProfile({ dreamCollege: goal.trim() });
      } else {
        await saveProfile({ dailyStudyHours: Number(selectedHours), completeOnboarding: true });
      }

      window.location.href = current.next;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save this step");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageContainer>
      <div className="mission-screen">
        <MissionProgress step={current.step} total={4} />
        <SectionHeader
          eyebrow={current.eyebrow}
          title={current.title}
          subtitle={current.subtitle}
          action={
            <div className="mission-action-row">
              <Button href={current.previous} variant="secondary">Back</Button>
              <button className="button button-primary" type="button" disabled={!canContinue || isSaving} onClick={handleContinue}>
                {isSaving ? "Saving..." : screen === "missionHours" ? "Create mission" : "Continue"}
              </button>
            </div>
          }
        />
        {screen === "missionExam" ? (
          <div className="screen-stack">
            <div className="grid grid-2">
              <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Student name" />
              <input className="input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number optional" />
            </div>
            <div className="option-grid">
              {exams.map((exam) => (
                <Card key={exam.id}>
                  <button
                    className={`option-card ${selectedExamId === exam.id ? "selected" : ""}`}
                    type="button"
                    onClick={() => setSelectedExamId(exam.id)}
                  >
                    {exam.name}
                  </button>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
        {screen === "missionYear" ? (
          <div className="option-grid">
            {years.map((year) => (
              <Card key={year}>
                <button
                  className={`option-card ${selectedYear === year ? "selected" : ""}`}
                  type="button"
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </button>
              </Card>
            ))}
          </div>
        ) : null}
        {screen === "missionCollege" ? (
          <div className="screen-stack">
            <input className="input" value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Dream college or preparation goal" />
            <div className="option-grid">
              {goals.map((item) => (
                <Card key={item}>
                  <button className={`option-card ${goal === item ? "selected" : ""}`} type="button" onClick={() => setGoal(item)}>
                    {item}
                  </button>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
        {screen === "missionHours" ? (
          <div className="option-grid">
            {hours.map((item) => (
              <Card key={item.value}>
                <button
                  className={`option-card ${selectedHours === item.value ? "selected" : ""}`}
                  type="button"
                  onClick={() => setSelectedHours(item.value)}
                >
                  {item.label}
                </button>
              </Card>
            ))}
          </div>
        ) : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </div>
    </PageContainer>
  );
}

export function WelcomeJourney() {
  return (
    <PageContainer>
      <div className="welcome-screen">
        <PlaceholderIllustration />
        <SectionHeader
          eyebrow="Welcome to TopRank"
          title="Your mission begins with one calm step"
          subtitle="Create your real preparation profile. Your choices are saved as you continue."
          action={<Button href="/mission/exam">Let's Begin</Button>}
        />
      </div>
    </PageContainer>
  );
}

export function MissionReady() {
  return (
    <PageContainer>
      <div className="ready-screen">
        <div className="celebration-mark">TR</div>
        <SectionHeader
          eyebrow="Mission Created"
          title="Your journey starts today."
          subtitle="Your preparation profile is saved. Mission Control will now use your real student data."
          action={<Button href="/home">Enter Mission Control</Button>}
        />
      </div>
    </PageContainer>
  );
}
