import { demoSteps } from "../../data/demo";

function withDemo(path: string) {
  return `${path}?demo=1`;
}

type PresenterPanelProps = {
  currentPath: string;
};

export function PresenterPanel({ currentPath }: PresenterPanelProps) {
  const currentIndex = Math.max(
    0,
    demoSteps.findIndex((step) => step.path === currentPath),
  );
  const previousStep = demoSteps[Math.max(0, currentIndex - 1)];
  const nextStep = demoSteps[Math.min(demoSteps.length - 1, currentIndex + 1)];

  return (
    <aside className="presenter-panel" aria-label="Demo presenter controls">
      <div>
        <p className="eyebrow">Demo Mode</p>
        <h2>Guided Journey</h2>
      </div>
      <div className="presenter-actions">
        <a href={withDemo(previousStep.path)}>Previous Screen</a>
        <a className="primary" href={withDemo(nextStep.path)}>Next Screen</a>
        <a href="/demo/start">Restart Demo</a>
      </div>
      <details>
        <summary>Jump To</summary>
        <div className="presenter-jumps">
          {demoSteps.map((step) => (
            <a className={step.path === currentPath ? "active" : ""} href={withDemo(step.path)} key={step.path}>
              {step.label}
            </a>
          ))}
          <a href="/presentation-summary?demo=1">Summary</a>
        </div>
      </details>
    </aside>
  );
}
