import { PaperCard } from "../../components/practice/PaperCard";
import { Button } from "../../components/ui/Button";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { papers } from "../../data/practice";

export function PreviousYearPapers() {
  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Previous Year Papers"
          title="Practice real exam patterns"
          subtitle="Mock paper list only. Start with NEET 2025."
          action={<Button href="/practice/question">Start NEET 2025</Button>}
        />
        <div className="grid grid-2">
          {papers.map((paper) => (
            <PaperCard paper={paper} key={paper.title} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
