import { Card } from "../ui/Card";

type MetricCardProps = {
  value: string;
  label: string;
};

export function MetricCard({ value, label }: MetricCardProps) {
  return (
    <Card>
      <div className="metric">
        <p className="metric-value">{value}</p>
        <p className="metric-label">{label}</p>
      </div>
    </Card>
  );
}
