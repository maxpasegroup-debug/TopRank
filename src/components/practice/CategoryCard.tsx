import { Card } from "../ui/Card";

type CategoryCardProps = {
  title: string;
  href: string;
};

export function CategoryCard({ title, href }: CategoryCardProps) {
  return (
    <a href={href} className="category-link">
      <Card>
        <h3 className="practice-card-title">{title}</h3>
        <p className="card-copy">Open</p>
      </Card>
    </a>
  );
}
