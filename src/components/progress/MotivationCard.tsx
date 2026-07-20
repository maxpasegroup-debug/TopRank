import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function MotivationCard() {
  return (
    <Card>
      <p className="eyebrow">Daily Encouragement</p>
      <h2 className="motivation-text">You are 12% closer to your dream than last month.</h2>
      <p className="card-copy">Showing up today counts. Keep the streak alive with one practice set.</p>
      <Button href="/practice">Continue Practice</Button>
    </Card>
  );
}
