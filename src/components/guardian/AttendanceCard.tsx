import { Card } from "../ui/Card";

export function AttendanceCard() {
  return (
    <Card>
      <p className="eyebrow">Attendance Preview</p>
      <h3 className="progress-card-title">Active today</h3>
      <div className="guardian-list">
        <span>Active Today: Yes</span>
        <span>Last Login: 7:20 PM</span>
        <span>Study Days This Week: 5</span>
      </div>
    </Card>
  );
}
