import type { ProgressMetricItem } from "../../data/progress";
import { Card } from "../ui/Card";

export function ProgressMetric({ metric }: { metric: ProgressMetricItem }) {
  return (
    <Card>
      <p className="progress-metric-value">{metric.value}</p>
      <h3 className="progress-card-title">{metric.label}</h3>
      <p className="card-copy">{metric.helper}</p>
    </Card>
  );
}
