import { Button } from "../ui/Button";

export function ChatInput() {
  return (
    <form className="chat-input">
      <input aria-label="Ask Tara" placeholder="Ask Tara anything" />
      <Button href="/tara/chat/ask">Send</Button>
    </form>
  );
}
