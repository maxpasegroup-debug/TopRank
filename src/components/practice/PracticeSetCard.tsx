import type { PracticeSet } from "../../data/practice";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function PracticeSetCard({ set }: { set: PracticeSet }) {
  return (
    <Card>
      <h3 className="practice-card-title">{set.title}</h3>
      <div className="practice-meta-grid">
        <span>{set.questions} questions</span>
        <span>{set.time}</span>
        <span>{set.difficulty}</span>
        <span>Best {set.bestScore}</span>
      </div>
      <Button href={set.href}>Start Set</Button>
    </Card>
  );
}
