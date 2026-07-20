import { Button } from "../ui/Button";

export function GlobalSearchLauncher() {
  return (
    <section className="global-search-launcher" aria-label="Universal search">
      <div>
        <p className="eyebrow">Global Search</p>
        <h2>Find lessons, practice, Tara, or progress</h2>
      </div>
      <Button href="/learn/search" variant="secondary">
        Search
      </Button>
    </section>
  );
}
