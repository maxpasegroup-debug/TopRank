import type { ReviewItem } from "../../data/practice";
import { Card } from "../ui/Card";

export function ReviewCard({ item }: { item: ReviewItem }) {
  return (
    <Card>
      <div className="review-card-head">
        <h3 className="practice-card-title">Question {item.number}</h3>
        <span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span>
      </div>
      <p className="practice-muted">Your Answer: {item.yourAnswer}</p>
      <p className="practice-muted">Correct Answer: {item.correctAnswer}</p>
    </Card>
  );
}
