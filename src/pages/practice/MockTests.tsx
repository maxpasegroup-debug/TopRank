import { MockTestCard } from "../../components/practice/MockTestCard";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { mockTests } from "../../data/practice";

export function MockTests() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Mock Tests"
          title="Test readiness without pressure"
          subtitle="Start with Weekly Challenge today."
          action={<Button href="/practice/question">Start Weekly Challenge</Button>}
        />
        <div className="grid grid-3">
          {mockTests.map((test) => (
            <MockTestCard test={test} key={test.title} />
          ))}
        </div>
        <EmptyState title="No mock history" text="Completed mock tests will appear here later." actionLabel="Start Weekly Challenge" actionHref="/practice/question" />
      </div>
    </PageContainer>
  );
}
