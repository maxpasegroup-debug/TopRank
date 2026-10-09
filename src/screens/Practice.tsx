import { CategoryCard } from "../components/practice/CategoryCard";
import { ContinuePracticeCard } from "../components/practice/ContinuePracticeCard";
import { PracticeCard } from "../components/practice/PracticeCard";
import { GlobalSearchLauncher } from "../components/polish/GlobalSearchLauncher";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { practiceCategories, practiceSubjects } from "../data/practice";
import type { PracticeHomeSubjectDto } from "../server/question/service";

type PracticeProps = {
  exam?: { code: string; name: string } | null;
  subjects?: PracticeHomeSubjectDto[];
};

export function Practice({ exam, subjects }: PracticeProps) {
  const hasRealSubjects = Array.isArray(subjects);
  const practiceItems = hasRealSubjects ? subjects : practiceSubjects;
  const firstQuestionHref = subjects?.find((subject) => subject.questions > 0)?.href ?? "/practice/question";

  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Today's Practice"
          title={exam ? `${exam.name} practice bank` : "Practice what matters next"}
          subtitle={exam ? "Foundation questions are available from reviewed published content only." : "Choose your target exam during onboarding to unlock practice questions."}
          action={<Button href={firstQuestionHref}>Start Practice</Button>}
        />
        <GlobalSearchLauncher />
        {hasRealSubjects ? null : <ContinuePracticeCard />}
        {practiceItems.length > 0 ? (
          <div className="grid grid-3">
            {practiceItems.map((item) => (
              <PracticeCard item={item} key={item.title} />
            ))}
          </div>
        ) : (
          <EmptyState title="No practice questions yet" text="Practice questions are being prepared for your selected exam." actionLabel="Back to Mission Control" actionHref="/home" />
        )}
        <SectionHeader eyebrow="Practice Categories" title="Choose a practice mode" />
        <div className="grid grid-3">
          {practiceCategories.map((category) => (
            <CategoryCard title={category.title} href={category.href} key={category.title} />
          ))}
        </div>
        <div className="grid grid-3">
          <EmptyState title="No completed practice" text="Completed sets will appear here later." actionLabel="Start Practice" actionHref="/practice/question" />
          <EmptyState title="No mock history" text="Mock test attempts will appear here later." actionLabel="Take Mock Test" actionHref="/practice/mock-tests" />
          <EmptyState title="No saved questions" text="Saved questions will appear here later." actionLabel="Continue Practice" actionHref="/practice/question" />
        </div>
      </div>
    </PageContainer>
  );
}
