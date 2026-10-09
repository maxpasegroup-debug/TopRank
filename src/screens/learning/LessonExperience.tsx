import { LessonCard } from "../../components/learning/LessonCard";
import { ResourceCard } from "../../components/learning/ResourceCard";
import { TeacherCard } from "../../components/learning/TeacherCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { downloads } from "../../data/learning";
import type { LessonDetailDto } from "../../server/content/service";

type LessonExperienceProps = {
  lesson?: LessonDetailDto;
};

export function LessonExperience({ lesson }: LessonExperienceProps) {
  const resources = lesson?.resources.map((resource) => ({
    title: resource.title,
    type: resource.type,
    detail: resource.reference ?? resource.url ?? "Published learning resource",
    href: resource.url ?? lesson.href,
  })) ?? downloads;

  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Lesson"
          title={lesson ? `${lesson.chapter.title}: ${lesson.title}` : "Motion: Distance and Displacement"}
          subtitle={lesson?.summary ?? "Prototype lesson screen. Video, bookmarks, and completion are mock actions."}
          action={<Button href={lesson?.chapter.href ?? "/learn/physics"}>Back to Chapter</Button>}
        />
        <div className="video-placeholder">
          <div>
            <p className="eyebrow">Video Placeholder</p>
            <h2>Concept lesson preview</h2>
          </div>
        </div>
        <TeacherCard />
        <div className="grid grid-2">
          <LessonCard title="Quick notes" text={lesson?.summary ?? "Distance is total path covered. Displacement is shortest change in position."} />
          <LessonCard title="Content status" text={lesson ? "Published foundation lesson from PostgreSQL." : "Tap later to save this lesson. Prototype only."} />
        </div>
        <SectionHeader eyebrow="Downloads" title="Study resources" />
        <div className="grid grid-3">
          {resources.slice(0, 3).map((resource) => (
            <ResourceCard resource={resource} key={resource.title} />
          ))}
        </div>
        <Card soft>
          <div className="lesson-actions">
            <Button href="/success/lesson" variant="secondary">Mark Complete</Button>
            <Button href="/learn/physics">Next Lesson</Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
