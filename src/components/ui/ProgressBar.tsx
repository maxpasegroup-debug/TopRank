type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="progress-track" aria-label={`${safeValue}% complete`}>
      <div className="progress-fill" style={{ width: `${safeValue}%` }} />
    </div>
  );
}
