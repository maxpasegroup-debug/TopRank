import type { CSSProperties } from "react";

type ProgressRingProps = {
  value: number;
};

export function ProgressRing({ value }: ProgressRingProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="progress-ring" style={{ "--ring-value": `${safeValue}%` } as CSSProperties}>
      <span>{safeValue}%</span>
    </div>
  );
}
