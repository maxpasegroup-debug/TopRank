import type { TimelineItem } from "../../data/guardian";
import { Card } from "../ui/Card";

export function JourneyTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <Card>
      <div className="guardian-timeline">
        {items.map((item) => (
          <div className="guardian-timeline-item" key={item.title}>
            <span />
            <div>
              <h3 className="progress-card-title">{item.title}</h3>
              <p className="card-copy">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
