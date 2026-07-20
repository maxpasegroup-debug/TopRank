import { CategoryCard } from "../components/practice/CategoryCard";
import { ContinuePracticeCard } from "../components/practice/ContinuePracticeCard";
import { PracticeCard } from "../components/practice/PracticeCard";
import { GlobalSearchLauncher } from "../components/polish/GlobalSearchLauncher";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { practiceCategories, practiceSubjects } from "../data/practice";

export function Practice() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Today's Practice"
          title="Practice what matters next"
          subtitle="Start with Motion. It is your clearest next step today."
          action={<Button href="/practice/question">Start Practice</Button>}
        />
        <GlobalSearchLauncher />
        <ContinuePracticeCard />
        <div className="grid grid-3">
          {practiceSubjects.map((item) => (
            <PracticeCard item={item} key={item.title} />
          ))}
        </div>
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
