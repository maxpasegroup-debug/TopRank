import type { Notice } from "../../data/guardian";
import { Card } from "../ui/Card";

export function NoticeCard({ notice }: { notice: Notice }) {
  return (
    <Card>
      <div className="notice-mark" />
      <h3 className="progress-card-title">{notice.title}</h3>
      <p className="card-copy">{notice.detail}</p>
    </Card>
  );
}
