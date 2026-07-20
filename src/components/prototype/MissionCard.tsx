import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

type MissionCardProps = {
  title: string;
  label: string;
  progress: number;
};

export function MissionCard({ title, label, progress }: MissionCardProps) {
  return (
    <Card>
      <Badge>{label}</Badge>
      <h2 style={{ margin: "18px 0 12px", fontSize: 24 }}>{title}</h2>
      <ProgressBar value={progress} />
      <p style={{ margin: "12px 0 0", color: "var(--color-muted)", fontWeight: 700 }}>
        {progress}% ready
      </p>
    </Card>
  );
}
