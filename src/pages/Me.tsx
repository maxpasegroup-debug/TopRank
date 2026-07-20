import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { demoStudent } from "../data/demo";

export function Me() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Me"
          title="A profile that feels personal"
          subtitle="Student details are mock-only. Authentication is not implemented."
          action={<Button href="/settings">Open settings</Button>}
        />
        <Card>
          <Badge>Village learner</Badge>
          <h2 style={{ margin: "18px 0 8px", fontSize: 30 }}>{demoStudent.name}</h2>
          <p style={{ margin: 0, color: "var(--color-muted)", lineHeight: 1.55 }}>
            Class 11. Preparing for {demoStudent.exam} {demoStudent.targetYear} with {demoStudent.dreamCollege} as the dream.
          </p>
        </Card>
        <div className="grid grid-2">
          <Card>
            <h2 style={{ marginTop: 0 }}>Parent Preview</h2>
            <p style={{ color: "var(--color-muted)", lineHeight: 1.55 }}>
              A warm view of the student's journey.
            </p>
            <Button href="/parent" variant="secondary">Open Parent View</Button>
          </Card>
          <Card>
            <h2 style={{ marginTop: 0 }}>School Preview</h2>
            <p style={{ color: "var(--color-muted)", lineHeight: 1.55 }}>
              A simple engagement view for teachers.
            </p>
            <Button href="/school" variant="secondary">Open School View</Button>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
