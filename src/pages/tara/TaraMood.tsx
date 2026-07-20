import { ChatBubble } from "../../components/tara/ChatBubble";
import { Avatar } from "../../components/tara/Avatar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { moodResponses } from "../../data/tara";

export type TaraMoodKey = keyof typeof moodResponses;

const moodActions: Record<TaraMoodKey, { label: string; href: string }> = {
  great: { label: "Start Today's Practice", href: "/practice" },
  okay: { label: "Continue Physics", href: "/learn/physics" },
  stressed: { label: "Start Easy Practice", href: "/practice/question" },
  tired: { label: "Revise Biology", href: "/learn/biology" },
};

export function TaraMood({ mood }: { mood: TaraMoodKey }) {
  const messages = moodResponses[mood];
  const nextAction = moodActions[mood];

  return (
    <PageContainer>
      <div className="screen-stack">
        <SectionHeader
          eyebrow="Daily Check-in"
          title="Tara heard you"
          subtitle="Supportive scripted response for this prototype."
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
      </div>
    </PageContainer>
  );
}
