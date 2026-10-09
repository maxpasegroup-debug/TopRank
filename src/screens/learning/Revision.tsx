import { ResourceCard } from "../../components/learning/ResourceCard";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { quickRevision } from "../../data/learning";

export function Revision() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Quick Revision"
          title="Short revision, strong recall"
          subtitle="Formula Sheet, Mind Maps, Flashcards, Important Concepts, and NCERT Highlights."
          action={<Button href="/learn/downloads">Downloads</Button>}
        />
        <div className="grid grid-3">
          {quickRevision.map((resource) => (
            <ResourceCard resource={resource} key={resource.title} />
          ))}
        </div>
        <EmptyState title="No completed lessons" text="Completed lesson summaries will appear here later." actionLabel="Continue Learning" actionHref="/learn/physics" />
      </div>
    </PageContainer>
  );
}
