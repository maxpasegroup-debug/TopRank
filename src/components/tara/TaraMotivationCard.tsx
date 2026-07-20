import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function TaraMotivationCard() {
  return (
    <Card>
      <p className="eyebrow">Daily Motivation</p>
      <h2 className="tara-quote">One honest hour today is stronger than a perfect plan tomorrow.</h2>
      <p className="card-copy">Keep the promise small. Finish one practice set.</p>
      <Button href="/practice">Start Today's Practice</Button>
    </Card>
  );
}
