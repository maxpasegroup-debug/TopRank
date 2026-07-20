import type { Paper } from "../../data/practice";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function PaperCard({ paper }: { paper: Paper }) {
  return (
    <Card>
      <h3 className="practice-card-title">{paper.title}</h3>
      <p className="card-copy">{paper.detail}</p>
      <Button href={paper.href} variant="secondary">
        Open
      </Button>
    </Card>
  );
}
