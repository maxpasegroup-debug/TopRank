import type { ReactNode } from "react";
import { Card } from "../ui/Card";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  text: string;
};

export function FeatureCard({ icon, title, text }: FeatureCardProps) {
  return (
    <Card>
      <div className="feature-icon">{icon}</div>
      <h3 className="card-title">{title}</h3>
      <p className="card-copy">{text}</p>
    </Card>
  );
}
