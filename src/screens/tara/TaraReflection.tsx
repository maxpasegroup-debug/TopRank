import { ReflectionCard } from "../../components/tara/ReflectionCard";
import { Button } from "../../components/ui/Button";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";

export function TaraReflection() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Daily Reflection"
          title="End the day with clarity"
          subtitle="Nothing is saved in this prototype. This is a preview of Tara's reflection flow."
          action={<Button href="/practice">Practice Tomorrow</Button>}
        />
        <ReflectionCard />
      </div>
    </PageContainer>
  );
}
