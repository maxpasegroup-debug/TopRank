import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function ContinuePracticeCard() {
  return (
    <Card>
      <p className="eyebrow">Continue Practice</p>
      <h2 className="practice-card-title">Motion</h2>
      <p className="card-copy">Question 18 of 40</p>
      <ProgressBar value={45} />
      <p className="practice-muted">Your next best action is ready.</p>
      <Button href="/practice/question">Continue</Button>
    </Card>
  );
}
