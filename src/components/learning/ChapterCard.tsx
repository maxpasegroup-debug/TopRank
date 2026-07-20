import type { Chapter } from "../../data/learning";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function ChapterCard({ chapter }: { chapter: Chapter }) {
  return (
    <Card>
      <h3 className="learning-card-title">{chapter.title}</h3>
      <div className="learning-meta-row">
        <span>{chapter.time}</span>
        <span>{chapter.difficulty}</span>
      </div>
      <ProgressBar value={chapter.completion} />
      <p className="learning-meta">{chapter.completion}% complete</p>
      <Button href={chapter.href} variant="secondary">
        Continue
      </Button>
    </Card>
  );
}
