import { QuestionCard } from "../../components/practice/QuestionCard";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageContainer } from "../../components/ui/PageContainer";
import type { StudentQuestionDto } from "../../server/question/service";

export function QuestionExperience({ question }: { question?: StudentQuestionDto | null }) {
  if (!question) {
    return (
      <PageContainer>
        <EmptyState title="No question available" text="Published practice questions are being prepared." actionLabel="Back to Practice" actionHref="/practice" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="question-screen">
        <QuestionCard question={question} />
        <div className="question-actions">
          <Button href={`/practice/subjects/${question.subject.slug}/questions`} variant="secondary">
            Back to Questions
          </Button>
          <Button href="/practice" variant="ghost">
            Practice Home
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
