import type { Resource } from "../../data/learning";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Card>
      <span className="resource-type">{resource.type}</span>
      <h3 className="learning-card-title">{resource.title}</h3>
      <p className="card-copy">{resource.detail}</p>
      <Button href={resource.href} variant="secondary">
        Open
      </Button>
    </Card>
  );
}
