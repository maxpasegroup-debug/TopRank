import { QuestionCard } from "../../components/practice/QuestionCard";
import { Button } from "../../components/ui/Button";
import { PageContainer } from "../../components/ui/PageContainer";

export function QuestionExperience() {
  return (
    <PageContainer>
      <div className="question-screen">
        <QuestionCard />
        <div className="question-actions">
          <Button href="/practice/question" variant="secondary">
            Previous Question
          </Button>
          <Button href="/practice/question">Next Question</Button>
          <Button href="/practice/question" variant="secondary">
            Mark for Review
          </Button>
          <Button href="/practice/complete" variant="ghost">
            Submit Test
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
