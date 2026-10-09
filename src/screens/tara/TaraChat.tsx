import { ChatBubble } from "../../components/tara/ChatBubble";
import { ChatInput } from "../../components/tara/ChatInput";
import { Avatar } from "../../components/tara/Avatar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { conversations } from "../../data/tara";

export type TaraChatKey = keyof typeof conversations;

const nextActions: Record<TaraChatKey, { label: string; href: string }> = {
  study: { label: "Continue Physics", href: "/learn/physics" },
  motivate: { label: "Start Today's Practice", href: "/practice" },
  plan: { label: "Continue Physics", href: "/learn/physics" },
  revise: { label: "Revise Biology", href: "/learn/biology" },
  concept: { label: "Open Motion Lesson", href: "/learn/physics/motion" },
  ask: { label: "Start Motion Practice", href: "/practice/question" },
};

export function TaraChat({ chat }: { chat: TaraChatKey }) {
  const messages = conversations[chat];
  const nextAction = nextActions[chat];

  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Talk to Tara"
          title="A calm mentor chat"
          subtitle="Scripted conversation only. No AI is running."
          action={<Button href={nextAction.href}>{nextAction.label}</Button>}
        />
        <Card>
          <div className="chat-panel">
            <Avatar />
            {messages.map((message, index) => (
              <ChatBubble message={message} key={`${message.speaker}-${index}`} />
            ))}
          </div>
        </Card>
        <ChatInput />
      </div>
    </PageContainer>
  );
}
