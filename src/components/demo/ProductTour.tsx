import { demoSteps } from "../../data/demo";

type ProductTourProps = {
  currentPath: string;
};

export function ProductTour({ currentPath }: ProductTourProps) {
  const step = demoSteps.find((item) => item.path === currentPath);

  if (!step) {
    return null;
  }

  return (
    <section className="product-tour" aria-label="Product tour highlight">
      <strong>{step.label}</strong>
      <span>{step.note}</span>
      <a href={`${currentPath}?demo=1&tour=hide`}>Dismiss</a>
    </section>
  );
}
