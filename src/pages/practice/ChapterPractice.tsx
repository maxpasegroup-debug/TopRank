import { PracticeSetCard } from "../../components/practice/PracticeSetCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { practiceSets } from "../../data/practice";

export function ChapterPractice() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Physics"
          title="Motion practice"
          subtitle="Three focused sets. Start with Set 1."
          action={<Button href="/practice/question">Start Set 1</Button>}
        />
        <Card soft>
          <div className="breadcrumb-strip">
            <span>Physics</span>
            <span>Motion</span>
            <span>Practice Sets</span>
          </div>
        </Card>
        <div className="grid grid-3">
          {practiceSets.map((set) => (
            <PracticeSetCard set={set} key={set.title} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
