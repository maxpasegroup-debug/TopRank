import { Button } from "../ui/Button";
import { DemoBadge } from "../polish/DemoBadge";

type ExamEngineHubProps = {
  demo?: boolean;
  studentName?: string;
  exam?: string;
  targetYear?: string;
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
  studentName = "Rahul",
  exam = "NEET",
  targetYear = "2028",
}: ExamEngineHubProps) {
  return (
    <div className="exam-hub">
      <section className="exam-hero-panel" aria-labelledby="exam-engine-title">
        <div className="exam-hero-copy">
          <div className="exam-hero-meta">
            <span>{exam} {targetYear}</span>
            {demo ? <DemoBadge /> : null}
          </div>
          <p className="eyebrow">Exam Engine</p>
          <h1 id="exam-engine-title">Hi {studentName}, start today's practice session.</h1>
          <p className="exam-hero-lead">
            TopRank opens with practice first. Learn only what helps you answer better, then return to questions.
          </p>
          <div className="exam-primary-action">
            <Button href="/practice/question">Start Exam Practice</Button>
            <span>Motion • 40 questions • 48 minutes</span>
          </div>
        </div>

        <div className="practice-window" aria-label="Today's practice session preview">
          <div className="practice-window-top">
            <span>Live Session</span>
            <strong>Question 18 of 40</strong>
          </div>
          <div className="practice-question-preview">
            <p>Physics • Motion</p>
            <h2>A ball is thrown upward. Which graph best shows its velocity?</h2>
          </div>
          <div className="practice-options-preview">
            <span>A</span>
            <span>B</span>
            <span>C</span>
            <span>D</span>
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
          <h2>Finish one serious practice set.</h2>
          <p>Learn 12 minutes, solve 40 questions, revise 5 formulas. That is enough for today.</p>
        </div>
        <div className="exam-day-card">
          <strong>12 days</strong>
          <span>streak</span>
        </div>
        <div className="exam-day-card">
          <strong>78%</strong>
          <span>last accuracy</span>
        </div>
        <div className="exam-day-card">
          <strong>AIIMS Delhi</strong>
          <span>dream college path</span>
        </div>
      </section>
    </div>
  );
}
