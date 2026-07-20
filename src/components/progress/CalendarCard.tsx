import { calendarDays } from "../../data/progress";
import { Card } from "../ui/Card";

export function CalendarCard() {
  return (
    <Card>
      <h3 className="progress-card-title">Study Calendar</h3>
      <div className="calendar-grid">
        {calendarDays.map((day) => (
          <span className={`calendar-day ${day.state}`} key={day.day}>
            {day.day}
          </span>
        ))}
      </div>
      <div className="calendar-legend">
        <span>Study Days</span>
        <span>Practice Days</span>
        <span>Missed Days</span>
      </div>
    </Card>
  );
}
