import type { MockTest } from "../../data/practice";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function MockTestCard({ test }: { test: MockTest }) {
  return (
    <Card>
      <h3 className="practice-card-title">{test.title}</h3>
      <div className="practice-meta-grid">
        <span>{test.duration}</span>
        <span>{test.questions} questions</span>
        <span>{test.difficulty}</span>
      </div>
      <Button href={test.href}>Start</Button>
    </Card>
  );
}
