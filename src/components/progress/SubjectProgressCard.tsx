import type { SubjectPerformance } from "../../data/progress";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function SubjectProgressCard({ subject }: { subject: SubjectPerformance }) {
  return (
    <Card>
      <h3 className="progress-card-title">{subject.subject}</h3>
      <ProgressBar value={subject.progress} />
      <div className="progress-mini-row">
        <span>{subject.progress}% progress</span>
        <span>{subject.accuracy} accuracy</span>
      </div>
      <p className="card-copy">Last: {subject.lastActivity}</p>
      <Button href={subject.href} variant="secondary">
        Continue
      </Button>
    </Card>
  );
}
