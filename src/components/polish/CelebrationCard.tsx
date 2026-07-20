import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type CelebrationCardProps = {
  title: string;
  text: string;
  actionLabel: string;
  actionHref: string;
};

export function CelebrationCard({ title, text, actionLabel, actionHref }: CelebrationCardProps) {
  return (
    <Card>
      <div className="celebration-card">
        <div className="celebration-mark">TR</div>
        <h1>{title}</h1>
        <p>{text}</p>
        <Button href={actionHref}>{actionLabel}</Button>
      </div>
    </Card>
  );
}
