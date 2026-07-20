import type { ClassRoom } from "../../data/guardian";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function ClassCard({ item }: { item: ClassRoom }) {
  return (
    <Card>
      <h3 className="progress-card-title">{item.name}</h3>
      <div className="guardian-list">
        <span>{item.students} students</span>
        <span>{item.progress} progress</span>
        <span>{item.activity} activity</span>
      </div>
      <Button href="/school" variant="secondary">
        View
      </Button>
    </Card>
  );
}
