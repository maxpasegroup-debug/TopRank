import { Card } from "../ui/Card";

export function SummaryCard() {
  return (
    <Card>
      <h3 className="progress-card-title">Study Summary</h3>
      <div className="summary-grid">
        <div>
          <p className="progress-metric-value">18h</p>
          <p className="metric-label">Studied</p>
        </div>
        <div>
          <p className="progress-metric-value">620</p>
          <p className="metric-label">Questions</p>
        </div>
        <div>
          <p className="progress-metric-value">14</p>
          <p className="metric-label">Chapters</p>
        </div>
      </div>
    </Card>
  );
}
