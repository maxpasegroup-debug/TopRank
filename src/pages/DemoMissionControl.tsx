import { MetricCard } from "../components/prototype/MetricCard";
import { MissionCard } from "../components/prototype/MissionCard";
import { demoStudent } from "../data/demo";
import { GlobalSearchLauncher } from "../components/polish/GlobalSearchLauncher";
import { QuickActionGrid } from "../components/polish/QuickActionGrid";
import { SuccessBanner } from "../components/polish/SuccessBanner";
import { WelcomeBanner } from "../components/polish/WelcomeBanner";
import { Card } from "../components/ui/Card";
import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";

export function DemoMissionControl() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <WelcomeBanner demo />
        <SuccessBanner title="Mission Updated" actionLabel="Continue Physics" actionHref="/learn/physics" />
        <MissionCard title="Complete Physics Motion Practice" label={`${demoStudent.exam} ${demoStudent.targetYear}`} progress={72} />
        <SectionHeader eyebrow="Quick Actions" title="Your next best actions" />
        <QuickActionGrid />
        <GlobalSearchLauncher />
        <div className="grid grid-3">
          <MetricCard value="12" label="Day streak" />
          <MetricCard value="18" label="Lessons ready" />
          <MetricCard value="78%" label="Mock accuracy" />
        </div>
        <Card soft>
          <h2 style={{ margin: 0, fontSize: 24 }}>Daily quote</h2>
          <p style={{ marginBottom: 0, color: "var(--color-muted)", lineHeight: 1.55 }}>
            Progress is built by students who return to the mission, even on ordinary days.
          </p>
        </Card>
      </div>
    </PageContainer>
  );
}
