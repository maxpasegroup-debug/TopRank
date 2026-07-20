import { Brand } from "../layout/Brand";
import { Button } from "../ui/Button";

export function PublicHeader() {
  return (
    <header className="public-header">
      <Brand />
      <nav className="public-actions" aria-label="Public">
        <a href="#explore">Explore</a>
        <Button href="/login" variant="secondary">
          Log in
        </Button>
      </nav>
    </header>
  );
}
