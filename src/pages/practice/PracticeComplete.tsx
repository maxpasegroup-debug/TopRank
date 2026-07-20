import { ResultCard } from "../../components/practice/ResultCard";
import { Button } from "../../components/ui/Button";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";

export function PracticeComplete() {
  return (
    <PageContainer>
      <div className="ready-screen">
        <div className="celebration-mark">OK</div>
        <SectionHeader
          eyebrow="Practice Finished"
          title="You finished today's practice."
          subtitle="These results are mock values for the prototype."
          action={<Button href="/practice/review">Review Answers</Button>}
        />
        <div className="grid grid-3">
          <ResultCard value="40" label="Questions attempted" />
          <ResultCard value="78%" label="Accuracy" />
          <ResultCard value="48m" label="Time" />
        </div>
        <Button href="/practice" variant="secondary">
          Back to Practice
        </Button>
      </div>
    </PageContainer>
  );
}
