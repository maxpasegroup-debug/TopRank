import type { QuickAction } from "../../data/tara";
import { Card } from "../ui/Card";

export function QuickActionCard({ action }: { action: QuickAction }) {
  return (
    <a className="tara-action-link" href={action.href}>
      <Card>
        <h3 className="progress-card-title">{action.title}</h3>
        <p className="card-copy">{action.detail}</p>
      </Card>
    </a>
  );
}
