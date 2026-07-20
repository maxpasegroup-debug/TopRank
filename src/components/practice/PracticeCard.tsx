import type { PracticeSubject } from "../../data/practice";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function PracticeCard({ item }: { item: PracticeSubject }) {
  return (
    <Card>
      <h2 className="practice-card-title">{item.title}</h2>
      <ProgressBar value={item.progress} />
      <div className="practice-meta-grid">
        <span>{item.questions} questions</span>
        <span>{item.difficulty}</span>
      </div>
      <Button href={item.href}>Continue</Button>
    </Card>
  );
}
