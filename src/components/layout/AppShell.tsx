import type { ReactNode } from "react";
import { Brand } from "./Brand";
import { Navigation } from "./Navigation";
import { Button } from "../ui/Button";

type AppShellProps = {
  children: ReactNode;
  currentPath: string;
};

export function AppShell({ children, currentPath }: AppShellProps) {
  return (
    <div className="app-shell">
      <div className="app-layout">
        <aside className="sidebar">
          <Brand />
          <Navigation currentPath={currentPath} variant="sidebar" />
          <div style={{ marginTop: "auto" }}>
            <Button href="/settings" variant="secondary">
              Settings
            </Button>
          </div>
        </aside>
        <div className="app-main">{children}</div>
      </div>
      <Navigation currentPath={currentPath} variant="bottom" />
    </div>
  );
}
