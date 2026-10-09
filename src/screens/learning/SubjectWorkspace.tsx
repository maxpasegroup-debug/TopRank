import { ChapterCard } from "../../components/learning/ChapterCard";
import { ContinueLearningCard } from "../../components/learning/ContinueLearningCard";
import { ResourceCard } from "../../components/learning/ResourceCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageContainer } from "../../components/ui/PageContainer";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { chapters, quickRevision } from "../../data/learning";
import type { ContentChapterDto, ContentSubjectDto } from "../../server/content/service";

type SubjectWorkspaceProps = {
  subject: "Physics" | "Chemistry" | "Biology" | string;
  contentSubject?: ContentSubjectDto;
  contentChapters?: ContentChapterDto[];
};

export function SubjectWorkspace({ subject, contentSubject, contentChapters }: SubjectWorkspaceProps) {
  const progress = subject === "Physics" ? 62 : subject === "Chemistry" ? 44 : 100;
  const mappedChapters = contentChapters?.map((chapter) => ({
    title: chapter.title,
    completion: 0,
    time: "Foundation",
    difficulty: "Easy" as const,
    href: chapter.href,
  }));
  const isProduction = Boolean(contentSubject);
  const displayChapters = isProduction ? (mappedChapters ?? []) : chapters;

  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow={contentSubject?.name ?? subject}
          title={`${contentSubject?.name ?? subject} workspace`}
          subtitle={isProduction ? "Chapters are loaded from published TopRank content." : "Your learning mission, chapters, and activity in one clean place."}
          action={<Button href={displayChapters[0]?.href ?? "/learn"}>Continue Learning</Button>}
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
          {displayChapters.map((chapter) => (
            <ChapterCard chapter={chapter} key={chapter.title} />
          ))}
        </div>
        {isProduction && displayChapters.length === 0 ? (
          <EmptyState title="Content is being prepared" text="Published chapters for this subject are not available yet." actionLabel="Back to Learn" actionHref="/learn" />
        ) : null}
        <SectionHeader eyebrow="Recent Activity" title="Fresh from your study table" />
        {isProduction ? (
          <EmptyState title="No recent learning yet" text="Real activity will appear after lesson tracking is added." actionLabel="Continue" actionHref={displayChapters[0]?.href ?? "/learn"} />
        ) : (
          <div className="grid grid-2">
            {quickRevision.slice(0, 2).map((resource) => (
              <ResourceCard resource={resource} key={resource.title} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
