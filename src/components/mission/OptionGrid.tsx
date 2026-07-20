import { Card } from "../ui/Card";

type OptionGridProps = {
  options: string[];
};

export function OptionGrid({ options }: OptionGridProps) {
  return (
    <div className="option-grid">
      {options.map((option) => (
        <Card key={option}>
          <button className="option-card" type="button">
            {option}
          </button>
        </Card>
      ))}
    </div>
  );
}
