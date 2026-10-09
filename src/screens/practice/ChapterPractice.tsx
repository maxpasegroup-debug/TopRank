import { PracticeSetCard } from "../../components/practice/PracticeSetCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { practiceSets } from "../../data/practice";
import type { StudentQuestionDto } from "../../server/question/service";

type ChapterPracticeProps = {
  subject?: { name: string; slug: string };
  chapter?: { title: string; slug: string };
  questions?: StudentQuestionDto[];
};

export function ChapterPractice({ subject, chapter, questions }: ChapterPracticeProps) {
  const hasRealQuestions = Array.isArray(questions);
  const title = chapter?.title ?? "Motion practice";
  const eyebrow = subject?.name ?? "Physics";
  const firstQuestion = questions?.[0];
  const sets = questions?.map((question) => ({
    title: question.code,
    questions: 1,
    time: "Read-only",
    difficulty: question.difficulty,
    bestScore: "Not attempted",
    href: `/practice/questions/${question.code}`,
  })) ?? practiceSets;

  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          subtitle={hasRealQuestions ? "Published foundation questions. Attempts and scoring are intentionally not enabled in this phase." : "Three focused sets. Start with Set 1."}
          action={<Button href={firstQuestion ? `/practice/questions/${firstQuestion.code}` : "/practice/question"}>Start Practice</Button>}
        />
        <Card soft>
          <div className="breadcrumb-strip">
            <span>{eyebrow}</span>
            <span>{chapter?.title ?? "Motion"}</span>
            <span>{hasRealQuestions ? "Question Bank" : "Practice Sets"}</span>
          </div>
        </Card>
        {sets.length > 0 ? (
          <div className="grid grid-3">
            {sets.map((set) => (
              <PracticeSetCard set={set} key={set.title} />
            ))}
          </div>
        ) : (
          <EmptyState title="No questions available" text="Published practice questions for this area will appear here." actionLabel="Back to Practice" actionHref="/practice" />
        )}
      </div>
    </PageContainer>
  );
}
