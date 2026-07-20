import { LessonCard } from "../../components/learning/LessonCard";
import { ResourceCard } from "../../components/learning/ResourceCard";
import { TeacherCard } from "../../components/learning/TeacherCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { downloads } from "../../data/learning";

export function LessonExperience() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Lesson"
          title="Motion: Distance and Displacement"
          subtitle="Prototype lesson screen. Video, bookmarks, and completion are mock actions."
          action={<Button href="/learn/physics">Next Lesson</Button>}
        />
        <div className="video-placeholder">
          <div>
            <p className="eyebrow">Video Placeholder</p>
            <h2>Concept lesson preview</h2>
          </div>
        </div>
        <TeacherCard />
        <div className="grid grid-2">
          <LessonCard title="Quick notes" text="Distance is total path covered. Displacement is shortest change in position." />
          <LessonCard title="Bookmark" text="Tap later to save this lesson. Prototype only." />
        </div>
        <SectionHeader eyebrow="Downloads" title="Study resources" />
        <div className="grid grid-3">
          {downloads.slice(0, 3).map((resource) => (
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
