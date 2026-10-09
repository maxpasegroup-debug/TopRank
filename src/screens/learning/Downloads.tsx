import { ResourceCard } from "../../components/learning/ResourceCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { downloads } from "../../data/learning";

export function Downloads() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Resources"
          title="Downloads preview"
          subtitle="No files are downloaded in this prototype."
        />
        <div className="grid grid-2">
          {downloads.map((resource) => (
            <ResourceCard resource={resource} key={resource.title} />
          ))}
        </div>
        <EmptyState title="No downloads yet" text="Downloaded files will be shown here in a later phase." actionLabel="Explore Resources" actionHref="/learn/revision" />
      </div>
    </PageContainer>
  );
}
