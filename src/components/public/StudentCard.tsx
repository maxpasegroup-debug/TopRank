import { Card } from "../ui/Card";
import { ProgressRing } from "./ProgressRing";

type StudentCardProps = {
  name: string;
  exam: string;
  streak: string;
  progress: number;
};

export function StudentCard({ name, exam, streak, progress }: StudentCardProps) {
  return (
    <Card>
      <div className="student-card">
        <div>
          <div className="student-avatar">{name.charAt(0)}</div>
          <h3 className="card-title">{name}</h3>
          <p className="card-copy">{exam}</p>
          <p className="streak-text">{streak} streak</p>
        </div>
        <ProgressRing value={progress} />
      </div>
    </Card>
  );
}
