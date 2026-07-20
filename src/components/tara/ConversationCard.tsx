import type { Conversation } from "../../data/tara";
import { Card } from "../ui/Card";

export function ConversationCard({ conversation }: { conversation: Conversation }) {
  return (
    <a className="tara-action-link" href={conversation.href}>
      <Card>
        <h3 className="progress-card-title">{conversation.title}</h3>
        <p className="card-copy">{conversation.time}</p>
      </Card>
    </a>
  );
}
