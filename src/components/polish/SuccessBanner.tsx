import { Button } from "../ui/Button";

type SuccessBannerProps = {
  title: string;
  actionLabel: string;
  actionHref: string;
};

export function SuccessBanner({ title, actionLabel, actionHref }: SuccessBannerProps) {
  return (
    <section className="success-banner">
      <strong>{title}</strong>
      <Button href={actionHref} variant="secondary">
        {actionLabel}
      </Button>
    </section>
  );
}
