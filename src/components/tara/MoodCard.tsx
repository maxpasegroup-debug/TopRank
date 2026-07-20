import type { Mood } from "../../data/tara";
import { Card } from "../ui/Card";

export function MoodCard({ mood }: { mood: Mood }) {
  return (
    <a className="tara-action-link" href={mood.href}>
      <Card>
        <h3 className="progress-card-title">{mood.label}</h3>
        <p className="card-copy">{mood.feeling}</p>
      </Card>
    </a>
  );
}
