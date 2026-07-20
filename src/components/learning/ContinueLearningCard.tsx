import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function ContinueLearningCard() {
  return (
    <Card>
      <p className="eyebrow">Continue where you left off</p>
      <h2 className="learning-card-title">Motion: Distance and Displacement</h2>
      <p className="card-copy">Mock memory of your last opened lesson.</p>
      <ProgressBar value={62} />
      <p className="learning-meta">12 minutes left</p>
      <Button href="/learn/physics/motion">Continue Learning</Button>
    </Card>
  );
}
