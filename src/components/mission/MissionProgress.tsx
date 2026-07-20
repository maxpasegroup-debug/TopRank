type MissionProgressProps = {
  step: number;
  total: number;
};

export function MissionProgress({ step, total }: MissionProgressProps) {
  return (
    <div className="mission-progress" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }, (_, index) => (
        <span className={index < step ? "active" : ""} key={index} />
      ))}
    </div>
  );
}
