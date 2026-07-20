import { MissionProgress } from "../components/mission/MissionProgress";
import { OptionGrid } from "../components/mission/OptionGrid";
import { PlaceholderIllustration } from "../components/prototype/PlaceholderIllustration";
import { Button } from "../components/ui/Button";
import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";

const steps = {
  missionExam: {
    step: 1,
    eyebrow: "Question 1",
    title: "Which exam is your mission?",
    subtitle: "Pick one goal for now. You can change it later.",
    options: ["NEET", "JEE", "KEAM", "CUET"],
    next: "/mission/year",
    action: "Next",
  },
  missionYear: {
    step: 2,
    eyebrow: "Question 2",
    title: "What is your target year?",
    subtitle: "A clear year helps TopRank shape your daily rhythm.",
    options: ["2027", "2028", "2029"],
    next: "/mission/college",
    action: "Continue",
  },
  missionCollege: {
    step: 3,
    eyebrow: "Question 3",
    title: "What is your dream college?",
    subtitle: "Keep it honest. Big dreams are welcome here.",
    options: ["AIIMS Delhi", "IIT Madras", "NIT Calicut", "My State College"],
    next: "/mission/hours",
    action: "Set dream",
  },
  missionHours: {
    step: 4,
    eyebrow: "Question 4",
    title: "How many hours can you study daily?",
    subtitle: "Choose a steady number you can actually protect.",
    options: ["1 hour", "2 hours", "3 hours", "4+ hours"],
    next: "/mission-ready",
    action: "Create mission",
  },
};

export type MissionStepKey = keyof typeof steps;

export function MissionFlow({ screen }: { screen: MissionStepKey }) {
  const current = steps[screen];

  return (
    <PageContainer>
      <div className="mission-screen">
        <MissionProgress step={current.step} total={4} />
        <SectionHeader
          eyebrow={current.eyebrow}
          title={current.title}
          subtitle={current.subtitle}
          action={<Button href={current.next}>{current.action}</Button>}
        />
        <OptionGrid options={current.options} />
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
          subtitle="We will create a daily plan preview using only mock choices."
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
          subtitle="A friendly mission control preview is ready. No real account or data was created."
          action={<Button href="/home">Enter Mission Control</Button>}
        />
      </div>
    </PageContainer>
  );
}
