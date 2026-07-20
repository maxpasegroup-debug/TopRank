import { Button } from "./Button";
import { EmptyStateIllustration } from "../polish/EmptyStateIllustration";

type EmptyStateProps = {
  title: string;
  text: string;
  actionLabel: string;
  actionHref: string;
};

export function EmptyState({ title, text, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <EmptyStateIllustration />
      <h2 style={{ margin: 0, fontSize: 22 }}>{title}</h2>
      <p style={{ margin: 0, color: "var(--color-muted)", lineHeight: 1.55 }}>{text}</p>
      <div>
        <Button href={actionHref} variant="secondary">
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
