import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function RankCard() {
  return (
    <Card>
      <p className="eyebrow">Rank Preview</p>
      <h3 className="progress-card-title">Your target is moving closer</h3>
      <div className="rank-grid">
        <div>
          <p className="progress-metric-value">18,420</p>
          <p className="metric-label">Current Rank</p>
        </div>
        <div>
          <p className="progress-metric-value">5,000</p>
          <p className="metric-label">Target Rank</p>
        </div>
      </div>
      <ProgressBar value={56} />
      <p className="card-copy">Estimated Improvement: Stronger with consistency.</p>
      <Button href="/practice">Practice next</Button>
    </Card>
  );
}
