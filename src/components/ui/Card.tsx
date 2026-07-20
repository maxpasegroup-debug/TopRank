import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  padded?: boolean;
  soft?: boolean;
};

export function Card({ children, padded = true, soft = false }: CardProps) {
  const classes = [soft ? "soft-card" : "card", padded ? "card-pad" : ""]
    .filter(Boolean)
    .join(" ");

  return <section className={classes}>{children}</section>;
}
