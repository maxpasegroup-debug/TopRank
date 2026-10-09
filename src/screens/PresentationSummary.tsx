import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";

const sections = [
  {
    title: "Prototype Features",
    items: ["Mission Control", "Daily learning", "Practice flow", "Progress view", "Tara mentor", "Parent and school previews"],
  },
  {
    title: "Student Journey",
    items: ["Start demo", "Continue mission", "Learn Physics", "Practice Motion", "See progress", "Talk to Tara"],
  },
  {
    title: "Parent Journey",
    items: ["Check if Rahul is moving forward", "Review weekly summary", "Celebrate consistency"],
  },
  {
    title: "School Journey",
    items: ["View engagement", "Review class cards", "Share notices", "Highlight student effort"],
  },
  {
    title: "Future AI Roadmap",
    items: ["Tara AI mentor", "Personalized plans", "Concept explanations", "Adaptive revision"],
  },
  {
    title: "Production Roadmap",
    items: ["Authentication", "Backend", "Database", "Exam engine", "Analytics", "Payments"],
  },
  {
    title: "Known Mock Areas",
    items: ["All data", "Search", "AI", "Auth", "Downloads", "Notifications", "Scoring"],
  },
];

export function PresentationSummary() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Presentation Summary"
          title="TopRank Level 1 is ready to demo"
          subtitle="A concise guide for school presentations, parent demos, investor meetings, and product videos."
          action={<Button href="/demo/start">Start Demo</Button>}
        />
        <div className="grid grid-2">
          {sections.map((section) => (
            <Card key={section.title}>
              <h2 className="progress-card-title">{section.title}</h2>
              <div className="summary-list">
                {section.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
