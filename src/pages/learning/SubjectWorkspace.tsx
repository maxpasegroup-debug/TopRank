import { ChapterCard } from "../../components/learning/ChapterCard";
import { ContinueLearningCard } from "../../components/learning/ContinueLearningCard";
import { ResourceCard } from "../../components/learning/ResourceCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageContainer } from "../../components/ui/PageContainer";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { chapters, quickRevision } from "../../data/learning";

type SubjectWorkspaceProps = {
  subject: "Physics" | "Chemistry" | "Biology";
};

export function SubjectWorkspace({ subject }: SubjectWorkspaceProps) {
  const progress = subject === "Physics" ? 62 : subject === "Chemistry" ? 44 : 100;

  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow={subject}
          title={`${subject} workspace`}
          subtitle="Your learning mission, chapters, and activity in one clean place."
          action={<Button href="/learn/physics/motion">Continue Learning</Button>}
        />
        <Card>
          <div className="subject-hero">
            <div>
              <p className="eyebrow">Progress</p>
              <h2 className="subject-progress">{progress}%</h2>
            </div>
            <ProgressBar value={progress} />
          </div>
        </Card>
        <ContinueLearningCard />
        <Card soft>
          <h2 className="learning-card-title">Today's Mission</h2>
          <p className="card-copy">Finish Motion basics and revise three formulas.</p>
        </Card>
        <SectionHeader eyebrow="Topics" title="Chapters" />
        <div className="grid grid-3">
          {chapters.map((chapter) => (
            <ChapterCard chapter={chapter} key={chapter.title} />
          ))}
        </div>
        <SectionHeader eyebrow="Recent Activity" title="Fresh from your study table" />
        <div className="grid grid-2">
          {quickRevision.slice(0, 2).map((resource) => (
            <ResourceCard resource={resource} key={resource.title} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
