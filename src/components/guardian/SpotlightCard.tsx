import { Card } from "../ui/Card";
import { demoStudent } from "../../data/demo";

export function SpotlightCard() {
  return (
    <Card>
      <p className="eyebrow">Student Spotlight</p>
      <h2 className="guardian-quote">{demoStudent.name} improved by 18%</h2>
      <p className="card-copy">Achievement Badge: {demoStudent.achievement}</p>
    </Card>
  );
}
