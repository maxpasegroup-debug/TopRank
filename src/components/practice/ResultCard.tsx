import { Card } from "../ui/Card";

type ResultCardProps = {
  value: string;
  label: string;
};

export function ResultCard({ value, label }: ResultCardProps) {
  return (
    <Card>
      <p className="result-value">{value}</p>
      <p className="metric-label">{label}</p>
    </Card>
  );
}
