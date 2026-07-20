import { plannerItems } from "../../data/tara";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function PlannerCard() {
  return (
    <Card>
      <p className="eyebrow">Study Planner Preview</p>
      <h3 className="progress-card-title">Today's Focus</h3>
      <div className="tara-plan-list">
        {plannerItems.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <Button href="/learn/physics">Continue Physics</Button>
    </Card>
  );
}
