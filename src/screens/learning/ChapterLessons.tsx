import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import type { ContentChapterDto, ContentLessonDto, ContentSubjectDto } from "../../server/content/service";

type ChapterLessonsProps = {
  subject: ContentSubjectDto;
  chapter: ContentChapterDto;
  lessons: ContentLessonDto[];
};

export function ChapterLessons({ subject, chapter, lessons }: ChapterLessonsProps) {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow={subject.name}
          title={chapter.title}
          subtitle={chapter.summary ?? "Published lesson list for this chapter."}
          action={<Button href={subject.href} variant="secondary">Back to Subject</Button>}
        />

        <div className="grid grid-3">
          {lessons.map((lesson) => (
            <Card key={lesson.slug}>
              <h3 className="learning-card-title">{lesson.title}</h3>
              <p className="card-copy">{lesson.summary ?? "Foundation lesson"}</p>
              <Button href={lesson.href} variant="secondary">Open Lesson</Button>
            </Card>
          ))}
        </div>

        {lessons.length === 0 ? (
          <EmptyState
            title="Content is being prepared"
            text="Published lessons for this chapter are not available yet."
            actionLabel="Back to Subject"
            actionHref={subject.href}
          />
        ) : null}
      </div>
    </PageContainer>
  );
}
