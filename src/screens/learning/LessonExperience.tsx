import { Button } from "../../components/ui/Button";
import { PageContainer } from "../../components/ui/PageContainer";
import type { LessonDetailDto } from "../../server/content/service";
import { LessonActions } from "@/components/journey/LessonActions";

type LessonExperienceProps = {
  lesson?: LessonDetailDto;
};

export function LessonExperience({ lesson }: LessonExperienceProps) {
  if (lesson) return <PageContainer><main className="journey-shell">
    <span className="journey-kicker">{lesson.subject.name} / {lesson.chapter.title}</span>
    <h1>{lesson.title}</h1><p>{lesson.summary}</p>
    <Button href={lesson.chapter.href}>Back to chapter</Button>
    <section><h2>Study resources</h2>{lesson.resources.length ? <ul className="journey-task-list">{lesson.resources.map((resource) => <li key={resource.slug}><div><strong>{resource.title}</strong><span>{resource.type}</span>{resource.reference && <p>{resource.reference}</p>}</div>{resource.url ? <a href={resource.url} target="_blank" rel="noopener noreferrer">Open resource</a> : <span>Resource link unavailable</span>}</li>)}</ul> : <p>No published resources yet.</p>}</section>
    <LessonActions lessonId={lesson.id} />
  </main></PageContainer>;
  return <PageContainer><main className="journey-shell"><h1>Lesson unavailable</h1><Button href="/learn">Back to learning</Button></main></PageContainer>;
}
