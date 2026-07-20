import type { ChatMessage } from "../../data/tara";

export function ChatBubble({ message }: { message: ChatMessage }) {
  return <div className={`chat-bubble ${message.speaker}`}>{message.text}</div>;
}
