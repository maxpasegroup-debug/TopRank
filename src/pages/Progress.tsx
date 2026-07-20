import { AchievementCard } from "../components/progress/AchievementCard";
import { CalendarCard } from "../components/progress/CalendarCard";
import { CertificateCard } from "../components/progress/CertificateCard";
import { MotivationCard } from "../components/progress/MotivationCard";
import { ProgressMetric } from "../components/progress/ProgressMetric";
import { RankCard } from "../components/progress/RankCard";
import { SubjectProgressCard } from "../components/progress/SubjectProgressCard";
import { SummaryCard } from "../components/progress/SummaryCard";
import { TimelineItem } from "../components/progress/TimelineItem";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import {
  achievements,
  certificates,
  journeyItems,
  progressMetrics,
  subjectPerformance,
  weeklyProgress,
} from "../data/progress";

export function Progress() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Your Progress"
          title="You are moving forward"
          subtitle="Effort matters here. Every study day, revision, and practice set counts."
          action={<Button href="/practice">Practice today</Button>}
        />

        <div className="progress-metrics-grid">
          {progressMetrics.map((metric) => (
            <ProgressMetric metric={metric} key={metric.label} />
          ))}
        </div>

        <SectionHeader eyebrow="Progress Journey" title="Your path so far" />
        <section className="timeline-card">
          {journeyItems.map((item) => (
            <TimelineItem item={item} key={item.title} />
          ))}
        </section>

        <SectionHeader eyebrow="Subject Performance" title="Where your effort is growing" />
        <div className="grid grid-3">
          {subjectPerformance.map((subject) => (
            <SubjectProgressCard subject={subject} key={subject.subject} />
          ))}
        </div>

        <SectionHeader eyebrow="Weekly Progress" title="This week at a glance" />
        <section className="weekly-card">
          {weeklyProgress.map((day) => (
            <div className="weekly-day" key={day.label}>
              <span className={day.value > 0 ? "weekly-check active" : "weekly-check"} />
              <p>{day.label}</p>
            </div>
          ))}
        </section>

        <SectionHeader eyebrow="Achievements" title="Effort worth celebrating" />
        <div className="grid grid-3">
          {achievements.map((achievement) => (
            <AchievementCard achievement={achievement} key={achievement.title} />
          ))}
        </div>

        <div className="grid grid-2">
          <RankCard />
          <SummaryCard />
        </div>

        <CalendarCard />

        <SectionHeader eyebrow="Certificates" title="Milestones you can unlock" />
        <div className="grid grid-3">
          {certificates.map((certificate) => (
            <CertificateCard certificate={certificate} key={certificate.title} />
          ))}
        </div>

        <div className="grid grid-2">
          <EmptyState title="No achievements" text="New achievement cards will appear as you keep showing up." actionLabel="Complete Today's Mission" actionHref="/home" />
          <EmptyState title="No streak" text="Your streak history will be visible after future tracking is connected." actionLabel="Start Practice" actionHref="/practice" />
          <EmptyState title="No study history" text="Study history will appear here once real activity is tracked." actionLabel="Continue Learning" actionHref="/learn" />
          <EmptyState title="No certificates" text="Certificates are preview-only in Level 1." actionLabel="View Progress" actionHref="/progress" />
        </div>

        <MotivationCard />
      </div>
    </PageContainer>
  );
}
