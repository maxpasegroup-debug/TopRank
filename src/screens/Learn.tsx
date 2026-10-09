import { ContinueLearningCard } from "../components/learning/ContinueLearningCard";
import { GlobalSearchLauncher } from "../components/polish/GlobalSearchLauncher";
import { ResourceCard } from "../components/learning/ResourceCard";
import { SearchBar } from "../components/learning/SearchBar";
import { SubjectCard } from "../components/learning/SubjectCard";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { quickRevision, todaySubjects } from "../data/learning";
import type { ContentExamDto, ContentSubjectDto } from "../server/content/service";

type LearnProps = {
  exam?: ContentExamDto | null;
  subjects?: ContentSubjectDto[];
};

const subjectColors = ["blue", "amber", "green"] as const;

export function Learn({ exam, subjects }: LearnProps) {
  const productionSubjects = subjects?.map((subject, index) => ({
    name: subject.name,
    href: subject.href,
    progress: 0,
    status: "Continue" as const,
    color: subjectColors[index % subjectColors.length],
  }));
  const isProduction = Boolean(subjects);
  const displaySubjects = isProduction ? (productionSubjects ?? []) : todaySubjects;

  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Today's Learning"
          title={exam ? `${exam.name} learning path` : "One calm study plan for today"}
          subtitle={isProduction ? "Subjects are loaded from your saved exam content." : "Only the subjects you need today. No clutter."}
          action={<Button href="/learn/search">Search</Button>}
        />
        <SearchBar />
        <GlobalSearchLauncher />
        <div className="grid grid-3">
          {displaySubjects.map((subject) => (
            <SubjectCard subject={subject} key={subject.name} />
          ))}
        </div>
        <ContinueLearningCard />
        <SectionHeader
          eyebrow="Quick Revision"
          title="Revise before you forget"
          action={<Button href="/learn/revision" variant="secondary">Open revision</Button>}
        />
        <div className="grid grid-3">
          {quickRevision.slice(0, 3).map((resource) => (
            <ResourceCard resource={resource} key={resource.title} />
          ))}
        </div>
        <EmptyState
          title={isProduction && displaySubjects.length === 0 ? "Content is being prepared" : "No bookmarks yet"}
          text={isProduction && displaySubjects.length === 0 ? "Published content for your selected exam is not available yet." : "Saved lessons and revision cards will appear here later."}
          actionLabel="Continue Learning"
          actionHref={displaySubjects[0]?.href ?? "/learn"}
        />
      </div>
    </PageContainer>
  );
}
