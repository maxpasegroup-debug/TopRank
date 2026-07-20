import { ReviewCard } from "../../components/practice/ReviewCard";
import { Button } from "../../components/ui/Button";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { reviewItems } from "../../data/practice";

export function PracticeReview() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Review Answers"
          title="Learn from every question"
          subtitle="Mock review cards only. No scoring or validation is running."
          action={<Button href="/practice">Back to Practice</Button>}
        />
        <div className="grid grid-2">
          {reviewItems.map((item) => (
            <ReviewCard item={item} key={item.number} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
