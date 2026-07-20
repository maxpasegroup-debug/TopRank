import { navigationRoutes } from "../../app/routes";
import { Icon } from "../ui/Icon";

type NavigationProps = {
  currentPath: string;
  variant: "sidebar" | "bottom";
};

export function Navigation({ currentPath, variant }: NavigationProps) {
  return (
    <nav className={variant === "sidebar" ? "sidebar-nav" : "bottom-nav"} aria-label="Main">
      {navigationRoutes.map((route) => (
        <a
          className={`nav-item ${currentPath === route.path ? "active" : ""}`}
          href={route.path}
          key={route.path}
        >
          <Icon name={route.screen} />
          <span>{route.label}</span>
        </a>
      ))}
    </nav>
  );
}
