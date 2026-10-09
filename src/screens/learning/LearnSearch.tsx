import { SearchBar } from "../../components/learning/SearchBar";
import { ResourceCard } from "../../components/learning/ResourceCard";
import { SubjectCard } from "../../components/learning/SubjectCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { quickRevision, todaySubjects } from "../../data/learning";

export function LearnSearch() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Search"
          title="Find a subject, chapter, or concept"
          subtitle="Search is visual only in Level 1."
        />
        <SearchBar />
        <div className="grid grid-3">
          {todaySubjects.slice(0, 2).map((subject) => (
            <SubjectCard subject={subject} key={subject.name} />
          ))}
          <ResourceCard resource={quickRevision[0]} />
        </div>
        <EmptyState title="No search logic yet" text="Real search results will connect in a future phase." actionLabel="Continue Learning" actionHref="/learn/physics" />
      </div>
    </PageContainer>
  );
}
