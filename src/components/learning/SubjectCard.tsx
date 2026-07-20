import type { Subject } from "../../data/learning";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function SubjectCard({ subject }: { subject: Subject }) {
  const isDone = subject.status === "Completed";

  return (
    <Card>
      <div className={`subject-dot ${subject.color}`} />
      <h2 className="learning-card-title">{subject.name}</h2>
      <ProgressBar value={subject.progress} />
      <p className="learning-meta">{subject.progress}% today</p>
      <Button href={subject.href} variant={isDone ? "secondary" : "primary"}>
        {subject.status}
      </Button>
    </Card>
  );
}
