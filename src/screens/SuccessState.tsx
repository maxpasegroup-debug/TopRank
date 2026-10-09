import { CelebrationCard } from "../components/polish/CelebrationCard";
import { PageContainer } from "../components/ui/PageContainer";

const successCopy = {
  lesson: {
    title: "Lesson Completed",
    text: "Nice work. You showed up and finished one more concept.",
    actionLabel: "Start Practice",
    actionHref: "/practice",
  },
  practice: {
    title: "Practice Finished",
    text: "Your effort is recorded in this prototype moment.",
    actionLabel: "Review Answers",
    actionHref: "/practice/review",
  },
  week: {
    title: "Weekly Goal Complete",
    text: "Consistency is the real win this week.",
    actionLabel: "View Progress",
    actionHref: "/progress",
  },
  streak: {
    title: "7-Day Streak",
    text: "Seven days of showing up. That deserves a calm celebration.",
    actionLabel: "Continue Learning",
    actionHref: "/learn",
  },
  mock: {
    title: "First Mock Test",
    text: "A big step toward exam readiness.",
    actionLabel: "Review Answers",
    actionHref: "/practice/review",
  },
  milestone: {
    title: "Mission Milestone",
    text: "Your daily actions are turning into visible progress.",
    actionLabel: "Enter Mission Control",
    actionHref: "/home",
  },
};

export type SuccessKey = keyof typeof successCopy;

export function SuccessState({ type }: { type: SuccessKey }) {
  const item = successCopy[type];

  return (
    <PageContainer>
      <div className="ready-screen">
        <CelebrationCard {...item} />
      </div>
    </PageContainer>
  );
}
