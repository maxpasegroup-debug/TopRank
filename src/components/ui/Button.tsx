import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ children, href, variant = "primary" }: ButtonProps) {
  const className = `button button-${variant}`;

  if (href) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }

  return <button className={className}>{children}</button>;
}
