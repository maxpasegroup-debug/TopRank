import { ClassCard } from "../components/guardian/ClassCard";
import { NoticeCard } from "../components/guardian/NoticeCard";
import { SchoolMetricCard } from "../components/guardian/SchoolMetricCard";
import { SpotlightCard } from "../components/guardian/SpotlightCard";
import { Button } from "../components/ui/Button";
import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { classes, notices, schoolMetrics } from "../data/guardian";

export function SchoolPreview() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="School Preview"
          title="Students are engaged"
          subtitle="A simple overview for principals and teachers."
          action={<Button href="/practice/mock-tests">View Mock Tests</Button>}
        />

        <div className="grid grid-2">
          {schoolMetrics.map((metric) => (
            <SchoolMetricCard metric={metric} key={metric.label} />
          ))}
        </div>

        <SectionHeader eyebrow="Class Overview" title="Clear class signals" />
        <div className="grid grid-3">
          {classes.map((item) => (
            <ClassCard item={item} key={item.name} />
          ))}
        </div>

        <SectionHeader eyebrow="Notices" title="Simple announcements" />
        <div className="grid grid-3">
          {notices.map((notice) => (
            <NoticeCard notice={notice} key={notice.title} />
          ))}
        </div>

        <SpotlightCard />
      </div>
    </PageContainer>
  );
}
