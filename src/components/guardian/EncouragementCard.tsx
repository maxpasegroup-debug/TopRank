import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function EncouragementCard() {
  return (
    <Card>
      <p className="eyebrow">Encouragement</p>
      <h2 className="guardian-quote">
        Your encouragement makes a difference. Celebrate consistency, not perfection.
      </h2>
      <p className="card-copy">A small word of support can help your child show up again tomorrow.</p>
      <Button href="/progress">View Student Progress</Button>
    </Card>
  );
}
