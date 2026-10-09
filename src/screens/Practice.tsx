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
  if (subjects) return <PageContainer><main className="journey-shell"><span className="journey-kicker">PRACTICE</span><h1>{exam?.name ?? "Your practice bank"}</h1>
    <div className="journey-actions"><Button href="/practice/review" variant="secondary">Attempt history</Button><Button href="/learn" variant="secondary">Back to learning</Button></div>
    {subjects.length ? <ul className="journey-task-list">{subjects.map((subject) => <li key={subject.slug}><div><strong>{subject.title}</strong><span>{subject.questions} published questions</span></div><Button href={subject.href} variant="secondary">Open questions</Button></li>)}</ul> : <p>No published questions are available for your exam yet.</p>}
  </main></PageContainer>;
  const hasRealSubjects = false;
  const practiceItems = practiceSubjects;
  const firstQuestionHref = "/practice/question";

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
