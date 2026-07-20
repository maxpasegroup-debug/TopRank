import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function ReflectionCard() {
  return (
    <Card>
      <div className="reflection-form">
        <label>
          What went well today?
          <textarea placeholder="I showed up for Physics practice." />
        </label>
        <label>
          What challenged you today?
          <textarea placeholder="Motion questions felt confusing." />
        </label>
        <label>
          One thing to improve tomorrow?
          <textarea placeholder="Revise formulas before practice." />
        </label>
        <Button href="/practice">Start Tomorrow's Practice</Button>
      </div>
    </Card>
  );
}
