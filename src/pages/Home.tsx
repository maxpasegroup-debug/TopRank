import { MetricCard } from "../components/prototype/MetricCard";
import { MissionCard } from "../components/prototype/MissionCard";
import { GlobalSearchLauncher } from "../components/polish/GlobalSearchLauncher";
import { QuickActionGrid } from "../components/polish/QuickActionGrid";
import { WelcomeBanner } from "../components/polish/WelcomeBanner";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";

export function Home() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <WelcomeBanner />
        <SectionHeader
          eyebrow="Today"
          title="Mission Control"
          subtitle="One clear mission for today. Keep it light, keep moving."
          action={<Button href="/learn">Start learning</Button>}
        />
        <GlobalSearchLauncher />
        <MissionCard title="Complete Physics Basics" label="Daily mission" progress={42} />
        <SectionHeader eyebrow="Quick Actions" title="Choose the next best step" />
        <QuickActionGrid />
        <div className="grid grid-3">
          <MetricCard value="12" label="Day streak" />
          <MetricCard value="3" label="Lessons ready" />
          <MetricCard value="68%" label="Weekly progress" />
        </div>
        <Card soft>
          <h2 style={{ margin: 0, fontSize: 24 }}>Tara says</h2>
          <p style={{ marginBottom: 0, color: "var(--color-muted)", lineHeight: 1.55 }}>
            Start with the easiest topic first. Confidence is also practice.
          </p>
        </Card>
      </div>
    </PageContainer>
  );
}
