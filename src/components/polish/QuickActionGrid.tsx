import { Card } from "../ui/Card";

const actions = [
  { title: "Continue Learning", href: "/learn/physics" },
  { title: "Start Practice", href: "/practice/question" },
  { title: "Revise Today", href: "/learn/revision" },
  { title: "Talk to Tara", href: "/tara/chat/study" },
  { title: "Take Mock Test", href: "/practice/mock-tests" },
];

export function QuickActionGrid() {
  return (
    <div className="quick-action-grid">
      {actions.map((action) => (
        <a href={action.href} className="quick-action-link" key={action.title}>
          <Card>
            <h3 className="progress-card-title">{action.title}</h3>
            <p className="card-copy">Open</p>
          </Card>
        </a>
      ))}
    </div>
  );
}
