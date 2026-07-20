import type { Metric } from "../../data/guardian";
import { Card } from "../ui/Card";

export function SchoolMetricCard({ metric }: { metric: Metric }) {
  return (
    <Card>
      <p className="guardian-value">{metric.value}</p>
      <h3 className="progress-card-title">{metric.label}</h3>
      <p className="card-copy">{metric.helper}</p>
    </Card>
  );
}
