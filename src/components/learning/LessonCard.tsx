import { Card } from "../ui/Card";

type LessonCardProps = {
  title: string;
  text: string;
};

export function LessonCard({ title, text }: LessonCardProps) {
  return (
    <Card>
      <h3 className="learning-card-title">{title}</h3>
      <p className="card-copy">{text}</p>
    </Card>
  );
}
