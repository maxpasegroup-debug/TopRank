import { AttendanceCard } from "../components/guardian/AttendanceCard";
import { EncouragementCard } from "../components/guardian/EncouragementCard";
import { JourneyTimeline } from "../components/guardian/JourneyTimeline";
import { ParentMetricCard } from "../components/guardian/ParentMetricCard";
import { WeeklySummaryCard } from "../components/guardian/WeeklySummaryCard";
import { Button } from "../components/ui/Button";
import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { parentMetrics, parentTimeline, weeklySummary } from "../data/guardian";

export function ParentPreview() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Parent Preview"
          title="Your Child's Journey"
          subtitle="A warm snapshot of effort, consistency, and movement."
          action={<Button href="/progress">Open Progress</Button>}
        />

        <div className="grid grid-2">
          {parentMetrics.map((metric) => (
            <ParentMetricCard metric={metric} key={metric.label} />
          ))}
        </div>

        <SectionHeader eyebrow="Weekly Summary" title="This week is moving forward" />
        <div className="grid grid-2">
          {weeklySummary.map((item) => (
            <WeeklySummaryCard item={item} key={item.label} />
          ))}
        </div>

        <div className="grid grid-2">
          <AttendanceCard />
          <EncouragementCard />
        </div>

        <SectionHeader eyebrow="Parent Timeline" title="Recent journey moments" />
        <JourneyTimeline items={parentTimeline} />
      </div>
    </PageContainer>
  );
}
