import type { Metric } from "../../data/guardian";
import { Card } from "../ui/Card";

export function WeeklySummaryCard({ item }: { item: Metric }) {
  return (
    <Card>
      <p className="guardian-value">{item.value}</p>
      <h3 className="progress-card-title">{item.label}</h3>
      <p className="card-copy">{item.helper}</p>
    </Card>
  );
}
