import type { Achievement } from "../../data/progress";
import { Card } from "../ui/Card";

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <Card>
      <div className={`achievement-mark ${achievement.tone}`} />
      <h3 className="progress-card-title">{achievement.title}</h3>
      <p className="card-copy">{achievement.detail}</p>
    </Card>
  );
}
