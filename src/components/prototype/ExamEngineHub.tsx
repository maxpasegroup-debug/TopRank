import { Button } from "../ui/Button";
import { DemoBadge } from "../polish/DemoBadge";

type MissionPlaceholder = {
  subject: string;
  chapter: string;
  durationMinutes: number;
  href: string;
};

type ExamEngineHubProps = {
  demo?: boolean;
  studentName?: string | null;
  exam?: string | null;
  targetYear?: string | number | null;
  dreamCollege?: string | null;
  dailyStudyHours?: number | null;
  mission?: MissionPlaceholder | null;
};

const supportTools = [
  {
    title: "Tara Mentor",
    copy: "Calms doubts and sends you back to the next question.",
    action: "Ask Tara",
    href: "/tara",
  },
  {
    title: "Live Programs",
    copy: "Revision classes, doubt hours, and weekly practice plans.",
    action: "View Plan",
    href: "/learn",
  },
  {
    title: "Real Progress",
    copy: "See effort, streak, accuracy, and chapters completed.",
    action: "Check Progress",
    href: "/progress",
  },
  {
    title: "Leaderboard",
    copy: "Friendly rank view when your practice group is ready.",
    action: "Preview",
    href: "/progress",
  },
];

export function ExamEngineHub({
  demo = false,
  studentName,
  exam,
  targetYear,
  dreamCollege,
  dailyStudyHours,
  mission,
}: ExamEngineHubProps) {
  const displayName = demo ? (studentName ?? "Rahul") : studentName;
  const displayExam = demo ? (exam ?? "NEET") : exam;
  const displayYear = demo ? (targetYear ?? "2028") : targetYear;
  const displayGoal = demo ? (dreamCollege ?? "AIIMS Delhi") : dreamCollege;
  const displayMission = demo
    ? (mission ?? { subject: "Physics", chapter: "Motion", durationMinutes: 45, href: "/practice/question" })
    : mission;

  if (!demo && (!displayName || !displayExam || !displayYear || !displayGoal || !displayMission)) {
    return (
      <div className="exam-hub">
        <section className="exam-hero-panel" aria-labelledby="setup-title">
          <div className="exam-hero-copy">
            <p className="eyebrow">Mission Control</p>
            <h1 id="setup-title">Complete your preparation profile.</h1>
            <p className="exam-hero-lead">
              Your real Mission Control appears after exam, target year, goal, and study hours are saved.
            </p>
            <div className="exam-primary-action">
              <Button href="/onboarding">Finish Onboarding</Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!displayMission) {
    return null;
  }

  return (
    <div className="exam-hub">
      <section className="exam-hero-panel" aria-labelledby="exam-engine-title">
        <div className="exam-hero-copy">
          <div className="exam-hero-meta">
            <span>{displayExam} {displayYear}</span>
            {demo ? <DemoBadge /> : null}
          </div>
          <p className="eyebrow">Mission Control</p>
          <h1 id="exam-engine-title">Hi {displayName}, start today's preparation mission.</h1>
          <p className="exam-hero-lead">
            TopRank opens with practice first. Learn only what helps you answer better, then return to questions.
          </p>
          <div className="exam-primary-action">
            <Button href={displayMission.href}>Continue Learning</Button>
            <span>{displayMission.chapter} - {displayMission.durationMinutes} minutes</span>
          </div>
          {!demo ? (
            <div className="exam-primary-action">
              <Button href="/mission/exam" variant="secondary">Edit Profile</Button>
            </div>
          ) : null}
        </div>

        <div className="practice-window" aria-label="Today's mission preview">
          <div className="practice-window-top">
            <span>Today's Mission</span>
            <strong>{displayMission.durationMinutes} min</strong>
          </div>
          <div className="practice-question-preview">
            <p>{displayMission.subject} - {displayMission.chapter}</p>
            <h2>Today's placeholder mission is ready from your saved preparation profile.</h2>
          </div>
          <div className="practice-options-preview">
            <span>L</span>
            <span>P</span>
            <span>R</span>
            <span>G</span>
          </div>
          <div className="practice-progress-preview">
            <span style={{ width: "45%" }} />
          </div>
        </div>
      </section>

      <section className="exam-support-strip" aria-label="Preparation tools around exam practice">
        {supportTools.map((tool) => (
          <a className="exam-tool-card" href={tool.href} key={tool.title}>
            <strong>{tool.title}</strong>
            <p>{tool.copy}</p>
            <span>{tool.action}</span>
          </a>
        ))}
      </section>

      <section className="exam-day-grid" aria-label="Today's focused preparation">
        <div className="exam-day-card main">
          <p className="eyebrow">Today's Goal</p>
          <h2>{displayMission.subject}: {displayMission.chapter}</h2>
          <p>Study for {displayMission.durationMinutes} minutes, then continue into practice when the real engine is ready.</p>
        </div>
        <div className="exam-day-card">
          <strong>{dailyStudyHours ? `${dailyStudyHours}h` : "Set"}</strong>
          <span>daily study plan</span>
        </div>
        <div className="exam-day-card">
          <strong>{displayExam}</strong>
          <span>target exam</span>
        </div>
        <div className="exam-day-card">
          <strong>{displayGoal}</strong>
          <span>dream college path</span>
        </div>
      </section>
    </div>
  );
}
