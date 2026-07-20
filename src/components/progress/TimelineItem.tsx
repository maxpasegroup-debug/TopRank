import type { TimelineItemData } from "../../data/progress";

export function TimelineItem({ item }: { item: TimelineItemData }) {
  return (
    <div className={`timeline-item ${item.state}`}>
      <span className="timeline-dot" />
      <div>
        <h3 className="progress-card-title">{item.title}</h3>
        <p className="card-copy">{item.detail}</p>
      </div>
    </div>
  );
}
