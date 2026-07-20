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

export function Learn() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Today's Learning"
          title="One calm study plan for today"
          subtitle="Only the subjects you need today. No clutter."
          action={<Button href="/learn/search">Search</Button>}
        />
        <SearchBar />
        <GlobalSearchLauncher />
        <div className="grid grid-3">
          {todaySubjects.map((subject) => (
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
          title="No bookmarks yet"
          text="Saved lessons and revision cards will appear here later."
          actionLabel="Continue Learning"
          actionHref="/learn/physics"
        />
      </div>
    </PageContainer>
  );
}
